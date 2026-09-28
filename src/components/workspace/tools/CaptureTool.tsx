import React, { useState, useEffect } from 'react';
import { CaptureItem, ProjectMember } from '../../../types';
import { api } from '../../../services/api';
import { Bookmark, Pin, Plus, Trash2, Tag, Maximize2, X, ExternalLink, ArrowRight, CheckCircle2, FileText, CheckSquare, Layers } from 'lucide-react';

interface ToolProps {
  projectId: string;
  members: ProjectMember[];
  userRole: 'owner' | 'member' | 'viewer';
  onEnterFocus: () => void;
  isFocusMode: boolean;
}

const CAPTURE_TYPES = ['ALL', 'idea', 'thought', 'note', 'reference', 'link', 'fragment'];

export const CaptureTool: React.FC<ToolProps> = ({
  projectId, members, userRole, onEnterFocus, isFocusMode
}) => {
  const [captures, setCaptures] = useState<CaptureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('ALL');
  const [createModal, setCreateModal] = useState(false);
  const [convertingId, setConvertingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [captureType, setCaptureType] = useState<'idea' | 'thought' | 'note' | 'reference' | 'link' | 'fragment'>('thought');
  const [tagInput, setTagInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    loadCaptures();
  }, [projectId]);

  const loadCaptures = async () => {
    setLoading(true);
    try {
      const data = await api.getCaptures(projectId);
      setCaptures(data.captures || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const tags = tagInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

    try {
      await api.createCapture(projectId, {
        title: title || 'Untitled Fragment',
        content,
        capture_type: captureType,
        tags,
        is_pinned: isPinned ? 1 : 0
      });
      setTitle('');
      setContent('');
      setTagInput('');
      setIsPinned(false);
      setCreateModal(false);
      loadCaptures();
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvert = async (captureId: string, targetType: 'task' | 'asset' | 'milestone' | 'note') => {
    setConvertingId(captureId);
    try {
      await api.convertCapture(projectId, captureId, { target_type: targetType });
      loadCaptures();
    } catch (err) {
      console.error(err);
      alert('Failed to convert creative fragment');
    } finally {
      setConvertingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this creative fragment?')) return;
    try {
      await api.deleteCapture(projectId, id);
      loadCaptures();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCaptures = captures.filter(c => activeType === 'ALL' || c.capture_type === activeType);

  return (
    <div className="space-y-6">
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[2px] border-black pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#6A1A4C] font-bold">06 // CAPTURE</span>
            <span className="font-mono text-[10px] text-black/60 font-bold uppercase">FRAGMENTS, NOTES &amp; REFERENCES</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-black mt-1">NOTES, THOUGHTS &amp; FRAGMENTS</h2>
        </div>

        <div className="flex items-center gap-3">
          {userRole !== 'viewer' && (
            <button
              onClick={() => setCreateModal(true)}
              className="btn-editorial-pink text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ RECORD FRAGMENT</span>
            </button>
          )}

          {!isFocusMode && (
            <button
              onClick={onEnterFocus}
              className="btn-editorial text-xs px-3 py-2 flex items-center gap-1.5 cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>ENTER FOCUS ⤢</span>
            </button>
          )}
        </div>
      </div>

      {/* Type Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b-[2px] border-black pb-3">
        {CAPTURE_TYPES.map(t => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`font-mono text-xs px-3 py-1 border-[2px] transition-all uppercase whitespace-nowrap cursor-pointer ${
              activeType === t
                ? 'border-black bg-black text-white font-bold'
                : 'border-black/30 bg-[#fbf6f0] text-black hover:border-black'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Grid of Creative Notebook Entries */}
      {loading ? (
        <div className="py-12 text-center font-mono text-xs text-black/60 animate-pulse">
          FETCHING SCRATCHPAD...
        </div>
      ) : filteredCaptures.length === 0 ? (
        <div className="border-[2.5px] border-dashed border-black/30 p-8 text-center space-y-3 bg-[#fbf6f0]">
          <Bookmark className="w-8 h-8 text-black/40 mx-auto" />
          <p className="font-fun text-sm text-black/70">
            No fragments or notes recorded under {activeType === 'ALL' ? 'this project' : activeType}.
          </p>
          {userRole !== 'viewer' && (
            <button
              onClick={() => setCreateModal(true)}
              className="btn-editorial-pink mt-2 text-xs px-4 py-2 cursor-pointer"
            >
              + RECORD FIRST FRAGMENT ↗
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
          {filteredCaptures.map((c) => {
            const isConverted = !!c.converted_to;

            return (
              <div
                key={c.id}
                className={`p-5 bg-[#FFFDF9] border-[2.5px] border-black transition-all relative flex flex-col justify-between group shadow-[3px_3px_0px_#000000] ${
                  c.is_pinned ? 'border-l-[6px] border-l-[#6A1A4C]' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-black/15 pb-2 mb-3">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#6A1A4C] font-bold">
                      [{c.capture_type}]
                    </span>
                    {c.is_pinned === 1 && (
                      <span className="flex items-center gap-1 font-mono text-[9px] text-[#6A1A4C] font-bold">
                        <Pin className="w-2.5 h-2.5 fill-current" />
                        PINNED
                      </span>
                    )}
                  </div>

                  <h4 className="font-arthouse font-bold text-base text-black leading-snug">
                    {c.title}
                  </h4>

                  <p className={`mt-3 leading-relaxed ${
                    c.capture_type === 'fragment'
                      ? 'font-fun italic text-sm text-black/90 pl-3 border-l-2 border-[#6A1A4C]'
                      : c.capture_type === 'reference'
                      ? 'font-mono text-xs text-black/90'
                      : 'font-fun text-xs text-black/85'
                  }`}>
                    {c.content}
                  </p>

                  {c.tags && c.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-black/10">
                      {c.tags.map((tag: string) => (
                        <span key={tag} className="font-mono text-[9px] text-black bg-[#fbf6f0] px-1.5 py-0.5 border border-black/30 font-bold">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Conversion Status Badge */}
                  {isConverted && (
                    <div className="mt-3 p-1.5 bg-[#2D7A4C]/10 border border-[#2D7A4C] flex items-center gap-1.5 font-mono text-[10px] text-[#2D7A4C] font-bold uppercase">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>CONVERTED TO {c.converted_to}</span>
                    </div>
                  )}
                </div>

                {/* Conversion & Action Toolbar */}
                <div className="mt-4 pt-3 border-t border-black/15 space-y-2">
                  {userRole !== 'viewer' && !isConverted && (
                    <div className="pt-1 flex items-center justify-between border-b border-black/10 pb-2">
                      <span className="font-mono text-[9px] text-black/50 font-bold uppercase">CONVERT TO:</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleConvert(c.id, 'task')}
                          disabled={convertingId === c.id}
                          className="px-1.5 py-0.5 border border-black font-mono text-[9px] uppercase hover:bg-black hover:text-white transition-colors cursor-pointer"
                          title="Convert to 04 BUILD task"
                        >
                          Task
                        </button>
                        <button
                          onClick={() => handleConvert(c.id, 'asset')}
                          disabled={convertingId === c.id}
                          className="px-1.5 py-0.5 border border-black font-mono text-[9px] uppercase hover:bg-black hover:text-white transition-colors cursor-pointer"
                          title="Convert to 05 STUDIO asset"
                        >
                          Asset
                        </button>
                        <button
                          onClick={() => handleConvert(c.id, 'milestone')}
                          disabled={convertingId === c.id}
                          className="px-1.5 py-0.5 border border-black font-mono text-[9px] uppercase hover:bg-black hover:text-white transition-colors cursor-pointer"
                          title="Convert to 07 MILESTONE"
                        >
                          Milestone
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between font-mono text-[9px] text-black/60">
                    <span>RECORDED BY {c.author_name?.toUpperCase() || 'CREATOR'}</span>
                    {userRole !== 'viewer' && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="opacity-0 group-hover:opacity-100 hover:text-[#C84B31] transition-opacity cursor-pointer p-1"
                        title="Remove note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Record Fragment Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-editorial-fade">
          <div className="w-full max-w-lg bg-[#FFFDF9] border-[2.5px] border-black p-6 shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between border-b-[2px] border-black pb-3 mb-4">
              <div>
                <span className="font-mono text-[10px] text-[#6A1A4C] font-bold uppercase">06 // CAPTURE</span>
                <h3 className="font-arthouse font-black text-xl text-black uppercase">RECORD SCRATCHPAD FRAGMENT</h3>
              </div>
              <button onClick={() => setCreateModal(false)} className="text-black/60 hover:text-black cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase font-bold text-black mb-1">Snippet Title / Catchphrase</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Desert wind acoustic frequency note"
                  className="w-full bg-white border-[2px] border-black p-2.5 font-fun text-sm text-black focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">Fragment Type</label>
                  <select
                    value={captureType}
                    onChange={(e) => setCaptureType(e.target.value as any)}
                    className="w-full bg-white border-[2px] border-black p-2 font-mono text-xs text-black focus:outline-none"
                  >
                    <option value="thought">THOUGHT</option>
                    <option value="idea">IDEA</option>
                    <option value="fragment">DIALOGUE / TEXT FRAGMENT</option>
                    <option value="reference">REFERENCE</option>
                    <option value="link">EXTERNAL LINK</option>
                    <option value="note">STUDIO NOTE</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-black font-bold">
                    <input
                      type="checkbox"
                      checked={isPinned}
                      onChange={(e) => setIsPinned(e.target.checked)}
                      className="accent-[#6A1A4C]"
                    />
                    <span>PIN TO TOP</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase font-bold text-black mb-1">Content / Observation *</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write the raw observation, line of dialogue, acoustic texture, or creative reference..."
                  className="w-full bg-white border-[2px] border-black p-3 font-fun text-sm text-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase font-bold text-black mb-1">Tags (Comma separated)</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="celluloid, audio, rajasthan, dialog"
                  className="w-full bg-white border-[2px] border-black p-2 font-mono text-xs text-black focus:outline-none"
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
                  RECORD NOTE ↗
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
