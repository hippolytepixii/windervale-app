import React from 'react';

interface MonogramSealProps {
  name: string;
  disciplines?: string[];
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const PALETTES = [
  { bg: 'bg-[#000000]', text: 'text-[#fbf6f0]', border: 'border-black', accent: 'text-white' },
  { bg: 'bg-[#18161b]', text: 'text-[#fbf6f0]', border: 'border-black', accent: 'text-white' },
  { bg: 'bg-[#fbf6f0]', text: 'text-black', border: 'border-black', accent: 'text-black' },
  { bg: 'bg-[#000000]', text: 'text-white', border: 'border-black', accent: 'text-white' },
  { bg: 'bg-[#fbf6f0]', text: 'text-black', border: 'border-black', accent: 'text-black' },
  { bg: 'bg-[#18161b]', text: 'text-[#fbf6f0]', border: 'border-black', accent: 'text-white' },
];

export const MonogramSeal: React.FC<MonogramSealProps> = ({
  name,
  disciplines = [],
  size = 'md',
  className = '',
}) => {
  const cleanName = (name || 'Anonymous Creative').trim();
  const parts = cleanName.split(/\s+/);
  const initials = parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : cleanName.slice(0, 2).toUpperCase();

  const primaryDisc = disciplines[0] || 'CREATIVE';

  const charSum = cleanName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const palette = PALETTES[charSum % PALETTES.length];

  const sizeClasses = {
    xs: 'w-7 h-7 text-[10px]',
    sm: 'w-9 h-9 text-xs',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center font-display font-black border-[2px]  select-none flex-shrink-0 ${palette.bg} ${palette.text} ${palette.border} ${sizeClasses[size]} ${className}`}
      title={`${cleanName} (${primaryDisc})`}
    >
      <span className="tracking-tighter">{initials}</span>

      {(size === 'lg' || size === 'xl') && (
        <span className="absolute -bottom-2 -right-2 font-mono text-[8px] uppercase tracking-widest px-1 bg-black text-white border border-black">
          {primaryDisc.slice(0, 4)}
        </span>
      )}
    </div>
  );
};
