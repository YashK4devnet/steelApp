import React, { useId } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { hapticFeedback } from '../../utils/haptics';

interface ThemeToggleButtonProps {
  className?: string;
}

export function ThemeToggleButton({ className = '' }: ThemeToggleButtonProps) {
  const { isDark, toggleTheme } = useTheme();
  const rawId = useId();
  // Sanitize React useId for safe SVG mask reference
  const maskId = `theme-mask-${rawId.replace(/:/g, '')}`;

  const handleToggle = () => {
    hapticFeedback.light();
    toggleTheme();
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`relative w-[42px] h-[42px] rounded-full bg-slate-50 dark:bg-slate-700/80 shadow-[0_4px_12px_rgba(15,23,42,0.05)] border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-amber-500 dark:text-sky-300 hover:bg-amber-50/50 dark:hover:bg-slate-600/80 hover:shadow-[0_4px_16px_rgba(245,158,11,0.15)] dark:hover:shadow-[0_4px_16px_rgba(56,189,248,0.15)] active:scale-95 transition-all duration-200 cursor-pointer overflow-hidden group ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{ transform: 'translateZ(0)' }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110"
        style={{
          willChange: 'transform',
          transform: isDark ? 'rotate(-20deg)' : 'rotate(0deg)',
        }}
      >
        <mask id={maskId}>
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          {/* Carving circle that glides in to form the crescent moon or glides out to reveal the full sun disk */}
          <circle
            cx={isDark ? '18' : '26'}
            cy={isDark ? '6' : '-2'}
            r="8"
            fill="black"
            style={{
              transition: 'cx 450ms cubic-bezier(0.4, 0, 0.2, 1), cy 450ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </mask>

        {/* Central Celestial Body (expands in moon mode, shrinks into compact disk in sun mode) */}
        <circle
          cx="12"
          cy="12"
          r={isDark ? '9' : '5'}
          fill="currentColor"
          mask={`url(#${maskId})`}
          style={{
            transition: 'r 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />

        {/* Sun Beams / Rays (radiate outward in light mode, collapse and rotate away in dark mode) */}
        <g
          stroke="currentColor"
          style={{
            opacity: isDark ? 0 : 1,
            transform: isDark ? 'rotate(90deg) scale(0)' : 'rotate(0deg) scale(1)',
            transformOrigin: '12px 12px',
            transition: 'transform 450ms cubic-bezier(0.4, 0, 0.2, 1), opacity 350ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </g>

        {/* Delicate Starlight Accents (gently sparkle into view during dark mode) */}
        <circle
          cx="18.5"
          cy="17.5"
          r="1"
          fill="currentColor"
          style={{
            opacity: isDark ? 1 : 0,
            transform: isDark ? 'scale(1)' : 'scale(0)',
            transformOrigin: '18.5px 17.5px',
            transition: 'opacity 400ms cubic-bezier(0.4, 0, 0.2, 1) 150ms, transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1) 150ms',
          }}
        />
        <circle
          cx="6"
          cy="7"
          r="0.75"
          fill="currentColor"
          style={{
            opacity: isDark ? 0.9 : 0,
            transform: isDark ? 'scale(1)' : 'scale(0)',
            transformOrigin: '6px 7px',
            transition: 'opacity 400ms cubic-bezier(0.4, 0, 0.2, 1) 200ms, transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1) 200ms',
          }}
        />
      </svg>
    </button>
  );
}
