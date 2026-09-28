import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { NotificationItem } from '../../types';
import { Search, Bell, Settings, User as UserIcon, LogOut, CheckCheck, Compass, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onNavigate: (view: string) => void;
  activeView: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, onOpenSettings, onNavigate, activeView }) => {
  const { user, profile, logout, login } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.notifications.filter(n => n.is_read === 0).length);
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="border-b border-wv-border bg-wv-black/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('map')}
            className="text-left group flex items-baseline gap-3 focus:outline-none"
          >
            <span className="font-brand text-2xl sm:text-3xl tracking-normal text-[#fbf6f0] group-hover:text-[#6A1A4C] transition-colors lowercase">
              windervale
            </span>
            <span className="hidden md:inline-block font-mono text-[10px] uppercase tracking-widest text-wv-dust border-l border-wv-border pl-3">
              Operating Environment 01
            </span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Global Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 bg-wv-charcoal border border-wv-border text-wv-dust hover:text-wv-paper hover:border-wv-paper text-xs font-mono transition-all"
            title="Search People, Projects, Library (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-wv-dustyrose" />
            <span className="hidden sm:inline">SEARCH</span>
            <kbd className="hidden sm:inline text-[9px] bg-wv-surface px-1.5 py-0.5 border border-wv-border text-wv-dust">⌘K</kbd>
          </button>

          {user ? (
            <>
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="relative p-2 bg-wv-charcoal border border-wv-border text-wv-paper hover:border-wv-pink transition-all"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-black text-white border border-[#6A1A4C] font-mono text-[9px] w-4 h-4 flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-wv-charcoal border border-wv-border  p-4 z-50 animate-editorial-fade">
                    <div className="flex items-center justify-between pb-3 border-b border-wv-border mb-3">
                      <span className="font-mono text-xs uppercase tracking-wider text-wv-dust">NOTIFICATIONS [{notifications.length}]</span>
                      <span className="font-mono text-[10px] text-wv-pink">{unreadCount} UNREAD</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="font-mono text-xs text-wv-dust py-4 text-center">NO NOTIFICATIONS</p>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            className={`p-2.5 border text-xs transition-colors ${
                              n.is_read ? 'border-wv-border/50 bg-wv-black/40 text-wv-dust' : 'border-wv-pink/40 bg-wv-surface text-wv-paper'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-mono font-bold text-[10px] text-wv-dustyrose uppercase">[{n.type}]</span>
                              {!n.is_read && (
                                <button
                                  onClick={() => markAsRead(n.id)}
                                  className="text-[10px] text-wv-pink hover:underline"
                                >
                                  Mark read
                                </button>
                              )}
                            </div>
                            <p className="font-bold text-xs mt-0.5">{n.title}</p>
                            <p className="text-xs text-wv-dirtywhite/80 mt-1">{n.message}</p>
                            <p className="font-mono text-[9px] text-wv-dust mt-1.5">{new Date(n.created_at).toLocaleDateString()}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Dossier Avatar / Name */}
              <button
                onClick={() => onNavigate('profile')}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 border transition-all ${
                  activeView === 'profile'
                    ? 'border-wv-pink bg-wv-pink/10 text-wv-pink'
                    : 'border-wv-border bg-wv-charcoal hover:border-wv-paper text-wv-paper'
                }`}
              >
                <img
                  src={profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt={user.name}
                  className="w-5 h-5 object-cover grayscale"
                />
                <span className="font-mono text-xs font-bold hidden sm:inline">{user.name.split(' ')[0]}</span>
              </button>

              {/* Settings button */}
              <button
                onClick={onOpenSettings}
                className={`p-2 border transition-all ${
                  activeView === 'settings'
                    ? 'border-wv-dustyrose bg-wv-dustyrose/10 text-wv-dustyrose'
                    : 'border-wv-border bg-wv-charcoal hover:border-wv-paper text-wv-paper'
                }`}
                title="Account, Privacy & Legal Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => login('maya@windervale.art', 'windervale2026')}
                className="px-3 py-1.5 text-xs font-bold font-mono bg-black text-white border-2 border-black hover:bg-[#6A1A4C] hover:text-white transition-all"
              >
                ENTER AS MAYA ↗
              </button>
              <button
                onClick={() => onNavigate('onboarding')}
                className="btn-editorial px-3 py-1.5 text-xs"
              >
                JOIN ↗
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
