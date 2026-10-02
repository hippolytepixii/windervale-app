import React, { useState, useEffect } from 'react';
import { WorkspaceTask, ProjectMember, DecisionItem } from '../../../types';
import { api } from '../../../services/api';
import { Plus, Check, Clock, AlertCircle, Trash2, Calendar, User, Maximize2, Scale, X } from 'lucide-react';

interface ToolProps {
  projectId: string;
  members: ProjectMember[];
  userRole: 'owner' | 'member' | 'viewer';
  onEnterFocus: () => void;
  isFocusMode: boolean;
  onRefreshProject?: () => void;
  isCovenantSigned?: boolean;
  onOpenAgreement?: () => void;
}

export const BuildTool: React.FC<ToolProps> = ({
  projectId, members, userRole, onEnterFocus, isFocusMode, isCovenantSigned, onOpenAgreement
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'decisions'>('tasks');

  // Tasks state
  const [tasks, setTasks] = useState<WorkspaceTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'todo' | 'in_progress' | 'completed'>('ALL');
  const [createTaskModal, setCreateTaskModal] = useState(false);

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState<'standard' | 'urgent'>('standard');
  const [deadline, setDeadline] = useState('');

  // Decisions state
  const [decisions, setDecisions] = useState<DecisionItem[]>([]);
  const [loadingDecisions, setLoadingDecisions] = useState(false);
  const [createDecisionModal, setCreateDecisionModal] = useState(false);

  // Decision form state
  const [decisionTitle, setDecisionTitle] = useState('');
  const [decisionDate, setDecisionDate] = useState(new Date().toISOString().split('T')[0]);
  const [decisionWhy, setDecisionWhy] = useState('');
  const [decisionDetails, setDecisionDetails] = useState('');
  const [decisionMadeBy, setDecisionMadeBy] = useState('');
  const [decisionCategory, setDecisionCategory] = useState('Creative Direction');

  useEffect(() => {
    loadTasks();
    loadDecisions();
  }, [projectId]);

  const loadTasks = async () => {
    setLoadingTasks(true);
    try {
      const data = await api.getTasks(projectId);
      setTasks(data.tasks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTasks(false);
    }
  };

  const loadDecisions = async () => {
    setLoadingDecisions(true);
    try {
      const data = await api.getDecisions(projectId);
      setDecisions(data.decisions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDecisions(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;
    try {
      await api.createTask(projectId, {
        title: taskTitle,
        description: taskDescription,
        assignee_id: assigneeId || undefined,
        priority,
        deadline: deadline || undefined,
        status: 'todo'
      });
      setTaskTitle('');
      setTaskDescription('');
      setAssigneeId('');
      setDeadline('');
      setCreateTaskModal(false);
      loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'todo' ? 'in_progress' : currentStatus === 'in_progress' ? 'completed' : 'todo';
    try {
      await api.updateTask(projectId, taskId, { status: nextStatus as any });
      loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.deleteTask(projectId, taskId);
      loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionTitle || !decisionWhy) return;

    try {
      await api.createDecision(projectId, {
        title: decisionTitle,
        decision_date: decisionDate,
        why_context: decisionWhy,
        details: decisionDetails,
        made_by: decisionMadeBy || 'Project Consensus',
        category: decisionCategory
      });
      setDecisionTitle('');
      setDecisionWhy('');
      setDecisionDetails('');
      setCreateDecisionModal(false);
      loadDecisions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDecision = async (id: string) => {
    if (!confirm('Remove this decision record?')) return;
    try {
      await api.deleteDecision(projectId, id);
      loadDecisions();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filterStatus === 'ALL') return true;
    return t.status === filterStatus;
  });

  const counts = {
    todo: tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[2px] border-black pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#6A1A4C] font-bold">04 : BUILD</span>
            <span className="font-mono text-[10px] text-black/60 font-bold uppercase">CREATIVE PIPELINE &amp; DELIVERABLES</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-black mt-1">
            {activeTab === 'tasks' ? 'WORK ITEMS & TASKS' : 'PROJECT DECISIONS'}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {userRole !== 'viewer' && (
            activeTab === 'tasks' ? (
              <button
                onClick={() => setCreateTaskModal(true)}
                className="btn-editorial text-xs px-4 py-2 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ ADD TASK</span>
              </button>
            ) : (
              <button
                onClick={() => setCreateDecisionModal(true)}
                className="btn-editorial-pink text-xs px-4 py-2 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ RECORD DECISION</span>
              </button>
            )
          )}

          {!isFocusMode && (
            <button
              onClick={onEnterFocus}
              className="btn-editorial text-xs px-3 py-2 flex items-center gap-1.5"
              title="Enter focus mode"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">FOCUS</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Sub-Navigation Tabs: Tasks vs Decisions */}
      <div className="flex items-center gap-2 border-b-[2px] border-black pb-3">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-1.5 text-xs font-mono font-bold uppercase transition-all ${
            activeTab === 'tasks'
              ? 'bg-black text-white border-[2px] border-black'
              : 'bg-[#fbf6f0] text-black border-[2px] border-black/30 hover:border-black'
          }`}
        >
          Tasks &amp; Pipeline ({tasks.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('decisions');
            loadDecisions();
          }}
          className={`px-4 py-1.5 text-xs font-mono font-bold uppercase transition-all ${
            activeTab === 'decisions'
              ? 'bg-black text-white border-[2px] border-black'
              : 'bg-[#fbf6f0] text-black border-[2px] border-black/30 hover:border-black'
          }`}
        >
          Project Decisions ({decisions.length})
        </button>
      </div>

      {/* Pre-Production Covenant Requirement Card */}
      {isCovenantSigned === false && (
        <div className="border-[2.5px] border-black bg-[#FFFDF9] p-4 sm:p-5 space-y-2.5 shadow-none">
          <div className="flex items-center justify-between border-b border-black/15 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6A1A4C] animate-pulse" />
              <span className="font-mono text-[10px] font-black tracking-widest uppercase text-[#6A1A4C]">
                STUDIO PROTOCOL &middot; COVENANT SIGNATURE REQUIRED
              </span>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-wider text-black/60 font-bold">
              STAGE 03 &middot; AGREEMENT
            </span>
          </div>
          <p className="font-fun text-xs sm:text-sm text-black/90 leading-relaxed">
            Windervale projects operate under mutual consensus. Project agreements must be signed by practitioners before starting work items and production.
          </p>
          <div className="pt-1 flex items-center justify-between">
            <span className="font-mono text-[9px] text-black/60 uppercase font-bold">
              STATUS: PENDING YOUR SIGNATURE
            </span>
            <button
              onClick={onOpenAgreement}
              className="px-4 py-2 bg-black hover:bg-[#6A1A4C] text-white font-arthouse font-bold text-xs uppercase tracking-wider border-[2px] border-black transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>REVIEW & SIGN COVENANT ✍</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: TASKS & PIPELINE */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {/* Creative Pipeline Stages Track */}
          <div className="p-3 bg-[#fbf6f0] border-[2px] border-black">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[9px] text-[#6A1A4C] font-bold uppercase">CREATIVE PIPELINE</span>
              <span className="font-mono text-[9px] text-black/60 font-bold">LIFECYCLE PROGRESSION</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-1 font-mono text-[10px] text-center font-bold">
              {['Idea', 'Development', 'Pre-production', 'Production', 'Post-production', 'Final'].map((stg, idx) => (
                <div key={stg} className="p-1.5 border border-black bg-white flex items-center justify-center gap-1 shadow-[1px_1px_0px_#000000]">
                  <span className="text-[#6A1A4C] text-[9px]">{idx + 1}.</span>
                  <span className="truncate">{stg}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 border-b-[2px] border-black/15 pb-2">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`font-mono text-xs px-3 py-1 border transition-all ${
                filterStatus === 'ALL'
                  ? 'border-black bg-black text-white font-bold'
                  : 'border-black/30 text-black/60 hover:text-black hover:border-black'
              }`}
            >
              ALL [{tasks.length}]
            </button>
            <button
              onClick={() => setFilterStatus('todo')}
              className={`font-mono text-xs px-3 py-1 border transition-all ${
                filterStatus === 'todo'
                  ? 'border-black bg-[#6A1A4C] text-white font-bold'
                  : 'border-black/30 text-black/60 hover:text-black hover:border-black'
              }`}
            >
              TO-DO [{counts.todo}]
            </button>
            <button
              onClick={() => setFilterStatus('in_progress')}
              className={`font-mono text-xs px-3 py-1 border transition-all ${
                filterStatus === 'in_progress'
                  ? 'border-black bg-[#6A1A4C] text-white font-bold'
                  : 'border-black/30 text-black/60 hover:text-black hover:border-black'
              }`}
            >
              IN PROGRESS [{counts.in_progress}]
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`font-mono text-xs px-3 py-1 border transition-all ${
                filterStatus === 'completed'
                  ? 'border-black bg-[#6A1A4C] text-white font-bold'
                  : 'border-black/30 text-black/60 hover:text-black hover:border-black'
              }`}
            >
              COMPLETED [{counts.completed}]
            </button>
          </div>

          {/* Task List */}
          {loadingTasks ? (
            <div className="py-12 text-center font-mono text-xs text-black/60 animate-pulse">
              LOADING WORK ITEMS...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="border-[2.5px] border-dashed border-black/30 p-8 text-center space-y-3 bg-[#fbf6f0]">
              <p className="font-fun text-sm text-black/70">No tasks in this view.</p>
              {userRole !== 'viewer' && (
                <button
                  onClick={() => setCreateTaskModal(true)}
                  className="btn-editorial text-xs px-4 py-1.5"
                >
                  + CREATE FIRST TASK
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 bg-[#FFFDF9] border-[2px] border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group transition-colors hover:bg-white"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={() => handleStatusChange(t.id, t.status)}
                      className={`w-5 h-5 rounded-none border-[2px] border-black flex items-center justify-center shrink-0 mt-0.5 cursor-pointer ${
                        t.status === 'completed'
                          ? 'bg-[#6A1A4C] text-white'
                          : t.status === 'in_progress'
                          ? 'bg-[#F3C8CD] text-black'
                          : 'bg-white hover:bg-black/10'
                      }`}
                      title="Click to cycle status: to-do -> in progress -> completed"
                    >
                      {t.status === 'completed' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      {t.status === 'in_progress' && <Clock className="w-3 h-3 text-black" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-fun text-sm font-bold truncate text-black ${
                            t.status === 'completed' ? 'line-through text-black/40' : ''
                          }`}
                        >
                          {t.title}
                        </span>
                        {t.priority === 'urgent' && (
                          <span className="font-mono text-[9px] bg-[#C84B31] text-white px-1.5 py-0.2 shrink-0 font-bold uppercase">
                            URGENT
                          </span>
                        )}
                      </div>
                      {t.description && (
                        <p className="font-fun text-xs text-black/75 line-clamp-1 mt-0.5">
                          {t.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-black/60">
                        {t.assignee_name && (
                          <span className="flex items-center gap-1 font-semibold text-black/80">
                            <User className="w-3 h-3" />
                            {t.assignee_name}
                          </span>
                        )}
                        {t.deadline && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {t.deadline}
                          </span>
                        )}
                        <span className="uppercase text-[9px] border px-1 py-0.2 border-black/30 font-bold text-black/80">
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleDeleteTask(t.id)}
                      className="p-1.5 text-black/40 hover:text-[#6A1A4C] hover:bg-black/5 transition-colors cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROJECT DECISIONS */}
      {activeTab === 'decisions' && (
        <div className="space-y-4">
          <div className="p-3 bg-[#fbf6f0] border-[2px] border-black/20 text-xs text-black/80 font-fun">
            <strong>Project Decision Log:</strong> Record pivotal artistic, technical, and structural choices with the context and rationale for why a direction was chosen.
          </div>

          {loadingDecisions ? (
            <div className="py-12 text-center font-mono text-xs text-black/60 animate-pulse">
              LOADING DECISION RECORDS...
            </div>
          ) : decisions.length === 0 ? (
            <div className="border-[2.5px] border-dashed border-black/30 p-8 text-center space-y-3 bg-[#fbf6f0]">
              <Scale className="w-8 h-8 text-black/40 mx-auto" />
              <p className="font-fun text-sm text-black/70">No formal project decisions recorded yet.</p>
              {userRole !== 'viewer' && (
                <button
                  onClick={() => setCreateDecisionModal(true)}
                  className="btn-editorial-pink text-xs px-4 py-1.5"
                >
                  + RECORD FIRST DECISION
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {decisions.map((d) => (
                <div
                  key={d.id}
                  className="border-[2.5px] border-black bg-[#FFFDF9] p-5 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between border-b border-black/15 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold uppercase bg-[#6A1A4C] text-white px-2 py-0.5">
                        {d.category || 'Creative Direction'}
                      </span>
                      <span className="font-mono text-[10px] text-black/60 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {d.decision_date}
                      </span>
                    </div>
                    {userRole !== 'viewer' && (
                      <button
                        onClick={() => handleDeleteDecision(d.id)}
                        className="text-black/40 hover:text-[#C84B31] p-1 cursor-pointer transition-colors"
                        title="Remove decision record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <h3 className="font-arthouse font-bold text-base text-black leading-tight">
                    {d.title}
                  </h3>

                  <div className="bg-black/5 border-l-4 border-black p-3 space-y-1">
                    <span className="font-mono text-[9px] uppercase font-bold text-black/60 block">
                      WHY CONTEXT &middot; RATIONALE
                    </span>
                    <p className="font-fun text-xs text-black/90 leading-relaxed italic">
                      "{d.why_context}"
                    </p>
                  </div>

                  {d.details && (
                    <p className="font-fun text-xs text-black/80 leading-relaxed pt-1">
                      {d.details}
                    </p>
                  )}

                  <div className="pt-2 border-t border-black/10 flex items-center justify-between font-mono text-[10px] text-black/50">
                    <span>Decided By: {d.made_by}</span>
                    <span>IMMUTABLE ARCHIVE RECORD</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Task Modal */}
      {createTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#FFFDF9] border-[2.5px] border-black p-6">
            <h3 className="font-display font-bold text-xl text-black mb-4 pb-2 border-b border-black/20">
              NEW BUILD TASK
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase text-black/70 font-bold mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Test push-processing on 16mm film stock"
                  className="w-full bg-white border border-black/40 px-3 py-2 text-sm text-black focus:outline-none focus:border-black font-medium"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-black/70 font-bold mb-1">Description &amp; Scope</label>
                <textarea
                  rows={2}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full bg-white border border-black/40 p-2.5 text-xs text-black focus:outline-none focus:border-black font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-black/70 font-bold mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-white border border-black/40 px-2 py-1.5 font-mono text-xs text-black focus:outline-none"
                  >
                    <option value="standard">STANDARD</option>
                    <option value="urgent">URGENT</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-black/70 font-bold mb-1">Assignee</label>
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full bg-white border border-black/40 px-2 py-1.5 font-mono text-xs text-black focus:outline-none"
                  >
                    <option value="">UNASSIGNED</option>
                    {members.map(m => (
                      <option key={m.id} value={m.user_id}>
                        {m.name} ({m.contribution_area || m.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-black/70 font-bold mb-1">Target Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-white border border-black/40 px-2 py-1.5 font-mono text-xs text-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-black/15">
                <button
                  type="button"
                  onClick={() => setCreateTaskModal(false)}
                  className="font-mono text-xs text-black/60 hover:text-black font-bold cursor-pointer"
                >
                  CANCEL
                </button>
                <button type="submit" className="btn-editorial text-xs px-5 py-2 cursor-pointer">
                  SAVE WORK ITEM ↗
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Decision Modal */}
      {createDecisionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#FFFDF9] border-[2.5px] border-black p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-black/20 pb-2">
              <h3 className="font-display font-bold text-xl text-black">
                RECORD PROJECT DECISION
              </h3>
              <button
                onClick={() => setCreateDecisionModal(false)}
                className="p-1 text-black/60 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDecision} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase text-black font-bold mb-1">
                  Decision Title *
                </label>
                <input
                  type="text"
                  required
                  value={decisionTitle}
                  onChange={(e) => setDecisionTitle(e.target.value)}
                  placeholder="e.g. Switch from 35mm to 16mm grain capture"
                  className="w-full bg-white border border-black/40 px-3 py-2 text-sm text-black focus:outline-none focus:border-black font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-xs uppercase text-black font-bold mb-1">
                    Category
                  </label>
                  <select
                    value={decisionCategory}
                    onChange={(e) => setDecisionCategory(e.target.value)}
                    className="w-full bg-white border border-black/40 px-2 py-2 font-mono text-xs text-black focus:outline-none"
                  >
                    <option value="Creative Direction">Creative Direction</option>
                    <option value="Technical / Format">Technical / Format</option>
                    <option value="Personnel / Role">Personnel / Role</option>
                    <option value="Financial / Budget">Financial / Budget</option>
                    <option value="Rights / Legal">Rights / Legal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-black font-bold mb-1">
                    Date of Decision
                  </label>
                  <input
                    type="date"
                    value={decisionDate}
                    onChange={(e) => setDecisionDate(e.target.value)}
                    className="w-full bg-white border border-black/40 px-2 py-2 font-mono text-xs text-black focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-black font-bold mb-1">
                  Why Context &middot; Rationale *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Why was this chosen over other alternatives? What tradeoff was made?"
                  value={decisionWhy}
                  onChange={(e) => setDecisionWhy(e.target.value)}
                  className="w-full bg-white border border-black/40 p-2.5 text-xs text-black focus:outline-none focus:border-black font-medium"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-black font-bold mb-1">
                  Implementation Details (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Specific actions or repercussions following this decision..."
                  value={decisionDetails}
                  onChange={(e) => setDecisionDetails(e.target.value)}
                  className="w-full bg-white border border-black/40 p-2.5 text-xs text-black focus:outline-none focus:border-black font-medium"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-black font-bold mb-1">
                  Decided By
                </label>
                <input
                  type="text"
                  placeholder="e.g. Director &amp; DP Consensus, Lead Artist"
                  value={decisionMadeBy}
                  onChange={(e) => setDecisionMadeBy(e.target.value)}
                  className="w-full bg-white border border-black/40 px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-black/15">
                <button
                  type="button"
                  onClick={() => setCreateDecisionModal(false)}
                  className="font-mono text-xs text-black/60 hover:text-black font-bold cursor-pointer"
                >
                  CANCEL
                </button>
                <button type="submit" className="btn-editorial-pink text-xs px-5 py-2 cursor-pointer">
                  RECORD DECISION ↗
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
