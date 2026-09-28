import React from 'react';

/**
 * Vintage Whimsical Background Pattern
 * Designed exclusively for the Windervale homepage (Splash.tsx).
 * Features a seamless vintage celestial & storybook tapestry:
 * - Etched crescent moon with serene profile & hanging star
 * - Radiant smiling sun with straight & wavy rays
 * - Whimsical swirling storybook clouds & wind ribbons
 * - Victorian 8-pointed starbursts & constellation lines
 * - Corner flourishes for seamless tiling
 * Color: Ethereal watermark blending gently with Glistening Grape (#6A1A4C).
 */
export const VintageWhimsicalBackground: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none z-0 overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        className="w-full h-full opacity-[0.13] text-white"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="vintage-whimsical-tile"
            x="0"
            y="0"
            width="240"
            height="240"
            patternUnits="userSpaceOnUse"
          >
            <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
              {/* === 1. Storybook Crescent Moon with Serene Profile (Upper Left) === */}
              {/* Outer crescent arc */}
              <path d="M 58 36 C 36 50, 36 82, 58 98 C 42 86, 40 78, 48 70 C 49 68, 50 66, 47 64 C 42 60, 42 48, 58 36 Z" />
              {/* Serene closed eye */}
              <path d="M 44 56 Q 47 54 50 56" strokeWidth="1" />
              <path d="M 46 55 L 45 52" strokeWidth="0.8" />
              <path d="M 48 55 L 48 52" strokeWidth="0.8" />
              {/* Gentle smile */}
              <path d="M 46 74 Q 50 76 52 73" strokeWidth="0.9" />
              {/* Hanging thread & tiny star from top horn */}
              <path d="M 58 36 Q 64 44 66 52" strokeDasharray="1.5,2" strokeWidth="0.8" />
              {/* 4-point diamond star hanging */}
              <path d="M 66 52 Q 66 55, 68 55 Q 66 55, 66 58 Q 66 55, 64 55 Q 66 55, 66 52 Z" fill="currentColor" stroke="none" />

              {/* === 2. Radiant Whimsical Sun with Serene Face (Lower Right) === */}
              {/* Sun disk */}
              <circle cx="178" cy="168" r="14" />
              {/* Serene face */}
              <path d="M 172 166 Q 174 164 176 166" strokeWidth="0.9" />
              <path d="M 180 166 Q 182 164 184 166" strokeWidth="0.9" />
              <path d="M 175 172 Q 178 175 181 172" strokeWidth="0.9" />
              <circle cx="171" cy="169" r="0.75" fill="currentColor" stroke="none" />
              <circle cx="185" cy="169" r="0.75" fill="currentColor" stroke="none" />
              {/* Alternating straight and whimsical wavy rays */}
              <path d="M 178 154 L 178 142" />
              <path d="M 188 158 Q 195 154 198 147" />
              <path d="M 192 168 L 204 168" />
              <path d="M 188 178 Q 196 182 199 189" />
              <path d="M 178 182 L 178 194" />
              <path d="M 168 178 Q 160 182 157 189" />
              <path d="M 164 168 L 152 168" />
              <path d="M 168 158 Q 161 154 158 147" />

              {/* === 3. Whimsical Storybook Clouds & Wind Ribbons === */}
              {/* Upper Right Cloud */}
              <path d="M 142 62 C 142 52, 154 46, 164 52 C 172 44, 186 46, 190 54 C 198 52, 207 58, 203 68 C 199 74, 147 74, 142 62 Z" />
              <path d="M 154 64 Q 166 58 178 65 Q 186 70 193 66" strokeWidth="0.8" />

              {/* Lower Left Cloud */}
              <path d="M 48 188 C 48 178, 60 172, 70 178 C 78 170, 92 172, 96 180 C 104 178, 113 184, 109 194 C 105 200, 53 200, 48 188 Z" />
              <path d="M 60 190 Q 72 184 84 191 Q 92 196 99 192" strokeWidth="0.8" />

              {/* === 4. Center Victorian 8-Point Starburst === */}
              <g transform="translate(120, 118)">
                {/* Major Cardinal Points */}
                <path d="M 0 -15 L 2 -4 L 15 0 L 2 4 L 0 15 L -2 4 L -15 0 L -2 -4 Z" fill="currentColor" />
                {/* Diagonal Rays */}
                <path d="M -7 -7 L 7 7" strokeWidth="0.8" />
                <path d="M 7 -7 L -7 7" strokeWidth="0.8" />
                <circle cx="0" cy="0" r="1.8" fill="#6A1A4C" stroke="currentColor" strokeWidth="0.8" />
              </g>

              {/* === 5. Whimsical Constellation Lines & Stars === */}
              {/* Dotted Constellation Path */}
              <path d="M 96 38 L 120 118 L 152 108 L 210 112" strokeDasharray="2,3" strokeWidth="0.7" />
              <path d="M 32 136 L 72 142 L 120 118" strokeDasharray="2,3" strokeWidth="0.7" />

              {/* Twinkling 4-Point Stars */}
              {/* Near Moon */}
              <path d="M 96 38 Q 96 42, 100 42 Q 96 42, 96 46 Q 96 42, 92 42 Q 96 42, 96 38 Z" fill="currentColor" stroke="none" />
              {/* Upper East */}
              <path d="M 210 112 Q 210 115, 213 115 Q 210 115, 210 118 Q 210 115, 207 115 Q 210 115, 210 112 Z" fill="currentColor" stroke="none" />
              {/* West Star */}
              <path d="M 32 136 Q 32 139, 35 139 Q 32 139, 32 142 Q 32 139, 29 139 Q 32 139, 32 136 Z" fill="currentColor" stroke="none" />
              {/* Middle Cluster Star */}
              <path d="M 152 108 Q 152 110, 154 110 Q 152 110, 152 112 Q 152 110, 150 110 Q 152 110, 152 108 Z" fill="currentColor" stroke="none" />
              {/* South Star */}
              <path d="M 120 208 Q 120 211, 123 211 Q 120 211, 120 214 Q 120 211, 117 211 Q 120 211, 120 208 Z" fill="currentColor" stroke="none" />

              {/* Whimsical Shooting Star / Comet */}
              <path d="M 90 22 Q 90 24, 92 24 Q 90 24, 90 26 Q 90 24, 88 24 Q 90 24, 90 22 Z" fill="currentColor" stroke="none" />
              <path d="M 88 24 C 74 27, 60 34, 48 44" strokeWidth="0.8" strokeDasharray="1.5,2.5" />

              {/* === 6. Seamless Corner Flourishes (Tiling across edges) === */}
              {/* Top-Left */}
              <path d="M 0 32 Q 18 28 28 18 Q 32 0 32 0" />
              <path d="M 0 20 Q 12 16 16 12 Q 20 0 20 0" strokeWidth="0.8" />
              <circle cx="16" cy="16" r="1.2" fill="currentColor" stroke="none" />

              {/* Top-Right */}
              <path d="M 240 32 Q 222 28 212 18 Q 208 0 208 0" />
              <path d="M 240 20 Q 228 16 224 12 Q 220 0 220 0" strokeWidth="0.8" />
              <circle cx="224" cy="16" r="1.2" fill="currentColor" stroke="none" />

              {/* Bottom-Left */}
              <path d="M 0 208 Q 18 212 28 222 Q 32 240 32 240" />
              <path d="M 0 220 Q 12 224 16 228 Q 20 240 20 240" strokeWidth="0.8" />
              <circle cx="16" cy="224" r="1.2" fill="currentColor" stroke="none" />

              {/* Bottom-Right */}
              <path d="M 240 208 Q 222 212 212 222 Q 208 240 208 240" />
              <path d="M 240 220 Q 228 224 224 228 Q 220 240 220 240" strokeWidth="0.8" />
              <circle cx="224" cy="224" r="1.2" fill="currentColor" stroke="none" />

              {/* === 7. Delicate Stardust Dots scattered throughout === */}
              <circle cx="24" cy="76" r="1" fill="currentColor" stroke="none" />
              <circle cx="82" cy="88" r="0.9" fill="currentColor" stroke="none" />
              <circle cx="138" cy="30" r="1" fill="currentColor" stroke="none" />
              <circle cx="198" cy="88" r="0.9" fill="currentColor" stroke="none" />
              <circle cx="222" cy="154" r="1" fill="currentColor" stroke="none" />
              <circle cx="140" cy="148" r="0.9" fill="currentColor" stroke="none" />
              <circle cx="150" cy="216" r="1" fill="currentColor" stroke="none" />
              <circle cx="78" cy="138" r="0.8" fill="currentColor" stroke="none" />
              <circle cx="28" cy="220" r="1" fill="currentColor" stroke="none" />
              <circle cx="218" cy="220" r="0.9" fill="currentColor" stroke="none" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#vintage-whimsical-tile)" />
      </svg>
    </div>
  );
};
