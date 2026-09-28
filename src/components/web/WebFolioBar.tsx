import React, { useState, useEffect } from 'react';

export const WebFolioBar: React.FC = () => {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }).toUpperCase();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      setFormattedDate(`${dateStr} · ${timeStr} GMT`);
    };

    updateDate();
    const interval = setInterval(updateDate, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-black text-[#fbf6f0] border-b-[2.5px] border-black px-4 sm:px-6 py-1.5 flex items-center justify-between font-mono text-[10px] tracking-widest uppercase select-none">
      {/* Left Edition Notice */}
      <div className="flex items-center gap-3">
        <span className="font-bold text-white">
          WINDERVALE GAZETTE
        </span>
        <span className="hidden lg:inline text-white/50">
          &middot; EST. 2026 &middot; INDEPENDENT PRAXIS
        </span>
      </div>

      {/* Center Volume & Issue */}
      <div className="hidden sm:flex items-center gap-2 text-white/80">
        <span>VOL. 31 &middot; ISSUE 04</span>
        <span className="text-[#6A1A4C]">&middot;</span>
        <span className="bg-[#6A1A4C] text-[#fbf6f0] px-1.5 py-0.5 border border-black font-bold text-[9px]">
          90s BROADSHEET EDITION
        </span>
      </div>

      {/* Right Live Frequency & Clock */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-white/90">
          <span className="w-1.5 h-1.5 bg-[#6A1A4C] rounded-full animate-pulse" />
          <span className="hidden md:inline">NETWORK FREQUENCY: </span>
          <span className="font-bold text-[#6A1A4C]">ONLINE</span>
        </span>
        <span className="hidden xl:inline text-white/40">|</span>
        <span className="hidden xl:inline text-white/70 font-mono">
          {formattedDate}
        </span>
      </div>
    </div>
  );
};
