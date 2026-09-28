import React, { useState, useEffect } from 'react';
import { OutcomeItem, ProjectMember } from '../../../types';
import { api } from '../../../services/api';
import { Award, Plus, Calendar, ExternalLink, Trash2, Maximize2, X, MapPin } from 'lucide-react';

interface ToolProps {
  projectId: string;
  members: ProjectMember[];
  userRole: 'owner' | 'member' | 'viewer';
  onEnterFocus: () => void;
  isFocusMode: boolean;
}

const OUTCOME_TYPES = ['ALL', 'award', 'press', 'sales', 'collaboration', 'continuation', 'creator_outcome', 'impact_note'];

export const OutcomeTool: React.FC<ToolProps> = ({
  projectId, members, userRole, onEnterFocus, isFocusMode
}) => {
  const [outcomes, setOutcomes] = useState<OutcomeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('ALL');
  const [createModal, setCreateModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [outcomeType, setOutcomeType] = useState<string>('award');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [venueOrChannel, setVenueOrChannel] = useState('');
  const [impactNotes, setImpactNotes] = useState('');
  const [externalUrl, setExternalUrl] = useState('');

  useEffect(() => {
    loadOutcomes();
  }, [projectId]);

  const loadOutcomes = async () => {
    setLoading(true);
    try {
      const data = await api.getOutcomes(projectId);
      setOutcomes(data.outcomes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !outcomeType || !eventDate) return;

    try {
      await api.createOutcome(projectId, {
        title,
        outcome_type: outcomeType as any,
        event_date: eventDate,
        venue_or_channel: venueOrChannel,
        impact_notes: impactNotes,
        external_url: externalUrl
      });
      setTitle('');
      setVenueOrChannel('');
      setImpactNotes('');
      setExternalUrl('');
      setCreateModal(false);
      loadOutcomes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove outcome record?')) return;
    try {
      await api.deleteOutcome(projectId, id);
      loadOutcomes();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOutcomes = outcomes.filter(o => activeType === 'ALL' || o.outcome_type === activeType);

  return (
    <div className="space-y-6">
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[2px] border-black pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#6A1A4C] font-bold">11 // OUTCOME</span>
            <span className="font-mono text-[10px] text-black/60 font-bold uppercase">POST-RELEASE INTELLIGENCE &amp; CONTINUATION</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-black mt-1">PROJECT OUTCOMES &amp; IMPACT</h2>
        </div>

        <div className="flex items-center gap-3">
          {userRole !== 'viewer' && (
            <button
              onClick={() => setCreateModal(true)}
              className="btn-editorial-pink text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ RECORD OUTCOME</span>
            </button>
          )}

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

      <p className="font-serif text-xs text-black/70 max-w-2xl">
        Post-release retrospective record: awards, critical press, sales milestones, follow-on collaborations, and creator trajectory.
      </p>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b-[2px] border-black pb-3">
        {OUTCOME_TYPES.map(t => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`px-3 py-1 text-xs font-mono font-bold uppercase transition-all ${
              activeType === t
                ? 'bg-black text-white border-[2px] border-black'
                : 'bg-[#fbf6f0] text-black border-[2px] border-black/30 hover:border-black'
            }`}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Outcomes Grid */}
      {loading ? (
        <div className="py-12 text-center font-mono text-xs text-black/60 animate-pulse">
          FETCHING OUTCOME ARCHIVE...
        </div>
      ) : filteredOutcomes.length === 0 ? (
        <div className="border-[2.5px] border-dashed border-black/30 p-8 text-center space-y-3 bg-[#fbf6f0]">
          <Award className="w-8 h-8 text-black/40 mx-auto" />
          <p className="font-display font-black text-lg text-black">NO OUTCOMES RECORDED YET</p>
          <p className="font-serif text-xs text-black/60">
            Document what happened because this project existed: awards, press, collaborations, and subsequent career chapters.
          </p>
          {userRole !== 'viewer' && (
            <button
              onClick={() => setCreateModal(true)}
              className="btn-editorial-pink mt-4 text-xs px-4 py-2"
            >
              RECORD PROJECT OUTCOME ↗
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredOutcomes.map((o) => (
            <div
              key={o.id}
              className="p-5 bg-[#FFFDF9] border-[2.5px] border-black shadow-[3px_3px_0px_#000000] flex flex-col justify-between group hover:border-[#6A1A4C] transition-all"
            >
              <div>
                <div className="flex items-center justify-between border-b border-black/15 pb-2 mb-3 font-mono text-[10px] text-black/60">
                  <span className="font-mono text-[9px] uppercase px-2 py-0.5 border border-black bg-[#6A1A4C] text-white font-bold">
                    {o.outcome_type.replace('_', ' ')}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-black/70">
                    <Calendar className="w-3 h-3 text-[#6A1A4C]" />
                    {o.event_date}
                  </span>
                </div>

                <h3 className="font-display font-black text-xl text-black leading-snug">
                  {o.title}
                </h3>

                {o.venue_or_channel && (
                  <p className="font-mono text-xs text-black/80 flex items-center gap-1.5 mt-2 font-bold">
                    <MapPin className="w-3.5 h-3.5 text-[#6A1A4C]" />
                    {o.venue_or_channel}
                  </p>
                )}

                {o.impact_notes && (
                  <p className="font-serif text-xs text-black/80 mt-3 leading-relaxed">
                    {o.impact_notes}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-black/15 flex items-center justify-between font-mono text-[10px] text-black/60 font-bold">
                {o.external_url ? (
                  <a
                    href={o.external_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[#6A1A4C] hover:underline uppercase"
                  >
                    <span>EXTERNAL RECORD</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span>INTERNAL ARCHIVE</span>
                )}

                {userRole !== 'viewer' && (
                  <button
                    onClick={() => handleDelete(o.id)}
                    className="hover:text-[#C84B31] opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove outcome"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record Outcome Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#FFFDF9] border-[2.5px] border-black p-6 shadow-[6px_6px_0px_#000000]">
            <div className="flex items-center justify-between border-b-[2px] border-black pb-3 mb-4">
              <h3 className="font-display font-black text-xl text-black">RECORD PROJECT OUTCOME</h3>
              <button onClick={() => setCreateModal(false)} className="text-black/60 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase text-black/70 font-bold mb-1">Outcome Event / Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Best Experimental Short Award at Oberhausen"
                  className="w-full bg-[#fbf6f0] border-[2px] border-black px-3 py-2 text-sm text-black focus:outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs uppercase text-black/70 font-bold mb-1">Type</label>
                  <select
                    value={outcomeType}
                    onChange={(e) => setOutcomeType(e.target.value)}
                    className="w-full bg-[#fbf6f0] border-[2px] border-black px-2.5 py-2 font-mono text-xs text-black focus:outline-none"
                  >
                    <option value="award">AWARD / RECOGNITION</option>
                    <option value="press">PRESS &amp; REVIEWS</option>
                    <option value="sales">SALES &amp; BOX OFFICE</option>
                    <option value="collaboration">FOLLOW-ON COLLABORATION</option>
                    <option value="continuation">CONTINUATION / SEQUEL</option>
                    <option value="creator_outcome">CREATOR TRAJECTORY / FUNDING</option>
                    <option value="impact_note">IMPACT &amp; RETROSPECTIVE NOTE</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-black/70 font-bold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-[#fbf6f0] border-[2px] border-black px-3 py-2 font-mono text-xs text-black focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-black/70 font-bold mb-1">Venue, Publication or Organisation</label>
                <input
                  type="text"
                  value={venueOrChannel}
                  onChange={(e) => setVenueOrChannel(e.target.value)}
                  placeholder="e.g. Oberhausen Film Festival / Sight &amp; Sound"
                  className="w-full bg-[#fbf6f0] border-[2px] border-black px-3 py-2 font-mono text-xs text-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-black/70 font-bold mb-1">Impact Notes &amp; Retrospective</label>
                <textarea
                  rows={2}
                  value={impactNotes}
                  onChange={(e) => setImpactNotes(e.target.value)}
                  placeholder="What was achieved? How did it affect creator careers, collaborations, or subsequent work?"
                  className="w-full bg-[#fbf6f0] border-[2px] border-black p-2.5 font-serif text-xs text-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-black/70 font-bold mb-1">Documentation Link / Review URL</label>
                <input
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://festival.org/awards/winner"
                  className="w-full bg-[#fbf6f0] border-[2px] border-black px-3 py-2 font-mono text-xs text-black focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t-[2px] border-black">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="font-mono text-xs text-black/60 hover:text-black font-bold"
                >
                  CANCEL
                </button>
                <button type="submit" className="btn-editorial-pink text-xs px-5 py-2">
                  ARCHIVE OUTCOME ↗
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
