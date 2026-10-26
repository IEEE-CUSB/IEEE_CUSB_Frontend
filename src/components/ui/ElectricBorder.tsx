'use client';

import {
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
} from 'react';

/**
 * Lightweight ElectricBorder (drop-in replacement).
 *
 * What was removed compared to the original:
 *  - cursor reaction, click pulses, sparks and arcs (and all the pointer listeners)
 *  - the intro reveal sweep and the light-theme ink mixing
 *  - the highest-frequency noise layer
 *
 * What was added to keep it cheap:
 *  - smaller canvas margin (40px instead of 64px) = far fewer pixels to shade
 *  - lower render resolution, and an even lower one on touch devices
 *  - frame rate cap (default 30fps)
 *  - at most 2 strands
 *  - prefers-reduced-motion renders a still frame
 *  - falls back to a plain outline if WebGL2 is unavailable or the context is lost
 */

export interface ElectricBorderProps {
  children?: ReactNode;
  /** The only setting: any CSS color (hex or rgb). */
  color?: string;
  className?: string;
  /** Corner radius is read from here, e.g. style={{ borderRadius: 24 }} (default 17). */
  style?: CSSProperties;
}

interface Settings {
  core: number[];
  glowColor: number[];
  speed: number;
  chaos: number;
  spread: number;
  thickness: number;
  strands: number;
  glow: number;
  intensity: number;
  flicker: number;
  offset: number;
  active: boolean;
  fps: number;
  colorCss: string;
}

interface Program {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null>;
}

interface BorderPath {
  hx: number;
  hy: number;
  r: number;
  vr: number;
  ax: number;
  ay: number;
  perimeter: number;
}

const MARGIN = 40;
const HALF_PI = Math.PI / 2;

