import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Project, Workspace } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Plus, Users, Calendar, X, AlertCircle, Lock, Unlock, Key,
  Shield, ShieldCheck, ShieldAlert, Settings, FolderPlus, ArrowRight, RefreshCw
} from 'lucide-react';

interface WorkspaceLandingProps {
  onSelectProject: (projectId: string) => void;
}

const PROJECT_TYPES = [
  'film',
  'music',
  'writing',
  'photography',
  'art',
  'exhibition',
  'publication',
  'research',
  'interdisciplinary',
  'other',
];

export const WorkspaceLanding: React.FC<WorkspaceLandingProps> = ({ onSelectProject }) => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // Security / Lock states
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoveryPassword, setRecoveryPassword] = useState('');
  const [recoveryNewPin, setRecoveryNewPin] = useState('');
  const [recovering, setRecovering] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);

  // Security configuration states
  const [lockAction, setLockAction] = useState<'set' | 'change' | 'remove'>('set');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [sensitivePin, setSensitivePin] = useState('');
  const [sensitiveEnabled, setSensitiveEnabled] = useState(false);
  const [updatingSecurity, setUpdatingSecurity] = useState(false);
  const [securityFeedback, setSecurityFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Workspace Modal
  const [newWsModal, setNewWsModal] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsDesc, setNewWsDesc] = useState('');
  const [newWsPin, setNewWsPin] = useState('');
  const [creatingWs, setCreatingWs] = useState(false);
  const [wsError, setWsError] = useState<string | null>(null);

  // Create Project Modal
  const [createModal, setCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [projectType, setProjectType] = useState('film');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    setLoading(true);
    try {
      const data = await api.getWorkspaces();
      const list = data.workspaces || [];
      setWorkspaces(list);

      // Select active workspace
      const savedId = localStorage.getItem('windervale_active_workspace');
      const found = list.find((w) => w.id === savedId) || list[0] || null;
      if (found) {
        selectWorkspace(found);
      }
    } catch (err) {
      console.error('Error fetching workspaces:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectWorkspace = (ws: Workspace) => {
    setActiveWorkspace(ws);
    localStorage.setItem('windervale_active_workspace', ws.id);
    setSensitiveEnabled(Boolean(ws.sensitive_lock_enabled));

    // Check unlock state in sessionStorage
    const isLocked = Boolean(ws.is_locked);
    const sessionUnlocked = sessionStorage.getItem(`unlocked_ws_${ws.id}`) === 'true';

    if (!isLocked || sessionUnlocked) {
      setIsUnlocked(true);
      loadProjects(ws.id);
    } else {
      setIsUnlocked(false);
      setProjects([]);
    }
  };

  const loadProjects = async (workspaceId?: string) => {
    setProjectsLoading(true);
    try {
      const wsId = workspaceId || activeWorkspace?.id;
      const data = await api.getProjects(wsId);
      setProjects(data.projects || []);
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !pinInput) return;

    setUnlocking(true);
    setUnlockError(null);
    try {
      await api.unlockWorkspace(activeWorkspace.id, pinInput);
      sessionStorage.setItem(`unlocked_ws_${activeWorkspace.id}`, 'true');
      setIsUnlocked(true);
      setPinInput('');
      loadProjects(activeWorkspace.id);
    } catch (err: any) {
      setUnlockError(err.message || 'Incorrect security PIN. Access denied.');
    } finally {
      setUnlocking(false);
    }
  };

  const handleRecoverPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !recoveryPassword || !recoveryNewPin) return;

    setRecovering(true);
    setUnlockError(null);
    try {
      await api.recoverWorkspacePin(activeWorkspace.id, recoveryPassword, recoveryNewPin);
      sessionStorage.setItem(`unlocked_ws_${activeWorkspace.id}`, 'true');
      setIsUnlocked(true);
      setRecoveryMode(false);
      setRecoveryPassword('');
      setRecoveryNewPin('');
      loadProjects(activeWorkspace.id);
      loadWorkspaces();
    } catch (err: any) {
      setUnlockError(err.message || 'Account password verification failed.');
    } finally {
      setRecovering(false);
    }
  };

  const handleLockNow = () => {
    if (!activeWorkspace) return;
    sessionStorage.removeItem(`unlocked_ws_${activeWorkspace.id}`);
    sessionStorage.removeItem(`unlocked_sensitive_${activeWorkspace.id}`);
    setIsUnlocked(false);
    setSecurityModalOpen(false);
  };

  const handleUpdateSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace) return;

    setUpdatingSecurity(true);
    setSecurityFeedback(null);

    try {
      if (lockAction === 'set') {
        if (newPin.length < 4) {
          throw new Error('PIN must be at least 4 digits');
        }
        if (newPin !== confirmPin) {
          throw new Error('PINs do not match');
        }
        await api.setWorkspaceLock(activeWorkspace.id, {
          action: 'set',
          new_pin: newPin,
        });
        sessionStorage.setItem(`unlocked_ws_${activeWorkspace.id}`, 'true');
      } else if (lockAction === 'change') {
        if (!currentPin) throw new Error('Current PIN is required');
        if (newPin.length < 4) throw new Error('New PIN must be at least 4 digits');
        if (newPin !== confirmPin) throw new Error('New PINs do not match');
        await api.setWorkspaceLock(activeWorkspace.id, {
          action: 'change',
          current_pin: currentPin,
          new_pin: newPin,
        });
      } else if (lockAction === 'remove') {
        if (!currentPin) throw new Error('Current PIN is required to remove protection');
        await api.setWorkspaceLock(activeWorkspace.id, {
          action: 'remove',
          current_pin: currentPin,
        });
      }

      setSecurityFeedback({
        type: 'success',
        message: 'Workspace security settings updated successfully.',
      });
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      await loadWorkspaces();
    } catch (err: any) {
      setSecurityFeedback({
        type: 'error',
        message: err.message || 'Failed to update security configuration.',
      });
    } finally {
      setUpdatingSecurity(false);
    }
  };

  const handleToggleSensitiveLock = async () => {
    if (!activeWorkspace) return;
    setUpdatingSecurity(true);
    setSecurityFeedback(null);
    try {
      const nextState = !sensitiveEnabled;
      await api.setSensitiveLock(activeWorkspace.id, {
        enabled: nextState,
        pin: nextState ? (sensitivePin || undefined) : undefined,
      });
      setSensitiveEnabled(nextState);
      setSecurityFeedback({
        type: 'success',
        message: nextState
          ? 'Sensitive modules (Rights, Agreement, Money, Distribution, Credits) are now locked.'
          : 'Sensitive modules lock disabled.',
      });
      await loadWorkspaces();
    } catch (err: any) {
      setSecurityFeedback({
        type: 'error',
        message: err.message || 'Failed to update sensitive lock state.',
      });
    } finally {
      setUpdatingSecurity(false);
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;

    setCreatingWs(true);
    setWsError(null);
    try {
      const data = await api.createWorkspace({
        name: newWsName.trim(),
        description: newWsDesc.trim(),
        pin: newWsPin.trim() || undefined,
      });
      setNewWsName('');
      setNewWsDesc('');
      setNewWsPin('');
      setNewWsModal(false);
      await loadWorkspaces();
      if (data.workspace) {
        selectWorkspace(data.workspace);
      }
    } catch (err: any) {
      setWsError(err.message || 'Failed to create workspace.');
    } finally {
      setCreatingWs(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !activeWorkspace) return;

    setCreating(true);
    setError(null);
    try {
      const data = await api.createProject({
        workspace_id: activeWorkspace.id,
        title: title.trim(),
        project_type: projectType,
        description: description.trim(),
        location: location.trim(),
        target_date: targetDate || undefined,
        visibility: 'private',
      });
      setTitle('');
      setDescription('');
      setLocation('');
      setTargetDate('');
      setCreateModal(false);
      if (data.project?.id) {
        onSelectProject(data.project.id);
      } else {
        loadProjects(activeWorkspace.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center font-mono text-xs text-black font-bold animate-pulse">
        CONNECTING TO WINDERVALE WORKSPACE ENVIRONMENT...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-white min-h-full text-black">
      {/* Top Broadsheet Hierarchy & Workspace Switcher Bar */}
      <div className="border-[2.5px] border-black bg-[#fbf6f0] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[3px_3px_0px_#000]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#6A1A4C] font-black block">
            CREATIVE OPERATING SYSTEM
          </span>
          <span className="text-black/30 font-mono text-xs">&middot;</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase font-bold text-black">
              WORKSPACE:
            </span>
            {workspaces.length > 1 ? (
              <select
                value={activeWorkspace?.id || ''}
                onChange={(e) => {
                  const ws = workspaces.find((w) => w.id === e.target.value);
                  if (ws) selectWorkspace(ws);
                }}
                className="bg-white border-[2px] border-black px-2.5 py-1 font-arthouse font-bold text-xs uppercase text-black focus:outline-none cursor-pointer"
              >
                {workspaces.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} {w.is_locked ? '[LOCKED]' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <span className="font-arthouse font-bold text-sm uppercase tracking-wider text-black border-b-[2px] border-black">
                {activeWorkspace?.name || 'Studio Primary'}
              </span>
            )}
          </div>

          <button
            onClick={() => setNewWsModal(true)}
            className="px-2 py-1 bg-white hover:bg-black hover:text-white border border-black font-mono text-[10px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1"
          >
            <FolderPlus className="w-3 h-3" />
            <span>+ New Workspace</span>
          </button>
        </div>

        {/* Security & Access Status Controls */}
        <div className="flex items-center gap-2">
          {activeWorkspace?.is_locked ? (
            isUnlocked ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#2D7A4C]/15 border border-[#2D7A4C] text-[#2D7A4C] font-mono text-[10px] font-bold uppercase">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>UNLOCKED SESSION</span>
                </span>
                <button
                  onClick={handleLockNow}
                  className="px-2.5 py-1 bg-black text-white hover:bg-[#6A1A4C] font-mono text-[10px] font-bold uppercase border border-black cursor-pointer transition-colors"
                >
                  <Lock className="w-3 h-3 inline mr-1" />
                  Lock Now
                </button>
              </div>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#C84B31]/15 border border-[#C84B31] text-[#C84B31] font-mono text-[10px] font-bold uppercase">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>LOCKED</span>
              </span>
            )
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#fbf6f0] border border-black/40 text-black/70 font-mono text-[9px] font-bold uppercase">
              <Shield className="w-3 h-3" />
              <span>OPEN ACCESS (NO PIN)</span>
            </span>
          )}

          <button
            onClick={() => {
              setSecurityModalOpen(true);
              setSecurityFeedback(null);
            }}
            className="p-1.5 bg-white hover:bg-black hover:text-white border border-black cursor-pointer transition-colors"
            title="Workspace Lock & Security Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* WORKSPACE LOCK SCREEN (When Locked and Not Unlocked in Session) */}
      {!isUnlocked && activeWorkspace?.is_locked ? (
        <div className="max-w-md mx-auto my-12 p-8 bg-[#fbf6f0] border-[2.5px] border-black shadow-[4px_4px_0px_0px_#000] space-y-6 animate-editorial-fade">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-black text-white flex items-center justify-center mx-auto border-[2px] border-black">
              <Lock className="w-6 h-6 text-[#F2CBD2]" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#6A1A4C] font-black block">
              AUTHENTICATED ENCRYPTION
            </span>
            <h2 className="font-fun font-bold text-2xl text-black lowercase">
              workspace is private
            </h2>
            <p className="font-fun italic text-xs text-black/80 leading-relaxed">
              Enter the security PIN set by the workspace administrator to access project records and assets.
            </p>
          </div>

          {unlockError && (
            <div className="p-3 bg-black border border-black text-white font-mono text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#C84B31] shrink-0" />
              <span>{unlockError}</span>
            </div>
          )}

          {!recoveryMode ? (
            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] uppercase font-bold text-black mb-1.5">
                  Security PIN
                </label>
                <input
                  type="password"
                  maxLength={8}
                  required
                  autoFocus
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter 4 - 8 digit PIN"
                  className="w-full p-3 bg-white border-[2px] border-black font-mono text-center tracking-[0.5em] text-lg text-black focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={unlocking || !pinInput}
                className="w-full py-3 bg-black hover:bg-[#6A1A4C] text-white font-mono text-xs font-bold uppercase tracking-wider border-[2px] border-black disabled:opacity-40 cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                <span>{unlocking ? 'VERIFYING CREDENTIAL...' : 'UNLOCK WORKSPACE'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setRecoveryMode(true);
                    setUnlockError(null);
                  }}
                  className="font-mono text-[10px] text-black/60 hover:text-black uppercase underline cursor-pointer"
                >
                  Forgot PIN? Recover with account password
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRecoverPin} className="space-y-4">
              <div className="p-3 bg-white border border-black text-xs font-fun italic text-black/80">
                Provide your main Windervale account password to authenticate ownership and reset the workspace PIN.
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase font-bold text-black mb-1">
                  Account Password
                </label>
                <input
                  type="password"
                  required
                  value={recoveryPassword}
                  onChange={(e) => setRecoveryPassword(e.target.value)}
                  placeholder="Your account login password"
                  className="w-full p-2.5 bg-white border-[2px] border-black font-mono text-xs text-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase font-bold text-black mb-1">
                  New 4 - 8 Digit PIN
                </label>
                <input
                  type="password"
                  maxLength={8}
                  required
                  value={recoveryNewPin}
                  onChange={(e) => setRecoveryNewPin(e.target.value)}
                  placeholder="New Security PIN"
                  className="w-full p-2.5 bg-white border-[2px] border-black font-mono text-xs text-black focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRecoveryMode(false);
                    setUnlockError(null);
                  }}
                  className="font-mono text-xs text-black/60 hover:text-black uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recovering || !recoveryPassword || !recoveryNewPin}
                  className="px-4 py-2 bg-black hover:bg-[#6A1A4C] text-white font-mono text-xs font-bold uppercase border-[2px] border-black disabled:opacity-40 cursor-pointer transition-colors"
                >
                  {recovering ? 'RECOVERING...' : 'RESET PIN & UNLOCK'}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        /* UNLOCKED PROJECT DIRECTORY & MODULE INTERFACE */
        <div className="space-y-6">
          {/* Header answering 'what am i making?' */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b-[2.5px] border-black pb-4 gap-3">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-black font-black block">
                COLLABORATIVE STUDIO &middot; PRAXIS DIRECTORY
              </span>
              <h1 className="font-fun font-bold text-2xl sm:text-3xl lg:text-4xl text-black lowercase tracking-normal mt-0.5">
                what am i making?
              </h1>
              <p className="font-fun italic text-xs sm:text-sm text-black/75 mt-1">
                Dedicated project environments with the 12 production tools, immutable records, and rights protection.
              </p>
            </div>
            {projects.length > 0 && (
              <button
                onClick={() => setCreateModal(true)}
                className="px-4 py-2 bg-[#3b0764] hover:bg-[#581c87] text-[#f3e8ff] border-[2px] border-black text-xs flex items-center gap-1.5 font-mono tracking-wider uppercase font-bold cursor-pointer transition-colors self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>New Project</span>
              </button>
            )}
          </div>

          {/* Projects Content */}
          {projectsLoading ? (
            <div className="py-20 text-center font-mono text-xs text-black/60 animate-pulse font-bold">
              Retrieving workspace projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="py-16 px-6 text-center space-y-4 border-[2.5px] border-black bg-[#fbf6f0] max-w-xl mx-auto shadow-[3px_3px_0px_#000]">
              <div className="space-y-2 max-w-sm mx-auto">
                <h2 className="font-fun font-bold text-2xl text-black lowercase">
                  nothing here yet
                </h2>
                <p className="font-fun text-xs text-black/80 italic leading-relaxed">
                  Start a project in {activeWorkspace?.name || 'this workspace'} to establish a dedicated creative environment, invite collaborators, and protect your work.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setCreateModal(true)}
                  className="py-2.5 px-6 bg-[#3b0764] hover:bg-[#581c87] text-[#f3e8ff] font-mono text-xs font-bold uppercase tracking-wider border-[2px] border-black cursor-pointer transition-colors"
                >
                  [ START A PROJECT &rarr; ]
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProject(p.id)}
                  className="p-5 bg-[#fbf6f0] border-[2.5px] border-black hover:bg-white cursor-pointer transition-colors flex flex-col gap-3 group shadow-[2px_2px_0px_#000]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] uppercase px-2 py-0.5 bg-[#6A1A4C] border border-black text-white font-bold">
                        {p.project_type}
                      </span>
                      <span className="font-mono text-[9px] uppercase px-2 py-0.5 border border-black text-black font-bold">
                        {p.status || 'Active'}
                      </span>
                    </div>
                    {p.user_role && (
                      <span className="font-mono text-[10px] text-black/60 font-bold uppercase">
                        [{p.user_role}]
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-fun font-bold text-xl text-black group-hover:text-[#6A1A4C] transition-colors">
                      {p.title}
                    </h3>
                    {p.description && (
                      <p className="font-fun italic text-xs text-black/85 mt-1 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-black/20 text-xs text-black/70 font-mono mt-auto">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold">
                        <Users className="w-3 h-3 text-black" />
                        {p.member_count || 1} Collaborators
                      </span>
                      {p.target_date && (
                        <span className="flex items-center gap-1.5 font-mono text-[10px]">
                          <Calendar className="w-3 h-3 text-black/60" />
                          {p.target_date}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs tracking-wider uppercase font-bold text-black group-hover:translate-x-0.5 transition-all flex items-center gap-0.5">
                      Project Cover &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* WORKSPACE SECURITY & LOCK SETTINGS MODAL */}
      {securityModalOpen && activeWorkspace && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#fbf6f0] border-[2.5px] border-black p-6 space-y-4 shadow-[5px_5px_0px_#000]">
            <div className="flex items-center justify-between border-b-[2px] border-black pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase text-[#6A1A4C] font-bold tracking-widest">
                  ACCESS CONTROL &amp; ENCRYPTION
                </span>
                <h3 className="font-fun font-bold text-xl text-black leading-tight">
                  workspace lock settings
                </h3>
              </div>
              <button
                onClick={() => setSecurityModalOpen(false)}
                className="text-black hover:bg-black hover:text-white p-1 border border-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {securityFeedback && (
              <div
                className={`p-3 border font-mono text-xs flex items-center gap-2 ${
                  securityFeedback.type === 'success'
                    ? 'bg-[#2D7A4C]/10 border-[#2D7A4C] text-[#2D7A4C]'
                    : 'bg-[#C84B31]/10 border-[#C84B31] text-[#C84B31]'
                }`}
              >
                <span>{securityFeedback.message}</span>
              </div>
            )}

            {/* Lock Action Selector */}
            <div className="flex border border-black">
              <button
                type="button"
                onClick={() => setLockAction('set')}
                className={`flex-1 py-1.5 font-mono text-xs uppercase font-bold cursor-pointer transition-colors ${
                  lockAction === 'set' ? 'bg-black text-white' : 'bg-white text-black hover:bg-[#fbf6f0]'
                }`}
              >
                Set PIN
              </button>
              <button
                type="button"
                onClick={() => setLockAction('change')}
                className={`flex-1 py-1.5 font-mono text-xs uppercase font-bold cursor-pointer transition-colors border-x border-black ${
                  lockAction === 'change' ? 'bg-black text-white' : 'bg-white text-black hover:bg-[#fbf6f0]'
                }`}
              >
                Change PIN
              </button>
              <button
                type="button"
                onClick={() => setLockAction('remove')}
                className={`flex-1 py-1.5 font-mono text-xs uppercase font-bold cursor-pointer transition-colors ${
                  lockAction === 'remove' ? 'bg-black text-white' : 'bg-white text-black hover:bg-[#fbf6f0]'
                }`}
              >
                Remove PIN
              </button>
            </div>

            <form onSubmit={handleUpdateSecurity} className="space-y-3">
              {(lockAction === 'change' || lockAction === 'remove') && (
                <div>
                  <label className="block font-mono text-[10px] uppercase font-bold text-black mb-1">
                    Current PIN
                  </label>
                  <input
                    type="password"
                    maxLength={8}
                    required
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value)}
                    placeholder="Enter current PIN"
                    className="w-full p-2.5 bg-white border-[2px] border-black font-mono text-xs text-black focus:outline-none"
                  />
                </div>
              )}

              {lockAction !== 'remove' && (
                <>
                  <div>
                    <label className="block font-mono text-[10px] uppercase font-bold text-black mb-1">
                      New Security PIN (4 - 8 Digits)
                    </label>
                    <input
                      type="password"
                      maxLength={8}
                      required
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="e.g. 4829"
                      className="w-full p-2.5 bg-white border-[2px] border-black font-mono text-xs text-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase font-bold text-black mb-1">
                      Confirm PIN
                    </label>
                    <input
                      type="password"
                      maxLength={8}
                      required
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      placeholder="Re-enter PIN"
                      className="w-full p-2.5 bg-white border-[2px] border-black font-mono text-xs text-black focus:outline-none"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={updatingSecurity}
                className="w-full py-2.5 bg-black hover:bg-[#6A1A4C] text-white font-mono text-xs font-bold uppercase border-[2px] border-black disabled:opacity-40 cursor-pointer transition-colors"
              >
                {updatingSecurity ? 'SAVING...' : 'UPDATE WORKSPACE LOCK'}
              </button>
            </form>

            {/* SENSITIVE MODULES SECONDARY LOCK */}
            <div className="pt-4 border-t-[2px] border-black space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs uppercase font-bold text-black block">
                    Secondary Sensitive Records Lock
                  </span>
                  <p className="font-fun text-xs text-black/70 italic">
                    Restricts 02 RIGHTS, 03 AGREEMENT, 08 MONEY, 09 DISTRIBUTION, and 10 CREDITS until unlocked once per session.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleSensitiveLock}
                  disabled={updatingSecurity}
                  className={`px-3 py-1 font-mono text-xs uppercase font-bold border border-black cursor-pointer transition-colors ${
                    sensitiveEnabled ? 'bg-[#2D7A4C] text-white' : 'bg-white text-black hover:bg-black hover:text-white'
                  }`}
                >
                  {sensitiveEnabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW WORKSPACE MODAL */}
      {newWsModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#fbf6f0] border-[2.5px] border-black p-6 space-y-4 shadow-[4px_4px_0px_#000]">
            <div className="flex items-center justify-between border-b-[2px] border-black pb-2">
              <span className="font-mono text-[10px] uppercase text-[#6A1A4C] font-black tracking-widest">
                CREATIVE STUDIO
              </span>
              <button
                onClick={() => setNewWsModal(false)}
                className="text-black hover:bg-black hover:text-white p-1 border border-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="font-fun font-bold text-xl text-black lowercase leading-tight">
              create new workspace
            </h3>
            <p className="font-fun italic text-xs text-black/80">
              Create an isolated workspace environment to house multiple projects with independent access rules.
            </p>

            {wsError && (
              <div className="p-2 bg-black border border-black text-white font-mono text-xs">
                {wsError}
              </div>
            )}

            <form onSubmit={handleCreateWorkspace} className="space-y-3">
              <div>
                <label className="block font-mono text-[10px] font-bold uppercase text-black mb-1">
                  Workspace Name *
                </label>
                <input
                  type="text"
                  required
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  placeholder="e.g. Cinema Atelier, Sound Lab"
                  className="w-full bg-white border-[2px] border-black px-3 py-2 text-xs text-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] font-bold uppercase text-black mb-1">
                  Description / Studio Focus
                </label>
                <input
                  type="text"
                  value={newWsDesc}
                  onChange={(e) => setNewWsDesc(e.target.value)}
                  placeholder="e.g. Feature film development and experimental sound"
                  className="w-full bg-white border-[2px] border-black px-3 py-2 text-xs text-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] font-bold uppercase text-black mb-1">
                  Optional Security PIN
                </label>
                <input
                  type="password"
                  maxLength={8}
                  value={newWsPin}
                  onChange={(e) => setNewWsPin(e.target.value)}
                  placeholder="Leave empty for open access"
                  className="w-full bg-white border-[2px] border-black px-3 py-2 font-mono text-xs text-black focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t-[2px] border-black">
                <button
                  type="button"
                  onClick={() => setNewWsModal(false)}
                  className="font-mono text-xs text-black/60 hover:text-black cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={creatingWs || !newWsName.trim()}
                  className="px-4 py-2 bg-black text-white hover:bg-[#6A1A4C] border-[2px] border-black font-mono text-xs uppercase font-bold disabled:opacity-40 cursor-pointer transition-colors"
                >
                  {creatingWs ? 'CREATING...' : 'CREATE WORKSPACE \u2197'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* START PROJECT MODAL */}
      {createModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#fbf6f0] border-[2.5px] border-black p-6 space-y-3 shadow-[4px_4px_0px_#000]">
            <div className="flex items-center justify-between border-b-[2px] border-black pb-2 mb-2">
              <span className="font-mono text-[10px] uppercase text-black font-black tracking-widest">
                NEW CREATIVE PROJECT
              </span>
              <button
                onClick={() => setCreateModal(false)}
                className="text-black hover:bg-black hover:text-white p-1 border border-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="font-fun font-bold text-xl text-black lowercase leading-tight">
              establish project space
            </h3>
            <p className="font-fun italic text-xs text-black/80">
              Creates a dedicated project environment with the 12 production tools in {activeWorkspace?.name || 'Workspace'}.
            </p>

            {error && (
              <div className="p-2 bg-black border border-black text-white font-mono text-[10px] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-[#6A1A4C]" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-3 pt-1">
              <div>
                <label className="block font-mono text-[10px] font-bold uppercase text-black mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. THE ARCHIVE"
                  className="w-full bg-white border-[2px] border-black px-3 py-2 text-sm text-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] font-bold uppercase text-black mb-1">
                  Project Medium
                </label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full bg-white border-[2px] border-black px-3 py-2 font-mono text-xs text-black focus:outline-none"
                >
                  {PROJECT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] font-bold uppercase text-black mb-1">
                  Description / Core Concept
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this project making and exploring?"
                  className="w-full bg-white border-[2px] border-black p-3 font-fun italic text-xs text-black focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-mono text-[10px] font-bold uppercase text-black mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Tokyo"
                    className="w-full bg-white border-[2px] border-black px-3 py-2 text-xs text-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] font-bold uppercase text-black mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-white border-[2px] border-black px-3 py-2 font-mono text-xs text-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t-[2px] border-black">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="font-mono text-xs text-black/60 hover:text-black cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={creating || !title.trim()}
                  className="px-4 py-2 bg-black text-white hover:bg-[#6A1A4C] border-[2px] border-black font-mono text-xs uppercase font-bold disabled:opacity-40 cursor-pointer transition-colors"
                >
                  {creating ? 'CREATING...' : 'ESTABLISH WORKSPACE \u2197'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
