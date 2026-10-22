import React from 'react';
import { useTheme } from '@/shared/hooks/useTheme';

interface ToggleProps {
  /** Whether the toggle is in the ON state */
  checked: boolean;
  /** Called whenever the user flips the toggle */
  onChange: (checked: boolean) => void;
  /** Static label always shown beside the toggle */
  label?: string;
  /** Dynamic label shown when checked=true (overrides `label`) */
  labelOn?: string;
  /** Dynamic label shown when checked=false (overrides `label`) */
  labelOff?: string;
  /** Custom track color when ON (defaults to green-500) */
  activeColor?: string;
  /** Extra className on the outer wrapper */
  className?: string;
  /** Manually override dark mode (reads from theme context by default) */
  darkMode?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_FONT_SIZES = {
  sm: 11,
  md: 17,
  lg: 20,
};

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  labelOn,
  labelOff,
  activeColor = '#22c55e',
  className = '',
  darkMode,
  disabled = false,
  size = 'md',
}) => {
  const { isDark } = useTheme();
  const dark = darkMode !== undefined ? darkMode : isDark;
  const currentFontSize = SIZE_FONT_SIZES[size] || 17;

  const resolvedLabel = checked
    ? (labelOn ?? label)
    : (labelOff ?? label);

  const labelColor = checked
    ? (dark ? 'text-green-400' : 'text-green-600')
    : (dark ? 'text-gray-400' : 'text-gray-500');

  return (
    <div className={`flex items-center gap-2.5 ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}>
      {/* Switch wrapper */}
      <label
        className="relative inline-block cursor-pointer select-none flex-shrink-0"
        style={{ fontSize: currentFontSize, width: '3.5em', height: '2em' }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          disabled={disabled}
          className="opacity-0 w-0 h-0 absolute"
        />

        {/* Track */}
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: checked ? activeColor : (dark ? '#4b5563' : '#d1d5db'),
            transition: 'background 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
          }}
        />

        {/* Thumb — grows and slides on check */}
        <span
          className="absolute rounded-full bg-white"
          style={{
            height:  checked ? '2em'   : '1.4em',
            width:   checked ? '2em'   : '1.4em',
            left:    checked ? 'calc(100% - 2em)' : '0.3em',
            bottom:  checked ? 0       : '0.3em',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            boxShadow: '0 0 20px rgba(0,0,0,0.4)',
          }}
        />
      </label>

      {/* Dynamic label */}
      {resolvedLabel && (
        <span
          className={`${size === 'sm' ? 'text-xs' : 'text-sm'} font-semibold cursor-pointer select-none ${labelColor}`}
          onClick={() => !disabled && onChange(!checked)}
        >
          {resolvedLabel}
        </span>
      )}
    </div>
  );
};
