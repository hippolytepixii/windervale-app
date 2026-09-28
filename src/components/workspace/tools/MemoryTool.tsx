import React, { useState, useEffect } from 'react';
import { ProjectMemoryItem, DecisionItem, ProjectMember } from '../../../types';
import { api } from '../../../services/api';
import { Plus, Calendar, Maximize2, X, Trash2, History, Scale, User, BookOpen } from 'lucide-react';

interface ToolProps {
  projectId: string;
  members: ProjectMember[];
  userRole: 'owner' | 'member' | 'viewer';
  onEnterFocus: () => void;
  isFocusMode: boolean;
}

const EVENT_TYPES = ['ALL', 'milestone', 'change', 'pivot', 'insight', 'archival'];
const DECISION_CATEGORIES = ['ALL', 'Creative Direction', 'Format & Medium', 'Rights & Legal', 'Financial', 'Distribution'];

export const MemoryTool: React.FC<ToolProps> = ({
  projectId, members, userRole, onEnterFocus, isFocusMode
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'decisions'>('timeline');
  const [memories, setMemories] = useState<ProjectMemoryItem[]>([]);
  const [decisions, setDecisions] = useState<DecisionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('ALL');
  const [activeDecisionCat, setActiveDecisionCat] = useState('ALL');

  // Modals
  const [createMemoryModal, setCreateMemoryModal] = useState(false);
  const [createDecisionModal, setCreateDecisionModal] = useState(false);

  // Memory Form states
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventType, setEventType] = useState<'milestone' | 'change' | 'pivot' | 'insight' | 'archival'>('insight');
  const [summary, setSummary] = useState('');
  const [fullContext, setFullContext] = useState('');

  // Decision Form states
  const [decisionTitle, setDecisionTitle] = useState('');
  const [decisionDate, setDecisionDate] = useState(new Date().toISOString().split('T')[0]);
  const [decisionCategory, setDecisionCategory] = useState('Creative Direction');
  const [whyContext, setWhyContext] = useState('');
  const [details, setDetails] = useState('');
  const [madeBy, setMadeBy] = useState('');

  useEffect(() => {
    loadAll();
  }, [projectId]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [memData, decData] = await Promise.all([
        api.getMemories(projectId),
        api.getDecisions(projectId).catch(() => ({ decisions: [] }))
      ]);
      setMemories(memData.memories || []);
      setDecisions(decData.decisions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !summary) return;

    try {
      await api.createMemory(projectId, {
        title,
        event_date: eventDate,
        event_type: eventType,
        summary,
        full_context: fullContext
      });
      setTitle('');
      setSummary('');
      setFullContext('');
      setCreateMemoryModal(false);
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionTitle || !whyContext) return;

    try {
      await api.createDecision(projectId, {
        title: decisionTitle,
        decision_date: decisionDate,
        category: decisionCategory,
        why_context: whyContext,
        details,
        made_by: madeBy || 'Project Consensus'
      });
      setDecisionTitle('');
      setWhyContext('');
      setDetails('');
      setMadeBy('');
      setCreateDecisionModal(false);
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    if (!confirm('Remove this historical memory record?')) return;
    try {
      await api.deleteMemory(projectId, id);
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDecision = async (id: string) => {
    if (!confirm('Remove this decision record?')) return;
    try {
      await api.deleteDecision(projectId, id);
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMemories = memories.filter(m => activeType === 'ALL' || m.event_type === activeType);
  const filteredDecisions = decisions.filter(d => activeDecisionCat === 'ALL' || d.category === activeDecisionCat);

  return (
    <div className="space-y-6">
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[2px] border-black pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#6A1A4C] font-bold">12 // MEMORY</span>
            <span className="font-mono text-[10px] text-black/60 font-bold uppercase">ARCHIVE &amp; PROJECT HISTORY</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-black mt-1">PROJECT MEMORY &amp; ARCHIVE</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {userRole !== 'viewer' && (
            <>
              {activeTab === 'timeline' ? (
                <button
                  onClick={() => setCreateMemoryModal(true)}
                  className="btn-editorial-pink text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ RECORD ARCHIVE EVENT</span>
                </button>
              ) : (
                <button
                  onClick={() => setCreateDecisionModal(true)}
                  className="bg-black hover:bg-[#6A1A4C] text-white font-mono text-xs px-4 py-2 border-[2px] border-black flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ RECORD DECISION</span>
                </button>
              )}
            </>
          )}

          {!isFocusMode && (
            <button
              onClick={onEnterFocus}
              className="btn-editorial text-xs px-3 py-2 flex items-center gap-1.5 cursor-pointer"
              title="Focus Mode"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">FOCUS</span>
            </button>
          )}
        </div>
      </div>

      {/* Mode Sub-navigation: Timeline vs Decisions */}
      <div className="flex border-[2px] border-black bg-[#fbf6f0]">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex-1 py-2.5 px-4 font-mono text-xs uppercase font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'timeline'
              ? 'bg-black text-white'
              : 'text-black hover:bg-black/5'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Timeline &amp; Archive Events ({memories.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('decisions')}
          className={`flex-1 py-2.5 px-4 font-mono text-xs uppercase font-bold flex items-center justify-center gap-2 border-l-[2px] border-black transition-colors cursor-pointer ${
            activeTab === 'decisions'
              ? 'bg-black text-white'
              : 'text-black hover:bg-black/5'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Project Decisions History ({decisions.length})</span>
        </button>
      </div>

      {/* TAB 1: TIMELINE & ARCHIVE EVENTS */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          <p className="font-fun text-xs text-black/75 max-w-2xl">
            Permanent historical record. Document important events, pivots, discoveries, and creative breakthroughs so vital context is preserved for future retrospectives and publications.
          </p>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b-[2px] border-black pb-3">
            {EVENT_TYPES.map(t => (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                className={`px-3 py-1 text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  activeType === t
                    ? 'bg-black text-white border-[2px] border-black'
                    : 'bg-[#fbf6f0] text-black border-[2px] border-black/30 hover:border-black'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-12 text-center font-mono text-xs text-black/60 animate-pulse">
              OPENING ARCHIVE LOGS...
            </div>
          ) : filteredMemories.length === 0 ? (
            <div className="border-[2.5px] border-dashed border-black/30 p-8 text-center space-y-3 bg-[#fbf6f0]">
              <History className="w-8 h-8 text-black/40 mx-auto" />
              <p className="font-arthouse font-black text-lg text-black">NO MEMORY ENTRIES RECORDED</p>
              <p className="font-fun text-xs text-black/60">
                Document vital milestones, strategic pivots, creative breakthroughs, and archival preservation notes.
              </p>
              {userRole !== 'viewer' && (
                <button
                  onClick={() => setCreateMemoryModal(true)}
                  className="btn-editorial-pink mt-4 text-xs px-4 py-2 cursor-pointer"
                >
                  RECORD FIRST GENESIS NOTE ↗
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {filteredMemories.map((m) => (
                <div
                  key={m.id}
                  className="p-6 bg-[#FFFDF9] border-[2.5px] border-black shadow-[3px_3px_0px_#000000] hover:border-[#6A1A4C] transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-black/15 pb-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[9px] uppercase px-2 py-0.5 border border-black bg-[#6A1A4C] text-white font-bold">
                        [{m.event_type}]
                      </span>
                      <h3 className="font-arthouse font-black text-xl text-black">
                        {m.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4 font-mono text-xs text-black/60">
                      <span className="flex items-center gap-1.5 text-black font-bold">
                        <Calendar className="w-3.5 h-3.5 text-[#6A1A4C]" />
                        {m.event_date}
                      </span>
                      {userRole !== 'viewer' && (
                        <button
                          onClick={() => handleDeleteMemory(m.id)}
                          className="hover:text-[#C84B31] opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                          title="Remove record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="font-fun text-sm text-black/85 leading-relaxed">
                    {m.summary}
                  </p>

                  {m.full_context && (
                    <div className="mt-4 p-3 bg-[#fbf6f0] border-l-4 border-[#6A1A4C] font-fun text-xs text-black/80 leading-relaxed">
                      <span className="font-mono text-[9px] uppercase text-[#6A1A4C] font-bold block mb-1">Deeper Context / Why it matters:</span>
                      {m.full_context}
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-black/15 font-mono text-[10px] text-black/60 font-bold uppercase">
                    RECORDED BY {m.recorder_name?.toUpperCase() || 'COLLABORATOR'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROJECT DECISIONS HISTORY */}
      {activeTab === 'decisions' && (
        <div className="space-y-6">
          <p className="font-fun text-xs text-black/75 max-w-2xl">
            Pivotal artistic, technical, and structural choices with the full context and rationale for why a direction was chosen over alternatives.
          </p>

          {/* Decision Category Filter */}
          <div className="flex flex-wrap items-center gap-2 border-b-[2px] border-black pb-3">
            {DECISION_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveDecisionCat(cat)}
                className={`px-3 py-1 text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  activeDecisionCat === cat
                    ? 'bg-black text-white border-[2px] border-black'
                    : 'bg-[#fbf6f0] text-black border-[2px] border-black/30 hover:border-black'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-12 text-center font-mono text-xs text-black/60 animate-pulse">
              LOADING DECISION HISTORY...
            </div>
          ) : filteredDecisions.length === 0 ? (
            <div className="border-[2.5px] border-dashed border-black/30 p-8 text-center space-y-3 bg-[#fbf6f0]">
              <Scale className="w-8 h-8 text-black/40 mx-auto" />
              <p className="font-arthouse font-black text-lg text-black">NO DECISION LOGS RECORDED</p>
              <p className="font-fun text-xs text-black/60">
                Record major creative directions, technical format choices, and governance decisions to keep the team aligned.
              </p>
              {userRole !== 'viewer' && (
                <button
                  onClick={() => setCreateDecisionModal(true)}
                  className="bg-black hover:bg-[#6A1A4C] text-white font-mono text-xs px-4 py-2 border-[2px] border-black cursor-pointer transition-colors"
                >
                  + RECORD FIRST DECISION ↗
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {filteredDecisions.map((d) => (
                <div
                  key={d.id}
                  className="p-6 bg-[#FFFDF9] border-[2.5px] border-black shadow-[3px_3px_0px_#000000] hover:border-black transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-black/15 pb-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[9px] uppercase px-2 py-0.5 border border-black bg-black text-white font-bold">
                        {d.category || 'General'}
                      </span>
                      <h3 className="font-arthouse font-black text-xl text-black">
                        {d.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4 font-mono text-xs text-black/60">
                      <span className="flex items-center gap-1.5 text-black font-bold">
                        <Calendar className="w-3.5 h-3.5 text-black" />
                        {d.decision_date}
                      </span>
                      {userRole !== 'viewer' && (
                        <button
                          onClick={() => handleDeleteDecision(d.id)}
                          className="hover:text-[#C84B31] opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                          title="Remove decision"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 font-fun text-sm text-black/85">
                    <div className="p-3 bg-[#fbf6f0] border-l-4 border-black">
                      <span className="font-mono text-[10px] uppercase font-bold text-black block mb-0.5">Rationale &amp; Context:</span>
                      <p className="leading-relaxed">{d.why_context}</p>
                    </div>

                    {d.details && (
                      <p className="leading-relaxed whitespace-pre-line text-xs text-black/80">
                        {d.details}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-black/15 flex items-center justify-between font-mono text-[10px] text-black/60 font-bold uppercase">
                    <span>AGREED BY: {d.made_by || 'PROJECT CONSENSUS'}</span>
                    <span>DECISION ID: {d.id.slice(0, 8)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Memory Modal */}
      {createMemoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-editorial-fade">
          <div className="w-full max-w-lg bg-[#FFFDF9] border-[2.5px] border-black p-6 shadow-[6px_6px_0px_#000000]">
            <div className="flex items-center justify-between border-b-[2px] border-black pb-3 mb-4">
              <div>
                <span className="font-mono text-[10px] text-[#6A1A4C] font-bold uppercase">12 // MEMORY &middot; ARCHIVE</span>
                <h3 className="font-arthouse font-black text-xl text-black uppercase">RECORD HISTORICAL EVENT</h3>
              </div>
              <button onClick={() => setCreateMemoryModal(false)} className="text-black/60 hover:text-black cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMemory} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase text-black font-bold mb-1">Event / Milestone Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Format Pivot from Digital to 16mm"
                  className="w-full bg-[#fbf6f0] border-[2px] border-black p-2.5 text-sm text-black focus:outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs uppercase text-black font-bold mb-1">Date Occurred *</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-[#fbf6f0] border-[2px] border-black p-2 font-mono text-xs text-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase text-black font-bold mb-1">Event Type *</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="w-full bg-[#fbf6f0] border-[2px] border-black p-2 font-mono text-xs text-black focus:outline-none"
                  >
                    <option value="milestone">Milestone Achieved</option>
                    <option value="change">Personnel / Role Change</option>
                    <option value="pivot">Creative / Technical Pivot</option>
                    <option value="insight">Insight / Breakthrough</option>
                    <option value="archival">Archival Master Deposit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-black font-bold mb-1">Summary *</label>
                <textarea
                  required
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Concise overview of what occurred..."
                  className="w-full bg-[#fbf6f0] border-[2px] border-black p-2.5 font-fun text-xs text-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-black font-bold mb-1">Full Context &amp; Significance</label>
                <textarea
                  rows={3}
                  value={fullContext}
                  onChange={(e) => setFullContext(e.target.value)}
                  placeholder="Why did this change happen? What lessons were learned? Document the nuance..."
                  className="w-full bg-[#fbf6f0] border-[2px] border-black p-2.5 font-fun text-xs text-black focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t-[2px] border-black">
                <button
                  type="button"
                  onClick={() => setCreateMemoryModal(false)}
                  className="font-mono text-xs text-black/60 hover:text-black font-bold uppercase cursor-pointer"
                >
                  CANCEL
                </button>
                <button type="submit" className="btn-editorial-pink text-xs px-5 py-2 cursor-pointer">
                  RECORD TO MEMORY ↗
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Decision Modal */}
      {createDecisionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-editorial-fade">
          <div className="w-full max-w-lg bg-[#FFFDF9] border-[2.5px] border-black p-6 shadow-[6px_6px_0px_#000000]">
            <div className="flex items-center justify-between border-b-[2px] border-black pb-3 mb-4">
              <div>
                <span className="font-mono text-[10px] text-[#6A1A4C] font-bold uppercase">12 // MEMORY &middot; DECISIONS</span>
                <h3 className="font-arthouse font-black text-xl text-black uppercase">RECORD PROJECT DECISION</h3>
              </div>
              <button onClick={() => setCreateDecisionModal(false)} className="text-black/60 hover:text-black cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDecision} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase text-black font-bold mb-1">Decision Title *</label>
                <input
                  type="text"
                  required
                  value={decisionTitle}
                  onChange={(e) => setDecisionTitle(e.target.value)}
                  placeholder="e.g. Choose 16mm celluloid over digital capture"
                  className="w-full bg-[#fbf6f0] border-[2px] border-black p-2.5 text-sm text-black focus:outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs uppercase text-black font-bold mb-1">Decision Date *</label>
                  <input
                    type="date"
                    required
                    value={decisionDate}
                    onChange={(e) => setDecisionDate(e.target.value)}
                    className="w-full bg-[#fbf6f0] border-[2px] border-black p-2 font-mono text-xs text-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase text-black font-bold mb-1">Category *</label>
                  <select
                    value={decisionCategory}
                    onChange={(e) => setDecisionCategory(e.target.value)}
                    className="w-full bg-[#fbf6f0] border-[2px] border-black p-2 font-mono text-xs text-black focus:outline-none"
                  >
                    <option value="Creative Direction">Creative Direction</option>
                    <option value="Format & Medium">Format &amp; Medium</option>
                    <option value="Rights & Legal">Rights &amp; Legal</option>
                    <option value="Financial">Financial</option>
                    <option value="Distribution">Distribution</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-black font-bold mb-1">Why &middot; Context &amp; Rationale *</label>
                <textarea
                  required
                  rows={2}
                  value={whyContext}
                  onChange={(e) => setWhyContext(e.target.value)}
                  placeholder="Why was this option selected? What tradeoffs were made?"
                  className="w-full bg-[#fbf6f0] border-[2px] border-black p-2.5 font-fun text-xs text-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-black font-bold mb-1">Full Implementation Details</label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Technical specifics, gear requirements, or protocol changes..."
                  className="w-full bg-[#fbf6f0] border-[2px] border-black p-2.5 font-fun text-xs text-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-black font-bold mb-1">Decision Author / Consensus Body</label>
                <input
                  type="text"
                  value={madeBy}
                  onChange={(e) => setMadeBy(e.target.value)}
                  placeholder="e.g. Director & Cinematographer Consensus"
                  className="w-full bg-[#fbf6f0] border-[2px] border-black p-2 font-mono text-xs text-black focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t-[2px] border-black">
                <button
                  type="button"
                  onClick={() => setCreateDecisionModal(false)}
                  className="font-mono text-xs text-black/60 hover:text-black font-bold uppercase cursor-pointer"
                >
                  CANCEL
                </button>
                <button type="submit" className="bg-black hover:bg-[#6A1A4C] text-white font-mono text-xs px-5 py-2 border-[2px] border-black cursor-pointer transition-colors">
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
