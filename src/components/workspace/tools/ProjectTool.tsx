import React, { useState } from 'react';
import { Project, ProjectMember } from '../../../types';
import { api } from '../../../services/api';
import {
  FolderKanban,
  Edit3,
  Check,
  Calendar,
  Globe,
  Lock,
  Users,
  Eye,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layers,
  FileText
} from 'lucide-react';
import { MonogramSeal } from '../../common/MonogramSeal';

interface ToolProps {
  project: Project;
  members: ProjectMember[];
  userRole: 'owner' | 'member' | 'viewer';
  onEnterFocus: () => void;
  isFocusMode: boolean;
  onRefreshProject?: () => void;
  onNavigateModule?: (moduleKey: string) => void;
}

const PROJECT_TYPES = [
  'Film',
  'Music',
  'Photography',
  'Writing',
  'Visual Art',
  'Performance',
  'Publishing',
  'Exhibition',
  'Multidisciplinary',
  'Other'
];

const STATUS_OPTIONS: { id: Project['status']; label: string; stage: string }[] = [
  { id: 'idea', label: 'Idea', stage: '01 FORM' },
  { id: 'forming', label: 'Forming', stage: '01 FORM' },
  { id: 'in progress', label: 'In Production', stage: '02 MAKE' },
  { id: 'completed', label: 'Completed', stage: '03 COMMERCIALIZE' },
  { id: 'released', label: 'Released', stage: '04 ATTRIBUTE' },
  { id: 'archived', label: 'Archived', stage: '05 REMEMBER' }
];

const VISIBILITY_OPTIONS = [
  { id: 'private', label: 'Private (Lead Only)' },
  { id: 'collaborators', label: 'Collaborators Only' },
  { id: 'public', label: 'Public After Release' }
];

