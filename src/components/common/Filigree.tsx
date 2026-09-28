import React from 'react';

/**
 * Authentic Vintage Filigree & Calligraphic Scrollwork Frame
 * Directly based on 19th/20th-century ornamental cartouche bookplates (matching user's Canva reference).
 * Pure SVG vectors with smooth calligraphic curls, volutes, and center anthemion palmettes.
 */

const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '2',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** Symmetrical Top Filigree Crest (Matches the top crest in Canva reference) */
export const FiligreeTopCrest: React.FC<{ className?: string }> = ({ className = 'w-full h-12' }) => (
  <svg viewBox="0 0 360 60" preserveAspectRatio="xMidYMid meet" className={className} {...strokeProps}>
    {/* Center Anthemion / Palmette Flower */}
    <path d="M 180 38 C 176 24, 178 12, 180 8 C 182 12, 184 24, 180 38 Z" fill="currentColor" />
    <path d="M 177 34 C 168 26, 160 26, 158 32 C 156 38, 166 40, 177 38" />
    <path d="M 183 34 C 192 26, 200 26, 202 32 C 204 38, 194 40, 183 38" />
    <circle cx="180" cy="43" r="2" fill="currentColor" stroke="none" />

    {/* Upper Left Sweeping Arch & Volute */}
    <path d="M 174 30 C 158 14, 126 8, 92 16 C 66 22, 48 34, 54 44 C 60 52, 74 50, 78 40 C 82 28, 62 20, 50 28 C 42 34, 44 46, 52 48" />

    {/* Upper Right Sweeping Arch & Volute (Mirror) */}
    <path d="M 186 30 C 202 14, 234 8, 268 16 C 294 22, 312 34, 306 44 C 300 52, 286 50, 282 40 C 278 28, 298 20, 310 28 C 318 34, 316 46, 308 48" />

    {/* Lower Left Counter-Curve with Spiral Loop */}
    <path d="M 170 38 C 146 46, 124 48, 102 38 C 88 32, 82 20, 96 16 C 108 12, 116 22, 110 32 C 104 40, 90 42, 82 36" />

    {/* Lower Right Counter-Curve with Spiral Loop (Mirror) */}
    <path d="M 190 38 C 214 46, 236 48, 258 38 C 272 32, 278 20, 264 16 C 252 12, 244 22, 250 32 C 256 40, 270 42, 278 36" />

    {/* Delicate Inner Acanthus Filigree Leaves */}
    <path d="M 160 30 Q 150 24, 142 28 Q 152 34, 164 34" strokeWidth="1.4" />
    <path d="M 200 30 Q 210 24, 218 28 Q 208 34, 196 34" strokeWidth="1.4" />
  </svg>
);

/** Symmetrical Bottom Filigree Crest (Matches the bottom crest in Canva reference) */
export const FiligreeBottomCrest: React.FC<{ className?: string }> = ({ className = 'w-full h-12' }) => (
  <svg viewBox="0 0 360 60" preserveAspectRatio="xMidYMid meet" className={className} {...strokeProps}>
    {/* Center Anthemion / Palmette Flower pointing down */}
    <path d="M 180 22 C 176 36, 178 48, 180 52 C 182 48, 184 36, 180 22 Z" fill="currentColor" />
    <path d="M 177 26 C 168 34, 160 34, 158 28 C 156 22, 166 20, 177 22" />
    <path d="M 183 26 C 192 34, 200 34, 202 28 C 204 22, 194 20, 183 22" />
    <circle cx="180" cy="17" r="2" fill="currentColor" stroke="none" />

    {/* Lower Left Sweeping Arch & Volute */}
    <path d="M 174 30 C 158 46, 126 52, 92 44 C 66 38, 48 26, 54 16 C 60 8, 74 10, 78 20 C 82 32, 62 40, 50 32 C 42 26, 44 14, 52 12" />

    {/* Lower Right Sweeping Arch & Volute (Mirror) */}
    <path d="M 186 30 C 202 46, 234 52, 268 44 C 294 38, 312 26, 306 16 C 300 8, 286 10, 282 20 C 278 32, 298 40, 310 32 C 318 26, 316 14, 308 12" />

    {/* Upper Left Counter-Curve with Spiral Loop */}
    <path d="M 170 22 C 146 14, 124 12, 102 22 C 88 28, 82 40, 96 44 C 108 48, 116 38, 110 28 C 104 20, 90 18, 82 24" />

    {/* Upper Right Counter-Curve with Spiral Loop (Mirror) */}
    <path d="M 190 22 C 214 14, 236 12, 258 22 C 272 28, 278 40, 264 44 C 252 48, 244 38, 250 28 C 256 20, 270 18, 278 24" />

    {/* Delicate Inner Acanthus Filigree Leaves */}
    <path d="M 160 30 Q 150 36, 142 32 Q 152 26, 164 26" strokeWidth="1.4" />
    <path d="M 200 30 Q 210 36, 218 32 Q 208 26, 196 26" strokeWidth="1.4" />
  </svg>
);

