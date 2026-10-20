import { useTheme } from '@/shared/hooks/useTheme';
import { Marquee } from '@/components/ui/marquee';
import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';

/**
 * filter modes:
 *  'flip'  – white logo  → black in light mode, white in dark mode
 *  'keep'  – colored     → no filter in either mode
 *  'dark'  – dark logo   → as-is in light mode, white in dark mode
 */
type FilterMode = 'flip' | 'keep' | 'dark';

const sponsors: { name: string; src: string; filter: FilterMode }[] = [
  { name: 'IEEE', src: '/sponsers/IEEE.svg', filter: 'flip' },
  { name: 'IEEE CUSB', src: '/sponsers/ieeecusb.svg', filter: 'keep' },
  { name: 'IEEE Egypt', src: '/sponsers/ieeeegy.svg', filter: 'flip' },
  {
    name: 'Cairo University',
    src: '/sponsers/cairounversity.svg',
    filter: 'keep',
  },
  { name: 'CUFE', src: '/sponsers/cufe.svg', filter: 'keep' },
  {
    name: 'IEEE Xplore',
    src: '/sponsers/IEEE-XploreDigitalLibrary.svg',
    filter: 'keep',
  },
  {
    name: 'IEEE Spectrum',
    src: '/sponsers/logo-ieee-spectrum.svg',
    filter: 'dark',
  },
  { name: 'IEEEDuino', src: '/sponsers/IEEEDuino.svg', filter: 'dark' },
  { name: 'IEEEXtreme', src: '/sponsers/IEEEXTREME.svg', filter: 'keep' },
  { name: 'IEEE TV', src: '/sponsers/ieeetv-logo.svg', filter: 'dark' },
];

/** Returns an inline style object so filters are always applied regardless of Tailwind purging. */
function getLogoStyle(mode: FilterMode, isDark: boolean): CSSProperties {
  if (mode === 'flip') {
    // white logo: force black in light, force white in dark
    return { filter: isDark ? 'brightness(0) invert(1)' : 'brightness(0)' };
  }
  if (mode === 'dark' && isDark) {
    // dark/colored logo that's hard to see in dark mode → invert to white
    return { filter: 'brightness(0) invert(1)', opacity: 0.85 };
  }
  // 'keep' or 'dark' in light mode → no filter
  return {};
}

export const SponsorsMarquee = () => {
  const { isDark } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.2 }}
      className="relative flex w-full flex-col items-center justify-center overflow-hidden mt-6 md:mt-8"
    >
      <p className="text-center text-xs font-semibold tracking-widest text-text-muted/60 uppercase mb-3 md:mb-4">
        Trusted by leading organizations
      </p>

      <Marquee pauseOnHover className="[--duration:35s] py-3 md:py-4">
        {sponsors.map(sponsor => (
          <img
            key={sponsor.name}
            src={sponsor.src}
            alt={`${sponsor.name} logo`}
            className="h-10 sm:h-14 md:h-16 w-24 sm:w-32 md:w-48 object-contain select-none pointer-events-none transition-[filter,opacity] duration-300 mx-1 sm:mx-2"
            style={getLogoStyle(sponsor.filter, isDark)}
            draggable={false}
            loading="lazy"
          />
        ))}
      </Marquee>

      {/* MagicUI handles the gradient mask via tailwind mask-image natively rather than absolute divs */}
    </motion.div>
  );
};
