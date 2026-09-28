import React, { useState, useEffect } from 'react';
import { Milestone, ProjectMember } from '../../../types';
import { api } from '../../../services/api';
import { Flag, Plus, CheckCircle, Clock, Calendar, Maximize2, X, Trash2, CheckCircle2, User, ShieldCheck } from 'lucide-react';

interface ToolProps {
  projectId: string;
  members: ProjectMember[];
  userRole: 'owner' | 'member' | 'viewer';
  onEnterFocus: () => void;
  isFocusMode: boolean;
}

export const MilestonesTool: React.FC<ToolProps> = ({
  projectId, members, userRole, onEnterFocus, isFocusMode
}) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'upcoming' | 'in_progress' | 'completed'>('upcoming');
  const [progress, setProgress] = useState(0);
  const [deliverables, setDeliverables] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [approvalState, setApprovalState] = useState<'Pending Approval' | 'Approved' | 'Review Underway'>('Pending Approval');

  useEffect(() => {
    loadMilestones();
  }, [projectId]);

  const loadMilestones = async () => {
    setLoading(true);
    try {
      const data = await api.getMilestones(projectId);
      setMilestones(data.milestones || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) return;

    try {
      await api.createMilestone(projectId, {
        title,
        due_date: dueDate,
        status,
        progress: Number(progress),
        deliverables,
        responsible_person: responsiblePerson || undefined,
        approval_state: approvalState
      });
      setTitle('');
      setDueDate('');
      setProgress(0);
      setDeliverables('');
      setResponsiblePerson('');
      setApprovalState('Pending Approval');
      setCreateModal(false);
      loadMilestones();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProgress = async (id: string, newProgress: number) => {
    const nextStatus = newProgress >= 100 ? 'completed' : newProgress > 0 ? 'in_progress' : 'upcoming';
    try {
      await api.updateMilestone(projectId, id, {
        progress: newProgress,
        status: nextStatus
      });
      loadMilestones();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleApproval = async (m: Milestone) => {
    const nextApproval = m.approval_state === 'Approved' ? 'Pending Approval' : 'Approved';
    try {
      await api.updateMilestone(projectId, m.id, {
        approval_state: nextApproval
      });
      loadMilestones();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove milestone?')) return;
    try {
      await api.deleteMilestone(projectId, id);
      loadMilestones();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[2px] border-black pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#6A1A4C] font-bold">07 // MILESTONES</span>
            <span className="font-mono text-[10px] text-black/60 font-bold uppercase">MAJOR GATES &amp; APPROVAL STATES</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-black mt-1">MILESTONES &amp; GATES</h2>
        </div>

        <div className="flex items-center gap-3">
          {userRole !== 'viewer' && (
            <button
              onClick={() => setCreateModal(true)}
              className="btn-editorial-pink text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ ADD MILESTONE</span>
            </button>
          )}

          {!isFocusMode && (
            <button
              onClick={onEnterFocus}
              className="btn-editorial text-xs px-3 py-2 flex items-center gap-1.5 cursor-pointer"
              title="Focus Mode"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>ENTER FOCUS ⤢</span>
            </button>
          )}
        </div>
      </div>

      {/* Milestones Timeline */}
      {loading ? (
        <div className="py-12 text-center font-mono text-xs text-black/60 animate-pulse">
          ALIGNING TIMELINE GATES...
        </div>
      ) : milestones.length === 0 ? (
        <div className="py-16 text-center border-[2.5px] border-dashed border-black/30 p-8 text-black/70 bg-[#fbf6f0] space-y-3">
          <Flag className="w-8 h-8 text-black/40 mx-auto" />
          <p className="font-arthouse font-black text-lg text-black">NO MILESTONES ESTABLISHED</p>
          <p className="font-fun text-xs text-black/60">
            Define key gates, sign-offs, and critical deliverables with clear collaborator ownership.
          </p>
          {userRole !== 'viewer' && (
            <button
              onClick={() => setCreateModal(true)}
              className="btn-editorial-pink mt-2 text-xs px-4 py-2 cursor-pointer"
            >
              SET FIRST MILESTONE ↗
            </button>
          )}
        </div>
      ) : (
        <div className="relative border-l-[2.5px] border-black ml-4 sm:ml-8 pl-6 sm:pl-8 space-y-8 py-4">
          {milestones.map((m) => {
            const isCompleted = m.status === 'completed' || m.progress === 100;
            const isApproved = m.approval_state === 'Approved';

            return (
              <div key={m.id} className="relative group">
                {/* Marker Node on Timeline */}
                <span className={`absolute -left-[32px] sm:-left-[41px] top-2 w-4 h-4 border-[2px] border-black transition-all ${
                  isCompleted ? 'bg-[#2D7A4C]' : m.status === 'in_progress' ? 'bg-[#6A1A4C]' : 'bg-white'
                }`} />

                <div className="p-6 bg-[#FFFDF9] border-[2.5px] border-black shadow-[3px_3px_0px_#000000] hover:border-black transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/15 pb-3 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`font-mono text-[9px] uppercase px-2 py-0.5 border font-bold ${
                        isCompleted
                          ? 'border-[#2D7A4C] bg-[#2D7A4C]/10 text-[#2D7A4C]'
                          : m.status === 'in_progress'
                          ? 'border-[#6A1A4C] bg-[#6A1A4C]/10 text-[#6A1A4C]'
                          : 'border-black/30 bg-[#fbf6f0] text-black'
                      }`}>
                        {m.status.replace('_', ' ')}
                      </span>

                      {m.approval_state && (
                        <button
                          onClick={() => userRole !== 'viewer' && handleToggleApproval(m)}
                          className={`font-mono text-[9px] uppercase px-2 py-0.5 border font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                            isApproved
                              ? 'bg-[#2D7A4C] text-white border-black'
                              : 'bg-[#fbf6f0] text-[#C84B31] border-[#C84B31]'
                          }`}
                          title="Click to toggle approval sign-off"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>{m.approval_state}</span>
                        </button>
                      )}

                      <h3 className="font-arthouse font-black text-lg text-black">
                        {m.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4 font-mono text-xs text-black/60">
                      <span className="flex items-center gap-1.5 text-black font-bold">
                        <Calendar className="w-3.5 h-3.5 text-[#6A1A4C]" />
                        {m.due_date}
                      </span>
                      {userRole !== 'viewer' && (
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="hover:text-[#C84B31] opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                          title="Delete milestone"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {m.responsible_person && (
                    <div className="font-mono text-xs text-black/80 font-bold mb-2 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-black/50" />
                      <span>LEAD: {m.responsible_person}</span>
                    </div>
                  )}

                  {m.deliverables && (
                    <div className="font-fun text-xs text-black/85 mb-4 p-2.5 bg-[#fbf6f0] border border-black/20">
                      <strong className="font-mono text-[10px] text-black/70 uppercase block mb-0.5">Deliverables / Gate Criteria:</strong>
                      {m.deliverables}
                    </div>
                  )}

                  {/* Progress Bar & Slider */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between font-mono text-[10px] text-black/70 font-bold">
                      <span>EXECUTION PROGRESS</span>
                      <span className="text-black">{m.progress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#fbf6f0] border border-black overflow-hidden">
                      <div
                        className="h-full bg-[#6A1A4C] transition-all duration-300"
                        style={{ width: `${m.progress}%` }}
                      />
                    </div>
                    {userRole !== 'viewer' && (
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={m.progress}
                        onChange={(e) => handleUpdateProgress(m.id, parseInt(e.target.value))}
                        className="w-full accent-[#6A1A4C] h-1 bg-transparent cursor-pointer mt-2"
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Milestone Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-editorial-fade">
          <div className="w-full max-w-lg bg-[#FFFDF9] border-[2.5px] border-black p-6 shadow-[6px_6px_0px_#000000]">
            <div className="flex items-center justify-between border-b-[2px] border-black pb-3 mb-4">
              <div>
                <span className="font-mono text-[10px] text-[#6A1A4C] font-bold uppercase">07 // MILESTONES</span>
                <h3 className="font-arthouse font-black text-xl text-black uppercase">ESTABLISH MILESTONE</h3>
              </div>
              <button onClick={() => setCreateModal(false)} className="text-black/60 hover:text-black cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase font-bold text-black mb-1">Milestone Name *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Principal Photography & Sound Acquisition Gate"
                  className="w-full bg-white border-[2px] border-black p-2.5 font-fun text-sm text-black focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">Target Date *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-white border-[2px] border-black p-2 font-mono text-xs text-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-white border-[2px] border-black p-2 font-mono text-xs text-black focus:outline-none"
                  >
                    <option value="upcoming">UPCOMING</option>
                    <option value="in_progress">IN PROGRESS</option>
                    <option value="completed">COMPLETED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">Responsible Person</label>
                  <select
                    value={responsiblePerson}
                    onChange={(e) => setResponsiblePerson(e.target.value)}
                    className="w-full bg-white border-[2px] border-black p-2 font-mono text-xs text-black focus:outline-none"
                  >
                    <option value="">Select Collaborator...</option>
                    {members.map(m => (
                      <option key={m.id} value={m.name || m.email}>
                        {m.name || m.email} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">Initial Approval State</label>
                  <select
                    value={approvalState}
                    onChange={(e) => setApprovalState(e.target.value as any)}
                    className="w-full bg-white border-[2px] border-black p-2 font-mono text-xs text-black focus:outline-none"
                  >
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="Review Underway">Review Underway</option>
                    <option value="Approved">Approved</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase font-bold text-black mb-1">Deliverables &amp; Acceptance Gate Criteria</label>
                <textarea
                  rows={3}
                  value={deliverables}
                  onChange={(e) => setDeliverables(e.target.value)}
                  placeholder="e.g. 12 shooting days on 16mm, raw sound stems on DAT, telecine test reel"
                  className="w-full bg-white border-[2px] border-black p-2.5 font-fun text-xs text-black focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-black/15">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="font-mono text-xs text-black/60 hover:text-black uppercase cursor-pointer"
                >
                  CANCEL
                </button>
                <button type="submit" className="btn-editorial-pink text-xs px-5 py-2 cursor-pointer">
                  SAVE MILESTONE ↗
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
