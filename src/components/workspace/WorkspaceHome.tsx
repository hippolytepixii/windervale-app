import React, { useState, useEffect } from 'react';
import { Project, ProjectMember, WorkspaceTask } from '../../types';
import { api } from '../../services/api';
import {
  Hammer, Users, Bookmark, Layers, Flag, History, Scale,
  FileCheck2, ScrollText, Coins, Award, Film, ArrowLeft,
  CheckSquare, Clock, ArrowRight, Shield, AlertTriangle
} from 'lucide-react';

interface WorkspaceHomeProps {
  project: Project;
  members: ProjectMember[];
  userRole: 'owner' | 'member' | 'viewer';
  onBackToProjects: () => void;
  onSelectTool: (toolId: string) => void;
}

const TOOLS_CONFIG = [
  { id: 'crew', num: '01', title: 'CREW', subtitle: 'Collaborator roster & roles', icon: Users, accent: 'text-wv-pink', border: 'hover:border-wv-pink' },
  { id: 'rights', num: '02', title: 'RIGHTS', subtitle: 'Ownership, licensing & revenue', icon: Shield, accent: 'text-wv-blood', border: 'hover:border-wv-blood' },
  { id: 'agreement', num: '03', title: 'AGREEMENT', subtitle: 'Covenants & digital confirmations', icon: ScrollText, accent: 'text-wv-dirtywhite', border: 'hover:border-wv-dirtywhite' },
  { id: 'build', num: '04', title: 'BUILD', subtitle: 'Pipeline, tasks & execution', icon: Hammer, accent: 'text-wv-dustyrose', border: 'hover:border-wv-dustyrose' },
  { id: 'capture', num: '05', title: 'CAPTURE', subtitle: 'Fragments, notes & references', icon: Bookmark, accent: 'text-wv-dirtywhite', border: 'hover:border-wv-dirtywhite' },
  { id: 'studio', num: '06', title: 'STUDIO', subtitle: 'Assets, scripts & media', icon: Layers, accent: 'text-wv-cobalt', border: 'hover:border-wv-cobalt' },
  { id: 'milestones', num: '07', title: 'MILESTONES', subtitle: 'Timeline & deliverable stages', icon: Flag, accent: 'text-wv-dustyrose', border: 'hover:border-wv-dustyrose' },
  { id: 'money', num: '08', title: 'MONEY', subtitle: 'Funding, budgets & payouts', icon: Coins, accent: 'text-wv-dustyrose', border: 'hover:border-wv-dustyrose' },
  { id: 'distribution', num: '09', title: 'DISTRIBUTION', subtitle: 'Release, festivals & audience', icon: Film, accent: 'text-wv-pink', border: 'hover:border-wv-pink' },
  { id: 'credits', num: '10', title: 'CREDITS', subtitle: 'Permanent contributor record', icon: Film, accent: 'text-wv-dirtywhite', border: 'hover:border-wv-dirtywhite' },
  { id: 'outcome', num: '11', title: 'OUTCOME', subtitle: 'What happened after the project', icon: Award, accent: 'text-wv-pink', border: 'hover:border-wv-pink' },
  { id: 'memory', num: '12', title: 'MEMORY', subtitle: 'Archive & project history', icon: History, accent: 'text-wv-dirtywhite', border: 'hover:border-wv-dirtywhite' },
];

