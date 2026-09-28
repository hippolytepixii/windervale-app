import React from 'react';

/**
 * Luxury Vintage Filigree Corner Flourish
 * Replicating the exact corner ornament from the user's Canva reference image (media_1789712735151.png).
 * Delicate calligraphic curves, spiral volutes, and accent dots.
 */

const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '1.6',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/**
 * Top-Left Filigree Corner Flourish (Base orientation)
 * Viewbox: 0 0 100 100
 */
export const FiligreeCorner: React.FC<{
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}> = ({ className = 'w-16 h-16', position = 'top-left' }) => {
  // Transform classes for 4 corners
  const transformClass =
    position === 'top-right'
      ? 'scale-x-[-1]'
      : position === 'bottom-left'
      ? 'scale-y-[-1]'
      : position === 'bottom-right'
      ? '-scale-100'
      : '';

  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className} ${transformClass}`}
      {...strokeProps}
    >
      {/* Outer corner double-arch that rounds the corner */}
      <path d="M 88 18 C 76 12, 60 12, 44 14 C 28 16, 16 28, 14 44 C 12 60, 12 76, 18 88" />
      <path d="M 76 26 C 64 22, 52 22, 40 24 C 28 26, 24 38, 22 52 C 22 64, 24 74, 26 80" strokeWidth="1.2" />

      {/* Top branch terminal: sweeping spiral volute curling at the top-right */}
      <path d="M 88 18 C 94 20, 96 28, 90 32 C 84 36, 76 30, 80 22 C 82 16, 90 14, 94 18" />

      {/* Left branch terminal: sweeping spiral volute curling at the bottom-left */}
      <path d="M 18 88 C 20 94, 28 96, 32 90 C 36 84, 30 76, 22 80 C 16 82, 14 90, 18 94" />

      {/* Inner calligraphic branch curling inward toward the page */}
      <path d="M 38 24 C 44 26, 54 28, 58 36 C 62 44, 56 52, 48 48 C 42 44, 44 34, 52 34 C 56 34, 60 38, 58 42" />

      {/* Downward inner curly tendril */}
      <path d="M 24 38 C 26 44, 28 54, 36 58 C 44 62, 52 56, 48 48 C 44 42, 34 44, 34 52 C 34 56, 38 60, 42 58" />

      {/* Center diagonal petal loop connecting corner */}
      <path d="M 26 26 Q 36 36, 46 46" strokeWidth="1.1" />

      {/* Delicate accent pearls / dots (exact detail from Canva image) */}
      <circle cx="68" cy="22" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="22" cy="68" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="50" cy="50" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="92" cy="24" r="1" fill="currentColor" stroke="none" />
      <circle cx="24" cy="92" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
};

/**
 * Luxury Monograph Page Border Frame
 * Places 4 delicate FiligreeCorner elements in the 4 corners of the container,
 * with a subtle, luxury border line connecting them or framing the layout.
 * Leaves the entire center 100% open and unencumbered.
 */
export const LuxuryBorderFrame: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {/* 4 Corner Flourishes positioned along the outer borders */}
      <div className="absolute top-2 left-2 select-none pointer-events-none z-10 text-black opacity-85">
        <FiligreeCorner position="top-left" className="w-12 sm:w-14 h-12 sm:h-14" />
      </div>
      <div className="absolute top-2 right-2 select-none pointer-events-none z-10 text-black opacity-85">
        <FiligreeCorner position="top-right" className="w-12 sm:w-14 h-12 sm:h-14" />
      </div>
      <div className="absolute bottom-2 left-2 select-none pointer-events-none z-10 text-black opacity-85">
        <FiligreeCorner position="bottom-left" className="w-12 sm:w-14 h-12 sm:h-14" />
      </div>
      <div className="absolute bottom-2 right-2 select-none pointer-events-none z-10 text-black opacity-85">
        <FiligreeCorner position="bottom-right" className="w-12 sm:w-14 h-12 sm:h-14" />
      </div>

      {/* Content flows cleanly inside */}
      <div className="relative z-20">
        {children}
      </div>
    </div>
  );
};
