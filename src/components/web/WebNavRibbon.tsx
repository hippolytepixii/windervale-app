import React from 'react';
import { Compass, Users, FolderKanban, User, Search, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { MobileTab } from '../mobile/MobileNav';

interface WebNavRibbonProps {
  activeTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  pendingConnectionsCount?: number;
  onOpenSearch?: () => void;
  onOpenSettings?: () => void;
  onLogout?: () => void;
  showBrandLogo?: boolean;
}

export const WebNavRibbon: React.FC<WebNavRibbonProps> = ({
  activeTab,
  onSelectTab,
  pendingConnectionsCount = 0,
  onOpenSearch,
  onOpenSettings,
  onLogout,
  showBrandLogo = false,
}) => {
  const tabs: { id: MobileTab; num: string; label: string; icon: React.ReactNode }[] = [
    {
      id: 'map',
      num: '01',
      label: 'THE HUMAN MAP',
      icon: <Compass className="w-4 h-4 stroke-[2.5]" />,
    },
    {
      id: 'connections',
      num: '02',
      label: 'NETWORK & ALLIES',
      icon: <Users className="w-4 h-4 stroke-[2.5]" />,
    },
    {
      id: 'workspace',
      num: '03',
      label: 'WORKSPACE & PROJECTS',
      icon: <FolderKanban className="w-4 h-4 stroke-[2.5]" />,
    },
    {
      id: 'profile',
      num: '04',
      label: 'CREATIVE DOSSIER',
      icon: <User className="w-4 h-4 stroke-[2.5]" />,
    },
  ];

  return (
    <nav className="w-full bg-white border-y-[2.5px] border-black select-none sticky top-0 z-40">
      <div className={`${showBrandLogo ? 'w-full px-2 sm:px-4 flex items-stretch justify-between' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-stretch justify-between'}`}>
        {/* Primary 4 Editorial Tabs */}
        <div className="flex items-stretch divide-x-[2px] divide-black border-l-[2px] border-black">
          {showBrandLogo && (
            <div className="flex items-center px-4 lg:px-6 py-2 bg-white select-none">
              <span className="font-brand text-2xl lg:text-3xl text-black tracking-normal leading-none lowercase">
                windervale
              </span>
            </div>
          )}
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onSelectTab(t.id)}
                className={`flex items-center gap-2.5 px-4 lg:px-6 py-3.5 transition-colors focus:outline-none cursor-pointer group ${
                  isActive
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-[#6A1A4C]/10'
                }`}
              >
                <span
                  className={`font-mono text-[10px] font-bold px-1.5 py-0.5 border ${
                    isActive
                      ? 'bg-[#6A1A4C] text-white border-black'
                      : 'bg-black text-white border-black'
                  }`}
                >
                  {t.num}
                </span>

                <span className="flex items-center gap-1.5">
                  <span className={isActive ? 'text-[#6A1A4C]' : 'text-black'}>
                    {t.icon}
                  </span>
                  <span className="font-arthouse font-bold text-xs lg:text-sm tracking-wider uppercase">
                    {t.label}
                  </span>
                </span>

                {/* Pending Requests Badge in Selective Royal Purple */}
                {t.id === 'connections' && pendingConnectionsCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-[#6A1A4C] text-[#f3e8ff] border border-black font-mono text-[9px] font-black uppercase">
                    {pendingConnectionsCount} PENDING
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Utility Actions (Right) */}
        <div className="hidden md:flex items-center gap-2 divide-x-[2px] divide-black border-r-[2px] border-black">
          {/* Global Search */}
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#fbf6f0] hover:bg-[#6A1A4C] hover:text-white text-black border-[1.5px] border-black font-mono text-xs font-bold uppercase transition-colors cursor-pointer"
              title="Search (⌘K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span>SEARCH</span>
              <kbd className="text-[9px] bg-white text-black px-1.5 py-0.5 border border-black">
                ⌘K
              </kbd>
            </button>
          )}


          {/* Settings */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-2 text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
              title="Settings & Legal"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          )}

          {/* Sign Out */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
              title="Disconnect Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
