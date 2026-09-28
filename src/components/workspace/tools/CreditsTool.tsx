import React, { useState, useEffect } from 'react';
import { CreditItem, ProjectMember } from '../../../types';
import { api } from '../../../services/api';
import { Plus, Trash2, Maximize2, X, RefreshCw, Users, CheckCircle2 } from 'lucide-react';

interface ToolProps {
  projectId: string;
  members: ProjectMember[];
  userRole: 'owner' | 'member' | 'viewer';
  onEnterFocus: () => void;
  isFocusMode: boolean;
}

export const CreditsTool: React.FC<ToolProps> = ({
  projectId, members, userRole, onEnterFocus, isFocusMode
}) => {
  const [credits, setCredits] = useState<CreditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Form states
  const [roleTitle, setRoleTitle] = useState('');
  const [contributorName, setContributorName] = useState('');
  const [notes, setNotes] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);

  useEffect(() => {
    loadCredits();
  }, [projectId]);

  const loadCredits = async () => {
    setLoading(true);
    try {
      const data = await api.getCredits(projectId);
      setCredits(data.credits || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleTitle || !contributorName) return;

    try {
      await api.createCredit(projectId, {
        role_title: roleTitle.toUpperCase(),
        contributor_name: contributorName,
        notes,
        display_order: Number(displayOrder)
      });
      setRoleTitle('');
      setContributorName('');
      setNotes('');
      setCreateModal(false);
      loadCredits();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSyncCrew = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await api.syncCrewCredits(projectId);
      setSyncMessage(res.message || 'Synced credits from confirmed crew');
      await loadCredits();
      setTimeout(() => setSyncMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
      alert('Failed to sync crew credits: ' + (err.message || 'Server error'));
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove credit attribution?')) return;
    try {
      await api.deleteCredit(projectId, id);
      loadCredits();
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
            <span className="font-mono text-xs text-[#6A1A4C] font-bold">10 // CREDITS</span>
            <span className="font-mono text-[10px] text-black/60 font-bold uppercase">PERMANENT CONTRIBUTOR RECORD</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-black mt-1">PROJECT CREDITS &amp; COLOPHON</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {userRole !== 'viewer' && (
            <>
              <button
                onClick={handleSyncCrew}
                disabled={syncing}
                className="bg-[#2D7A4C] hover:bg-black text-white font-mono text-xs px-3.5 py-2 border-[2px] border-black flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] cursor-pointer transition-all"
                title="Automatically import all confirmed crew members and their contributions into credits"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>+ SYNC FROM CREW</span>
              </button>

              <button
                onClick={() => setCreateModal(true)}
                className="btn-editorial-pink text-xs px-3.5 py-2 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ ADD CREDIT</span>
              </button>
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

      {syncMessage && (
        <div className="p-3 bg-[#2D7A4C]/10 border-[2px] border-[#2D7A4C] flex items-center gap-2 font-mono text-xs text-[#2D7A4C] font-bold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      <p className="font-fun text-xs text-black/75 max-w-2xl">
        Permanent contributor colophon. Unlike ephemeral social media tags, credits here are permanent records of everyone who shaped the work, cross-referenced against confirmed crew roles and contributions.
      </p>

      {/* Credits Film Slate Scroll Layout */}
      {loading ? (
        <div className="py-12 text-center font-mono text-xs text-black/60 animate-pulse">
          PREPARING CREDIT ROSTER...
        </div>
      ) : credits.length === 0 ? (
        <div className="py-16 text-center border-[2.5px] border-dashed border-black/30 p-6 bg-[#fbf6f0] text-black/70 space-y-3">
          <p className="font-arthouse font-black text-lg text-black">NO CREDITS ATTRIBUTED YET</p>
          <p className="font-fun text-xs text-black/60">Acknowledge all key contributors, artists, technicians, and advisors.</p>
          {userRole !== 'viewer' && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleSyncCrew}
                className="bg-[#2D7A4C] text-white font-mono text-xs px-4 py-2 border-[2px] border-black hover:bg-black cursor-pointer transition-colors"
              >
                + SYNC CONFIRMED CREW TO CREDITS
              </button>
              <button
                onClick={() => setCreateModal(true)}
                className="btn-editorial text-xs px-4 py-2 cursor-pointer"
              >
                RECORD INDIVIDUAL CREDIT ↗
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto py-12 px-6 sm:px-12 bg-[#FFFDF9] border-[2.5px] border-black shadow-[4px_4px_0px_#000000] space-y-10 text-center relative">
          {/* Film Edge Registration */}
          <div className="flex justify-between font-mono text-[9px] text-black/40 border-b border-black/20 pb-2">
            <span>START OF MASTER TITLES</span>
            <span>ROLL 01 // AUDIO &amp; OPTICAL TRACK</span>
          </div>

          <div className="space-y-10">
            {credits.map((c) => (
              <div key={c.id} className="relative group py-2">
                <span className="font-mono text-[10px] tracking-[0.25em] text-[#6A1A4C] font-bold uppercase block mb-1">
                  {c.role_title}
                </span>

                <h3 className="font-arthouse font-black text-2xl sm:text-3xl text-black tracking-wider uppercase">
                  {c.contributor_name}
                </h3>

                {c.notes && (
                  <p className="font-fun italic text-xs text-black/70 mt-1">
                    {c.notes}
                  </p>
                )}

                {userRole !== 'viewer' && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="absolute -right-2 top-2 p-1.5 text-black/40 hover:text-[#C84B31] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Remove credit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-black/20 font-mono text-[9px] text-black/50 font-bold uppercase tracking-wider">
            PERMANENTLY PRESERVED IN WINDERVALE AUTONOMOUS ARCHIVE
          </div>
        </div>
      )}

      {/* Add Credit Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-editorial-fade">
          <div className="w-full max-w-lg bg-[#FFFDF9] border-[2.5px] border-black p-6 shadow-[6px_6px_0px_#000000]">
            <div className="flex items-center justify-between border-b-[2px] border-black pb-3 mb-4">
              <div>
                <span className="font-mono text-[10px] text-[#6A1A4C] font-bold uppercase">10 // CREDITS</span>
                <h3 className="font-arthouse font-black text-xl text-black uppercase">RECORD CREDIT ATTRIBUTION</h3>
              </div>
              <button onClick={() => setCreateModal(false)} className="text-black/60 hover:text-black cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase text-black font-bold mb-1">Credit Title / Attribution *</label>
                <input
                  type="text"
                  required
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. DIRECTED BY, SOUND DESIGN, CINEMATOGRAPHY, LEAD ACTOR"
                  className="w-full bg-[#fbf6f0] border-[2px] border-black p-2.5 text-sm text-black focus:outline-none uppercase font-mono"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-black font-bold mb-1">Contributor Name *</label>
                <input
                  type="text"
                  required
                  value={contributorName}
                  onChange={(e) => setContributorName(e.target.value)}
                  placeholder="e.g. Maya Rao"
                  className="w-full bg-[#fbf6f0] border-[2px] border-black p-2.5 font-arthouse font-bold text-base text-black focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs uppercase text-black font-bold mb-1">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                    className="w-full bg-[#fbf6f0] border-[2px] border-black p-2 font-mono text-xs text-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-black font-bold mb-1">Contribution Detail / Medium</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. 16mm Camera Operation, Modular Synthesizer"
                    className="w-full bg-[#fbf6f0] border-[2px] border-black p-2 font-fun text-xs text-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t-[2px] border-black">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="font-mono text-xs text-black/60 hover:text-black font-bold uppercase cursor-pointer"
                >
                  CANCEL
                </button>
                <button type="submit" className="btn-editorial-pink text-xs px-5 py-2 cursor-pointer">
                  RECORD CREDIT ↗
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