export const ProjectTool: React.FC<ToolProps> = ({
  project,
  members,
  userRole,
  onRefreshProject,
  onNavigateModule
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState(project.title || '');
  const [projectType, setProjectType] = useState(project.project_type || 'Film');
  const [status, setStatus] = useState<Project['status']>(project.status || 'idea');
  const [visibility, setVisibility] = useState(project.visibility || 'private');
  const [statement, setStatement] = useState(project.statement || project.description || '');
  const [intent, setIntent] = useState(project.intent || '');
  const [format, setFormat] = useState(project.format || '');
  const [expectedOutputs, setExpectedOutputs] = useState(project.expected_outputs || '');
  const [projectOwner, setProjectOwner] = useState(project.project_owner || '');
  const [location, setLocation] = useState(project.location || '');
  const [targetDate, setTargetDate] = useState(project.target_date || '');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      await api.updateProject(project.id, {
        title,
        project_type: projectType,
        status,
        visibility: visibility as any,
        description: statement,
        statement,
        intent,
        format,
        expected_outputs: expectedOutputs,
        project_owner: projectOwner,
        location,
        target_date: targetDate
      });
      setIsEditing(false);
      onRefreshProject?.();
    } catch (err: any) {
      alert(err.message || 'Failed to update project identity');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatusChange = async (newStatus: Project['status']) => {
    if (userRole === 'viewer') return;
    try {
      await api.updateProject(project.id, { status: newStatus });
      onRefreshProject?.();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const leadMember = members.find((m) => m.role === 'owner') || members[0];
  const ownerDisplayName = project.project_owner || leadMember?.name || 'Project Lead';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[2px] border-black pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#6A1A4C] font-bold">00 // PROJECT</span>
            <span className="font-mono text-[10px] text-black/60 font-bold uppercase">
              PROJECT IDENTITY, INTENT &amp; STATUS
            </span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-black mt-1">
            PROJECT IDENTITY &amp; CHARTER
          </h2>
        </div>

        {userRole !== 'viewer' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-editorial-wine text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'CANCEL EDIT' : 'EDIT CHARTER'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Lifecycle Stage Indicator Bar */}
      <div className="border-[2px] border-black bg-[#fbf6f0] p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-black/15">
          <div>
            <span className="font-mono text-[10px] text-black/60 uppercase font-bold tracking-wider">
              PROJECT LIFECYCLE PHASE
            </span>
            <h4 className="font-fun font-bold text-sm text-black">
              FORM &rarr; MAKE &rarr; COMMERCIALIZE &rarr; ATTRIBUTE &rarr; REMEMBER
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold text-black uppercase">
              CURRENT STATUS:
            </span>
            <span className="font-mono text-xs uppercase px-2.5 py-1 bg-black text-white font-bold border border-black">
              {project.status || 'Idea'}
            </span>
          </div>
        </div>

        {/* Quick Lifecycle Pill Selector */}
        {userRole !== 'viewer' && (
          <div className="pt-3 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] text-black/60 uppercase font-bold mr-1">
              TRANSITION GATE:
            </span>
            {STATUS_OPTIONS.map((opt) => {
              const isActive = (project.status || 'idea').toLowerCase() === opt.id.toLowerCase();
              return (
                <button
                  key={opt.id}
                  onClick={() => handleQuickStatusChange(opt.id)}
                  className={`px-3 py-1 font-mono text-[10px] uppercase font-bold border border-black transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#6A1A4C] text-white border-black shadow-[2px_2px_0px_0px_#000]'
                      : 'bg-white text-black hover:bg-[#f3eae4]'
                  }`}
                >
                  {isActive && <Check className="w-2.5 h-2.5 inline mr-1" />}
                  {opt.label}
                  <span className="ml-1.5 opacity-60 text-[8px]">({opt.stage})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Form or Editorial View */}
      {isEditing ? (
        <form onSubmit={handleSave} className="border-[2px] border-black bg-white p-6 space-y-6">
          <div className="border-b-[2px] border-black pb-3 flex items-center justify-between">
            <h3 className="font-fun font-bold text-lg text-black uppercase">
              Edit Project Identity &amp; Intent
            </h3>
            <span className="font-mono text-[10px] text-black/60 uppercase font-bold">
              Root Project Definition
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 bg-[#fbf6f0] border-[2px] border-black font-fun text-sm text-black focus:outline-none focus:bg-white"
                placeholder="Title of creative work"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                Creative Discipline / Type *
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full p-2.5 bg-[#fbf6f0] border-[2px] border-black font-fun text-sm text-black focus:outline-none focus:bg-white"
              >
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
              Project Statement (Artistic Vision)
            </label>
            <textarea
              rows={3}
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              className="w-full p-2.5 bg-[#fbf6f0] border-[2px] border-black font-fun text-sm text-black focus:outline-none focus:bg-white"
              placeholder="What is this project? Articulate its creative ethos, central narrative, or aesthetic thesis."
            />
          </div>

          <div>
            <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
              Intent / Purpose (Why does this work exist?)
            </label>
            <textarea
              rows={2}
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              className="w-full p-2.5 bg-[#fbf6f0] border-[2px] border-black font-fun text-sm text-black focus:outline-none focus:bg-white"
              placeholder="The practical or curatorial motivation behind making this work."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                Format
              </label>
              <input
                type="text"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2.5 bg-[#fbf6f0] border-[2px] border-black font-fun text-sm text-black focus:outline-none focus:bg-white"
                placeholder="e.g. 16mm Short Film, 8-Track Vinyl LP, Hardcover Monograph"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                Expected Outputs
              </label>
              <input
                type="text"
                value={expectedOutputs}
                onChange={(e) => setExpectedOutputs(e.target.value)}
                className="w-full p-2.5 bg-[#fbf6f0] border-[2px] border-black font-fun text-sm text-black focus:outline-none focus:bg-white"
                placeholder="e.g. 4K ProRes Master, Uncompressed 24-bit WAV, Limited Edition Run of 500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                Project Lead / Owner
              </label>
              <input
                type="text"
                value={projectOwner}
                onChange={(e) => setProjectOwner(e.target.value)}
                className="w-full p-2.5 bg-[#fbf6f0] border-[2px] border-black font-fun text-sm text-black focus:outline-none focus:bg-white"
                placeholder="Name of principal lead"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                Visibility
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full p-2.5 bg-[#fbf6f0] border-[2px] border-black font-fun text-sm text-black focus:outline-none focus:bg-white"
              >
                {VISIBILITY_OPTIONS.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                Target Release Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full p-2.5 bg-[#fbf6f0] border-[2px] border-black font-mono text-sm text-black focus:outline-none focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/15">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border-[2px] border-black font-mono text-xs uppercase font-bold text-black hover:bg-[#fbf6f0] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-editorial-wine text-xs px-6 py-2 cursor-pointer font-bold"
            >
              {saving ? 'SAVING...' : 'SAVE PROJECT CHARTER'}
            </button>
          </div>
        </form>
      ) : (
        /* Editorial Project Charter Display */
        <div className="space-y-6">
          {/* Top Identity Block */}
          <div className="border-[2.5px] border-black bg-[#fbf6f0] p-6 shadow-[3px_3px_0px_0px_#000]">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2 py-0.5 bg-[#6A1A4C] text-white font-mono text-[10px] uppercase font-bold">
                {project.project_type || 'Creative Work'}
              </span>
              <span className="px-2 py-0.5 border border-black font-mono text-[10px] uppercase font-bold bg-white text-black">
                STATUS : {project.status || 'Idea'}
              </span>
              <span className="px-2 py-0.5 border border-black/40 font-mono text-[10px] uppercase text-black/70 bg-white">
                {project.visibility === 'public'
                  ? 'Public'
                  : project.visibility === 'collaborators'
                  ? 'Collaborators Only'
                  : 'Private'}
              </span>
              <span className="font-mono text-[10px] text-black/50 ml-auto uppercase">
                ID : {project.id}
              </span>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-4xl text-black tracking-tight leading-tight">
              {project.title}
            </h1>

            {/* Statement */}
            <div className="mt-4 pt-4 border-t border-black/15">
              <span className="font-mono text-[9px] uppercase font-bold text-black/60 tracking-wider block mb-1">
                PROJECT STATEMENT &middot; ARTISTIC VISION
              </span>
              <p className="font-fun text-base sm:text-lg text-black leading-relaxed italic">
                &ldquo;
                {project.statement ||
                  project.description ||
                  'No artistic statement articulated yet. Click Edit Charter to document the vision for this creative work.'}
                &rdquo;
              </p>
            </div>

            {/* Intent & Purpose */}
            {project.intent && (
              <div className="mt-3 pt-3 border-t border-black/10">
                <span className="font-mono text-[9px] uppercase font-bold text-black/60 tracking-wider block mb-1">
                  INTENT &amp; PURPOSE
                </span>
                <p className="font-fun text-sm text-black/85 leading-normal">
                  {project.intent}
                </p>
              </div>
            )}
          </div>

          {/* Structured Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Format & Outputs */}
            <div className="border-[2px] border-black bg-white p-5 space-y-3">
              <div className="flex items-center gap-2 border-b border-black/15 pb-2">
                <Layers className="w-4 h-4 text-[#6A1A4C]" />
                <h4 className="font-mono text-xs uppercase font-bold text-black">
                  Format &amp; Outputs
                </h4>
              </div>
              <div>
                <span className="font-mono text-[9px] text-black/50 uppercase block font-bold">
                  Format / Medium:
                </span>
                <p className="font-fun font-bold text-sm text-black">
                  {project.format || 'Unspecified'}
                </p>
              </div>
              <div>
                <span className="font-mono text-[9px] text-black/50 uppercase block font-bold">
                  Expected Outputs:
                </span>
                <p className="font-fun text-xs text-black/80">
                  {project.expected_outputs || 'Pending definition'}
                </p>
              </div>
              {project.target_date && (
                <div className="pt-2 border-t border-black/10">
                  <span className="font-mono text-[9px] text-black/50 uppercase block font-bold">
                    Target Release:
                  </span>
                  <span className="font-mono text-xs font-bold text-black">
                    {project.target_date}
                  </span>
                </div>
              )}
            </div>

            {/* Leadership & Personnel */}
            <div className="border-[2px] border-black bg-white p-5 space-y-3">
              <div className="flex items-center gap-2 border-b border-black/15 pb-2">
                <Users className="w-4 h-4 text-[#6A1A4C]" />
                <h4 className="font-mono text-xs uppercase font-bold text-black">
                  Lead &amp; Collaborators
                </h4>
              </div>
              <div>
                <span className="font-mono text-[9px] text-black/50 uppercase block font-bold">
                  Project Lead:
                </span>
                <p className="font-fun font-bold text-sm text-black">
                  {ownerDisplayName}
                </p>
              </div>
              <div>
                <span className="font-mono text-[9px] text-black/50 uppercase block font-bold">
                  Roster Size:
                </span>
                <p className="font-fun text-xs text-black/80">
                  {members.length} Confirmed Collaborator{members.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="pt-2 border-t border-black/10 flex items-center justify-between">
                <span className="font-mono text-[10px] text-black/60 uppercase">
                  View Full Team:
                </span>
                <button
                  onClick={() => onNavigateModule?.('01_CREW')}
                  className="font-mono text-[10px] uppercase font-bold text-[#6A1A4C] hover:underline cursor-pointer flex items-center gap-1"
                >
                  01 CREW &rarr;
                </button>
              </div>
            </div>

            {/* Operating System Connections */}
            <div className="border-[2px] border-black bg-white p-5 space-y-3">
              <div className="flex items-center gap-2 border-b border-black/15 pb-2">
                <ShieldCheck className="w-4 h-4 text-[#6A1A4C]" />
                <h4 className="font-mono text-xs uppercase font-bold text-black">
                  Operating Connections
                </h4>
              </div>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-black/60">02 RIGHTS:</span>
                  <button
                    onClick={() => onNavigateModule?.('02_RIGHTS')}
                    className="font-bold text-[#6A1A4C] hover:underline cursor-pointer"
                  >
                    Ledger &rarr;
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-black/60">03 AGREEMENT:</span>
                  <button
                    onClick={() => onNavigateModule?.('03_AGREEMENT')}
                    className="font-bold text-[#6A1A4C] hover:underline cursor-pointer"
                  >
                    Covenant &rarr;
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-black/60">08 MONEY:</span>
                  <button
                    onClick={() => onNavigateModule?.('08_MONEY')}
                    className="font-bold text-[#6A1A4C] hover:underline cursor-pointer"
                  >
                    Waterfall &rarr;
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-black/60">09 DISTRIBUTION:</span>
                  <button
                    onClick={() => onNavigateModule?.('09_DISTRIBUTION')}
                    className="font-bold text-[#6A1A4C] hover:underline cursor-pointer"
                  >
                    Releases &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Editorial Project Timestamp Footnote */}
          <div className="border border-black/20 bg-[#fbf6f0] px-4 py-2.5 flex flex-wrap items-center justify-between text-black/60 font-mono text-[10px]">
            <span>
              RECORD CREATED: {new Date(project.created_at).toLocaleDateString()}
            </span>
            <span>
              LAST UPDATED: {new Date(project.updated_at).toLocaleDateString()}
            </span>
            <span>WINDERVALE CREATIVE OS // THE PROJECT IS THE UNIT</span>
          </div>
        </div>
      )}
    </div>
  );
};
