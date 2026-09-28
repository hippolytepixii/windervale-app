import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Shield, Lock, Trash2, CheckCircle2, AlertTriangle, Eye, EyeOff, Bell, User, LogOut, Laptop } from 'lucide-react';

interface SettingsViewProps {
  onBack?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
  const { user, profile, legalAcceptances, logout, verifyEmail, updatePrivacy } = useAuth();

  const [activeTab, setActiveTab] = useState<'account' | 'privacy' | 'notifications' | 'legal' | 'security' | 'deletion'>('account');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Privacy toggles
  const [visibility, setVisibility] = useState(profile?.visibility || 'public');
  const [locationVisibility, setLocationVisibility] = useState(profile?.location_visibility === 1);
  const [privacySaved, setPrivacySaved] = useState(false);

  // Deletion state
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleSavePrivacy = async () => {
    try {
      await updatePrivacy({
        visibility,
        location_visibility: locationVisibility
      });
      setPrivacySaved(true);
      setTimeout(() => setPrivacySaved(false), 2000);
    } catch (err: any) {
      alert(err.message || 'Could not update privacy');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    try {
      await api.resetPassword(currentPassword, newPassword);
      setPasswordMsg({ type: 'success', text: 'Password successfully updated' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Could not reset password' });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE PERMANENTLY') {
      alert('Type DELETE PERMANENTLY to confirm');
      return;
    }
    setDeleting(true);
    try {
      await api.deleteAccount();
      logout();
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Could not delete account');
      setDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="py-20 text-center">
        <p className="font-display font-bold text-xl text-wv-paper">AUTHENTICATION REQUIRED</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="font-mono text-xs text-wv-dustyrose font-bold hover:underline mb-2 block"
        >
          ← BACK TO PROFILE
        </button>
      )}

      {/* Header */}
      <div className="border-b-2 border-wv-paper pb-4 mb-4">
        <span className="font-mono text-xs uppercase text-wv-pink">OPERATING CONTROL PANEL</span>
        <h1 className="font-display font-black text-2xl text-wv-paper tracking-tight mt-1">
          SETTINGS & LEGAL
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-1">
          {[
            { id: 'account', label: '01 ACCOUNT', icon: User },
            { id: 'privacy', label: '02 PRIVACY', icon: Eye },
            { id: 'notifications', label: '03 NOTIFICATIONS', icon: Bell },
            { id: 'legal', label: '04 LEGAL & AUDIT', icon: Shield },
            { id: 'security', label: '05 SECURITY & SESSIONS', icon: Lock },
            { id: 'deletion', label: '06 DELETION', icon: Trash2 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full text-left font-mono text-xs p-3 border transition-all flex items-center justify-between ${
                activeTab === tab.id
                  ? 'border-wv-paper bg-wv-charcoal text-wv-paper font-bold'
                  : 'border-transparent text-wv-dust hover:text-wv-paper hover:bg-wv-surface/50'
              }`}
            >
              <span>{tab.label}</span>
              <tab.icon className="w-3.5 h-3.5" />
            </button>
          ))}

          <div className="pt-6 border-t border-wv-border/50">
            <button
              onClick={logout}
              className="w-full text-left font-mono text-xs p-3 text-[#6A1A4C] hover:text-white hover:bg-black border border-transparent hover:border-black flex items-center justify-between transition-all"
            >
              <span>LOGOUT SESSION</span>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Panel */}
        <div className="md:col-span-3 bg-wv-charcoal border border-wv-border p-6 sm:p-8 space-y-6">
          {/* TAB 1: ACCOUNT */}
          {activeTab === 'account' && (
            <div className="space-y-6 animate-editorial-fade">
              <h2 className="font-display font-bold text-2xl text-wv-paper border-b border-wv-border pb-3">
                ACCOUNT CREDENTIALS
              </h2>

              <div className="space-y-4 font-mono text-xs">
                <div>
                  <label className="text-wv-dust block mb-1 uppercase">LEGAL IDENTITY / PUBLIC NAME</label>
                  <input
                    disabled
                    value={user.name}
                    className="w-full bg-wv-surface border border-wv-border p-2.5 text-wv-paper cursor-not-allowed opacity-80"
                  />
                  <span className="text-[10px] text-wv-dust mt-1 block">To alter public artist name, update your Creative Dossier.</span>
                </div>

                <div>
                  <label className="text-wv-dust block mb-1 uppercase">AUTHENTICATED EMAIL</label>
                  <div className="flex items-center gap-3">
                    <input
                      disabled
                      value={user.email}
                      className="flex-1 bg-wv-surface border border-wv-border p-2.5 text-wv-paper cursor-not-allowed opacity-80"
                    />
                    {user.email_verified === 1 ? (
                      <span className="stamp border border-wv-dustyrose text-wv-dustyrose font-bold">
                        ✓ VERIFIED
                      </span>
                    ) : (
                      <button
                        onClick={verifyEmail}
                        className="btn-editorial-rose text-xs px-3 py-2"
                      >
                        VERIFY NOW
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-wv-dust block mb-1 uppercase">ACCOUNT ROLE</label>
                  <span className="stamp border border-wv-pink text-wv-pink">
                    {user.role.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACY */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-editorial-fade">
              <h2 className="font-display font-bold text-2xl text-wv-paper border-b border-wv-border pb-3">
                PRIVACY & GEOLOCATION BOUNDARIES
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-wv-surface border border-wv-border space-y-2">
                  <span className="font-mono text-xs uppercase font-bold text-wv-paper block">
                    PROFILE VISIBILITY
                  </span>
                  <p className="font-serif text-xs text-wv-dust leading-relaxed">
                    Control who can view your creative dossier and selected works.
                  </p>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as any)}
                    className="bg-wv-black border border-wv-border px-3 py-2 font-mono text-xs text-wv-paper focus:outline-none"
                  >
                    <option value="public">PUBLIC - Visible to entire Human Map & Library</option>
                    <option value="members">MEMBERS ONLY - Restricted to verified collaborators</option>
                    <option value="private">PRIVATE - Hidden from directory discovery</option>
                  </select>
                </div>

                <div className="p-4 bg-wv-surface border border-wv-border flex items-start justify-between gap-4">
                  <div>
                    <span className="font-mono text-xs uppercase font-bold text-wv-paper block">
                      HUMAN MAP GEOLOCATION
                    </span>
                    <p className="font-serif text-xs text-wv-dust leading-relaxed mt-1">
                      When enabled, your general city-level coordinates appear as an interactive creative node on the global Human Atlas.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={locationVisibility}
                    onChange={(e) => setLocationVisibility(e.target.checked)}
                    className="w-5 h-5 accent-wv-dustyrose rounded-none cursor-pointer mt-1"
                  />
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-wv-border">
                  {privacySaved && <span className="font-mono text-xs text-wv-dustyrose">✓ Privacy boundaries updated</span>}
                  <button
                    onClick={handleSavePrivacy}
                    className="btn-editorial text-xs px-6 py-2 ml-auto"
                  >
                    SAVE PRIVACY SETTINGS ↗
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-editorial-fade">
              <h2 className="font-display font-black text-2xl text-wv-paper border-b border-wv-border pb-3">
                NOTIFICATION DISPATCHERS
              </h2>

              <p className="font-serif text-xs text-wv-dust">
                Windervale rejects engagement notifications, badge nagging, and algorithmic spam. Only high-integrity project and connection updates are dispatched.
              </p>

              <div className="space-y-3 font-mono text-xs">
                <label className="flex items-center gap-3 p-3.5 bg-wv-surface border border-wv-border cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-wv-pink rounded-none" />
                  <div>
                    <span className="text-wv-paper font-bold block">PROJECT WORKSPACE UPDATES</span>
                    <span className="text-[10px] text-wv-dust">Tasks assigned, decisions logged, and rights covenants modified</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 bg-wv-surface border border-wv-border cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-wv-pink rounded-none" />
                  <div>
                    <span className="text-wv-paper font-bold block">HUMAN MAP CONNECTION PROPOSALS</span>
                    <span className="text-[10px] text-wv-dust">Intentional collaboration messages received from other creatives</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 bg-wv-surface border border-wv-border cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-wv-pink rounded-none" />
                  <div>
                    <span className="text-wv-paper font-bold block">GRANT JURY DECISIONS</span>
                    <span className="text-[10px] text-wv-dust">Status updates regarding submitted fund applications</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: LEGAL AND CONSENT AUDIT */}
          {activeTab === 'legal' && (
            <div className="space-y-6 animate-editorial-fade">
              <div className="border-b border-wv-border pb-3">
                <span className="font-mono text-xs uppercase text-wv-dustyrose">IMMUTABLE COMPLIANCE AUDIT</span>
                <h2 className="font-display font-black text-2xl text-wv-paper mt-1">
                  LEGAL ACCEPTANCE AUDIT TRAIL
                </h2>
              </div>

              <p className="font-serif text-xs text-wv-dust leading-relaxed">
                As required by Windervale protocol, the system records the exact version and timestamp of every legal agreement executed by your account.
              </p>

              <div className="border border-wv-border divide-y divide-wv-border bg-wv-surface/50">
                {legalAcceptances.map((acc) => (
                  <div key={acc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-wv-dustyrose" />
                        <span className="font-bold text-wv-paper uppercase">
                          {acc.doc_type === 'terms' ? 'Terms of Service' : acc.doc_type === 'privacy' ? 'Privacy Policy' : 'Community Guidelines'}
                        </span>
                        <span className="stamp border border-wv-border text-[9px] text-wv-dust">
                          VERSION {acc.doc_version}
                        </span>
                      </div>
                      <p className="font-mono text-[10px] text-wv-dust mt-1">
                        ACCEPTED ON: <strong className="text-wv-dirtywhite">{new Date(acc.accepted_at).toLocaleString()}</strong>
                      </p>
                    </div>

                    <span className="stamp border border-wv-dustyrose text-wv-dustyrose text-[9px] uppercase self-start sm:self-auto">
                      STATUS: ACCEPTED & AUDITED
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY & SESSIONS */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-editorial-fade">
              <h2 className="font-display font-black text-2xl text-wv-paper border-b border-wv-border pb-3">
                SECURITY & ACTIVE SESSIONS
              </h2>

              {/* Password update form */}
              <form onSubmit={handlePasswordChange} className="p-5 bg-wv-surface border border-wv-border space-y-4">
                <span className="font-mono text-xs uppercase text-wv-paper font-bold block">UPDATE PASSWORD</span>

                {passwordMsg && (
                  <div className={`p-2 font-mono text-xs border ${
                    passwordMsg.type === 'success' ? 'border-[#6A1A4C] text-[#6A1A4C]' : 'border-black text-[#6A1A4C]'
                  }`}>
                    {passwordMsg.text}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-wv-dust mb-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-wv-black border border-wv-border p-2 font-mono text-xs text-wv-paper focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-wv-dust mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-wv-black border border-wv-border p-2 font-mono text-xs text-wv-paper focus:outline-none"
                    />
                  </div>
                </div>

                <button type="submit" className="btn-editorial text-xs px-4 py-2">
                  UPDATE PASSWORD ↗
                </button>
              </form>

              {/* Active Sessions */}
              <div className="space-y-3">
                <span className="font-mono text-xs uppercase text-wv-dust block">ACTIVE CRYPTOGRAPHIC SESSIONS</span>
                <div className="p-4 bg-wv-surface border border-wv-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Laptop className="w-5 h-5 text-wv-dustyrose" />
                    <div>
                      <p className="font-mono text-xs text-wv-paper font-bold">Current Browser Session</p>
                      <p className="font-mono text-[10px] text-wv-dust">Active Now • Persistent JWT Token</p>
                    </div>
                  </div>
                  <span className="stamp border border-wv-dustyrose text-wv-dustyrose text-[9px]">ONLINE</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ACCOUNT DELETION */}
          {activeTab === 'deletion' && (
            <div className="space-y-6 animate-editorial-fade">
              <div className="border-b border-wv-border pb-3">
                <span className="font-mono text-xs uppercase text-[#6A1A4C] font-bold">IRREVOCABLE TERMINATION</span>
                <h2 className="font-display font-black text-2xl text-wv-paper mt-1">
                  ACCOUNT DELETION WORKFLOW
                </h2>
              </div>

              <div className="p-4 bg-black border border-black space-y-3 font-serif text-xs text-wv-dirtywhite leading-relaxed">
                <p>
                  Deleting your account permanently destroys your creative dossier, private workspace files, scratchpad fragments, and session tokens.
                </p>
                <p>
                  To confirm permanent eradication, type <strong className="font-mono text-white">DELETE PERMANENTLY</strong> below:
                </p>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE PERMANENTLY"
                  className="w-full bg-wv-black border-2 border-black p-3 font-mono text-sm text-wv-paper focus:outline-none"
                />

                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE PERMANENTLY' || deleting}
                  className="btn-editorial-wine w-full py-3 text-xs uppercase tracking-wider disabled:opacity-40 disabled:pointer-events-none"
                >
                  {deleting ? 'DESTROYING ACCOUNT DATA...' : 'CONFIRM IRREVOCABLE DELETION ✕'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
