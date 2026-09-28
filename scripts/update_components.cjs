const fs = require('fs');

// 1. MobileNav.tsx
const mobileNav = `import React from 'react';
import { Compass, Users, FolderKanban, User as UserIcon } from 'lucide-react';

export type MobileTab = 'map' | 'connections' | 'workspace' | 'profile';

interface MobileNavProps {
  activeTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  pendingConnectionsCount?: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onSelectTab,
  pendingConnectionsCount = 0,
}) => {
  const tabs: { id: MobileTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'map',
      label: 'Map',
      icon: <Compass className="w-4 h-4 stroke-[2]" />,
    },
    {
      id: 'connections',
      label: 'Network',
      icon: <Users className="w-4 h-4 stroke-[2]" />,
    },
    {
      id: 'workspace',
      label: 'Works',
      icon: <FolderKanban className="w-4 h-4 stroke-[2]" />,
    },
    {
      id: 'profile',
      label: 'Dossier',
      icon: <UserIcon className="w-4 h-4 stroke-[2]" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-t-[2.5px] border-black safe-area-bottom">
      <div className="max-w-md mx-auto grid grid-cols-4 h-16 px-2 items-center gap-1.5">
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTab(t.id)}
              className={\`relative flex flex-col items-center justify-center gap-1 py-1.5 px-2 transition-all focus:outline-none cursor-pointer \${
                isActive
                  ? 'bg-[#dfa5a2] text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]'
                  : 'text-[#fbf6f0]/70 hover:text-[#dfa5a2]'
              }\`}
            >
              <div className="relative">
                <span>{t.icon}</span>
                {t.id === 'connections' && pendingConnectionsCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 w-4 h-4 bg-black text-[#dfa5a2] font-mono text-[9px] font-black flex items-center justify-center border border-[#dfa5a2]">
                    {pendingConnectionsCount}
                  </span>
                )}
              </div>

              <span className="font-mono text-[10px] tracking-wider uppercase font-bold">
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
`;
fs.writeFileSync('src/components/mobile/MobileNav.tsx', mobileNav);
console.log('Updated src/components/mobile/MobileNav.tsx');

// 2. MonogramSeal.tsx
const monogramSeal = `import React from 'react';

interface MonogramSealProps {
  name: string;
  disciplines?: string[];
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const PALETTES = [
  { bg: 'bg-[#000000]', text: 'text-[#dfa5a2]', border: 'border-black', accent: 'text-[#dfa5a2]' },
  { bg: 'bg-[#dfa5a2]', text: 'text-black', border: 'border-black', accent: 'text-black' },
  { bg: 'bg-[#fbf6f0]', text: 'text-black', border: 'border-black', accent: 'text-black' },
  { bg: 'bg-[#18161b]', text: 'text-[#fbf6f0]', border: 'border-black', accent: 'text-[#dfa5a2]' },
  { bg: 'bg-[#dfa5a2]', text: 'text-black', border: 'border-black', accent: 'text-black' },
  { bg: 'bg-[#000000]', text: 'text-[#fbf6f0]', border: 'border-black', accent: 'text-[#dfa5a2]' },
];

export const MonogramSeal: React.FC<MonogramSealProps> = ({
  name,
  disciplines = [],
  size = 'md',
  className = '',
}) => {
  const cleanName = (name || 'Anonymous Creative').trim();
  const parts = cleanName.split(/\\s+/);
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
      className={\`relative inline-flex items-center justify-center font-display font-black border-[2px] shadow-[2px_2px_0px_0px_#000000] select-none flex-shrink-0 \${palette.bg} \${palette.text} \${palette.border} \${sizeClasses[size]} \${className}\`}
      title={\`\${cleanName} (\${primaryDisc})\`}
    >
      <span className="tracking-tighter">{initials}</span>

      {(size === 'lg' || size === 'xl') && (
        <span className="absolute -bottom-2 -right-2 font-mono text-[8px] uppercase tracking-widest px-1 bg-black text-[#dfa5a2] border border-black">
          {primaryDisc.slice(0, 4)}
        </span>
      )}
    </div>
  );
};
`;
fs.writeFileSync('src/components/common/MonogramSeal.tsx', monogramSeal);
console.log('Updated src/components/common/MonogramSeal.tsx');

// 3. Header.tsx
let headerContent = fs.readFileSync('src/components/common/Header.tsx', 'utf8');
headerContent = headerContent.replace('WINDERVALE', 'windervale');
headerContent = headerContent.replace('font-display font-black text-2xl sm:text-3xl tracking-tight text-wv-paper group-hover:text-wv-pink transition-colors', 'font-fun font-bold text-2xl sm:text-3xl tracking-tight text-[#fbf6f0] group-hover:text-[#dfa5a2] transition-colors lowercase');
headerContent = headerContent.replace('bg-wv-blood text-white', 'bg-black text-[#dfa5a2] border border-[#dfa5a2]');
headerContent = headerContent.replace(/btn-editorial-wine/g, 'px-3 py-1.5 text-xs font-bold font-mono bg-black text-[#dfa5a2] border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:bg-[#dfa5a2] hover:text-black transition-all');
fs.writeFileSync('src/components/common/Header.tsx', headerContent);
console.log('Updated src/components/common/Header.tsx');

