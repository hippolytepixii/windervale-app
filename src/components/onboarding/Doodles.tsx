import React from 'react';

const strokeDefaults = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '2.2',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** Whimsical Smiling Sun with wobbly rays */
export const DoodleSun: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 64 64" className={className} {...strokeDefaults}>
    <path d="M 32 18 C 39.5 17.5, 46.2 24.1, 46 32 C 45.8 40.2, 39.1 46.3, 31.8 46 C 24.3 45.7, 18 39.5, 18 32 C 18 24.2, 24.5 18.2, 32 18 Z" />
    <circle cx="27" cy="29" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="37" cy="29" r="1.5" fill="currentColor" stroke="none" />
    <path d="M 27 36 C 29.5 39, 34.5 39, 37 36" strokeWidth="2" />
    <path d="M 32 6 Q 31 11, 32 13" />
    <path d="M 32 51 Q 33 55, 32 58" />
    <path d="M 6 32 Q 11 31, 13 32" />
    <path d="M 51 32 Q 54 33, 58 32" />
    <path d="M 13 14 Q 17 18, 19 20" />
    <path d="M 45 44 Q 48 48, 51 51" />
    <path d="M 14 50 Q 18 46, 20 44" />
    <path d="M 44 20 Q 48 16, 50 13" />
  </svg>
);

/** Whimsical 16mm / 35mm Vintage Movie Camera Doodle */
export const DoodleCamera: React.FC<{ className?: string }> = ({ className = 'w-12 h-10' }) => (
  <svg viewBox="0 0 70 54" className={className} {...strokeDefaults}>
    <circle cx="23" cy="14" r="9" />
    <circle cx="23" cy="14" r="3" />
    <circle cx="39" cy="14" r="9" />
    <circle cx="39" cy="14" r="3" />
    <path d="M 14 23 C 13.5 23, 14 43.5, 14 44 C 14 46, 16 46, 48 46 C 50 46, 50 44, 50 24 C 50 23, 48 23, 14 23 Z" />
    <path d="M 50 28 L 62 21 L 62 47 L 50 40 Z" />
    <path d="M 58 27 L 58 41" strokeWidth="1.5" />
    <path d="M 12 18 L 16 23" />
    <path d="M 14 34 L 7 34 L 7 39" />
    <path d="M 26 46 L 20 52" />
    <path d="M 32 46 L 32 53" />
    <path d="M 38 46 L 44 52" />
  </svg>
);

/** Whimsical Indie Eyeball (Arthouse visual motif) */
export const DoodleEye: React.FC<{ className?: string }> = ({ className = 'w-8 h-6' }) => (
  <svg viewBox="0 0 50 32" className={className} {...strokeDefaults}>
    <path d="M 4 16 Q 25 2, 46 16 Q 25 30, 4 16 Z" />
    <circle cx="25" cy="16" r="6.5" />
    <circle cx="25" cy="16" r="2.5" fill="currentColor" stroke="none" />
    <path d="M 14 8 L 11 3" />
    <path d="M 25 6 L 25 1" />
    <path d="M 36 8 L 39 3" />
  </svg>
);

/** Whimsical 4-Point Star / Twinkle */
export const DoodleStar: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 32 32" className={className} {...strokeDefaults}>
    <path d="M 16 2 Q 16 16, 2 16 Q 16 16, 16 30 Q 16 16, 30 16 Q 16 16, 16 2 Z" />
  </svg>
);

/** Whimsical Loopy Doodle Arrow pointing down-right */
export const DoodleLoopyArrow: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 50 50" className={className} {...strokeDefaults}>
    <path d="M 10 10 Q 30 4, 30 18 Q 30 30, 16 26 Q 8 22, 14 14 Q 22 8, 38 34" />
    <path d="M 28 34 L 38 34 L 36 24" />
  </svg>
);

/** Whimsical Loopy Arrow pointing down-left */
export const DoodleLoopyArrowLeft: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 50 50" className={className} {...strokeDefaults}>
    <path d="M 40 10 Q 20 4, 20 18 Q 20 30, 34 26 Q 42 22, 36 14 Q 28 8, 12 34" />
    <path d="M 22 34 L 12 34 L 14 24" />
  </svg>
);

/** Whimsical Wavy Underline */
export const DoodleWavyUnderline: React.FC<{ className?: string }> = ({ className = 'w-full h-3' }) => (
  <svg viewBox="0 0 200 16" preserveAspectRatio="none" className={className} {...strokeDefaults}>
    <path d="M 2 8 Q 18 1, 34 8 T 66 8 T 98 8 T 130 8 T 162 8 T 194 8" strokeWidth="2.5" />
  </svg>
);

/** Stage 01: Hand-Drawn Magnifier */
export const DoodleMagnifier: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 28 28" className={className} {...strokeDefaults}>
    <circle cx="12" cy="12" r="7.5" />
    <path d="M 17.5 17.5 L 24.5 24.5" strokeWidth="2.5" />
    <path d="M 10 9 Q 12 7, 14 9" strokeWidth="1.5" />
  </svg>
);

