import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Project, ProjectMember, AgreementItem, PendingActionItem,
  Workspace, WorkspaceSearchResult, WorkspaceActivityItem
} from '../../types';
import { MonogramSeal } from '../common/MonogramSeal';
import {
  ArrowLeft, ChevronRight, Layers, FileSignature, CheckCircle,
  AlertTriangle, Bell, ArrowUpRight, Search, Activity, Lock, Unlock,
  HelpCircle, ChevronDown, ChevronUp, History, Shield, CheckCircle2, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// The 13 Dedicated Tool Modules
import { ProjectTool } from './tools/ProjectTool';
import { CrewTool } from './tools/CrewTool';
import { RightsTool } from './tools/RightsTool';
import { AgreementTool } from './tools/AgreementTool';
import { BuildTool } from './tools/BuildTool';
import { StudioTool } from './tools/StudioTool';
import { CaptureTool } from './tools/CaptureTool';
import { MilestonesTool } from './tools/MilestonesTool';
import { MoneyTool } from './tools/MoneyTool';
import { DistributionTool } from './tools/DistributionTool';
import { CreditsTool } from './tools/CreditsTool';
import { OutcomeTool } from './tools/OutcomeTool';
import { MemoryTool } from './tools/MemoryTool';

interface ProjectSpaceProps {
  projectId: string;
  onBackToProjects: () => void;
  onEnterModuleScreen?: (isModuleOpen: boolean) => void;
}

export type ModuleKey =
  | '00_PROJECT'
  | '01_CREW'
  | '02_RIGHTS'
  | '03_AGREEMENT'
  | '04_BUILD'
  | '05_STUDIO'
  | '06_CAPTURE'
  | '07_MILESTONES'
  | '08_MONEY'
  | '09_DISTRIBUTION'
  | '10_CREDITS'
  | '11_OUTCOME'
  | '12_MEMORY';

const SENSITIVE_MODULES: ModuleKey[] = [
  '02_RIGHTS',
  '03_AGREEMENT',
  '08_MONEY',
  '09_DISTRIBUTION',
  '10_CREDITS'
];

const MODULES: { key: ModuleKey; num: string; title: string; subtitle: string; isSensitive?: boolean }[] = [
  { key: '00_PROJECT', num: '00', title: 'PROJECT', subtitle: 'Identity, intent, format & outputs' },
  { key: '01_CREW', num: '01', title: 'CREW', subtitle: 'Collaborator roster & roles' },
  { key: '02_RIGHTS', num: '02', title: 'RIGHTS', subtitle: 'Ownership, licensing & revenue splits', isSensitive: true },
  { key: '03_AGREEMENT', num: '03', title: 'AGREEMENT', subtitle: 'Covenants & digital confirmations', isSensitive: true },
  { key: '04_BUILD', num: '04', title: 'BUILD', subtitle: 'Creative pipeline & deliverables' },
  { key: '05_STUDIO', num: '05', title: 'STUDIO', subtitle: 'Assets, scripts & media' },
  { key: '06_CAPTURE', num: '06', title: 'CAPTURE', subtitle: 'Fragments, notes & references' },
  { key: '07_MILESTONES', num: '07', title: 'MILESTONES', subtitle: 'Major gates & approval states' },
  { key: '08_MONEY', num: '08', title: 'MONEY', subtitle: 'Budgets, recoupment & waterfall math', isSensitive: true },
  { key: '09_DISTRIBUTION', num: '09', title: 'DISTRIBUTION', subtitle: 'Release, festivals, licensing & audience', isSensitive: true },
  { key: '10_CREDITS', num: '10', title: 'CREDITS', subtitle: 'Permanent contributor record', isSensitive: true },
  { key: '11_OUTCOME', num: '11', title: 'OUTCOME', subtitle: 'Post-release intelligence & continuation' },
  { key: '12_MEMORY', num: '12', title: 'MEMORY', subtitle: 'Archive & project history' },
];

export const ProjectSpace: React.FC<ProjectSpaceProps> = ({
  projectId,
  onBackToProjects,
  onEnterModuleScreen,
}) => {
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [agreements, setAgreements] = useState<AgreementItem[]>([]);
  const [pendingActions, setPendingActions] = useState<PendingActionItem[]>([]);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [summaryData, setSummaryData] = useState<{
    urgentTasks: any[];
    recentActivity: any[];
    toolCounts: Record<string, number>;
  } | null>(null);
  const [userRole, setUserRole] = useState<'owner' | 'member' | 'viewer'>('viewer');
  const [loading, setLoading] = useState(true);

  // Project context panel toggle
  const [showProjectContext, setShowProjectContext] = useState(true);

  // Sensitive lock state
  const [isSensitiveUnlocked, setIsSensitiveUnlocked] = useState(false);
  const [sensitivePinInput, setSensitivePinInput] = useState('');
  const [sensitiveError, setSensitiveError] = useState<string | null>(null);
  const [unlockingSensitive, setUnlockingSensitive] = useState(false);

  // Cross-module search state
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WorkspaceSearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  // Activity log state
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [activities, setActivities] = useState<WorkspaceActivityItem[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // Responsive desktop detection
  const [isDesktop, setIsDesktop] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth >= 768;
  });

  // Default module
  const [activeModule, setActiveModule] = useState<ModuleKey | null>(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      return '00_PROJECT';
    }
    return null;
  });

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
      if (desktop) {
        setActiveModule((prev) => prev || '00_PROJECT');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  useEffect(() => {
    if (onEnterModuleScreen) {
      onEnterModuleScreen(activeModule !== null);
    }
  }, [activeModule, onEnterModuleScreen]);

  const loadProject = async () => {
    setLoading(true);
    try {
      const [projData, agreeData, actionsData, summData] = await Promise.all([
        api.getProject(projectId),
        api.getAgreements(projectId).catch(() => ({ agreements: [] })),
        api.getPendingActions(projectId).catch(() => ({ pendingActions: [] })),
        api.getWorkspaceSummary(projectId).catch(() => null)
      ]);

      setProject(projData.project);
      setMembers(projData.members || []);
      setUserRole(projData.userRole || 'viewer');
      setAgreements(agreeData.agreements || []);
      setPendingActions(actionsData.pendingActions || []);
      if (summData) setSummaryData(summData);

      // Check if project belongs to a workspace with sensitive lock
      if (projData.project?.workspace_id) {
        try {
          const wsData = await api.getWorkspace(projData.project.workspace_id);
          setWorkspace(wsData.workspace);
          const wsId = wsData.workspace.id;
          const sessionSensitiveUnlocked = sessionStorage.getItem(`unlocked_sensitive_${wsId}`) === 'true';
          if (!wsData.workspace.sensitive_lock_enabled || sessionSensitiveUnlocked) {
            setIsSensitiveUnlocked(true);
          } else {
            setIsSensitiveUnlocked(false);
          }
        } catch {
          setIsSensitiveUnlocked(true);
        }
      } else {
        setIsSensitiveUnlocked(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockSensitive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project?.workspace_id || !sensitivePinInput) return;

    setUnlockingSensitive(true);
    setSensitiveError(null);
    try {
      await api.unlockSensitive(project.workspace_id, sensitivePinInput);
      sessionStorage.setItem(`unlocked_sensitive_${project.workspace_id}`, 'true');
      setIsSensitiveUnlocked(true);
      setSensitivePinInput('');
    } catch (err: any) {
      setSensitiveError(err.message || 'Incorrect sensitive records PIN.');
    } finally {
      setUnlockingSensitive(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const data = await api.searchWorkspace(projectId, query.trim());
      setSearchResults(data.results || []);
    } catch (err) {
      console.error('Workspace search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  const loadActivities = async () => {
    setLoadingActivity(true);
    try {
      const data = await api.getWorkspaceActivity(projectId);
      setActivities(data.activity || []);
    } catch (err) {
      console.error('Failed to load activity:', err);
    } finally {
      setLoadingActivity(false);
    }
  };

  const isCovenantSignedByMe = Boolean(
    user && agreements.length > 0 && agreements.every((a) => a.signed_by?.some((s) => s.user_id === user.id))
  );
  const isCovenantRatified = Boolean(
    agreements.length > 0 && agreements.every((a) => a.status === 'agreed')
  );

  const jumpToTool = (toolKey: string) => {
    const match = MODULES.find(m => m.key.toLowerCase().includes(toolKey.toLowerCase()) || m.title.toLowerCase().includes(toolKey.toLowerCase()));
    if (match) {
      setActiveModule(match.key);
    }
  };

  const renderActiveTool = () => {
    const toolKey = activeModule || '00_PROJECT';

    // Sensitive Lock Check
    const isSensitive = SENSITIVE_MODULES.includes(toolKey);
    if (isSensitive && workspace?.sensitive_lock_enabled && !isSensitiveUnlocked) {
      return (
        <div className="max-w-md mx-auto my-12 p-8 bg-[#fbf6f0] border-[2.5px] border-black shadow-[4px_4px_0px_#000] space-y-4 animate-editorial-fade">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-black text-white flex items-center justify-center mx-auto border-[2px] border-black">
              <Lock className="w-6 h-6 text-[#F2CBD2]" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#6A1A4C] font-black block">
              RESTRICTED SENSITIVE LEDGER
            </span>
            <h3 className="font-fun font-bold text-xl text-black">
              sensitive module protected
            </h3>
            <p className="font-fun italic text-xs text-black/80">
              This module contains sensitive ownership, covenants, or financial intelligence. Unlock once to work freely across all sensitive records for this session.
            </p>
          </div>

          {sensitiveError && (
            <div className="p-2.5 bg-black border border-black text-white font-mono text-xs flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-[#C84B31] shrink-0" />
              <span>{sensitiveError}</span>
            </div>
          )}

          <form onSubmit={handleUnlockSensitive} className="space-y-3">
            <div>
              <label className="block font-mono text-[10px] uppercase font-bold text-black mb-1">
                Sensitive Security PIN
              </label>
              <input
                type="password"
                maxLength={8}
                required
                autoFocus
                value={sensitivePinInput}
                onChange={(e) => setSensitivePinInput(e.target.value)}
                placeholder="Enter PIN"
                className="w-full p-2.5 bg-white border-[2px] border-black font-mono text-center tracking-[0.5em] text-base text-black focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={unlockingSensitive || !sensitivePinInput}
              className="w-full py-2.5 bg-black hover:bg-[#6A1A4C] text-white font-mono text-xs font-bold uppercase tracking-wider border-[2px] border-black disabled:opacity-40 cursor-pointer transition-colors"
            >
              {unlockingSensitive ? 'AUTHENTICATING...' : 'UNLOCK SENSITIVE MODULES \u2197'}
            </button>
          </form>
        </div>
      );
    }

    switch (toolKey) {
      case '00_PROJECT':
        return (
          <ProjectTool
            projectId={projectId}
            project={project}
            members={members}
            userRole={userRole}
            onEnterFocus={() => {}}
            isFocusMode={true}
            onRefreshProject={loadProject}
          />
        );
      case '01_CREW':
        return (
          <CrewTool
            projectId={projectId}
            members={members}
            userRole={userRole}
            onEnterFocus={() => {}}
            isFocusMode={true}
            onRefreshProject={loadProject}
          />
        );
      case '02_RIGHTS':
        return (
          <RightsTool
            projectId={projectId}
            members={members}
            userRole={userRole}
            onEnterFocus={() => {}}
            isFocusMode={true}
          />
        );
      case '03_AGREEMENT':
        return (
          <AgreementTool
            projectId={projectId}
            members={members}
            userRole={userRole}
            onEnterFocus={() => {}}
            isFocusMode={true}
            onRefreshProject={loadProject}
          />
        );
      case '04_BUILD':
        return (
          <BuildTool
            projectId={projectId}
            members={members}
            userRole={userRole}
            onEnterFocus={() => {}}
            isFocusMode={true}
            isCovenantSigned={isCovenantSignedByMe}
            onOpenAgreement={() => setActiveModule('03_AGREEMENT')}
          />
        );
      case '05_STUDIO':
        return (
          <StudioTool
            projectId={projectId}
            members={members}
            userRole={userRole}
            onEnterFocus={() => {}}
            isFocusMode={true}
          />
        );
      case '06_CAPTURE':
        return (
          <CaptureTool
            projectId={projectId}
            members={members}
            userRole={userRole}
            onEnterFocus={() => {}}
            isFocusMode={true}
          />
        );
      case '07_MILESTONES':
        return (
          <MilestonesTool
            projectId={projectId}
            members={members}
            userRole={userRole}
            onEnterFocus={() => {}}
            isFocusMode={true}
          />
        );
      case '08_MONEY':
        return (
          <MoneyTool
            projectId={projectId}
            members={members}
            userRole={userRole}
            onEnterFocus={() => {}}
            isFocusMode={true}
          />
        );
      case '09_DISTRIBUTION':
        return (
          <DistributionTool
            projectId={projectId}
            members={members}
            userRole={userRole}
            onEnterFocus={() => {}}
            isFocusMode={true}
          />
        );
      case '10_CREDITS':
        return (
          <CreditsTool
            projectId={projectId}
            members={members}
            userRole={userRole}
            onEnterFocus={() => {}}
            isFocusMode={true}
          />
        );
      case '11_OUTCOME':
        return (
          <OutcomeTool
            projectId={projectId}
            members={members}
            userRole={userRole}
            onEnterFocus={() => {}}
            isFocusMode={true}
          />
        );
      case '12_MEMORY':
        return (
          <MemoryTool
            projectId={projectId}
            members={members}
            userRole={userRole}
            onEnterFocus={() => {}}
            isFocusMode={true}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center font-mono text-xs text-black font-bold animate-pulse">
        ENTERING PROJECT WORKSPACE...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="font-fun font-bold text-lg text-black">PROJECT NOT FOUND</p>
        <button
          onClick={onBackToProjects}
          className="px-4 py-2 bg-black text-white font-mono text-xs uppercase font-bold border-[2px] border-black hover:bg-[#6A1A4C] cursor-pointer"
        >
          &larr; BACK TO PROJECT COVER
        </button>
      </div>
    );
  }

  // Calculate project intelligence metrics
  const toolCounts = summaryData?.toolCounts || {};
  const totalRecords = Object.values(toolCounts).reduce((a, b) => a + b, 0);

  // -----------------------------------------------------------------
  // WEB VIEW (DESKTOP): TOOLS ON LEFT COLUMN, ACTIVE TOOL IN THE MIDDLE
  // -----------------------------------------------------------------
  if (isDesktop) {
    const currentMod = MODULES.find((m) => m.key === (activeModule || '00_PROJECT'));

    return (
      <div className="flex-1 flex flex-row min-h-0 h-full w-full bg-white">
        {/* LEFT COLUMN: 13 Workspace Tools Navigation & Project Identity */}
        <aside className="w-80 lg:w-96 shrink-0 border-r-[2.5px] border-black bg-[#fbf6f0] flex flex-col h-full overflow-y-auto select-none">
          {/* Back to Project Cover Bar */}
          <div className="p-3 border-b-[2px] border-black bg-white flex items-center justify-between">
            <button
              onClick={onBackToProjects}
              className="flex items-center gap-1.5 font-mono text-xs uppercase font-bold text-black hover:text-[#6A1A4C] cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>&larr; Project Cover</span>
            </button>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setSearchModalOpen(true);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="p-1 hover:bg-black hover:text-white border border-black cursor-pointer transition-colors"
                title="Search All 12 Modules"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setActivityModalOpen(true);
                  loadActivities();
                }}
                className="p-1 hover:bg-black hover:text-white border border-black cursor-pointer transition-colors"
                title="Activity Log"
              >
                <History className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Project Summary Card */}
          <div className="p-4 border-b-[2px] border-black bg-[#fbf6f0] space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-[#6A1A4C] text-white font-bold">
                {project.project_type}
              </span>
              <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 border border-black font-bold text-black">
                {project.status || 'Active'}
              </span>
              <span className="font-mono text-[9px] text-black/60 uppercase ml-auto">
                [{userRole}]
              </span>
            </div>
            <h2 className="font-fun font-bold text-xl text-black leading-tight">
              {project.title}
            </h2>
            {project.description && (
              <p className="font-fun italic text-xs text-black/75 line-clamp-2 leading-snug">
                {project.description}
              </p>
            )}

            {/* Crew Avatars */}
            <div className="flex items-center gap-2 pt-1 border-t border-black/15">
              <div className="flex items-center gap-1">
                {members.slice(0, 4).map((m) => (
                  <MonogramSeal key={m.id} name={m.name} size="xs" />
                ))}
              </div>
              <span className="font-mono text-[10px] text-black/70">
                {members.length} Collaborator{members.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Covenant Status Badge */}
            <div className="pt-2 border-t border-black/15 flex items-center justify-between">
              <span className="font-mono text-[10px] text-black/60 uppercase font-bold">
                COVENANT:
              </span>
              {isCovenantRatified ? (
                <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase font-bold px-2 py-0.5 bg-[#2D7A4C]/15 border border-[#2D7A4C] text-[#2D7A4C]">
                  <CheckCircle className="w-3 h-3" /> RATIFIED
                </span>
              ) : isCovenantSignedByMe ? (
                <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase font-bold px-2 py-0.5 bg-[#6A1A4C]/15 border border-[#6A1A4C] text-[#6A1A4C]">
                  <FileSignature className="w-3 h-3" /> SIGNED &middot; PENDING CREW
                </span>
              ) : (
                <button
                  onClick={() => setActiveModule('03_AGREEMENT')}
                  className="inline-flex items-center gap-1 font-mono text-[9px] uppercase font-bold px-2 py-0.5 bg-[#C84B31] text-white border border-black hover:bg-black transition-colors cursor-pointer animate-pulse"
                >
                  <AlertTriangle className="w-3 h-3" /> SIGN REQUIRED &rarr;
                </button>
              )}
            </div>
          </div>

          {/* Tools Column Header */}
          <div className="px-4 py-2.5 bg-black text-white flex items-center justify-between font-mono text-[10px] uppercase tracking-wider font-bold">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#6A1A4C]" />
              Workspace Modules
            </span>
            <span className="text-white/70">00 &ndash; 12</span>
          </div>

          {/* The 13 Tool Navigation Items */}
          <div className="flex-1 divide-y divide-black/15">
            {MODULES.map((m) => {
              const isSelected = (activeModule || '00_PROJECT') === m.key;
              const hasPendingAction = pendingActions.some(a => a.link_tool?.toLowerCase() === m.title.toLowerCase());

              return (
                <button
                  key={m.key}
                  onClick={() => setActiveModule(m.key)}
                  className={`w-full p-3.5 text-left transition-all flex items-center justify-between group cursor-pointer focus:outline-none ${
                    isSelected
                      ? 'bg-black text-white border-l-4 border-l-[#6A1A4C]'
                      : 'bg-[#fbf6f0] text-black hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 border border-black shrink-0 ${
                        isSelected
                          ? 'bg-[#6A1A4C] text-white'
                          : 'bg-black text-white group-hover:bg-[#6A1A4C]'
                      }`}
                    >
                      {m.num}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-arthouse font-bold text-xs uppercase tracking-wider truncate">
                          {m.title}
                        </h4>
                        {m.isSensitive && workspace?.sensitive_lock_enabled && !isSensitiveUnlocked && (
                          <Lock className="w-2.5 h-2.5 text-[#C84B31] shrink-0" title="Restricted Sensitive Record" />
                        )}
                        {m.key === '03_AGREEMENT' && !isCovenantSignedByMe && (
                          <span className="px-1.5 py-0.5 bg-[#C84B31] text-white font-mono text-[8px] uppercase font-bold">
                            SIGN
                          </span>
                        )}
                        {hasPendingAction && (
                          <span className="w-2 h-2 rounded-full bg-[#C84B31] shrink-0" title="Action pending in this module" />
                        )}
                      </div>
                      <p
                        className={`font-fun italic text-[11px] truncate ${
                          isSelected ? 'text-white/75' : 'text-black/60'
                        }`}
                      >
                        {m.subtitle}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected
                        ? 'text-[#6A1A4C] translate-x-1'
                        : 'text-black/30 group-hover:text-black group-hover:translate-x-0.5'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </aside>

        {/* MIDDLE COLUMN: Active Tool View Area */}
        <section className="flex-1 min-w-0 bg-white flex flex-col h-full overflow-y-auto">
          {/* Top Project Context Intelligence Header (Answers the Core Questions) */}
          <div className="border-b-[2.5px] border-black bg-[#FFFDF9] shrink-0">
            <div className="px-4 py-2.5 bg-[#fbf6f0] border-b border-black/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#6A1A4C]" />
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-black">
                  PROJECT CONTEXT &middot; {project.title}
                </span>
              </div>
              <button
                onClick={() => setShowProjectContext(!showProjectContext)}
                className="font-mono text-[10px] text-black/60 hover:text-black flex items-center gap-1 uppercase cursor-pointer"
              >
                <span>{showProjectContext ? 'Hide Brief' : 'Show Brief'}</span>
                {showProjectContext ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {showProjectContext && (
              <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono divide-x divide-black/10">
                <div className="pr-3 space-y-1">
                  <span className="text-[9px] uppercase text-black/50 font-bold block">01. WHAT AM I IN?</span>
                  <span className="font-bold text-black block truncate">{project.title}</span>
                  <span className="text-[10px] text-[#6A1A4C] uppercase font-bold">[{project.project_type}]</span>
                </div>
                <div className="px-3 space-y-1">
                  <span className="text-[9px] uppercase text-black/50 font-bold block">02. WHO IS WORKING?</span>
                  <span className="font-bold text-black block">{members.length} Active Crew</span>
                  <span className="text-[10px] text-black/60 truncate block">{members[0]?.name || 'Creator'}</span>
                </div>
                <div className="px-3 space-y-1">
                  <span className="text-[9px] uppercase text-black/50 font-bold block">03. WHAT HAS BEEN DONE?</span>
                  <span className="font-bold text-black block">{toolCounts.tasks || 0} Tasks Logged</span>
                  <span className="text-[10px] text-[#2D7A4C] font-bold">Consensus Active</span>
                </div>
                <div className="px-3 space-y-1">
                  <span className="text-[9px] uppercase text-black/50 font-bold block">04. WHAT NEEDS TO HAPPEN?</span>
                  <span className="font-bold text-black block">{pendingActions.length} Actions Required</span>
                  <span className="text-[10px] text-black/60">{toolCounts.milestones || 0} Milestones</span>
                </div>
                <div className="px-3 space-y-1">
                  <span className="text-[9px] uppercase text-black/50 font-bold block">05. WHAT IS RECORDED?</span>
                  <span className="font-bold text-black block">{totalRecords} Immutable Records</span>
                  <span className="text-[10px] text-black/60">{toolCounts.rights || 0} Rights Splits</span>
                </div>
                <div className="pl-3 space-y-1">
                  <span className="text-[9px] uppercase text-black/50 font-bold block">06. CURRENT STATE</span>
                  <span className="font-bold text-black uppercase block">{project.status || 'Development'}</span>
                  <span className="text-[10px] text-black/60">Updated: {new Date(project.updated_at || project.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Cross-Project Pending Actions Banner */}
          {pendingActions.length > 0 && (
            <div className="bg-[#FFFDF9] border-b-[2.5px] border-black p-3.5 space-y-2 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C84B31] animate-pulse shrink-0" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-[#C84B31]" />
                    <span>PENDING ACTIONS ({pendingActions.length})</span>
                  </span>
                </div>
                <span className="font-mono text-[9px] text-black/60 uppercase font-bold">OPERATIONAL GATES</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {pendingActions.map(action => (
                  <button
                    key={action.id}
                    onClick={() => jumpToTool(action.link_tool)}
                    className="p-2 bg-[#fbf6f0] border border-black hover:border-[#6A1A4C] flex items-center justify-between gap-3 text-left transition-colors cursor-pointer group flex-1 min-w-[240px]"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[9px] uppercase px-1 bg-black text-white font-bold">
                          {action.type}
                        </span>
                        <span className="font-arthouse font-bold text-xs text-black group-hover:text-[#6A1A4C]">
                          {action.title}
                        </span>
                      </div>
                      <p className="font-fun text-[11px] text-black/70 mt-0.5 line-clamp-1">
                        {action.description}
                      </p>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-black/40 group-hover:text-black shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Top Covenant Prerequisite Banner if Unsigned */}
          {!isCovenantSignedByMe && activeModule !== '03_AGREEMENT' && (
            <div className="bg-[#6A1A4C] text-white px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b-[2.5px] border-black shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider">
                  03 : AGREEMENT &middot; COVENANT PENDING SIGNATURE
                </span>
                <span className="hidden md:inline font-fun italic text-xs text-white/80">
                  : Mutual consensus required before active production.
                </span>
              </div>
              <button
                onClick={() => setActiveModule('03_AGREEMENT')}
                className="px-3 py-1 bg-white text-black hover:bg-[#fbf6f0] font-mono text-xs uppercase font-bold border border-black cursor-pointer transition-colors shrink-0"
              >
                REVIEW &amp; SIGN COVENANT &rarr;
              </button>
            </div>
          )}

          {/* Active Tool Top Masthead */}
          <div className="p-4 border-b-[2.5px] border-black bg-[#fbf6f0] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold px-2.5 py-1 bg-[#6A1A4C] text-white border-[2px] border-black">
                {currentMod?.num}
              </span>
              <div>
                <h1 className="font-arthouse font-bold text-lg lg:text-xl uppercase tracking-wider text-black">
                  {currentMod?.title}
                </h1>
                <p className="font-fun italic text-xs text-black/75">
                  {currentMod?.subtitle}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 font-mono text-[10px] text-black/60 uppercase">
                <span>PROJECT:</span>
                <span className="font-bold text-black border-b border-black">
                  {project.title}
                </span>
              </div>
            </div>
          </div>

          {/* Active Tool Component View */}
          <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
            {renderActiveTool()}
          </div>
        </section>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // MOBILE VIEW: FOCUSED WORKFLOW
  // -----------------------------------------------------------------
  if (activeModule) {
    const currentMod = MODULES.find((m) => m.key === activeModule);
    return (
      <div className="flex flex-col min-h-full p-4 space-y-4 animate-editorial-fade bg-white">
        {/* Module Top Header with <- PROJECT SPACE */}
        <div className="flex items-center justify-between border-b-[2px] border-black pb-3">
          <button
            onClick={() => setActiveModule(null)}
            className="flex items-center gap-1.5 font-mono text-xs uppercase font-bold text-[#6A1A4C] hover:text-black cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>&larr; PROJECT SPACE</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] px-2 py-0.5 bg-black border border-black text-white font-bold">
              {currentMod?.num}
            </span>
            <span className="font-arthouse font-bold text-sm text-black tracking-wider uppercase">
              {currentMod?.title}
            </span>
          </div>
        </div>

        {/* Dedicated Tool View */}
        <div className="flex-1">
          {renderActiveTool()}
        </div>
      </div>
    );
  }

  // 2. MAIN MOBILE PROJECT SPACE (THE 13 WORKING TOOLS INDEX)
  return (
    <div className="p-4 sm:p-5 space-y-5 animate-editorial-fade bg-[#fbf6f0] min-h-full">
      {/* Navigation breadcrumb */}
      <div className="border-b-[2px] border-black pb-3 flex items-center justify-between">
        <button
          onClick={onBackToProjects}
          className="flex items-center gap-1.5 font-mono text-xs uppercase font-bold text-black/70 hover:text-black cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>&larr; Project Cover</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchModalOpen(true)}
            className="p-1 border border-black bg-white cursor-pointer"
            title="Search"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setActivityModalOpen(true);
              loadActivities();
            }}
            className="p-1 border border-black bg-white cursor-pointer"
            title="Activity"
          >
            <History className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Project Identity Banner */}
      <div className="p-4 bg-white border-[2px] border-black space-y-3 shadow-[2px_2px_0px_#000]">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] uppercase px-2 py-0.5 bg-[#6A1A4C] text-white font-bold">
              {project.project_type}
            </span>
            <span className="font-mono text-[9px] uppercase px-2 py-0.5 border border-black font-bold text-black">
              {project.status || 'Active'}
            </span>
          </div>
          <span className="font-mono text-[10px] text-black/60 uppercase font-bold">
            [{userRole}]
          </span>
        </div>

        <div>
          <h2 className="font-fun font-bold text-2xl text-black leading-tight">
            {project.title}
          </h2>
          {project.description && (
            <p className="font-fun italic text-xs text-black/80 leading-relaxed mt-1">
              {project.description}
            </p>
          )}
        </div>

        {/* Crew Roster Preview */}
        <div className="pt-3 border-t border-black/20 flex items-center justify-between text-xs text-black/70">
          <div className="flex items-center gap-2">
            {members.slice(0, 4).map((m) => (
              <MonogramSeal key={m.id} name={m.name} size="xs" />
            ))}
          </div>
          <span className="font-mono text-[10px] uppercase font-bold">
            {members.length} Collaborators
          </span>
        </div>
      </div>

      {/* Editorial 13 Modules Index */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between border-b-[2px] border-black pb-2">
          <span className="font-arthouse text-xs uppercase tracking-wider text-black font-bold">
            Project Operating System
          </span>
          <span className="font-mono text-[10px] text-[#6A1A4C] font-bold uppercase">
            13 Modules (00 &ndash; 12)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {MODULES.map((m) => (
            <button
              key={m.key}
              onClick={() => setActiveModule(m.key)}
              className="p-3.5 bg-white border-[2px] border-black hover:bg-[#6A1A4C]/10 text-left transition-colors flex items-center justify-between group cursor-pointer focus:outline-none shadow-[2px_2px_0px_#000]"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold px-2.5 py-1 bg-black text-white border border-black select-none">
                  {m.num}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-arthouse font-bold text-sm text-black group-hover:text-[#6A1A4C] transition-colors">
                      {m.title}
                    </h4>
                    {m.isSensitive && workspace?.sensitive_lock_enabled && !isSensitiveUnlocked && (
                      <Lock className="w-3 h-3 text-[#C84B31]" />
                    )}
                  </div>
                  <p className="font-fun italic text-xs text-black/70">
                    {m.subtitle}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-black/40 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      </div>

      {/* SEARCH MODAL */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#fbf6f0] border-[2.5px] border-black p-6 space-y-4 shadow-[6px_6px_0px_#000] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b-[2px] border-black pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase text-[#6A1A4C] font-black tracking-widest">
                  GLOBAL CROSS-MODULE QUERY
                </span>
                <h3 className="font-fun font-bold text-xl text-black">
                  search project workspace
                </h3>
              </div>
              <button
                onClick={() => setSearchModalOpen(false)}
                className="text-black hover:bg-black hover:text-white p-1 border border-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search across crew, tasks, captures, assets, rights, agreements, money, credits..."
                className="w-full p-3 bg-white border-[2px] border-black font-fun text-sm text-black focus:outline-none"
              />
              {searching && (
                <span className="absolute right-3 top-3.5 font-mono text-[10px] text-black/50 font-bold uppercase animate-pulse">
                  Searching...
                </span>
              )}
            </div>

            {/* Results list */}
            <div className="flex-1 overflow-y-auto divide-y divide-black/15 min-h-[200px] max-h-[350px]">
              {searchResults.length === 0 ? (
                <div className="p-8 text-center font-fun italic text-xs text-black/60">
                  {searchQuery ? 'No matching records found across the 12 modules.' : 'Type to search records across all 12 modules.'}
                </div>
              ) : (
                searchResults.map((r, idx) => (
                  <button
                    key={`${r.module}-${r.id}-${idx}`}
                    onClick={() => {
                      jumpToTool(r.module);
                      setSearchModalOpen(false);
                    }}
                    className="w-full p-3 text-left hover:bg-white transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-black text-white font-mono text-[9px] uppercase font-bold">
                          {r.module}
                        </span>
                        <span className="font-arthouse font-bold text-xs text-black group-hover:text-[#6A1A4C]">
                          {r.title}
                        </span>
                      </div>
                      <p className="font-fun text-xs text-black/70 mt-1 line-clamp-1">
                        {r.snippet}
                      </p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-black/30 group-hover:text-black shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ACTIVITY LOG MODAL */}
      {activityModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#fbf6f0] border-[2.5px] border-black p-6 space-y-4 shadow-[6px_6px_0px_#000] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b-[2px] border-black pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase text-[#6A1A4C] font-black tracking-widest">
                  IMMUTABLE AUDIT TRAIL
                </span>
                <h3 className="font-fun font-bold text-xl text-black">
                  workspace activity history
                </h3>
              </div>
              <button
                onClick={() => setActivityModalOpen(false)}
                className="text-black hover:bg-black hover:text-white p-1 border border-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-black/15 min-h-[200px] max-h-[400px]">
              {loadingActivity ? (
                <div className="p-8 text-center font-mono text-xs text-black/60 animate-pulse">
                  FETCHING ACTIVITY AUDIT LOG...
                </div>
              ) : activities.length === 0 ? (
                <div className="p-8 text-center font-fun italic text-xs text-black/60">
                  No logged activities recorded for this project yet.
                </div>
              ) : (
                activities.map((act) => (
                  <div key={act.id} className="p-3 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-black text-white font-bold uppercase">
                          {act.module_key}
                        </span>
                        <span className="font-bold text-black">{act.user_name}</span>
                      </div>
                      <span className="text-black/50">
                        {new Date(act.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="font-fun text-xs text-black font-bold">
                      {act.title}
                    </p>
                    {act.details && (
                      <p className="font-fun italic text-xs text-black/75">
                        {act.details}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
