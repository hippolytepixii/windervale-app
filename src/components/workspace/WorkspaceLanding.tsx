import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Project } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Plus, Users, Calendar, X, AlertCircle } from 'lucide-react';

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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [projectType, setProjectType] = useState('film');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await api.getProjects();
      setProjects(data.projects || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setCreating(true);
    setError(null);
    try {
      const data = await api.createProject({
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
      // Immediately navigate into the newly created Project Cover
      if (data.project?.id) {
        onSelectProject(data.project.id);
      } else {
        loadProjects();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-white min-h-full text-black">
      {/* Header answering 'what am i making?' */}
      <div className="flex items-baseline justify-between border-b-[2.5px] border-black pb-4">
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
            className="px-4 py-2 bg-[#3b0764] hover:bg-[#581c87] text-[#f3e8ff] border-[2px] border-black text-xs flex items-center gap-1.5 font-mono tracking-wider uppercase font-bold cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Projects Content */}
      {loading ? (
        <div className="py-20 text-center font-mono text-xs text-black/60 animate-pulse font-bold">
          Retrieving active projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="py-16 px-6 text-center space-y-4 border-[2.5px] border-black bg-[#fbf6f0] max-w-xl mx-auto">
          <div className="space-y-2 max-w-sm mx-auto">
            <h2 className="font-fun font-bold text-2xl text-black lowercase">
              nothing here yet
            </h2>
            <p className="font-fun text-xs text-black/80 italic leading-relaxed">
              Start a project to establish a dedicated creative workspace, invite collaborators, and protect your work.
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
              className="p-5 bg-[#fbf6f0] border-[2.5px] border-black hover:bg-white cursor-pointer transition-colors flex flex-col gap-3 group"
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

              <div className="flex items-center justify-between pt-3 border-t border-black/20 text-xs text-black/70 font-mono">
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

      {/* Start Project Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#fbf6f0] border-[2.5px] border-black p-6 space-y-3">
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
              establish workspace
            </h3>
            <p className="font-fun italic text-xs text-black/80">
              Creates a dedicated project environment with the 12 production tools.
            </p>

            {error && (
              <div className="p-2 bg-black border border-black text-white font-mono text-[10px] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-[#6A1A4C]" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3 pt-1">
              <div>
                <label className="block font-mono text-[10px] font-bold uppercase text-black mb-1">
                  Project Title
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
