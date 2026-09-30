import React, { useState } from 'react';
import { InstallAppButton, MobileInstallTopBanner, StandaloneAppPlaque } from '../common/InstallAppModal';
import { Smartphone } from 'lucide-react';

interface SplashProps {
  onComplete: () => void;
}

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

  // 8 Movements: Editorial Architecture
  const articles = [
    {
      num: '01',
      title: 'FIND PEOPLE',
      desc: 'Browse the Human Map. Discover verified practitioners across cinema, sound, visual art, typography, and architecture.',
      scribble: 'find the cinematographer who shoots what you hear',
    },
    {
      num: '02',
      title: 'MEET',
      desc: 'Inspect their Creative Dossier: real background, working philosophy, past works, and active studio availability.',
      scribble: 'real portfolios, zero follower counts',
    },
    {
      num: '03',
      title: 'CONNECT',
      desc: 'Request connection through a direct creative note. Once accepted, an unmediated studio channel opens.',
      scribble: 'no algorithmic inbox, real studio notes',
    },
    {
      num: '04',
      title: 'MAKE',
      desc: 'Instantiate a project inside your Workspace: independent film, album, publication, monograph, or exhibition.',
      scribble: 'the project is the unit',
    },
    {
      num: '05',
      title: 'BUILD',
      desc: 'A dedicated production atelier. Maintain call sheets, scripts, track lists, production milestones, and crew rosters.',
      scribble: 'call sheets, track lists & dailies',
    },
    {
      num: '06',
      title: 'PROTECT',
      desc: 'Structure clear rights, split sheets, and deal terms. Safeguard intellectual property before the work leaves the studio.',
      scribble: 'sign agreements before lighting fires',
    },
    {
      num: '07',
      title: 'REMEMBER',
      desc: 'Preserve key creative decisions, milestones, and production notes in a permanent, immutable archive.',
      scribble: 'never forget why you made that cut',
    },
    {
      num: '08',
      title: 'COMPLETE',
      desc: 'Archive the finished piece. Generate cinema-grade credits, verified rights registry, and final master documentation.',
      scribble: 'permanent cinema slate in the archive',
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#000000] text-[#FAF7F2] select-none overflow-x-hidden relative flex flex-col">
      {/* Mobile Top Install Announcement */}
      <MobileInstallTopBanner />

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
              <InstallAppButton variant="masthead" />
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
              </div>

              {/* Subtitle: 'a complete infrastructure for creative people.' */}
              <p className="font-fun text-2xl sm:text-3xl md:text-4xl lg:text-[42px] text-[#FAF7F2] font-normal italic tracking-tight leading-snug max-w-3xl">
                a complete infrastructure for creative people.
              </p>
            </div>

            {/* Colophon Principles Box */}
            <div className="max-w-3xl rounded-3xl border-[2.5px] border-black bg-[#FFFDF9] text-black p-6 sm:p-8 space-y-4 shadow-[8px_8px_0px_#000000] relative">
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
            </div>

            {/* Instant Hero CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
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
              <InstallAppButton variant="hero" />
            </div>
          </div>

          {/* Table of Contents Scroll Cue */}
          <div className="pt-2 flex flex-col items-center justify-center">
            <button
              onClick={scrollToMovements}
              className="flex items-center gap-2 group cursor-pointer text-white/70 hover:text-white transition-colors"
            >
              <span className="font-mono text-[11px] md:text-xs tracking-[0.2em] uppercase font-bold text-center bg-black/80 px-4 py-1.5 rounded-full border border-white/20 shadow-[2px_2px_0px_#000000]">
                EXPLORE THE 8 MOVEMENTS &darr;
              </span>
            </button>
          </div>
        </section>

        {/* ====================================================================
            SECTION 2: THE 8 MOVEMENTS (TABLE OF CONTENTS)
            - ONLY these cards are colored in dusty baby pink (#F2CBD2)
            - Fonts inside these cards are bold black
            - Rounded cards with 2.5px black border and black brutalist shadow
            - Pure clean typography (drawings and doodles removed)
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
            8 MOVEMENTS: DUSTY BABY PINK ROUNDED CARDS
            - Color: Dusty Baby Pink (#F2CBD2)
            - Fonts: Bold Black
            - Clean layout without drawings
          */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {articles.map((art) => (
              <div
                key={art.num}
                className="rounded-3xl border-[2.5px] border-black bg-[#F2CBD2] hover:bg-[#F7D6DC] text-black p-6 space-y-4 transition-all duration-200 hover:-translate-y-2 hover:shadow-[8px_8px_0px_#000000] shadow-[4px_4px_0px_#000000] relative group flex flex-col justify-between"
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

                <div className="pt-3 border-t-[1.5px] border-black/20">
                  <span className="font-mono text-[10px] text-black/80 font-bold uppercase tracking-wider block">
                    // {art.scribble}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 
            BESPOKE AVANT-GARDE CTA PLAQUE (ROUNDED 3XL)
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

              {/* Main Typographic Punch */}
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

          {/* Dedicated Standalone Mobile Atelier Plaque (Automatically removed when downloaded or on desktop) */}
          <StandaloneAppPlaque />

          {/* Colophon Footer */}
          <footer className="pt-8 mt-12 border-t-[2px] border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[10px] text-white/60 uppercase tracking-widest text-center sm:text-left">
            <span>PUBLISHED BY WINDERVALE PRESS &middot; BROADSHEET</span>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('windervale_open_cookies'))}
              className="hover:text-white underline cursor-pointer"
            >
              COOKIES &amp; PRIVACY PROTOCOL
            </button>
            <span>COPYRIGHT &copy; 2026 &middot; ALL RIGHTS RESERVED</span>
          </footer>
        </section>
      </div>
    </div>
  );
};
