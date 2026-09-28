import React from 'react';
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
    <nav className="sticky bottom-0 left-0 right-0 z-40 bg-[#fbf6f0] border-t-[2.5px] border-black safe-area-bottom w-full">
      <div className="max-w-md mx-auto grid grid-cols-4 h-16 px-2 items-center gap-1.5">
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTab(t.id)}
              className={`relative flex flex-col items-center justify-center gap-1 py-1.5 px-2 transition-all focus:outline-none cursor-pointer ${
                isActive
                  ? 'bg-black text-white font-black border-2 border-black'
                  : 'text-black/70 hover:text-black font-semibold'
              }`}
            >
              <div className="relative">
                <span>{t.icon}</span>
                {t.id === 'connections' && pendingConnectionsCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 w-4 h-4 bg-[#6A1A4C] text-white font-mono text-[9px] font-black flex items-center justify-center border border-black">
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
