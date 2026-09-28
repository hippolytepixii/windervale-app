import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Project } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Plus, FolderKanban, Users, Calendar, ArrowUpRight, X, AlertCircle } from 'lucide-react';

interface ProjectsViewProps {
  onSelectProject: (projectId: string) => void;
}

const PROJECT_TYPES = [
  'film', 'music', 'writing', 'photography', 'art', 'exhibition', 'publication', 'research', 'interdisciplinary', 'other'
];

export const ProjectsView: React.FC<ProjectsViewProps> = ({ onSelectProject }) => {
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
        visibility: 'private'
      });
      setTitle('');
      setDescription('');
      setLocation('');
      setTargetDate('');
      setCreateModal(false);
      // Immediately navigate into the newly created Project Space
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
    <div className="p-5 space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-wv-charcoal pb-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-wv-dustyrose font-medium block">
            Productions &amp; Works
          </span>
          <h1 className="font-display font-medium text-2xl text-wv-ivory tracking-normal">
            Projects
          </h1>
        </div>
        <button
          onClick={() => setCreateModal(true)}
          className="btn-editorial-wine text-xs px-3.5 py-1.5 flex items-center gap-1.5 font-sans tracking-wider uppercase font-semibold cursor-pointer "
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Start Project</span>
        </button>
      </div>

      {/* Projects Content */}
      {loading ? (
        <div className="py-16 text-center font-mono text-xs text-wv-dirtywhite/50 animate-pulse">
          Retrieving project catalog...
        </div>
      ) : projects.length === 0 ? (
        <div className="py-16 px-6 text-center border border-wv-charcoal bg-wv-charcoal/50 space-y-4 ">
          <div className="w-12 h-12 border border-wv-dustyrose/30 bg-[#6A1A4C]/20 flex items-center justify-center mx-auto">
            <FolderKanban className="w-5 h-5 text-wv-dustyrose stroke-[1.5]" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display font-medium text-xl text-wv-ivory">
              NO PROJECTS YET
            </h3>
            <p className="font-serif text-sm text-wv-dirtywhite/70 italic max-w-xs mx-auto leading-relaxed">
              Projects are where independent work happens.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => setCreateModal(true)}
              className="btn-editorial-wine text-xs px-6 py-2.5 mx-auto block font-sans font-semibold uppercase tracking-wider cursor-pointer "
            >
              Start a Project &rarr;
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {projects.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectProject(p.id)}
              className="p-4 bg-wv-charcoal/60 border border-wv-charcoal hover:border-wv-dustyrose/60 cursor-pointer transition-colors flex flex-col gap-3 group "
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] uppercase px-2 py-0.5 bg-wv-black border border-wv-charcoal text-wv-dustyrose">
                    {p.project_type}
                  </span>
                  <span className="font-mono text-[9px] uppercase px-2 py-0.5 border border-wv-charcoal text-wv-dirtywhite/60">
                    {p.status || 'Active'}
                  </span>
                </div>
                {p.user_role && (
                  <span className="font-mono text-[10px] text-wv-dirtywhite/60 uppercase">
                    [{p.user_role}]
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-display font-medium text-xl text-wv-ivory group-hover:text-wv-dustyrose transition-colors">
                  {p.title}
                </h3>
                {p.description && (
                  <p className="font-serif italic text-xs text-wv-dirtywhite/80 mt-1 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-wv-charcoal text-xs text-wv-dirtywhite/60">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-mono text-[10px]">
                    <Users className="w-3 h-3 text-wv-dustyrose" />
                    {p.member_count || 1} Collaborators
                  </span>
                  {p.target_date && (
                    <span className="flex items-center gap-1 font-mono text-[10px]">
                      <Calendar className="w-3 h-3 text-wv-dirtywhite/50" />
                      {p.target_date}
                    </span>
                  )}
                </div>
                <span className="font-sans text-xs tracking-wider uppercase text-wv-dirtywhite/80 group-hover:text-wv-ivory group-hover:translate-x-0.5 transition-all flex items-center gap-0.5">
                  View Cover &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Start Project Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 bg-wv-black/90 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-wv-charcoal border-2 border-wv-paper p-5 ">
            <div className="flex items-center justify-between border-b border-wv-border pb-2 mb-3">
              <span className="font-mono text-[10px] uppercase text-wv-orange tracking-wider">
                NEW PRODUCTION ROOM
              </span>
              <button onClick={() => setCreateModal(false)} className="text-wv-dust hover:text-wv-paper">
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="font-display font-black text-xl text-wv-paper mb-1">
              START A REAL PROJECT
            </h3>
            <p className="font-serif text-xs text-wv-dust mb-4">
              Establishes a dedicated Project Space with all 12 modules.
            </p>

            {error && (
              <div className="mb-3 p-2 bg-black border-2 border-[#6A1A4C] text-white font-mono text-[10px] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-[#6A1A4C]" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block font-mono text-[10px] uppercase text-wv-dust mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. THE DISSOLVE"
                  className="w-full bg-wv-surface border border-wv-border px-3 py-2 text-sm text-wv-paper focus:outline-none focus:border-wv-paper"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-wv-dust mb-1">Project Type</label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full bg-wv-surface border border-wv-border px-2.5 py-2 font-mono text-xs text-wv-paper focus:outline-none"
                >
                  {PROJECT_TYPES.map(t => (
                    <option key={t} value={t}>{t.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-wv-dust mb-1">Description / Core Idea</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this project aiming to make and explore?"
                  className="w-full bg-wv-surface border border-wv-border p-2 font-sans text-xs text-wv-paper focus:outline-none focus:border-wv-paper"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-wv-dust mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Berlin"
                    className="w-full bg-wv-surface border border-wv-border px-2.5 py-1.5 text-xs text-wv-paper focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-wv-dust mb-1">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-wv-surface border border-wv-border px-2 py-1.5 font-mono text-xs text-wv-paper focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-wv-border">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="font-mono text-xs text-wv-dust hover:text-wv-paper"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={creating || !title.trim()}
                  className="btn-editorial-wine text-xs px-4 py-2 disabled:opacity-40"
                >
                  {creating ? 'CREATING...' : 'ESTABLISH ROOM ↗'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
