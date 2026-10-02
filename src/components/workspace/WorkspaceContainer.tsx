import React, { useState, useEffect } from 'react';
import { Project, ProjectMember } from '../../types';
import { api } from '../../services/api';
import { WorkspaceHome } from './WorkspaceHome';
import { CrewTool } from './tools/CrewTool';
import { RightsTool } from './tools/RightsTool';
import { AgreementTool } from './tools/AgreementTool';
import { BuildTool } from './tools/BuildTool';
import { CaptureTool } from './tools/CaptureTool';
import { StudioTool } from './tools/StudioTool';
import { MilestonesTool } from './tools/MilestonesTool';
import { MoneyTool } from './tools/MoneyTool';
import { DistributionTool } from './tools/DistributionTool';
import { CreditsTool } from './tools/CreditsTool';
import { OutcomeTool } from './tools/OutcomeTool';
import { MemoryTool } from './tools/MemoryTool';
import { ArrowLeft, Maximize2, Minimize2, Eye, EyeOff, LayoutGrid } from 'lucide-react';

interface WorkspaceContainerProps {
  projectId: string;
  onBackToProjects: () => void;
  onFocusModeChange?: (active: boolean) => void;
}

const TOOLS_NAV = [
  { id: 'crew', num: '01', title: 'CREW' },
  { id: 'rights', num: '02', title: 'RIGHTS' },
  { id: 'agreement', num: '03', title: 'AGREEMENT' },
  { id: 'build', num: '04', title: 'BUILD' },
  { id: 'capture', num: '05', title: 'CAPTURE' },
  { id: 'studio', num: '06', title: 'STUDIO' },
  { id: 'milestones', num: '07', title: 'MILESTONES' },
  { id: 'money', num: '08', title: 'MONEY' },
  { id: 'distribution', num: '09', title: 'DISTRIBUTION' },
  { id: 'credits', num: '10', title: 'CREDITS' },
  { id: 'outcome', num: '11', title: 'OUTCOME' },
  { id: 'memory', num: '12', title: 'MEMORY' },
];