const VERTEX = `#version 300 es
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() {
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
precision highp int;

uniform vec2 uSize;
uniform float uRatio;
uniform vec2 uCenter;
uniform vec2 uHalf;
uniform float uRadius;
uniform vec3 uParam;
uniform float uPerimeter;
uniform vec3 uCells;
uniform vec2 uSoft;
uniform float uTime;
uniform float uPower;
uniform vec3 uCore;
uniform vec3 uGlowColor;
uniform float uIntensity;
uniform float uGlow;
uniform float uThickness;
uniform float uStrands;
uniform float uChaos;
uniform float uSpread;
uniform float uFlicker;

out vec4 fragColor;

uint scramble(uint x) {
  x ^= x >> 16u;
  x *= 0x7feb352du;
  x ^= x >> 15u;
  x *= 0x846ca68bu;
  x ^= x >> 16u;
  return x;
}

vec2 slant(uint x, uint y, uint seed) {
  uint h = scramble(x * 0x8da6b343u + y * 0xd8163841u + seed * 0xcb1ab31fu);
  return vec2(uvec2(h, h >> 8u) & 255u) / 127.5 - 1.0;
}

vec2 ring(vec2 p, float period, uint seed) {
  vec2 i = floor(p);
  vec2 f = p - i;
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float du = 30.0 * f.x * f.x * (f.x * (f.x - 2.0) + 1.0);
  uint x0 = uint(mod(i.x, period));
  uint x1 = uint(mod(i.x + 1.0, period));
  uint y0 = uint(i.y + 65536.0);
  vec2 ga = slant(x0, y0, seed);
  vec2 gb = slant(x1, y0, seed);
  vec2 gc = slant(x0, y0 + 1u, seed);
  vec2 gd = slant(x1, y0 + 1u, seed);
  float va = dot(ga, f);
  float vb = dot(gb, f - vec2(1.0, 0.0));
  float vc = dot(gc, f - vec2(0.0, 1.0));
  float vd = dot(gd, f - vec2(1.0, 1.0));
  float k = va - vb - vc + vd;
  float value = va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * k;
  float gx = ga.x + u.x * (gb.x - ga.x) + u.y * (gc.x - ga.x) + u.x * u.y * (ga.x - gb.x - gc.x + gd.x);
  return vec2(value, gx + du * (vb - va + u.y * k));
}

float wobble(float x, uint seed) {
  return ring(vec2(x, 0.5), 1048576.0, seed).x;
}

vec2 frameAt(vec2 p) {
  vec2 inner = max(uHalf - uRadius, 0.0);
  vec2 q = abs(p) - inner;
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;
  float quarter = uPerimeter * 0.25;
  vec2 v = abs(p) - uParam.xy;
  float t;
  if (v.x > 0.0 && v.y > 0.0) t = uParam.x + uParam.z * atan(v.x, v.y);
  else if (v.x > v.y) t = uParam.x + 1.5707963 * uParam.z + uParam.y - abs(p.y);
  else t = abs(p.x);
  t = clamp(t, 0.0, quarter);
  float s = p.x >= 0.0 ? (p.y < 0.0 ? t : 2.0 * quarter - t) : (p.y < 0.0 ? 4.0 * quarter - t : 2.0 * quarter + t);
  return vec2(s, d);
}

vec2 glowShape(float line, float spread, float w) {
  float x = abs(line);
  float y = abs(spread);
  return vec2(exp(-x * x / (w * w * 0.5)) + exp(-y / (w * 2.2)) * 0.6, exp(-y / (w * 4.5)) * 0.5);
}

void main() {
  vec2 p = vec2(gl_FragCoord.x / uRatio, uSize.y - gl_FragCoord.y / uRatio);
  vec2 frame = frameAt(p - uCenter);
  float s = frame.x;
  float d = frame.y;
  float t = uTime;
  vec3 light = vec3(0.0);
  float energy = 0.0;

  vec2 inset = min(p, uSize - p);
  float frameFade = smoothstep(0.0, 14.0, min(inset.x, inset.y));

  float edge = abs(d);
  float inward = d < 0.0 ? exp(d / 14.0) : 1.0;
  float bloom = (exp(-edge / 3.0) * 0.1 + exp(-edge / 16.0) * 0.05 * inward) * uGlow;
  light += uGlowColor * bloom;
  energy += bloom;

  float bendAmp = uSpread * 16.0;
  float rippleAmp = uSpread * 6.0;
  float crinkleAmp = uChaos * 4.5;
  float squeeze = min(1.0, ${MARGIN - 18}.0 / max((bendAmp + rippleAmp) * 1.6 + crinkleAmp, 1e-3));
  bendAmp *= squeeze;
  rippleAmp *= squeeze;
  crinkleAmp *= squeeze;
  float reach = (bendAmp * 1.9 + rippleAmp + crinkleAmp * 1.6) * 1.3 + uThickness * 14.0 + 8.0;

  if (edge < reach) {
    float fade = smoothstep(reach, reach * 0.55, edge);
    float slopeScale = 1.0 / uPerimeter;
    float x = s * slopeScale;
    for (int i = 0; i < 2; i++) {
      float fi = float(i);
      if (fi >= uStrands) break;
      uint seed = uint(i) * 7u + 3u;
      float lead = i == 0 ? 1.0 : 0.0;
      float range = mix(1.35 + fi * 0.18, 0.7, lead);
      vec2 a = ring(vec2(x * uCells.x, t * 0.7 + fi * 3.1), uCells.x, seed);
      vec2 b = ring(vec2(x * uCells.y, t * 1.9 + fi * 1.7), uCells.y, seed + 1u);
      vec2 c = ring(vec2(x * uCells.z, t * 4.6 + fi * 0.9), uCells.z, seed + 2u);
      float offset = (a.x * bendAmp + b.x * rippleAmp) * range + c.x * crinkleAmp;
      float slope =
        ((a.y * uCells.x * bendAmp + b.y * uCells.y * rippleAmp) * range + c.y * uCells.z * crinkleAmp) * slopeScale;
      float drift = lead > 0.5 ? 0.0 : wobble(fi * 7.3, seed + 9u) * 2.5 * uSpread;
      offset += drift;
      float across = (d - offset) / sqrt(1.0 + slope * slope);
      float spreadD = d - a.x * bendAmp * range - drift;
      float swell = 0.5 + 0.5 * ring(vec2(x * uSoft.y, t * 2.0 + fi * 5.1), uSoft.y, seed + 8u).x;
      float w = uThickness * mix(0.55, 1.0, lead) * (0.5 + swell);
      float vis = mix(0.3 + 0.45 * smoothstep(-0.25, 0.2, ring(vec2(x * uSoft.x, t * 0.5 + fi * 3.7), uSoft.x, seed + 5u).x), 1.0, lead);
      float spark = 1.0 - uFlicker * 0.3 * (0.5 + 0.5 * wobble(t * 13.0 + fi * 2.3, seed + 6u));
      float weight = vis * spark * fade * (0.7 + 0.6 * swell);
      vec2 g = glowShape(across, spreadD, w) * weight;
      g.y *= inward;
      float haze = uGlow;
      light += uCore * g.x + uGlowColor * g.y * haze;
      energy += g.x + g.y * haze;
    }
  }

  light *= uPower;
  energy *= uPower;

  float breath = 1.0 + uFlicker * 0.5 * wobble(t * 4.6 + 7.0, 3u);
  float gain = uIntensity * breath * 1.4;
  light *= frameFade;
  energy *= frameFade;
  float alpha = 1.0 - exp(-energy * gain);
  vec3 color = 1.0 - exp(-light * gain);
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;
  alpha = clamp(alpha + grain, 0.0, 1.0);
  fragColor = vec4(clamp(color + grain, 0.0, alpha), alpha);
}`;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const parseColor = (value: string): number[] => {
  const text = String(value || '').trim();
  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);
  const digits = hex?.[1];
  if (digits) {
    const full =
      digits.length === 3
        ? digits.replace(/./g, digit => digit + digit)
        : digits;
    return [0, 2, 4].map(
      index => parseInt(full.slice(index, index + 2), 16) / 255
    );
  }
  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(text);
  if (rgb) {
    return [rgb[1], rgb[2], rgb[3]].map(channel =>
      clamp(parseFloat(channel ?? '0') / 255, 0, 1)
    );
  }
  if (typeof document !== 'undefined') {
    const context = document.createElement('canvas').getContext('2d');
    if (context) {
      context.fillStyle = '#000000';
      context.fillStyle = text;
      const normal = String(context.fillStyle);
      if (normal !== '#000000' || /^(#0{3}|#0{6}|black)$/i.test(text))
        return parseColor(normal);
    }
  }
  return [0.75, 0.52, 0.99];
};

const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

const link = (gl: WebGL2RenderingContext): Program | null => {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = vertex && fragment ? gl.createProgram() : null;
  if (!vertex || !fragment || !program) {
    if (vertex) gl.deleteShader(vertex);
    if (fragment) gl.deleteShader(fragment);
    return null;
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  const uniforms: Program['uniforms'] = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
  for (let index = 0; index < count; index++) {
    const info = gl.getActiveUniform(program, index);
    if (info)
      uniforms[info.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(
        program,
        info.name
      );
  }
  return { program, uniforms };
};

const pathOf = (
  width: number,
  height: number,
  radius: number,
  offset: number
): BorderPath => {
  const hx = Math.max(1, width / 2 + offset);
  const hy = Math.max(1, height / 2 + offset);
  const r = clamp(radius + offset, 0, Math.min(hx, hy));
  const vr = Math.min(r + 48, Math.min(hx, hy));
  const ax = hx - vr;
  const ay = hy - vr;
  const quarter = ax + ay + HALF_PI * vr;
  return { hx, hy, r, vr, ax, ay, perimeter: quarter * 4 };
};

// Fixed look (tuned to be calm and cheap). Edit here if you ever want to change it.
const TUNING = {
  speed: 0.5,
  chaos: 0.3,
  spread: 1.2,
  thickness: 1.6,
  strands: 1,
  glow: 0.4,
  intensity: 0.5,
  flicker: 0.1,
  offset: 0,
  active: true,
  fps: 30,
};

const ElectricBorder = ({
  children,
  color = '#c084fc',
  className = '',
  style,
}: ElectricBorderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wakeRef = useRef<(() => void) | null>(null);

  const base = useMemo(() => parseColor(color), [color]);

  const settings: Settings = {
    ...TUNING,
    core: base.map(channel => channel + (1 - channel) * 0.55),
    glowColor: base,
    colorCss: color,
  };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // Re-measure and restart the loop whenever props change.
  useEffect(() => {
    wakeRef.current?.();
  });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const useFallback = () => {
      canvas.style.display = 'none';
      container.style.boxShadow = `0 0 0 1px color-mix(in srgb, ${settingsRef.current.colorCss} 45%, transparent)`;
    };

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    });
    const program = gl ? link(gl) : null;
    if (!gl || !program) {
      useFallback();
      return;
    }

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const vao = gl.createVertexArray();
    const size = { width: 1, height: 1, ratio: 1 };
    let path = pathOf(1, 1, 0, 0);
    let power = reduced ? 1 : 0;
    let time = Math.random() * 100;
    let raf = 0;
    let last = 0;
    let visible = true;
    let pageVisible = document.visibilityState !== 'hidden';
    let lost = false;

    const uni = (name: string) => program.uniforms[name] ?? null;

    const resize = () => {
      const s = settingsRef.current;
      const width = Math.max(1, container.offsetWidth);
      const height = Math.max(1, container.offsetHeight);
      const canvasWidth = width + MARGIN * 2;
      const canvasHeight = height + MARGIN * 2;
      const budget = coarse ? 6e5 : 1.2e6;
      const ratio = Math.min(
        window.devicePixelRatio || 1,
        coarse ? 1 : 1.5,
        Math.sqrt(budget / (canvasWidth * canvasHeight))
      );
      const pixelWidth = Math.max(1, Math.round(canvasWidth * ratio));
      const pixelHeight = Math.max(1, Math.round(canvasHeight * ratio));
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
      Object.assign(size, { width, height, ratio: pixelWidth / canvasWidth });
      const radius =
        parseFloat(getComputedStyle(container).borderTopLeftRadius) || 0;
      path = pathOf(width, height, radius, s.offset);
    };

    const draw = (s: Settings) => {
      const width = size.width + MARGIN * 2;
      const height = size.height + MARGIN * 2;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (power <= 0.001) return;
      gl.useProgram(program.program);
      gl.uniform2f(uni('uSize'), width, height);
      gl.uniform1f(uni('uRatio'), size.ratio);
      gl.uniform2f(uni('uCenter'), width / 2, height / 2);
      gl.uniform2f(uni('uHalf'), path.hx, path.hy);
      gl.uniform1f(uni('uRadius'), path.r);
      gl.uniform3f(uni('uParam'), path.ax, path.ay, path.vr);
      gl.uniform1f(uni('uPerimeter'), path.perimeter);
      gl.uniform3f(
        uni('uCells'),
        Math.max(1, Math.round(path.perimeter / 75)),
        Math.max(2, Math.round(path.perimeter / 25)),
        Math.max(3, Math.round(path.perimeter / 9))
      );
      gl.uniform2f(
        uni('uSoft'),
        Math.max(1, Math.round(path.perimeter / 150)),
        Math.max(1, Math.round(path.perimeter / 50))
      );
      gl.uniform1f(uni('uTime'), time);
      gl.uniform1f(uni('uPower'), power * power * (3 - 2 * power));
      gl.uniform3fv(uni('uCore'), s.core);
      gl.uniform3fv(uni('uGlowColor'), s.glowColor);
      gl.uniform1f(uni('uIntensity'), s.intensity);
      gl.uniform1f(uni('uGlow'), s.glow);
      gl.uniform1f(uni('uThickness'), s.thickness);
      gl.uniform1f(uni('uStrands'), s.strands);
      gl.uniform1f(uni('uChaos'), s.chaos);
      gl.uniform1f(uni('uSpread'), s.spread);
      gl.uniform1f(uni('uFlicker'), reduced ? 0 : s.flicker);
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const frame = (now: number) => {
      raf = 0;
      if (lost) return;
      const s = settingsRef.current;
      const gap = now - last;
      if (gap < 1000 / s.fps - 2) {
        raf = requestAnimationFrame(frame);
        return;
      }
      const dt = clamp(gap / 1000, 0, 0.1);
      last = now;

      if (!reduced) time += dt * s.speed;
      const target = s.active ? 1 : 0;
      power += (target - power) * (1 - Math.exp(-dt / (s.active ? 0.35 : 0.4)));
      draw(s);

      const animating = !reduced && (s.active || power > 0.002);
      const settling = Math.abs(target - power) > 0.002;
      if ((animating || settling) && visible && pageVisible)
        raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (raf || lost || !visible || !pageVisible) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    wakeRef.current = () => {
      resize();
      wake();
    };

    const onLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      cancelAnimationFrame(raf);
      raf = 0;
      useFallback();
    };
    canvas.addEventListener('webglcontextlost', onLost);

    const resizeObserver = new ResizeObserver(() => {
      resize();
      wake();
    });
    resizeObserver.observe(container);

    const intersection = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      wake();
    });
    intersection.observe(container);

    const onVisibility = () => {
      pageVisible = document.visibilityState !== 'hidden';
      wake();
    };
    document.addEventListener('visibilitychange', onVisibility);

    resize();
    wake();

    return () => {
      cancelAnimationFrame(raf);
      wakeRef.current = null;
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onLost);
      if (!gl.isContextLost()) {
        gl.deleteVertexArray(vao);
        gl.deleteProgram(program.program);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        isolation: 'isolate',
        borderRadius: 17,
        ...style,
      }}
    >
      {children}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -MARGIN,
          left: -MARGIN,
          zIndex: 1,
          display: 'block',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default ElectricBorder;
