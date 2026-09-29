import React, { useState } from 'react';

interface SplashProps {
  onComplete: () => void;
}

// -----------------------------------------------------------------------------
// FUN LITTLE DRAWINGS: CHARMING HAND-DRAWN SCALE FIGURES (Black Ink SVGs)
// Inspired directly by Grace Piscitello's avant-garde book spreads
// -----------------------------------------------------------------------------

// Figure 1: Walking practitioner with portfolio case in stride
const FigureWalking = ({ className = "text-black" }: { className?: string }) => (
  <svg className={`w-5 h-8 inline-block shrink-0 ${className}`} viewBox="0 0 20 32" fill="currentColor">
    <circle cx="10" cy="4" r="2.8" />
    <path d="M8 8 h4 v10 h-4 z" />
    <path d="M8.5 18 L6 29 M11.5 18 L14 29" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    {/* Tiny portfolio */}
    <rect x="14" y="14" width="4.5" height="6" rx="0.5" />
  </svg>
);

// Figure 2: Standing figure looking quietly into the open white void
const FigureStandingVoid = ({ className = "text-black" }: { className?: string }) => (
  <svg className={`w-5 h-8 inline-block shrink-0 ${className}`} viewBox="0 0 20 32" fill="currentColor">
    <circle cx="10" cy="4" r="2.8" />
    <path d="M8 8 h4 v11 h-4 z" />
    <line x1="8.5" y1="19" x2="8.5" y2="30" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="11.5" y1="19" x2="11.5" y2="30" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// Figure 3: Gazing figure looking upward at the architecture
const FigureGazingVoid = ({ className = "text-black" }: { className?: string }) => (
  <svg className={`w-5 h-8 inline-block shrink-0 ${className}`} viewBox="0 0 20 32" fill="currentColor">
    <circle cx="10" cy="3.8" r="2.8" />
    <path d="M8 7.8 h4 v11 h-4 z" />
    <line x1="9" y1="18.8" x2="7.5" y2="30" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="11" y1="18.8" x2="12.5" y2="30" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// Figure 4: Tiny figure climbing staircase
const FigureClimbing = ({ className = "text-black" }: { className?: string }) => (
  <svg className={`w-6 h-9 inline-block shrink-0 ${className}`} viewBox="0 0 24 36" fill="currentColor">
    <circle cx="13" cy="5" r="2.6" />
    <path d="M10.5 8.5 h5 v10 h-5 z" />
    <path d="M10.5 10 L6 7 M15.5 10 L20 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M11 18.5 L8 28 M14 18.5 L17 23 L21 23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Figure 5: Cinematographer with 16mm camera on tripod
const FigureCamera = ({ className = "text-black" }: { className?: string }) => (
  <svg className={`w-8 h-10 inline-block shrink-0 ${className}`} viewBox="0 0 36 44" fill="currentColor">
    <line x1="24" y1="20" x2="16" y2="42" stroke="currentColor" strokeWidth="1.8" />
    <line x1="24" y1="20" x2="24" y2="42" stroke="currentColor" strokeWidth="1.8" />
    <line x1="24" y1="20" x2="32" y2="42" stroke="currentColor" strokeWidth="1.8" />
    <rect x="21" y="14" width="8" height="7" rx="0.8" />
    <circle cx="23" cy="11.5" r="2.8" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="28" cy="11.5" r="2.8" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <line x1="29" y1="17.5" x2="34" y2="17.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    <circle cx="12" cy="13" r="3.2" />
    <path d="M10 17 q5 1 8 0 l2 6 h-4 l-2 19 h-2.5 l1 -18 z" />
  </svg>
);

// Figure 6: Reading/drafting seated figure
const FigureReading = ({ className = "text-black" }: { className?: string }) => (
  <svg className={`w-6 h-8 inline-block shrink-0 ${className}`} viewBox="0 0 28 36" fill="currentColor">
    <circle cx="11" cy="6" r="3.2" />
    <path d="M8.5 10.5 h5 l2 12 h-8 z" />
    <path d="M7 22 q-4 6 2 9 q8 1 12 -2 q3 -3 -3 -7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M15 16 l6 -3.5 v7 l-6 3.5 z M15 16 l-6 -3.5 v7 l6 3.5 z" fill="none" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

// -----------------------------------------------------------------------------
// EXACT ARCHITECTURAL MOTIFS FROM THE SUBSTACK SPREAD
// 1. Tilted empty box, circle, and spaced 't h e   w i n d o w'
// 2. Staircase elevation with handrail & vertical railings directly on the page
// -----------------------------------------------------------------------------

const ArchitecturalWindowDrafting = () => (
  <div className="py-2 my-2 select-none">
    <div className="flex items-center justify-between pb-1 font-mono text-[9px] uppercase tracking-[0.3em] text-black/70">
      <span>t &nbsp; h &nbsp; e &nbsp;&nbsp; w &nbsp; i &nbsp; n &nbsp; d &nbsp; o &nbsp; w</span>
      <span className="text-[7.5px] tracking-widest text-black/40">ELEVATION // PLAN</span>
    </div>

    {/* Tilted rectangle & circle schema */}
    <div className="relative w-full h-24 flex items-center justify-center">
      <svg className="w-full h-full" viewBox="0 0 220 90" fill="none">
        {/* Tilted empty drafting box (exact pattern from reference) */}
        <g transform="rotate(-26 70 45)">
          <rect x="25" y="16" width="60" height="38" stroke="currentColor" strokeWidth="1.3" fill="none" />
          <line x1="25" y1="16" x2="85" y2="54" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
        </g>

        {/* Survey circle with center point */}
        <circle cx="145" cy="42" r="16" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <circle cx="145" cy="42" r="2" fill="currentColor" />
        <line x1="125" y1="42" x2="165" y2="42" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 2" opacity="0.6" />
        <line x1="145" y1="22" x2="145" y2="62" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 2" opacity="0.6" />

        {/* Tiny figure standing near the circle */}
        <g transform="translate(180, 26) scale(0.65)">
          <circle cx="10" cy="4" r="2.8" fill="currentColor" />
          <path d="M8 8 h4 v11 h-4 z" fill="currentColor" />
          <line x1="8.5" y1="19" x2="8.5" y2="30" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="11.5" y1="19" x2="11.5" y2="30" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  </div>
);

const ArchitecturalStaircasePure = () => (
  <div className="w-full my-4 select-none">
    {/* Pure architectural line drawing directly on the page (NO rounded cards, NO gray boxes) */}
    <div className="relative w-full">
      <svg className="w-full h-32" viewBox="0 0 320 120" fill="none">
        {/* Ground baseline */}
        <line x1="10" y1="105" x2="310" y2="105" stroke="currentColor" strokeWidth="1.4" />

        {/* Elevation staircase steps */}
        <path
          d="M 40 105 L 85 105 L 85 85 L 135 85 L 135 65 L 185 65 L 185 45 L 235 45 L 235 25 L 285 25"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="none"
        />

        {/* Top landing and rear vertical wall */}
        <line x1="285" y1="25" x2="305" y2="25" stroke="currentColor" strokeWidth="1.6" />
        <line x1="305" y1="25" x2="305" y2="105" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" opacity="0.5" />

        {/* Handrail parallel to stairs */}
        <line x1="38" y1="70" x2="238" y2="-10" stroke="currentColor" strokeWidth="1.4" />
        <line x1="238" y1="-10" x2="305" y2="-10" stroke="currentColor" strokeWidth="1.4" />

        {/* Vertical baluster spindles */}
        <line x1="60" y1="105" x2="60" y2="60" stroke="currentColor" strokeWidth="0.9" opacity="0.7" />
        <line x1="110" y1="85" x2="110" y2="40" stroke="currentColor" strokeWidth="0.9" opacity="0.7" />
        <line x1="160" y1="65" x2="160" y2="20" stroke="currentColor" strokeWidth="0.9" opacity="0.7" />
        <line x1="210" y1="45" x2="210" y2="0" stroke="currentColor" strokeWidth="0.9" opacity="0.7" />
        <line x1="260" y1="25" x2="260" y2="-10" stroke="currentColor" strokeWidth="0.9" opacity="0.7" />
        <line x1="300" y1="25" x2="300" y2="-10" stroke="currentColor" strokeWidth="0.9" opacity="0.7" />

        {/* Dimension labels */}
        <text x="12" y="115" className="font-mono text-[7px] fill-current opacity-60">+0.00</text>
        <text x="290" y="115" className="font-mono text-[7px] fill-current opacity-60">+2.40m</text>

        {/* Tiny figure climbing the steps */}
        <g transform="translate(145, 34) scale(0.7)">
          <circle cx="13" cy="5" r="2.6" fill="currentColor" />
          <path d="M10.5 8.5 h5 v10 h-5 z" fill="currentColor" />
          <path d="M10.5 10 L6 7 M15.5 10 L20 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M11 18.5 L8 28 M14 18.5 L17 23 L21 23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  </div>
);

export const Splash: React.FC<SplashProps> = ({ onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const scrollToMovements = () => {
    const el = document.getElementById('how-windervale-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 8 Movements with fun little architectural line drawings
  const articles = [
    {
      num: '01',
      title: 'FIND PEOPLE',
      desc: 'Browse the Human Map. Discover verified practitioners across cinema, sound, visual art, typography, and architecture.',
      scribble: 'find the cinematographer who shoots what you hear',
      drawing: (
        <svg className="w-16 h-12 text-black opacity-80 shrink-0" viewBox="0 0 60 40" fill="none">
          <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1.2" />
          <line x1="20" y1="4" x2="20" y2="36" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" />
          <line x1="4" y1="20" x2="36" y2="20" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" />
          <circle cx="20" cy="20" r="2.5" fill="currentColor" />
          <g transform="translate(42, 6) scale(0.65)">
            <circle cx="10" cy="5" r="3.2" fill="currentColor" />
            <path d="M7.5 9.5 h5 v13 h-5 z" fill="currentColor" />
            <line x1="8.5" y1="22.5" x2="8.5" y2="38" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="11.5" y1="22.5" x2="11.5" y2="38" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        </svg>
      )
    },
    {
      num: '02',
      title: 'MEET',
      desc: 'Inspect their Creative Dossier: real background, working philosophy, past works, and active studio availability.',
      scribble: 'real portfolios, zero follower counts',
      drawing: (
        <svg className="w-16 h-12 text-black opacity-80 shrink-0" viewBox="0 0 60 40" fill="none">
          <rect x="10" y="6" width="22" height="32" stroke="currentColor" strokeWidth="1.5" />
          <line x1="6" y1="38" x2="36" y2="38" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="28" cy="22" r="1.5" fill="currentColor" />
          <g transform="translate(36, 6) scale(0.65)">
            <circle cx="12" cy="5" r="3.2" fill="currentColor" />
            <path d="M9.5 9.5 h5 v13 h-5 z" fill="currentColor" />
            <path d="M10 22 L6 36 M14 22 L18 36" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        </svg>
      )
    },
    {
      num: '03',
      title: 'CONNECT',
      desc: 'Request connection through a direct creative note. Once accepted, an unmediated studio channel opens.',
      scribble: 'no algorithmic inbox, real studio notes',
      drawing: (
        <svg className="w-18 h-12 text-black opacity-80 shrink-0" viewBox="0 0 70 40" fill="none">
          <path d="M 12 18 Q 35 30 58 18" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 2" />
          <circle cx="6" cy="12" r="2.8" fill="currentColor" />
          <path d="M4 16 h4 v14 h-4 z" fill="currentColor" />
          <circle cx="64" cy="12" r="2.8" fill="currentColor" />
          <path d="M62 16 h4 v14 h-4 z" fill="currentColor" />
          <text x="26" y="14" className="font-mono text-[7px] fill-current font-bold">NOTE</text>
        </svg>
      )
    },
    {
      num: '04',
      title: 'MAKE',
      desc: 'Instantiate a project inside your Workspace: independent film, album, publication, monograph, or exhibition.',
      scribble: 'the project is the unit',
      drawing: (
        <svg className="w-16 h-12 text-black opacity-80 shrink-0" viewBox="0 0 60 40" fill="none">
          <path d="M 22 10 L 40 10 L 48 20 L 30 20 Z" stroke="currentColor" strokeWidth="1.2" />
          <path d="M 22 10 L 22 26 L 30 36 L 30 20 Z" stroke="currentColor" strokeWidth="1.2" />
          <path d="M 30 20 L 48 20 L 48 36 L 30 36 Z" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="12" cy="18" r="2.8" fill="currentColor" />
          <path d="M10 22 h4 v14 h-4 z" fill="currentColor" />
        </svg>
      )
    },
    {
      num: '05',
      title: 'BUILD',
      desc: 'A dedicated production atelier. Maintain call sheets, scripts, track lists, production milestones, and crew rosters.',
      scribble: 'call sheets, track lists & dailies',
      drawing: (
        <svg className="w-16 h-12 text-black opacity-80 shrink-0" viewBox="0 0 60 40" fill="none">
          <path d="M 8 36 L 20 36 L 20 26 L 34 26 L 34 16 L 48 16" stroke="currentColor" strokeWidth="1.4" />
          <line x1="8" y1="24" x2="48" y2="4" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" />
          <g transform="translate(24, 2) scale(0.55)">
            <circle cx="15" cy="6.5" r="3.2" fill="currentColor" />
            <path d="M12 11 h6 v12 h-6 z" fill="currentColor" />
            <path d="M13 23 L9 35 M16 23 L20 29 L25 29" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        </svg>
      )
    },
    {
      num: '06',
      title: 'PROTECT',
      desc: 'Structure clear rights, split sheets, and deal terms. Safeguard intellectual property before the work leaves the studio.',
      scribble: 'sign agreements before lighting fires',
      drawing: (
        <svg className="w-16 h-12 text-black opacity-80 shrink-0" viewBox="0 0 60 40" fill="none">
          <path d="M 12 36 L 12 20 A 18 18 0 0 1 48 20 L 48 36" stroke="currentColor" strokeWidth="1.4" fill="none" />
          <rect x="27" y="2" width="6" height="5" stroke="currentColor" strokeWidth="1.2" fill="currentColor" />
          <circle cx="30" cy="22" r="5" stroke="currentColor" strokeWidth="1.2" fill="none" />
          <path d="M 28 22 L 30 24 L 33 20" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      )
    },
    {
      num: '07',
      title: 'REMEMBER',
      desc: 'Preserve key creative decisions, milestones, and production notes in a permanent, immutable archive.',
      scribble: 'never forget why you made that cut',
      drawing: (
        <svg className="w-16 h-12 text-black opacity-80 shrink-0" viewBox="0 0 60 40" fill="none">
          <rect x="8" y="10" width="34" height="26" stroke="currentColor" strokeWidth="1.4" />
          <line x1="8" y1="18" x2="42" y2="18" stroke="currentColor" strokeWidth="1" />
          <line x1="8" y1="26" x2="42" y2="26" stroke="currentColor" strokeWidth="1" />
          <rect x="14" y="27" width="28" height="6" stroke="currentColor" strokeWidth="1.2" fill="none" />
          <g transform="translate(44, 8) scale(0.6)">
            <circle cx="10" cy="5" r="3.2" fill="currentColor" />
            <path d="M7.5 9.5 h5 v13 h-5 z" fill="currentColor" />
            <line x1="8.5" y1="22.5" x2="8.5" y2="38" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="11.5" y1="22.5" x2="11.5" y2="38" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        </svg>
      )
    },
    {
      num: '08',
      title: 'COMPLETE',
      desc: 'Archive the finished piece. Generate cinema-grade credits, verified rights registry, and final master documentation.',
      scribble: 'permanent cinema slate in the archive',
      drawing: (
        <svg className="w-16 h-12 text-black opacity-80 shrink-0" viewBox="0 0 60 40" fill="none">
          <path d="M 6 8 L 36 34 L 54 34 L 14 8 Z" fill="currentColor" opacity="0.15" />
          <line x1="6" y1="8" x2="36" y2="34" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="14" y1="8" x2="54" y2="34" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
          <rect x="40" y="28" width="12" height="10" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="10" cy="8" r="4" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      )
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#000000] text-[#FAF7F2] select-none overflow-x-hidden relative">
      {/* Solid pitch dark canvas background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#000000]" />

      {/* Main broadsheet editorial container */}
      <div
        className={`w-full max-w-6xl mx-auto px-4 sm:px-8 md:px-12 py-6 sm:py-8 relative z-10 transition-all duration-300 ${
          isExiting ? 'animate-page-turn' : ''
        }`}
      >
        {/* ====================================================================
            COVER & HERO SPREAD
            ==================================================================== */}
        <section className="min-h-[90vh] flex flex-col justify-between pb-8">
          {/* Chic Art Magazine Folio Masthead */}
          <header className="pt-2 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-[2px] border-white/20 gap-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs md:text-sm font-black uppercase tracking-[0.25em] text-[#FAF7F2] bg-white/10 px-2.5 py-1 rounded-md border border-white/20">
                WINDERVALE &middot; VOL. I
              </span>
              <span className="font-mono text-[10px] md:text-xs text-white/70 tracking-widest uppercase font-bold">
                EDITION 2026 &middot; INDEPENDENT ART QUARTERLY
              </span>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span className="font-mono text-[10px] tracking-widest uppercase bg-[#FFFDF9] text-black px-3.5 py-1 rounded-full font-black border border-black shadow-[2px_2px_0px_#000000]">
                STUDIO DIRECTORY
              </span>
            </div>
          </header>

          {/* Hero Core */}
          <div className="my-auto py-10 md:py-14 space-y-7 md:space-y-9">
            {/* Minimalist Sub-header Tag */}
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="font-mono text-[10px] md:text-xs tracking-[0.22em] uppercase text-white/80 font-bold">
                AN AUTONOMOUS ATELIER FOR INDEPENDENT PRACTITIONERS
              </span>
            </div>

            {/* Giant Signature: windervale */}
            <div className="space-y-3 relative">
              <div className="flex items-baseline justify-between">
                <h1 className="font-brand text-[clamp(4.5rem,13vw,9.5rem)] text-[#FFFDF9] hover:text-white tracking-normal leading-[0.95] lowercase max-w-full drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] transition-colors duration-300 cursor-default">
                  windervale
                </h1>
                {/* Fun little camera figure standing by the title */}
                <div className="hidden md:block pr-6 pb-4 opacity-90">
                  <FigureCamera className="text-white scale-125" />
                </div>
              </div>

              {/* Subtitle: 'a complete infrastructure for creative people.' */}
              <p className="font-fun text-2xl sm:text-3xl md:text-4xl lg:text-[42px] text-[#FAF7F2] font-normal italic tracking-tight leading-snug max-w-3xl">
                a complete infrastructure for creative people.
              </p>
            </div>

            {/* Colophon Principles Box */}
            <div className="max-w-3xl rounded-3xl border-[2.5px] border-black bg-[#FFFDF9] text-black p-6 sm:p-8 space-y-4 shadow-[8px_8px_0px_#000000] relative">
              {/* Tiny figure perched on the top right edge */}
              <div className="absolute -top-6 right-8">
                <FigureReading className="text-black" />
              </div>

              <div className="flex items-center justify-between border-b-[2px] border-black pb-3">
                <span className="font-mono text-xs font-black uppercase tracking-[0.2em] text-black">
                  COLOPHON &middot; STUDIO PRINCIPLES
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-black/60 font-bold">
                  UNMEDIATED CRAFT
                </span>
              </div>

              <p className="font-fun text-base sm:text-lg text-black/90 leading-relaxed font-normal">
                No algorithmic scoring. No vanity metrics. Just artists, filmmakers, musicians, and designers building master works together in unmediated project spaces.
              </p>

              {/* Pill tags for disciplines */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-black/15 font-mono text-[10px] font-bold">
                <span className="bg-black text-[#FFFDF9] px-3 py-1 rounded-full uppercase">16MM &amp; 35MM CINEMA</span>
                <span className="bg-black text-[#FFFDF9] px-3 py-1 rounded-full uppercase">ANALOG AUDIO</span>
                <span className="bg-black text-[#FFFDF9] px-3 py-1 rounded-full uppercase">TYPOGRAPHY &amp; PRINT</span>
                <span className="bg-black text-[#FFFDF9] px-3 py-1 rounded-full uppercase">SCULPTURE &amp; SPATIAL</span>
              </div>
            </div>

            {/* Instant Hero CTA Button */}
            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={handleEnter}
                className="group inline-flex items-center gap-4 bg-[#FFFDF9] hover:bg-black text-black hover:text-[#FFFDF9] border-[2.5px] border-black px-7 sm:px-9 py-3.5 sm:py-4 rounded-full shadow-[6px_6px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] hover:translate-x-1 hover:translate-y-1 transition-all duration-200 cursor-pointer select-none"
              >
                <span className="font-mono text-xs font-black uppercase tracking-[0.25em]">
                  ENTER WINDERVALE
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-black group-hover:bg-white transition-colors" />
                <span className="font-fun italic text-sm group-hover:translate-x-1 transition-transform">
                  [ open workspace &rarr; ]
                </span>
              </button>
              <div className="hidden sm:block">
                <FigureWalking className="text-white opacity-80" />
              </div>
            </div>
          </div>

          {/* Table of Contents Scroll Cue */}
          <div className="pt-2 flex flex-col items-center justify-center">
            <button
              onClick={scrollToMovements}
              className="flex items-center gap-2 group cursor-pointer text-white/70 hover:text-white transition-colors"
            >
              <span className="font-mono text-[11px] md:text-xs tracking-[0.2em] uppercase font-bold text-center bg-black/80 px-4 py-1.5 rounded-full border border-white/20 shadow-[2px_2px_0px_#000000]">
                EXPLORE ARCHITECTURE &amp; MOVEMENTS &darr;
              </span>
            </button>
          </div>
        </section>

        {/* ====================================================================
            THE AUTHENTIC AVANT-GARDE BOOK SPREAD (GRACE PISCITELLO PATTERN)
            Exact replication of the user's reference image:
            - Open facing book pages side by side on ivory paper (#FFFDF9)
            - NO gray cards, NO rounded enclosing boxes around diagrams
            - Left Page: 'Wandering About the Creative Field' with text flowing
              and wrapping around intentional white voids with lonely scale figures!
            - Right Page: 'FONDATION // The Poetry of Space' with:
              * 'Part 1.' margin mark
              * Spaced text 't h e   w i n d o w' with tilted box and circle
              * Raw architectural staircase elevation directly on the baseline
              * Text wrapping tightly under and around the stairs
              * Full justified text across the bottom
            ==================================================================== */}
        <section className="my-14 sm:my-20">
          <div className="w-full bg-[#FFFDF9] text-black border-[2.5px] border-black rounded-3xl p-6 sm:p-10 md:p-14 shadow-[10px_10px_0px_#000000] relative">
            {/* Center Book Spine Line (Desktop) */}
            <div className="hidden lg:block absolute top-8 bottom-8 left-1/2 w-[1px] bg-black/15 pointer-events-none" />

            {/* Two Facing Book Pages */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
              
              {/* =============================================================
                  PAGE 1 (LEFT): WANDERING ABOUT THE CREATIVE FIELD
                  Exact pattern: dense justified book text with open white voids
                  where tiny figures stand, walk, and look into the space
                  ============================================================= */}
              <div className="space-y-4">
                {/* Book Running Header */}
                <div className="flex items-center justify-between border-b border-black/20 pb-2 text-[10px] font-mono uppercase tracking-widest text-black/60">
                  <span>WINDERVALE // BROADSHEET</span>
                  <span>FOLIO 106</span>
                </div>

                {/* Chapter Title matching the reference layout */}
                <div className="pt-1 pb-3">
                  <h2 className="font-serif font-bold text-xl sm:text-2xl text-black tracking-tight leading-snug">
                    Wandering About the Creative Field
                  </h2>
                  <div className="w-8 h-[1px] bg-black/40 mt-1.5" />
                </div>

                {/* 
                  Dense Book Prose with True Floating Negative Spaces
                  Text naturally wraps around the open white space where tiny figures stand
                */}
                <div className="text-[12.5px] sm:text-[13px] leading-[1.65] font-serif text-black/90 text-justify hyphens-auto space-y-3">
                  {/* Floating White Void 1 (Upper Right): A lonely figure looking into the void */}
                  <div className="float-right w-24 h-28 ml-3 mb-2 flex flex-col items-center justify-center pointer-events-none">
                    <FigureStandingVoid className="text-black scale-110" />
                    <span className="font-mono text-[6.5px] text-black/40 uppercase tracking-widest pt-2">
                      FIG. 01 &middot; FIELD
                    </span>
                  </div>

                  <p>
                    <span className="float-left text-3xl font-serif font-bold pr-1.5 pt-0.5 leading-none text-black">
                      I
                    </span>
                    ndependent art demands architectural silence. For decades, creative practitioners have been corralled into algorithmic funnels where creative output is pulverized into ephemeral vanity metrics. The memory came into focus: unmediated craft as a shelter of time. In contemplation, the lines and edges of each frame define space rather than commercial consumption.
                  </p>

                  {/* Floating White Void 2 (Mid-Left): Walking figure between paragraphs */}
                  <div className="float-left w-20 h-24 mr-3 my-1 flex flex-col items-center justify-center pointer-events-none">
                    <FigureWalking className="text-black scale-105" />
                  </div>

                  <p>
                    On the Human Map, every practitioner is an unmediated node in space. The physical film roll exists in real meters; a sound stem occupies real Hertz; a creative partnership is an immutable covenant between two names. You wander across disciplines: finding the 16mm cinematographer who shoots what your modular synthesizer plays, or the scenographer who understands your spatial score.
                  </p>

                  <p>
                    The words fall into place as stones become walls. No automated feeds. No algorithmic ranking. Just architects, directors, typographers, and sound artists building complete project worlds together inside sovereign workspaces.
                  </p>

                  {/* Floating White Void 3 (Bottom Center): Tiny gazing figure */}
                  <div className="float-right w-16 h-20 ml-2 mt-2 flex flex-col items-center justify-center pointer-events-none">
                    <FigureGazingVoid className="text-black scale-105" />
                  </div>

                  <p>
                    He looked across the landscape, taking it all in: his mind quiet and relentless. The practitioner stands alone before the blank ground, until another hand is extended across the grid. The work remains sovereign. The colophon is signed. The archive is sealed.
                  </p>
                </div>

                {/* Left Page Bottom Folio */}
                <div className="pt-4 border-t border-black/15 flex items-center justify-between font-mono text-[9px] text-black/50 uppercase">
                  <span>UNMEDIATED FIELD // SECTION A</span>
                  <span className="font-bold text-black">106</span>
                </div>
              </div>

              {/* =============================================================
                  PAGE 2 (RIGHT): FONDATION // THE POETRY OF SPACE
                  Exact pattern:
                  - Centered FONDATION header with rule and subtitle
                  - 'Part 1.' in left margin
                  - Spaced 't h e   w i n d o w' with tilted box and survey circle
                  - Raw staircase elevation line drawing directly on page baseline
                  - Text wrapping around the stairs
                  - Grounding wide-measure book text at bottom
                  ============================================================= */}
              <div className="space-y-4">
                {/* Book Running Header */}
                <div className="flex items-center justify-between border-b border-black/20 pb-2 text-[10px] font-mono uppercase tracking-widest text-black/60">
                  <span>STUDIO ATELIER ELEVATION</span>
                  <span>FOLIO 107</span>
                </div>

                {/* Centered FONDATION Header matching the reference */}
                <div className="text-center pt-1 pb-2">
                  <h3 className="font-serif font-bold text-lg sm:text-xl tracking-[0.22em] uppercase text-black">
                    FONDATION
                  </h3>
                  <div className="w-12 h-[1px] bg-black mx-auto my-1.5" />
                  <p className="font-serif italic text-xs text-black/75 tracking-tight">
                    The Poetry of Language in Context of Space
                  </p>
                </div>

                {/* Margin label 'Part 1.' and upper drafting field */}
                <div className="relative">
                  <span className="font-serif italic font-bold text-xs text-black block pb-1">
                    Part 1.
                  </span>

                  {/* Upper prose wrapping around the window drafting schema */}
                  <div className="text-[12.5px] sm:text-[13px] leading-[1.65] font-serif text-black/90 text-justify hyphens-auto">
                    <p>
                      "Like a footing reminder of that of the universe or rather its reality: every beginning is slow." The architect returns to the table, his hands resting on a white sheet of paper.
                    </p>

                    {/* Tilted box, compass circle, and 't h e   w i n d o w' */}
                    <ArchitecturalWindowDrafting />

                    <p>
                      He entered to the place where a thin line was drawn across the darkness: a table, four planes of illumination, a window looking out toward the unmeasured terrain.
                    </p>
                  </div>

                  {/* 
                    Raw Staircase Elevation line drawing directly on page
                    (NO card, NO gray box, pure architectural drafting)
                  */}
                  <ArchitecturalStaircasePure />

                  {/* 
                    Full-width grounding text beneath the staircase
                    Matching the reference's broad paragraph lines
                  */}
                  <div className="text-[12.5px] sm:text-[13px] leading-[1.65] font-serif text-black/90 text-justify hyphens-auto space-y-2 pt-1">
                    <p>
                      Each step of the eight movements forms an immutable threshold: from discovery on the Human Map to legal rights protection, sound stem archiving, and cinema slates. The words fall into place as stones become walls, in rhythm of exciting reeds and percussion.
                    </p>
                    <p>
                      The space opens once again: day after day will become his home. My house is based on noble words. The work is protected before the lights are struck.
                    </p>
                  </div>
                </div>

                {/* Right Page Bottom Folio */}
                <div className="pt-4 border-t border-black/15 flex items-center justify-between font-mono text-[9px] text-black/50 uppercase">
                  <span>ATELIER ELEVATION // SECTION B</span>
                  <span className="font-bold text-black">107</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            SECTION 2: THE 8 MOVEMENTS (TABLE OF CONTENTS)
            - ONLY these cards are colored in dusty baby pink (#F2CBD2)
            - Fonts inside these cards are bold black
            - Stage//01 tags completely removed
            - Rounded fun cards with 2.5px black border and black brutalist shadow
            - Each card features a charming, fun little architectural line drawing!
            ==================================================================== */}
        <section
          id="how-windervale-works"
          className="pt-8 sm:pt-12 pb-16 space-y-8 scroll-mt-6"
        >
          {/* Section Header */}
          <div className="rounded-2xl border-[2.5px] border-black bg-black text-[#FFFDF9] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[6px_6px_0px_#000000]">
            <div>
              <span className="font-mono text-[10px] text-white/70 uppercase tracking-widest font-bold block pb-1">
                STUDIO OPERATING PROTOCOL
              </span>
              <h2 className="font-arthouse font-normal text-2xl sm:text-3xl tracking-[0.05em] uppercase">
                HOW WINDERVALE WORKS &middot; THE 8 MOVEMENTS
              </h2>
            </div>

            <span className="font-mono text-[10px] text-[#FFFDF9] uppercase tracking-widest bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 font-bold">
              TABLE OF CONTENTS
            </span>
          </div>

          {/* 
            8 MOVEMENTS: DUSTY BABY PINK ROUNDED FUN CARDS
            - Color: Dusty Baby Pink (#F2CBD2)
            - Fonts: Bold Black
            - Each card embeds a fun little architectural drawing
          */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {articles.map((art) => (
              <div
                key={art.num}
                className="rounded-3xl border-[2.5px] border-black bg-[#F2CBD2] hover:bg-[#F7D6DC] text-black p-6 space-y-3.5 transition-all duration-200 hover:-translate-y-2 hover:shadow-[8px_8px_0px_#000000] shadow-[4px_4px_0px_#000000] relative group flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with Big Bold Number & Minimal Dot */}
                  <div className="flex items-center justify-between border-b-[2px] border-black/20 pb-3">
                    <span className="font-shrikhand text-3xl sm:text-4xl text-black leading-none font-bold">
                      {art.num}
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-black" />
                  </div>

                  {/* Title in Rare Artistic Serif (Instrument Serif) - Bold Black */}
                  <h3 className="font-arthouse font-bold text-2xl sm:text-[28px] text-black tracking-normal uppercase pt-3 leading-none">
                    {art.title}
                  </h3>

                  {/* Description in Bold Black */}
                  <p className="font-fun text-xs sm:text-[13px] text-black font-bold leading-relaxed pt-2.5">
                    {art.desc}
                  </p>
                </div>

                <div className="pt-3 border-t-[1.5px] border-black/20 flex items-end justify-between gap-2">
                  {/* Handwritten Artist Marginal Note in Bold Black */}
                  <p className="font-scribble text-base text-black font-extrabold leading-tight flex-1">
                    "{art.scribble}"
                  </p>
                  {/* Fun Little Drawing */}
                  {art.drawing}
                </div>
              </div>
            ))}
          </div>

          {/* 
            COOL, BESPOKE AVANT-GARDE CTA PLAQUE (ROUNDED 3XL)
            - Sculptural exhibition broadside plaque with rounded-3xl corners
            - Invert hover state with active spring press
            - Rare artistic font typography
            - 100% Solid Black brutalist shadow
          */}
          <div className="pt-8 max-w-2xl mx-auto">
            <button
              onClick={handleEnter}
              className="w-full text-left bg-[#FFFDF9] hover:bg-black text-black hover:text-[#FFFDF9] rounded-3xl border-[3px] border-black cursor-pointer select-none transition-all duration-300 p-7 sm:p-9 relative group flex flex-col justify-between shadow-[9px_9px_0px_#000000] hover:shadow-[3px_3px_0px_#000000] hover:translate-x-1.5 hover:translate-y-1.5"
            >
              {/* Top Sub-Bar with Live Status */}
              <div className="flex items-center justify-between border-b-[2px] border-black group-hover:border-white/20 pb-3 mb-4 font-mono text-[10px] uppercase tracking-widest transition-colors">
                <span className="flex items-center gap-2 font-black">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>STUDIO ACCESS PASS &middot; EDITION 2026</span>
                </span>
                <span className="border border-black group-hover:border-white px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase transition-colors">
                  UNMEDIATED
                </span>
              </div>

              {/* Main Typographic Punch with Rare Artistic Typography */}
              <div className="space-y-2 py-2">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-arthouse text-4xl sm:text-5xl md:text-6xl font-normal uppercase tracking-normal leading-none">
                    ENTER WINDERVALE
                  </h3>
                  <span className="font-mono text-2xl sm:text-3xl font-black group-hover:translate-x-2 transition-transform duration-300">
                    &rarr;
                  </span>
                </div>
                <p className="font-fun italic text-sm sm:text-base opacity-80 leading-normal">
                  open human map &middot; verified creative dossiers &middot; 12 workspace modules
                </p>
              </div>

              {/* Bottom Discipline Ticker Bar */}
              <div className="pt-4 mt-2 border-t-[1.5px] border-black/15 group-hover:border-white/15 flex flex-wrap items-center justify-between gap-2 font-mono text-[9px] tracking-wider uppercase opacity-70 transition-colors">
                <span>CINEMA &middot; SOUND &middot; TYPOGRAPHY &middot; ARCHITECTURE</span>
                <span className="font-bold underline underline-offset-2">CLICK TO ENTER &rarr;</span>
              </div>
            </button>
          </div>

          {/* Colophon Footer */}
          <footer className="pt-8 mt-12 border-t-[2px] border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[10px] text-white/60 uppercase tracking-widest text-center sm:text-left">
            <span>PUBLISHED BY WINDERVALE PRESS &middot; BROADSHEET</span>
            <span>RESTRICTED DIRECTORY &middot; STUDIO ARCHIVE &middot; RIGHTS REGISTRY</span>
            <span>COPYRIGHT &copy; 2026 &middot; ALL RIGHTS RESERVED</span>
          </footer>
        </section>
      </div>
    </div>
  );
};