/** Stage 02: Hand-Drawn Steaming Coffee Mug */
export const DoodleCoffee: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 28 28" className={className} {...strokeDefaults}>
    <path d="M 6 9 L 7 21 C 7 24, 19 24, 19 21 L 20 9 Z" />
    <path d="M 20 11 C 24 11, 24 18, 20 18" />
    <path d="M 10 7 Q 9 5, 10 3" strokeWidth="1.5" />
    <path d="M 14 6 Q 15 4, 14 2" strokeWidth="1.5" />
  </svg>
);

/** Stage 03: Hand-Drawn Intertwined Spark */
export const DoodleConnect: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 28 28" className={className} {...strokeDefaults}>
    <path d="M 14 3 L 14 25" />
    <path d="M 3 14 L 25 14" />
    <circle cx="14" cy="14" r="3" fill="currentColor" stroke="none" />
    <path d="M 6 6 L 10 10" />
    <path d="M 22 22 L 18 18" />
    <path d="M 22 6 L 18 10" />
    <path d="M 6 22 L 10 18" />
  </svg>
);

/** Stage 04: Hand-Drawn Cinema Clapperboard */
export const DoodleClapper: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 28 28" className={className} {...strokeDefaults}>
    <rect x="4" y="11" width="20" height="13" rx="1" />
    <path d="M 3 10 L 25 6 L 24 11 L 3 11 Z" />
    <path d="M 8 10 L 11 7" strokeWidth="1.5" />
    <path d="M 14 9 L 17 6" strokeWidth="1.5" />
    <path d="M 20 8 L 22 6" strokeWidth="1.5" />
  </svg>
);

/** Stage 05: Hand-Drawn Film Strip */
export const DoodleFilmStrip: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 28 28" className={className} {...strokeDefaults}>
    <rect x="4" y="4" width="20" height="20" rx="1" />
    <line x1="9" y1="4" x2="9" y2="24" />
    <line x1="19" y1="4" x2="19" y2="24" />
    <circle cx="6.5" cy="7" r="0.8" fill="currentColor" />
    <circle cx="6.5" cy="14" r="0.8" fill="currentColor" />
    <circle cx="6.5" cy="21" r="0.8" fill="currentColor" />
    <circle cx="21.5" cy="7" r="0.8" fill="currentColor" />
    <circle cx="21.5" cy="14" r="0.8" fill="currentColor" />
    <circle cx="21.5" cy="21" r="0.8" fill="currentColor" />
  </svg>
);

/** Stage 06: Hand-Drawn Padlock */
export const DoodleLock: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 28 28" className={className} {...strokeDefaults}>
    <path d="M 9 12 L 9 8 C 9 5, 19 5, 19 8 L 19 12" />
    <rect x="6" y="12" width="16" height="12" rx="2" />
    <circle cx="14" cy="17" r="1.5" fill="currentColor" />
    <path d="M 14 18.5 L 14 21" strokeWidth="2" />
  </svg>
);

/** Stage 07: Hand-Drawn Audio Cassette */
export const DoodleCassette: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 28 28" className={className} {...strokeDefaults}>
    <rect x="3" y="6" width="22" height="16" rx="2" />
    <rect x="7" y="10" width="14" height="8" rx="1" />
    <circle cx="10" cy="14" r="1.8" />
    <circle cx="18" cy="14" r="1.8" />
    <line x1="12" y1="14" x2="16" y2="14" strokeWidth="1.5" />
  </svg>
);

/** Stage 08: Hand-Drawn Laurel Wreath */
export const DoodleLaurel: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 28 28" className={className} {...strokeDefaults}>
    <path d="M 6 22 C 4 14, 10 6, 14 4 C 18 6, 24 14, 22 22" />
    <path d="M 7 17 Q 3 16, 5 13" />
    <path d="M 9 11 Q 5 10, 8 7" />
    <path d="M 21 17 Q 25 16, 23 13" />
    <path d="M 19 11 Q 23 10, 20 7" />
    <circle cx="14" cy="23" r="1.5" fill="currentColor" />
  </svg>
);

/** Whimsical Spiral Scribble */
export const DoodleSpiral: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 32 32" className={className} {...strokeDefaults}>
    <path d="M 16 16 C 17 15, 17 13, 15 13 C 12 13, 11 17, 13 20 C 16 23, 22 21, 23 16 C 24 9, 15 6, 9 11 C 3 17, 7 27, 16 28 C 25 29, 30 20, 29 13" />
  </svg>
);

/** Whimsical Hand-drawn Sparkle Cluster */
export const DoodleSparkleCluster: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg viewBox="0 0 40 40" className={className} {...strokeDefaults}>
    <path d="M 20 4 Q 20 16, 8 16 Q 20 16, 20 28 Q 20 16, 32 16 Q 20 16, 20 4 Z" />
    <path d="M 32 26 Q 32 30, 28 30 Q 32 30, 32 34 Q 32 30, 36 30 Q 32 30, 32 26 Z" strokeWidth="1.8" />
    <circle cx="10" cy="26" r="1" fill="currentColor" stroke="none" />
    <circle cx="30" cy="8" r="1" fill="currentColor" stroke="none" />
  </svg>
);
