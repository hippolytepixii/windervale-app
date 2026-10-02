import React, { useState, useEffect } from 'react';
import { DecisionItem, ProjectMember } from '../../../types';
import { api } from '../../../services/api';
import { Scale, Plus, Calendar, User, Maximize2, X, Trash2 } from 'lucide-react';

interface ToolProps {
  projectId: string;
  members: ProjectMember[];
  userRole: 'owner' | 'member' | 'viewer';
  onEnterFocus: () => void;
  isFocusMode: boolean;
}

export const DecisionsTool: React.FC<ToolProps> = ({
  projectId, members, userRole, onEnterFocus, isFocusMode
}) => {
  const [decisions, setDecisions] = useState<DecisionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [decisionDate, setDecisionDate] = useState(new Date().toISOString().split('T')[0]);
  const [whyContext, setWhyContext] = useState('');
  const [details, setDetails] = useState('');
  const [madeBy, setMadeBy] = useState('');
  const [category, setCategory] = useState('Creative Direction');

  useEffect(() => {
    loadDecisions();
  }, [projectId]);

  const loadDecisions = async () => {
    setLoading(true);
    try {
      const data = await api.getDecisions(projectId);
      setDecisions(data.decisions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !whyContext) return;

    try {
      await api.createDecision(projectId, {
        title,
        decision_date: decisionDate,
        why_context: whyContext,
        details,
        made_by: madeBy || 'Project Consensus',
        category
      });
      setTitle('');
      setWhyContext('');
      setDetails('');
      setCreateModal(false);
      loadDecisions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this decision record?')) return;
    try {
      await api.deleteDecision(projectId, id);
      loadDecisions();
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
            <span className="font-mono text-xs text-[#6A1A4C] font-bold">07 : DECISIONS</span>
            <span className="font-mono text-[10px] text-black/60 font-bold uppercase">STRUCTURED CONSENSUS LOG</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-black mt-1">DECISION LOG</h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCreateModal(true)}
            className="btn-editorial-pink text-xs px-4 py-2 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ RECORD DECISION</span>
          </button>

          {!isFocusMode && (
            <button
              onClick={onEnterFocus}
              className="btn-editorial text-xs px-3 py-2 flex items-center gap-1.5"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>ENTER FOCUS ⤢</span>
            </button>
          )}
        </div>
      </div>

      <p className="font-serif text-xs text-wv-dust max-w-2xl">
        Every creative choice has a rationale. Documenting what was chosen and why prevents second-guessing and preserves artistic direction.
      </p>

      {/* Decision Cards */}
      {loading ? (
        <div className="py-12 text-center font-mono text-xs text-wv-dust animate-pulse">
          RETRIEVING LOGS...
        </div>
      ) : decisions.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-wv-border p-6 text-wv-dust">
          <p className="font-display text-lg text-wv-paper">NO DECISIONS RECORDED YET</p>
          <button
            onClick={() => setCreateModal(true)}
            className="btn-editorial-pink mt-4 text-xs px-4 py-2"
          >
            RECORD FIRST DECISION ↗
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {decisions.map((d) => (
            <div
              key={d.id}
              className="p-6 bg-wv-charcoal border border-wv-border hover:border-wv-pink transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between border-b border-wv-border pb-2 mb-4 font-mono text-[10px] text-wv-dust">
                  <span className="text-wv-dustyrose uppercase font-bold">[{d.category || 'CREATIVE'}]</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-wv-pink" />
                    {d.decision_date}
                  </span>
                </div>

                <span className="font-mono text-[9px] uppercase tracking-widest text-wv-dust block mb-1">
                  DECISION:
                </span>
                <h3 className="font-display font-black text-xl text-wv-paper leading-snug">
                  {d.title}
                </h3>

                {/* The "WHY" block */}
                <div className="mt-4 p-3.5 bg-wv-surface border-l-2 border-wv-pink">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-wv-pink font-bold block mb-1">
                    WHY:
                  </span>
                  <p className="font-serif italic text-xs text-wv-paper leading-relaxed">
                    "{d.why_context}"
                  </p>
                </div>

                {d.details && (
                  <p className="font-serif text-xs text-wv-dirtywhite/80 mt-3 leading-relaxed">
                    {d.details}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-wv-border/50 flex items-center justify-between font-mono text-[10px] text-wv-dust">
                <span>MADE BY: <strong className="text-wv-paper uppercase">{d.made_by}</strong></span>
                <button
                  onClick={() => handleDelete(d.id)}
                  className="hover:text-[#6A1A4C] opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove decision"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record Decision Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 bg-wv-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-wv-charcoal border-2 border-wv-paper p-6 ">
            <div className="flex items-center justify-between border-b border-wv-border pb-3 mb-4">
              <h3 className="font-display font-bold text-xl text-wv-paper">RECORD STRUCTURED DECISION</h3>
              <button onClick={() => setCreateModal(false)} className="text-wv-dust hover:text-wv-paper">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase text-wv-dust mb-1">Decision Title / What was decided?</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Keep Final Color Grade Monochrome with Violet Undertones"
                  className="w-full bg-wv-surface border border-wv-border px-3 py-2 text-sm text-wv-paper focus:outline-none focus:border-wv-paper font-bold"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-wv-pink mb-1">WHY / The Artistic Rationale (Crucial)</label>
                <textarea
                  required
                  rows={2}
                  value={whyContext}
                  onChange={(e) => setWhyContext(e.target.value)}
                  placeholder="Explain why: e.g. The visual language should feel archival, tactile, and non-commercial."
                  className="w-full bg-wv-surface border-2 border-wv-pink/60 p-2.5 font-serif italic text-xs text-wv-paper focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs uppercase text-wv-dust mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-wv-surface border border-wv-border px-2.5 py-2 font-mono text-xs text-wv-paper focus:outline-none"
                  >
                    <option value="Creative Direction">Creative Direction</option>
                    <option value="Cinematography">Cinematography</option>
                    <option value="Audio / Score">Audio / Score</option>
                    <option value="Script / Story">Script / Story</option>
                    <option value="Editorial">Editorial</option>
                    <option value="Distribution">Distribution</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-wv-dust mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={decisionDate}
                    onChange={(e) => setDecisionDate(e.target.value)}
                    className="w-full bg-wv-surface border border-wv-border px-3 py-2 font-mono text-xs text-wv-paper focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-wv-dust mb-1">Decided By (Collaborators / Director)</label>
                <input
                  type="text"
                  value={madeBy}
                  onChange={(e) => setMadeBy(e.target.value)}
                  placeholder="e.g. Maya Rao & Sara Khan"
                  className="w-full bg-wv-surface border border-wv-border px-3 py-2 font-mono text-xs text-wv-paper focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-wv-border">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="font-mono text-xs text-wv-dust hover:text-wv-paper"
                >
                  CANCEL
                </button>
                <button type="submit" className="btn-editorial-pink text-xs px-5 py-2">
                  LOG DECISION ↗
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
