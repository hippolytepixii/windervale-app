import React from 'react';
import { Compass, FolderKanban, BookOpen, Banknote, UserCheck } from 'lucide-react';

interface NavigationProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeView, onNavigate }) => {
  const navItems = [
    { id: 'map', num: '01', label: 'MAP', sub: 'Discovery', icon: Compass, accent: 'group-hover:text-wv-dustyrose' },
    { id: 'projects', num: '02', label: 'PROJECTS', sub: 'Studio & Workspaces', icon: FolderKanban, accent: 'group-hover:text-wv-pink' },
    { id: 'library', num: '03', label: 'LIBRARY', sub: 'Editorial Press', icon: BookOpen, accent: 'group-hover:text-wv-dirtywhite' },
    { id: 'fund', num: '04', label: 'FUND', sub: 'Grants Ecosystem', icon: Banknote, accent: 'group-hover:text-wv-dustyrose' },
    { id: 'profile', num: '05', label: 'PROFILE', sub: 'Creative Dossier', icon: UserCheck, accent: 'group-hover:text-wv-pink' },
  ];

  return (
    <nav className="border-b border-wv-border bg-wv-charcoal/80 sticky top-16 z-30 overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-stretch divide-x divide-wv-border">
          {navItems.map((item) => {
            const isActive = activeView === item.id || (item.id === 'projects' && activeView.startsWith('workspace'));
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`group px-4 sm:px-7 py-3 flex items-center gap-3 transition-all relative whitespace-nowrap focus:outline-none ${
                  isActive
                    ? 'bg-wv-surface text-wv-paper'
                    : 'text-wv-dust hover:text-wv-paper hover:bg-wv-slate/50'
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-wv-pink" />
                )}
                
                <span className="font-mono text-[10px] text-wv-dust group-hover:text-wv-paper transition-colors">
                  {item.num}
                </span>

                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-sm tracking-wider uppercase">
                      {item.label}
                    </span>
                    <item.icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-wv-pink' : 'text-wv-dust/60'}`} />
                  </div>
                  <span className="hidden md:block font-mono text-[9px] uppercase tracking-wider text-wv-dust/70">
                    {item.sub}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Status ticker */}
        <div className="hidden lg:flex items-center gap-2 pl-4 font-mono text-[10px] text-wv-dust uppercase tracking-wider">
          <span className="w-2 h-2 rounded-none bg-wv-dustyrose animate-pulse" />
          <span>AUTONOMOUS NETWORK : ONLINE</span>
        </div>
      </div>
    </nav>
  );
};
