import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Project } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Plus, FolderKanban, Calendar, MapPin, Users, ArrowRight, X, AlertCircle } from 'lucide-react';

interface ProjectsListProps {
  onOpenWorkspace: (projectId: string) => void;
}

const PROJECT_TYPES = [
  'ALL', 'film', 'music', 'writing', 'photography', 'art',
  'exhibition', 'publication', 'research', 'interdisciplinary', 'other'
];

const PROJECT_STATUSES = [
  'ALL', 'idea', 'planning', 'in progress', 'completed', 'released', 'archived'
];

export const ProjectsList: React.FC<ProjectsListProps> = ({ onOpenWorkspace }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New Project Form
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('film');
  const [newDescription, setNewDescription] = useState('');
  const [newStatus, setNewStatus] = useState<'idea' | 'planning' | 'in progress'>('idea');
  const [newLocation, setNewLocation] = useState('');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [newCover, setNewCover] = useState('https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80');
  const [newVisibility, setNewVisibility] = useState<'private' | 'public'>('private');
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

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setError('Project title is required');
      return;
    }
    setError(null);
    setCreating(true);

    try {
      const res = await api.createProject({
        title: newTitle,
        project_type: newType,
        description: newDescription,
        status: newStatus,
        location: newLocation,
        target_date: newTargetDate,
        cover_image: newCover,
        visibility: newVisibility
      });
      setCreateModalOpen(false);
      // Reset form
      setNewTitle('');
      setNewDescription('');
      await loadProjects();
      // Directly open workspace
      onOpenWorkspace(res.project.id);
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  // Filter projects
  const filteredProjects = projects.filter(p => {
    if (selectedType !== 'ALL' && p.project_type.toLowerCase() !== selectedType.toLowerCase()) return false;
    if (selectedStatus !== 'ALL' && p.status.toLowerCase() !== selectedStatus.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-wv-border pb-6 mb-8">
        <div>
          <span className="font-mono text-xs uppercase text-wv-pink">PRODUCTION ARCHIVE</span>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-wv-paper tracking-tight mt-1">
            PROJECT WORKSPACES
          </h1>
          <p className="font-serif text-sm text-wv-dust mt-2 max-w-xl">
            Private creative studios for active collaborations, structured agreements, and outcome tracking.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="btn-editorial-wine px-5 py-3 text-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>START A PROJECT ↗</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="space-y-3 mb-8">
        {/* Type selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="font-mono text-[10px] text-wv-dust uppercase mr-2">TYPE:</span>
          {PROJECT_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`font-mono text-xs px-2.5 py-1 border transition-all uppercase whitespace-nowrap ${
                selectedType === t
                  ? 'border-wv-paper bg-wv-paper text-wv-black font-bold'
                  : 'border-wv-border bg-wv-surface text-wv-dust hover:text-wv-paper'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Status selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="font-mono text-[10px] text-wv-dust uppercase mr-2">STATUS:</span>
          {PROJECT_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={`font-mono text-[10px] px-2 py-0.5 border transition-all uppercase whitespace-nowrap ${
                selectedStatus === s
                  ? 'border-wv-pink bg-wv-pink/20 text-wv-pink font-bold'
                  : 'border-wv-border text-wv-dust/70 hover:text-wv-paper'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="py-24 text-center font-mono text-xs text-wv-dust animate-pulse">
          LOADING CREATIVE WORKSPACES...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-wv-border p-8 bg-wv-charcoal/40">
          <p className="font-display font-black text-2xl text-wv-paper">NO PROJECTS FOUND</p>
          <p className="font-serif text-sm text-wv-dust mt-1">Nothing has started under these parameters.</p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="btn-editorial-wine mt-6 text-xs px-6 py-2.5"
          >
            CREATE YOUR FIRST PROJECT ↗
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              className="bg-wv-charcoal border border-wv-border hover:border-wv-paper transition-all group flex flex-col justify-between"
            >
              <div>
                {/* Project Cover Image */}
                <div className="relative h-48 w-full bg-wv-slate overflow-hidden border-b border-wv-border">
                  <img
                    src={p.cover_image || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80'}
                    alt={p.title}
                    className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 bg-wv-black/90 text-wv-paper border border-wv-border">
                      [{p.project_type}]
                    </span>
                    <span className={`font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 border ${
                      p.status === 'in progress' ? 'bg-wv-dustyrose text-wv-black font-bold border-wv-dustyrose' : 'bg-wv-black/90 text-wv-pink border-wv-pink/40'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                </div>

                {/* Project Content */}
                <div className="p-5">
                  <h3 className="font-display font-black text-xl text-wv-paper group-hover:text-wv-pink transition-colors line-clamp-1">
                    {p.title}
                  </h3>
                  <p className="font-serif text-xs text-wv-dirtywhite/90 line-clamp-3 mt-2 leading-relaxed">
                    {p.description || 'No description provided.'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-wv-border/60 flex items-center justify-between font-mono text-[10px] text-wv-dust">
                    {p.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-wv-dust" />
                        {p.location}
                      </span>
                    )}
                    {p.target_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-wv-dust" />
                        {p.target_date}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => onOpenWorkspace(p.id)}
                  className="w-full btn-editorial text-xs py-2.5 flex items-center justify-between"
                >
                  <span>ENTER STUDIO WORKSPACE</span>
                  <span className="group-hover:translate-x-1 transition-transform">↗</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Start Project Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-wv-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-wv-charcoal border-2 border-wv-paper p-6 sm:p-8  max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-wv-border pb-3 mb-5">
              <div>
                <span className="font-mono text-xs text-wv-pink uppercase">NEW INITIATION</span>
                <h2 className="font-display font-bold text-2xl text-wv-paper">START A PROJECT</h2>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="text-wv-dust hover:text-wv-paper">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-wv-wine/40 border border-wv-blood text-wv-paper font-mono text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-wv-blood flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase text-wv-dust mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. THE DISSOLVE"
                  className="w-full bg-wv-surface border border-wv-border px-3.5 py-2 font-display font-bold text-base text-wv-paper focus:outline-none focus:border-wv-paper"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs uppercase text-wv-dust mb-1">Project Medium / Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-wv-surface border border-wv-border px-3 py-2 font-mono text-xs text-wv-paper focus:outline-none"
                  >
                    {PROJECT_TYPES.filter(t => t !== 'ALL').map(t => (
                      <option key={t} value={t}>{t.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-wv-dust mb-1">Initial Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-wv-surface border border-wv-border px-3 py-2 font-mono text-xs text-wv-paper focus:outline-none"
                  >
                    <option value="idea">IDEA</option>
                    <option value="planning">PLANNING</option>
                    <option value="in progress">IN PROGRESS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-wv-dust mb-1">Concept Synopsis</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe the central creative question, medium, and scope."
                  className="w-full bg-wv-surface border border-wv-border p-3 font-serif text-xs text-wv-paper focus:outline-none focus:border-wv-paper"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs uppercase text-wv-dust mb-1">Location / Filming Base</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Thar Desert / Mumbai"
                    className="w-full bg-wv-surface border border-wv-border px-3 py-2 font-sans text-xs text-wv-paper focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase text-wv-dust mb-1">Target Completion Date</label>
                  <input
                    type="date"
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full bg-wv-surface border border-wv-border px-3 py-2 font-mono text-xs text-wv-paper focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-wv-dust mb-1">Visual Reference Cover URL</label>
                <input
                  type="url"
                  value={newCover}
                  onChange={(e) => setNewCover(e.target.value)}
                  className="w-full bg-wv-surface border border-wv-border px-3 py-2 font-mono text-xs text-wv-dust focus:outline-none focus:text-wv-paper"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-wv-border">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="font-mono text-xs text-wv-dust hover:text-wv-paper"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-editorial-wine text-xs px-6 py-2.5"
                >
                  {creating ? 'CREATING STUDIO...' : 'INITIALIZE WORKSPACE ↗'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