export const WorkspaceHome: React.FC<WorkspaceHomeProps> = ({
  project, members, userRole, onBackToProjects, onSelectTool
}) => {
  const [summary, setSummary] = useState<{
    urgentTasks: WorkspaceTask[];
    recentActivity: { text: string; time: string }[];
    toolCounts: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, [project.id]);

  const loadSummary = async () => {
    try {
      const data = await api.getWorkspaceSummary(project.id);
      setSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (task: WorkspaceTask) => {
    const nextStatus = task.status === 'completed' ? 'todo' : 'completed';
    try {
      await api.updateTask(project.id, task.id, { status: nextStatus });
      loadSummary();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Navigation Breadcrumb */}
      <button
        onClick={onBackToProjects}
        className="font-mono text-xs text-wv-dust hover:text-wv-paper flex items-center gap-1.5 mb-6 group"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
        <span>← PROJECTS</span>
      </button>

      {/* Project Header Banner */}
      <div className="border-b border-wv-border pb-8 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="stamp bg-wv-charcoal border border-wv-border text-wv-dustyrose font-bold">
                [{project.project_type.toUpperCase()}]
              </span>
              <span className="stamp bg-wv-charcoal border border-wv-pink text-wv-pink font-bold">
                {project.status.toUpperCase()}
              </span>
              <span className="font-mono text-[10px] text-wv-dust">
                YOUR ROLE: <strong className="text-wv-paper uppercase">{userRole}</strong>
              </span>
            </div>

            <h1 className="font-display font-black text-4xl sm:text-6xl text-wv-paper tracking-tight uppercase leading-none">
              {project.title}
            </h1>

            <p className="font-serif text-sm sm:text-base text-wv-dirtywhite max-w-3xl mt-3 leading-relaxed">
              {project.description || 'No project description recorded.'}
            </p>

            {project.location && (
              <p className="font-mono text-[11px] text-wv-dust mt-3">
                BASE: <span className="text-wv-paper">{project.location}</span>
                {project.target_date && ` - TARGET: ${project.target_date}`}
              </p>
            )}
          </div>

          {/* Crew Avatars list */}
          <div className="bg-wv-charcoal border border-wv-border p-4 self-start min-w-[220px]">
            <div className="flex items-center justify-between border-b border-wv-border pb-2 mb-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-wv-dust">CREW [{members.length}]</span>
              <button
                onClick={() => onSelectTool('crew')}
                className="font-mono text-[10px] text-wv-pink hover:underline uppercase"
              >
                MANAGE ↗
              </button>
            </div>
            <div className="space-y-2">
              {members.map(m => (
                <div key={m.id} className="flex items-center gap-2.5">
                  <img
                    src={m.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                    alt={m.name}
                    className="w-6 h-6 object-cover grayscale"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs text-wv-paper truncate">{m.name}</p>
                    <p className="font-mono text-[9px] text-wv-dust truncate">{m.contribution_area}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Overview: Things Needing Attention & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* BUILD: Things Needing Attention */}
        <div className="bg-wv-charcoal border border-wv-border p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-wv-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Hammer className="w-4 h-4 text-wv-dustyrose" />
                <span className="font-display font-bold text-sm tracking-wider text-wv-paper">
                  BUILD : ATTENTION ITEMS
                </span>
              </div>
              <button
                onClick={() => onSelectTool('build')}
                className="font-mono text-xs text-wv-dustyrose hover:underline uppercase"
              >
                OPEN BUILD ↗
              </button>
            </div>

            {summary?.urgentTasks && summary.urgentTasks.length > 0 ? (
              <div className="space-y-2.5">
                <p className="font-mono text-xs text-wv-dust mb-3">
                  {summary.urgentTasks.length} task{summary.urgentTasks.length > 1 ? 's' : ''} require attention:
                </p>
                {summary.urgentTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleToggleTask(t)}
                    className="flex items-start gap-3 p-2.5 bg-wv-surface border border-wv-border/70 hover:border-wv-paper cursor-pointer transition-colors group"
                  >
                    <input
                      type="checkbox"
                      checked={t.status === 'completed'}
                      onChange={() => {}}
                      className="mt-0.5 accent-wv-dustyrose rounded-none cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`font-sans text-xs font-medium ${t.status === 'completed' ? 'line-through text-wv-dust' : 'text-wv-paper'}`}>
                        {t.title}
                      </p>
                      {t.deadline && (
                        <span className="font-mono text-[9px] text-wv-pink mt-0.5 inline-block">
                          DUE: {t.deadline}
                        </span>
                      )}
                    </div>
                    {t.priority === 'urgent' && (
                      <span className="font-mono text-[9px] text-wv-blood uppercase font-bold">
                        URGENT
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-wv-dust font-mono text-xs">
                No outstanding urgent tasks. The pipeline is calm.
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-wv-border/50 text-right">
            <button
              onClick={() => onSelectTool('build')}
              className="font-mono text-xs text-wv-dust hover:text-wv-paper"
            >
              + ADD WORK ITEM
            </button>
          </div>
        </div>

        {/* RECENT ACTIVITY LOG */}
        <div className="bg-wv-charcoal border border-wv-border p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-wv-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-wv-pink" />
                <span className="font-display font-bold text-sm tracking-wider text-wv-paper">
                  RECENT ACTIVITY
                </span>
              </div>
              <span className="font-mono text-[10px] text-wv-dust">STUDIO LOG</span>
            </div>

            {summary?.recentActivity && summary.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {summary.recentActivity.map((act, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs">
                    <span className="w-1.5 h-1.5 bg-wv-pink mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-wv-dirtywhite font-serif">{act.text}</p>
                      <p className="font-mono text-[9px] text-wv-dust mt-0.5">
                        {new Date(act.time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-wv-dust font-mono text-xs">
                No recent activity recorded yet.
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-wv-border/50 text-right">
            <button
              onClick={() => onSelectTool('memory')}
              className="font-mono text-xs text-wv-dust hover:text-wv-paper"
            >
              VIEW FULL PROJECT MEMORY ↗
            </button>
          </div>
        </div>
      </div>

      {/* THE 12 PROJECT TOOLS (Structured Index) */}
      <div className="border-t-2 border-wv-border pt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="font-mono text-[10px] uppercase text-wv-dust tracking-wider">WORKSPACE SUITE</span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-wv-paper">
              PROJECT TOOLS
            </h2>
          </div>
          <span className="font-mono text-xs text-wv-dust">12 SPECIALIZED CREATIVE ENVIRONMENTS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {TOOLS_CONFIG.map((tool) => {
            const count = summary?.toolCounts?.[tool.id] || 0;
            return (
              <button
                key={tool.id}
                onClick={() => onSelectTool(tool.id)}
                className={`p-5 bg-wv-charcoal border border-wv-border text-left transition-all ${tool.border} hover:translate-y-[-2px] hover:shadow-brutalist flex flex-col justify-between h-40 group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-wv-dust group-hover:text-wv-paper font-bold">
                      {tool.num}
                    </span>
                    <tool.icon className={`w-4 h-4 ${tool.accent}`} />
                  </div>
                  <h3 className="font-display font-black text-lg text-wv-paper group-hover:text-wv-pink transition-colors">
                    {tool.title}
                  </h3>
                  <p className="font-serif text-xs text-wv-dust line-clamp-2 mt-1">
                    {tool.subtitle}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-wv-border/50 font-mono text-[10px] text-wv-dust">
                  <span>{count} RECORDS</span>
                  <span className="group-hover:translate-x-1 transition-transform">OPEN ↗</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
