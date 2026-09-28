import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './services/api';
import { MobileAppShell } from './components/mobile/MobileAppShell';
import { MobileNav, MobileTab } from './components/mobile/MobileNav';
import { WebAppShell } from './components/web/WebAppShell';
import { LogoOpening } from './components/onboarding/LogoOpening';
import { Splash } from './components/onboarding/Splash';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { HumanMap } from './components/map/HumanMap';
import { ConnectionsView } from './components/connections/ConnectionsView';
import { WorkspaceLanding } from './components/workspace/WorkspaceLanding';
import { ProjectHome } from './components/projects/ProjectHome';
import { ProjectSpace } from './components/workspace/ProjectSpace';
import { ProfileView } from './components/profile/ProfileView';
import { SettingsView } from './components/settings/SettingsView';
import { CurationPendingView } from './components/onboarding/CurationPendingView';
import { AdminPortal } from './components/admin/AdminPortal';
import { CookieConsentModal } from './components/common/CookieConsentModal';

const MainLayout: React.FC = () => {
  const { user, profile, refreshProfile, isLoading } = useAuth();

  const [isDesktop, setIsDesktop] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth >= 768;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    return typeof window !== 'undefined' && (
      window.location.pathname.startsWith('/admin') ||
      window.location.hash.startsWith('#admin') ||
      window.location.search.includes('admin=true')
    );
  });

  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminRoute(
        window.location.pathname.startsWith('/admin') ||
        window.location.hash.startsWith('#admin') ||
        window.location.search.includes('admin=true')
      );
    };
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Two-Stage Opening Sequence: 'logo' (Stage 1) -> 'splash' (Stage 2) -> 'done'
  const [openingStage, setOpeningStage] = useState<'logo' | 'splash' | 'done'>(() => {
    return sessionStorage.getItem('windervale_entered') ? 'done' : 'logo';
  });

  // Exactly 4 primary mobile tabs: 'map' | 'connections' | 'workspace' | 'profile'
  const [activeTab, setActiveTab] = useState<MobileTab>('map');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectStage, setProjectStage] = useState<'cover' | 'space'>('cover');
  const [viewProfileUserId, setViewProfileUserId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isModuleScreenActive, setIsModuleScreenActive] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Poll or load pending connection requests count
  useEffect(() => {
    if (user) {
      api.getConnections().then(data => {
        const pending = (data.connections || []).filter(
          c => c.status === 'pending' && c.recipient_id === user.id
        ).length;
        setPendingCount(pending);
      }).catch(err => console.error(err));
    }
  }, [user, activeTab]);

  const handleSplashComplete = () => {
    sessionStorage.setItem('windervale_entered', 'true');
    setOpeningStage('done');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fbf6f0] flex items-center justify-center font-mono text-xs text-[#6A1A4C] font-bold tracking-widest film-grain">
        INITIALIZING WINDERVALE...
      </div>
    );
  }

  if (isAdminRoute) {
    return (
      <AdminPortal
        onExit={() => {
          if (window.location.hash.startsWith('#admin')) {
            window.location.hash = '';
          }
          if (window.location.pathname.startsWith('/admin') || window.location.search.includes('admin=true')) {
            window.history.pushState({}, '', '/');
          }
          setIsAdminRoute(false);
        }}
      />
    );
  }

  // Stage 1: Classical muse cameo medallion with physical ink animation
  if (openingStage === 'logo') {
    return <LogoOpening onComplete={() => setOpeningStage('splash')} />;
  }

  // Stage 2: How Windervale Works (Editorial Homepage)
  if (openingStage === 'splash') {
    return <Splash onComplete={handleSplashComplete} />;
  }

  // If user is not authenticated, show the onboarding & login flow
  if (!user) {
    return (
      <OnboardingFlow
        onComplete={() => setActiveTab('map')}
        onLoginClick={() => setActiveTab('map')}
      />
    );
  }

  // If user is logged in, but not yet approved by curation team:
  if (profile && profile.approval_status === 'pending') {
    return (
      <CurationPendingView
        onApproved={() => {
          refreshProfile();
          setActiveTab('map');
        }}
      />
    );
  }

  const handleTabSelect = (tab: MobileTab) => {
    setShowSettings(false);
    setViewProfileUserId(null);
    if (tab !== 'workspace') {
      setSelectedProjectId(null);
      setProjectStage('cover');
    }
    setActiveTab(tab);
  };

  const renderContent = () => {
    if (showSettings) {
      return <SettingsView onBack={() => setShowSettings(false)} />;
    }
    if (viewProfileUserId) {
      return (
        <div className="flex-1 flex flex-col">
          <div className="p-3 bg-[#fbf6f0] border-b-[2px] border-black flex items-center">
            <button
              onClick={() => setViewProfileUserId(null)}
              className="font-mono text-xs text-black font-bold uppercase tracking-wider hover:underline"
            >
              &larr; BACK TO {activeTab.toUpperCase()}
            </button>
          </div>
          <ProfileView
            userId={viewProfileUserId}
            onOpenWorkspace={(pid) => {
              setViewProfileUserId(null);
              setSelectedProjectId(pid);
              setProjectStage('cover');
              setActiveTab('workspace');
            }}
          />
        </div>
      );
    }
    switch (activeTab) {
      case 'map':
        return <HumanMap onOpenProfile={(uid) => setViewProfileUserId(uid)} />;
      case 'connections':
        return (
          <ConnectionsView
            onOpenProfile={(uid) => setViewProfileUserId(uid)}
            onOpenProjects={() => setActiveTab('workspace')}
            onOpenMap={() => setActiveTab('map')}
          />
        );
      case 'workspace':
        if (selectedProjectId) {
          return projectStage === 'cover' ? (
            <ProjectHome
              projectId={selectedProjectId}
              onBackToProjects={() => setSelectedProjectId(null)}
              onEnterProjectSpace={() => setProjectStage('space')}
            />
          ) : (
            <ProjectSpace
              projectId={selectedProjectId}
              onBackToProjects={() => setProjectStage('cover')}
              onEnterModuleScreen={setIsModuleScreenActive}
            />
          );
        }
        return (
          <WorkspaceLanding
            onSelectProject={(pid) => {
              setSelectedProjectId(pid);
              setProjectStage('cover');
            }}
          />
        );
      case 'profile':
        return (
          <ProfileView
            onOpenWorkspace={(pid) => {
              setSelectedProjectId(pid);
              setProjectStage('cover');
              setActiveTab('workspace');
            }}
            onOpenSettings={() => setShowSettings(true)}
          />
        );
      default:
        return null;
    }
  };

  if (isDesktop) {
    return (
      <WebAppShell
        activeTab={activeTab}
        onSelectTab={handleTabSelect}
        pendingConnectionsCount={pendingCount}
        onOpenSettings={() => setShowSettings(true)}
      >
        {renderContent()}
      </WebAppShell>
    );
  }

  return (
    <MobileAppShell>
      {/* Dynamic Screen Port */}
      <main className="flex-1 flex flex-col">
        {renderContent()}
      </main>

      {/* 4-Tab Thumb Navigation (Hidden when inside a specific Project Module for 100% focus) */}
      {!isModuleScreenActive && !showSettings && (
        <MobileNav
          activeTab={activeTab}
          onSelectTab={handleTabSelect}
          pendingConnectionsCount={pendingCount}
        />
      )}
    </MobileAppShell>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainLayout />
      <CookieConsentModal />
    </AuthProvider>
  );
};
