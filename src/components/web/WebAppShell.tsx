import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { MonogramSeal } from '../common/MonogramSeal';
import { WebFolioBar } from './WebFolioBar';
import { WebNavRibbon } from './WebNavRibbon';
import { MobileTab } from '../mobile/MobileNav';

interface WebAppShellProps {
  activeTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  pendingConnectionsCount?: number;
  onOpenSearch?: () => void;
  onOpenSettings?: () => void;
  children: React.ReactNode;
}

export const WebAppShell: React.FC<WebAppShellProps> = ({
  activeTab,
  onSelectTab,
  pendingConnectionsCount = 0,
  onOpenSearch,
  onOpenSettings,
  children,
}) => {
  const { user, profile, logout } = useAuth();
  const isMapTab = activeTab === 'map';
  const isWorkspaceTab = activeTab === 'workspace';
  const hideBroadsheetHeader = isMapTab || isWorkspaceTab;

  return (
    <div className={`min-h-screen bg-[#faf7f2] text-black film-grain flex flex-col ${isMapTab ? 'h-screen overflow-hidden' : ''}`}>
      {/* 1. Vintage Newspaper Folio Imprint (Hidden on Map & Workspace so tools take full space) */}
      {!hideBroadsheetHeader && <WebFolioBar />}

      {/* 2. Main Broadsheet Masthead Header (Hidden on Map & Workspace so windervale heading & subtitle take NO space) */}
      {!hideBroadsheetHeader && (
        <header className="w-full bg-white border-b-[2.5px] border-black pt-5 pb-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
            {/* Masthead Left: Brand & Manifesto */}
            <div className="space-y-1.5">
              <div className="flex items-baseline gap-3">
                <h1 className="font-brand text-4xl sm:text-5xl lg:text-6xl text-black tracking-normal leading-none lowercase whitespace-nowrap">
                  windervale
                </h1>
                <span className="font-mono text-[10px] tracking-widest uppercase bg-[#6A1A4C] text-white px-2 py-0.5 font-bold">
                  OPERATING ENVIRONMENT
                </span>
              </div>
              <p className="font-fun italic text-sm sm:text-base text-black/85 max-w-2xl leading-snug">
                Find people worth making things with. Meet them. Connect. Make something together. Keep the work protected and documented.
              </p>
            </div>

            {/* Masthead Right: Practitioner Monograph Pill */}
            {user && (
              <div className="flex items-center gap-3 p-3 bg-[#fbf6f0] border-[2px] border-black shrink-0">
                {profile?.avatar_url && profile?.avatar_public !== 0 ? (
                  <div className="w-11 h-11 border-[1.5px] border-black bg-black shrink-0 overflow-hidden">
                    <img
                      src={profile.avatar_url}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <MonogramSeal
                    name={user.name}
                    disciplines={profile?.disciplines}
                    size="sm"
                  />
                )}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-fun font-bold text-sm text-black leading-tight">
                      {user.name}
                    </span>
                    {/* Purple Verified Fellow Badge */}
                    <span className="bg-[#3b0764] text-[#f3e8ff] border border-black font-mono text-[8px] font-bold px-1.5 py-0.2 uppercase tracking-wider">
                      VERIFIED PRAXIS
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-black/70">
                    {profile?.location || 'Registered Base'} &middot; {profile?.disciplines?.[0] || 'Independent Practitioner'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </header>
      )}

      {/* 3. Easy Desktop Navigation Ribbon */}
      <WebNavRibbon
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        pendingConnectionsCount={pendingConnectionsCount}
        onOpenSearch={onOpenSearch}
        onOpenSettings={onOpenSettings}
        onLogout={logout}
        showBrandLogo={hideBroadsheetHeader}
      />

      {/* 4. Expansive Broadsheet Content Canvas */}
      <main className={`flex-1 w-full bg-white text-black relative flex flex-col ${
        isMapTab
          ? 'max-w-none border-x-0 h-[calc(100vh-53px)] overflow-hidden'
          : 'max-w-7xl mx-auto border-x-[2.5px] border-black'
      }`}>
        <div className="flex-1 flex flex-col relative h-full">
          {children}
        </div>
      </main>

      {/* 5. Bottom Editorial Colophon / Footer (Hidden on Map & Workspace so workspace has full vertical space) */}
      {!hideBroadsheetHeader && (
        <footer className="w-full bg-[#fbf6f0] border-t-[2.5px] border-black py-4 px-4 sm:px-6 lg:px-8 font-mono text-[10px] text-black/75">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-black uppercase">WINDERVALE</span>
              <span>&middot;</span>
              <span>Independent Creative Directory &amp; Collaborative Studio</span>
            </div>
            <div className="flex items-center gap-4 text-black/60">
              <span>PRINT PROTOCOL 01</span>
              <span>&middot;</span>
              <span>ALL RIGHTS RESERVED &copy; 2026</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
