import React from 'react';

/**
 * Vintage Whimsical Border Design
 * Crafted to blend harmoniously with PANTONE Glistening Grape (#6A1A4C).
 * Uses soft, elegant vintage rosewood tones (#542d39 / #4a2732) and fluid calligraphic curves.
 * Frames the borders of the page without colliding or mixing with the typography.
 */

const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '1.8',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/**
 * Top Whimsical Border
 * Flowing double-arches from corners toward center, terminating in outward spiral violin scrolls.
 */
export const WhimsicalTopBorder: React.FC<{ className?: string }> = ({
  className = 'w-full h-16',
}) => (
  <svg
    viewBox="0 0 400 90"
    preserveAspectRatio="xMidYMid meet"
    className={className}
    {...strokeProps}
  >
    {/* Main Left Sweeping Arch */}
    <path d="M 24 90 C 24 50, 32 26, 68 22 C 104 18, 140 38, 178 38 C 190 38, 196 28, 188 18 C 180 8, 164 12, 168 24 C 172 32, 184 30, 186 24" />

    {/* Secondary Parallel Accent Line (Double-etched vintage feel) */}
    <path
      d="M 34 85 C 34 54, 42 34, 72 30 C 102 26, 136 44, 168 44"
      strokeWidth="1.1"
      strokeDasharray="4 2"
    />

    {/* Main Right Sweeping Arch (Symmetrical mirror) */}
    <path d="M 376 90 C 376 50, 368 26, 332 22 C 296 18, 260 38, 222 38 C 210 38, 204 28, 212 18 C 220 8, 236 12, 232 24 C 228 32, 216 30, 214 24" />

    {/* Secondary Parallel Right Accent Line */}
    <path
      d="M 366 85 C 366 54, 358 34, 328 30 C 298 26, 264 44, 232 44"
      strokeWidth="1.1"
      strokeDasharray="4 2"
    />

    {/* Whimsical Botanical Tendrils on Left */}
    <path d="M 95 21 C 92 12, 102 6, 108 12 C 112 18, 104 24, 96 21" strokeWidth="1.3" />
    <path d="M 52 24 C 48 16, 56 10, 60 16" strokeWidth="1.2" />

    {/* Whimsical Botanical Tendrils on Right */}
    <path d="M 305 21 C 308 12, 298 6, 292 12 C 288 18, 296 24, 304 21" strokeWidth="1.3" />
    <path d="M 348 24 C 352 16, 344 10, 340 16" strokeWidth="1.2" />

    {/* Center Delicate Diamond Jewel Accent */}
    <polygon points="200,32 203,37 200,42 197,37" fill="currentColor" stroke="none" />
    <circle cx="200" cy="24" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

/**
 * Bottom Whimsical Border
 * Mirrors the top border at the bottom edge of the page.
 */
export const WhimsicalBottomBorder: React.FC<{ className?: string }> = ({
  className = 'w-full h-16',
}) => (
  <svg
    viewBox="0 0 400 90"
    preserveAspectRatio="xMidYMid meet"
    className={className}
    {...strokeProps}
  >
    {/* Main Left Sweeping Arch (curving downward) */}
    <path d="M 24 0 C 24 40, 32 64, 68 68 C 104 72, 140 52, 178 52 C 190 52, 196 62, 188 72 C 180 82, 164 78, 168 66 C 172 58, 184 60, 186 66" />

    {/* Secondary Parallel Accent Line */}
    <path
      d="M 34 5 C 34 36, 42 56, 72 60 C 102 64, 136 46, 168 46"
      strokeWidth="1.1"
      strokeDasharray="4 2"
    />

    {/* Main Right Sweeping Arch */}
    <path d="M 376 0 C 376 40, 368 64, 332 68 C 296 72, 260 52, 222 52 C 210 52, 204 62, 212 72 C 220 82, 236 78, 232 66 C 228 58, 216 60, 214 66" />

    {/* Secondary Parallel Right Accent Line */}
    <path
      d="M 366 5 C 366 36, 358 56, 328 60 C 298 64, 264 46, 232 46"
      strokeWidth="1.1"
      strokeDasharray="4 2"
    />

    {/* Whimsical Botanical Tendrils on Left */}
    <path d="M 95 69 C 92 78, 102 84, 108 78 C 112 72, 104 66, 96 69" strokeWidth="1.3" />
    <path d="M 52 66 C 48 74, 56 80, 60 74" strokeWidth="1.2" />

    {/* Whimsical Botanical Tendrils on Right */}
    <path d="M 305 69 C 308 78, 298 84, 292 78 C 288 72, 296 66, 304 69" strokeWidth="1.3" />
    <path d="M 348 66 C 352 74, 344 80, 340 74" strokeWidth="1.2" />

    {/* Center Delicate Diamond Jewel Accent */}
    <polygon points="200,58 203,53 200,48 197,53" fill="currentColor" stroke="none" />
    <circle cx="200" cy="66" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

/**
 * Left Side Undulating Vine Border
 * Slim vertical vine running down the left outer gutter.
 */
export const WhimsicalSideBorderLeft: React.FC<{ className?: string }> = ({
  className = 'w-6 h-full',
}) => (
  <svg
    viewBox="0 0 30 300"
    preserveAspectRatio="none"
    className={className}
    {...strokeProps}
  >
    {/* Continuous gentle wave down the margin */}
    <path d="M 16 0 C 10 50, 22 100, 16 150 C 10 200, 22 250, 16 300" />
    {/* Waist whimsical scroll flourish */}
    <path
      d="M 16 150 C 8 144, 4 154, 10 160 C 16 164, 24 156, 20 148 C 18 144, 12 146, 14 152"
      strokeWidth="1.3"
    />
    <circle cx="20" cy="136" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="12" cy="172" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

/**
 * Right Side Undulating Vine Border
 * Slim vertical vine running down the right outer gutter.
 */
export const WhimsicalSideBorderRight: React.FC<{ className?: string }> = ({
  className = 'w-6 h-full',
}) => (
  <svg
    viewBox="0 0 30 300"
    preserveAspectRatio="none"
    className={className}
    {...strokeProps}
  >
    {/* Continuous gentle wave down the margin */}
    <path d="M 14 0 C 20 50, 8 100, 14 150 C 20 200, 8 250, 14 300" />
    {/* Waist whimsical scroll flourish */}
    <path
      d="M 14 150 C 22 144, 26 154, 20 160 C 14 164, 6 156, 10 148 C 12 144, 18 146, 16 152"
      strokeWidth="1.3"
    />
    <circle cx="10" cy="136" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="18" cy="172" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);