/** Left Side Filigree Pillar (Matches the left vertical scrollwork border in Canva reference) */
export const FiligreeLeftPillar: React.FC<{ className?: string }> = ({ className = 'w-6 h-full' }) => (
  <svg viewBox="0 0 36 200" preserveAspectRatio="none" className={className} {...strokeProps}>
    {/* Top inward-curling volute */}
    <path d="M 32 8 C 18 8, 8 18, 12 30 C 16 38, 28 36, 29 28 C 30 20, 20 16, 14 22 C 10 26, 12 34, 18 36" />
    {/* Descending upper S-curve stem */}
    <path d="M 18 36 C 14 56, 22 78, 16 96" />
    {/* Center waist knot & acanthus bloom */}
    <path d="M 16 96 C 4 92, 2 104, 10 108 C 18 112, 26 106, 28 98 C 28 90, 18 88, 14 96" />
    <circle cx="16" cy="100" r="1.5" fill="currentColor" stroke="none" />
    {/* Descending lower S-curve stem */}
    <path d="M 16 104 C 22 122, 14 144, 18 164" />
    {/* Bottom inward-curling volute */}
    <path d="M 18 164 C 12 166, 10 174, 14 178 C 20 184, 30 180, 29 172 C 28 164, 16 162, 12 170 C 8 182, 18 192, 32 192" />
  </svg>
);

/** Right Side Filigree Pillar (Mirror of left pillar) */
export const FiligreeRightPillar: React.FC<{ className?: string }> = ({ className = 'w-6 h-full' }) => (
  <svg viewBox="0 0 36 200" preserveAspectRatio="none" className={className} {...strokeProps}>
    {/* Top inward-curling volute */}
    <path d="M 4 8 C 18 8, 28 18, 24 30 C 20 38, 8 36, 7 28 C 6 20, 16 16, 22 22 C 26 26, 24 34, 18 36" />
    {/* Descending upper S-curve stem */}
    <path d="M 18 36 C 22 56, 14 78, 20 96" />
    {/* Center waist knot & acanthus bloom */}
    <path d="M 20 96 C 32 92, 34 104, 26 108 C 18 112, 10 106, 8 98 C 8 90, 18 88, 22 96" />
    <circle cx="20" cy="100" r="1.5" fill="currentColor" stroke="none" />
    {/* Descending lower S-curve stem */}
    <path d="M 20 104 C 14 122, 22 144, 18 164" />
    {/* Bottom inward-curling volute */}
    <path d="M 18 164 C 24 166, 26 174, 22 178 C 16 184, 6 180, 7 172 C 8 164, 20 162, 24 170 C 28 182, 18 192, 4 192" />
  </svg>
);

/**
 * Complete Ornamental Filigree Cartouche Frame
 * Replicates the Canva reference exactly: Top crest, bottom crest, left and right pillars,
 * framing the content inside with refined elegance and without overdoing it.
 */
export const FiligreeCartouche: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`relative w-full text-black ${className}`}>
      {/* Top Filigree Crest */}
      <div className="w-full flex justify-center -mb-1 relative z-10 select-none pointer-events-none">
        <FiligreeTopCrest className="w-[88%] sm:w-[80%] max-w-[340px] h-9 sm:h-11 text-black" />
      </div>

      {/* Middle Body with side pillars framing content */}
      <div className="relative flex items-center justify-between w-full">
        {/* Left Pillar */}
        <div className="flex-shrink-0 flex items-center justify-center select-none pointer-events-none self-stretch py-1">
          <FiligreeLeftPillar className="w-4 sm:w-5 h-full max-h-56 text-black opacity-95" />
        </div>

        {/* Inner Content Area */}
        <div className="flex-1 px-2 sm:px-4 py-2 text-center">
          {children}
        </div>

        {/* Right Pillar */}
        <div className="flex-shrink-0 flex items-center justify-center select-none pointer-events-none self-stretch py-1">
          <FiligreeRightPillar className="w-4 sm:w-5 h-full max-h-56 text-black opacity-95" />
        </div>
      </div>

      {/* Bottom Filigree Crest */}
      <div className="w-full flex justify-center -mt-1 relative z-10 select-none pointer-events-none">
        <FiligreeBottomCrest className="w-[88%] sm:w-[80%] max-w-[340px] h-9 sm:h-11 text-black" />
      </div>
    </div>
  );
};

/** Delicate Horizontal Filigree Flourish / Divider */
export const FiligreeDivider: React.FC<{ className?: string }> = ({ className = 'w-36 h-6' }) => (
  <svg viewBox="0 0 180 26" preserveAspectRatio="xMidYMid meet" className={className} {...strokeProps}>
    {/* Center diamond & dot */}
    <polygon points="90,7 95,13 90,19 85,13" fill="currentColor" stroke="none" />
    <circle cx="78" cy="13" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="102" cy="13" r="1.5" fill="currentColor" stroke="none" />
    {/* Left scroll flourish */}
    <path d="M 72 13 C 60 7, 46 8, 34 14 C 24 19, 14 17, 16 11 C 18 6, 26 8, 26 12 C 26 16, 18 18, 10 16" />
    {/* Right scroll flourish */}
    <path d="M 108 13 C 120 7, 134 8, 146 14 C 156 19, 166 17, 164 11 C 162 6, 154 8, 154 12 C 154 16, 162 18, 170 16" />
  </svg>
);