export const WorkspaceContainer: React.FC<WorkspaceContainerProps> = ({
  projectId, onBackToProjects, onFocusModeChange
}) => {
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [userRole, setUserRole] = useState<'owner' | 'member' | 'viewer'>('viewer');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [hideChromeInFocus, setHideChromeInFocus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  useEffect(() => {
    if (onFocusModeChange) {
      onFocusModeChange(isFocusMode);
    }
  }, [isFocusMode, onFocusModeChange]);

  const loadProject = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProject(projectId);
      setProject(data.project);
      setMembers(data.members || []);
      setUserRole(data.userRole || 'viewer');
    } catch (err: any) {
      setError(err.message || 'Could not access workspace');
    } finally {
      setLoading(false);
    }
  };

  const enterFocus = () => {
    setIsFocusMode(true);
    setHideChromeInFocus(false);
  };

  const exitFocus = () => {
    setIsFocusMode(false);
    setHideChromeInFocus(false);
  };

  if (loading) {
    return (
      <div className="py-24 text-center font-mono text-xs text-wv-dust animate-pulse">
        CONNECTING TO CREATIVE STUDIO...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <h2 className="font-display font-black text-2xl text-wv-paper">ACCESS RESTRICTED</h2>
        <p className="font-serif text-sm text-wv-dust mt-2">
          {error || 'This project workspace is private to authorized crew members.'}
        </p>
        <button
          onClick={onBackToProjects}
          className="btn-editorial mt-6 text-xs px-6 py-2.5"
        >
          ← RETURN TO PROJECTS
        </button>
      </div>
    );
  }

  // Render dedicated tool component
  const renderActiveTool = () => {
    const props = {
      projectId: project.id,
      members,
      userRole,
      onEnterFocus: enterFocus,
      isFocusMode,
      onRefreshProject: loadProject
    };

    switch (activeTool) {
      case 'crew': return <CrewTool {...props} />;
      case 'rights': return <RightsTool {...props} />;
      case 'agreement': return <AgreementTool {...props} />;
      case 'build': return <BuildTool {...props} />;
      case 'capture': return <CaptureTool {...props} />;
      case 'studio': return <StudioTool {...props} />;
      case 'milestones': return <MilestonesTool {...props} />;
      case 'money': return <MoneyTool {...props} />;
      case 'distribution': return <DistributionTool {...props} />;
      case 'credits': return <CreditsTool {...props} />;
      case 'outcome': return <OutcomeTool {...props} />;
      case 'memory': return <MemoryTool {...props} />;
      default: return null;
    }
  };

  // 1. FOCUS MODE FULL-SCREEN RENDERING
  if (isFocusMode && activeTool) {
    return (
      <div className="focus-mode-container bg-wv-black p-4 sm:p-10 flex flex-col justify-between film-grain">
        {/* Floating Focus Mode Chrome Bar */}
        {!hideChromeInFocus ? (
          <div className="w-full flex items-center justify-between pb-4 border-b border-wv-border mb-8 animate-editorial-fade">
            <div className="flex items-center gap-3">
              <span className="stamp bg-wv-pink text-wv-black font-bold">
                FOCUS MODE ACTIVE
              </span>
              <span className="font-display font-black text-xl text-wv-paper uppercase">
                {activeTool.toUpperCase()} : {project.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setHideChromeInFocus(true)}
                className="btn-editorial text-[10px] px-3 py-1.5 flex items-center gap-1"
                title="Hide this top bar for complete visual immersion"
              >
                <EyeOff className="w-3 h-3" />
                <span>HIDE CHROME</span>
              </button>
              <button
                onClick={exitFocus}
                className="btn-editorial-wine text-[10px] px-3 py-1.5 flex items-center gap-1"
              >
                <Minimize2 className="w-3 h-3" />
                <span>EXIT FOCUS MODE ✕</span>
              </button>
            </div>
          </div>
        ) : (
          /* Subtle Show Chrome Reveal button when hidden */
          <button
            onClick={() => setHideChromeInFocus(false)}
            className="fixed top-4 right-4 z-50 p-2 bg-wv-charcoal border border-wv-border font-mono text-[10px] text-wv-dust hover:text-wv-paper flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity"
          >
            <Eye className="w-3 h-3" />
            <span>SHOW CHROME</span>
          </button>
        )}

        {/* Dedicated Tool Content (Full Width) */}
        <div className="max-w-5xl mx-auto w-full flex-1">
          {renderActiveTool()}
        </div>

        {/* Focus Footer */}
        <div className="w-full pt-8 mt-8 border-t border-wv-border/40 flex items-center justify-between font-mono text-[9px] text-wv-dust/50">
          <span>PROJECT: {project.title} [{project.status.toUpperCase()}]</span>
          <button onClick={exitFocus} className="hover:underline">EXIT FOCUS MODE</button>
        </div>
      </div>
    );
  }

  // 2. WORKSPACE HOME RENDERING (When no tool is opened yet)
  if (!activeTool) {
    return (
      <WorkspaceHome
        project={project}
        members={members}
        userRole={userRole}
        onBackToProjects={onBackToProjects}
        onSelectTool={(toolId) => setActiveTool(toolId)}
      />
    );
  }

  // 3. WORKSPACE TOOL STANDARD VIEW (With Project Navigation Bar)
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Studio Header Breadcrumbs & Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-wv-border pb-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTool(null)}
            className="font-mono text-xs text-wv-dust hover:text-wv-paper flex items-center gap-1.5 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>← WORKSPACE HOME</span>
          </button>
          <span className="text-wv-border">/</span>
          <span className="font-display font-black text-sm text-wv-paper uppercase">
            {project.title}
          </span>
          <span className="text-wv-border">/</span>
          <span className="font-mono text-xs text-wv-pink uppercase font-bold">
            {activeTool}
          </span>
        </div>

        {/* Fast Tool Switcher Bar */}
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          {TOOLS_NAV.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              className={`font-mono text-[10px] px-2 py-1 border transition-all uppercase whitespace-nowrap ${
                activeTool === t.id
                  ? 'border-wv-paper bg-wv-surface text-wv-paper font-bold'
                  : 'border-wv-border/60 text-wv-dust hover:text-wv-paper'
              }`}
            >
              {t.num} {t.title}
            </button>
          ))}
        </div>
      </div>

      {/* Render Selected Tool */}
      {renderActiveTool()}
    </div>
  );
};
