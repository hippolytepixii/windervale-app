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
      label: 'PROFILE',
      icon: <User className="w-4 h-4 stroke-[2.5]" />,
    },
  ];

  return (
    <nav className="w-full bg-white border-y-[2.5px] border-black select-none sticky top-0 z-40">
      <div
        className={`${
          showBrandLogo
            ? 'w-full px-2 sm:px-4 flex items-center py-1 sm:py-1.5'
            : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center py-1 sm:py-1.5'
        }`}
      >
        {/* Left Toolbar: Distinct Brand Logo, 4 Numbered Editorial Tabs, and Utility Actions */}
        <div className="flex items-center gap-2 sm:gap-3 py-0.5">
          {/* Authentic Brand Logo Mark (Separated from tabs, unmistakable brand presence) */}
          {showBrandLogo && (
            <div
              onClick={() => onSelectTab('map')}
              className="flex items-center gap-2.5 py-1 pr-3 sm:pr-4 mr-1 sm:mr-2 border-r-[2px] border-black/25 hover:border-black cursor-pointer select-none group shrink-0 transition-colors"
              title="Windervale : Studio Operating Environment"
            >
              {/* Monogram Seal */}
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-black text-white flex items-center justify-center font-brand text-xl sm:text-2xl font-bold border border-black shadow-sm group-hover:scale-105 transition-transform shrink-0">
                w
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-brand text-2xl lg:text-3xl text-black tracking-normal leading-none lowercase">
                  windervale
                </span>
                <span className="font-mono text-[7px] sm:text-[7.5px] tracking-[0.22em] uppercase text-black/60 font-bold leading-tight mt-0.5">
                  STUDIO ATELIER
                </span>
              </div>
            </div>
          )}

          {/* Primary 4 Editorial Tabs */}
          <div className="flex items-stretch divide-x-[2px] divide-black border-[2px] border-black bg-white shrink-0">
            {tabs.map((t) => {
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onSelectTab(t.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 transition-colors focus:outline-none cursor-pointer group ${
                    isActive
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-black/5'
                  }`}
                >
                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.5 border ${
                      isActive
                        ? 'bg-white text-black border-white'
                        : 'bg-black text-white border-black'
                    }`}
                  >
                    {t.num}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <span className={isActive ? 'text-white' : 'text-black'}>
                      {t.icon}
                    </span>
                    <span className="font-arthouse font-bold text-xs lg:text-sm tracking-wider uppercase whitespace-nowrap">
                      {t.label}
                    </span>
                  </span>

                  {/* Pending Requests Badge */}
                  {t.id === 'connections' && pendingConnectionsCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-black text-white border border-white font-mono text-[9px] font-black uppercase">
                      {pendingConnectionsCount} PENDING
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Utility Actions (Docked directly right after Profile - keeping space small and tight) */}
          <div className="hidden sm:flex items-stretch divide-x-[2px] divide-black border-[2px] border-black bg-[#fbf6f0] shrink-0">
            {/* Global Search */}
            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                className="flex items-center gap-1.5 px-3 py-2 text-black hover:bg-black hover:text-white font-mono text-xs font-bold uppercase transition-colors cursor-pointer"
                title="Search (⌘K)"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-[11px]">SEARCH</span>
                <kbd className="text-[9px] bg-white text-black px-1.5 py-0.5 border border-black hidden xl:inline">
                  ⌘K
                </kbd>
              </button>
            )}

            {/* Settings */}
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="p-2 sm:px-3 sm:py-2 text-black hover:bg-black hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                title="Settings & Legal"
              >
                <SettingsIcon className="w-4 h-4" />
                <span className="hidden xl:inline font-mono text-[11px] font-bold uppercase">
                  SETTINGS
                </span>
              </button>
            )}

            {/* Sign Out */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 sm:px-3 sm:py-2 text-black hover:bg-black hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                title="Disconnect Session"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden xl:inline font-mono text-[11px] font-bold uppercase">
                  EXIT
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
