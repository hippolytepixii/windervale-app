import React, { useState, useEffect } from 'react';
import { DistributionRecord, ProjectMember, RightRecord } from '../../../types';
import { api } from '../../../services/api';
import { Globe, Plus, Calendar, ExternalLink, Trash2, Maximize2, X, Film, Award, Key, Users, Sparkles, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';

interface ToolProps {
  projectId: string;
  members: ProjectMember[];
  userRole: 'owner' | 'member' | 'viewer';
  onEnterFocus: () => void;
  isFocusMode: boolean;
}

const CATEGORIES = ['ALL', 'windervale', 'release', 'festival', 'licensing', 'audience'];

const WINDERVALE_PROGRAMS = [
  { id: 'library', name: 'Editorial Library Feature & Monograph', desc: 'In-depth monograph, editorial essay, and permanent archive publication.' },
  { id: 'anthology', name: 'Windervale Anthology & Screening Series', desc: 'Curated seasonal theatrical showcases, screenings, and community exhibitions.' },
  { id: 'vault', name: 'Permanent Repository & Master Vault', desc: 'Preservation master deposit in the permanent Windervale autonomous repository.' },
  { id: 'grant', name: 'Patron Grant & Production Award Consideration', desc: 'Review for acquisition, finishing fund, or subsequent patron grant.' },
];

export const DistributionTool: React.FC<ToolProps> = ({
  projectId, members, userRole, onEnterFocus, isFocusMode
}) => {
  const [records, setRecords] = useState<DistributionRecord[]>([]);
  const [rights, setRights] = useState<RightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [createModal, setCreateModal] = useState(false);
  const [submitWindervaleModal, setSubmitWindervaleModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Standard Entry form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'release' | 'festival' | 'licensing' | 'audience' | 'windervale'>('release');
  const [status, setStatus] = useState<'planned' | 'submitted' | 'selected' | 'active' | 'completed'>('planned');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [platformOrPartner, setPlatformOrPartner] = useState('');
  const [territoryOrDetails, setTerritoryOrDetails] = useState('');
  const [notes, setNotes] = useState('');
  const [externalUrl, setExternalUrl] = useState('');

  // Licensing specific fields
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [licensee, setLicensee] = useState('');
  const [duration, setDuration] = useState('1 Year');
  const [fee, setFee] = useState<number | ''>('');
  const [exclusivity, setExclusivity] = useState(false);

  // Submit to Windervale form states
  const [wvTitle, setWvTitle] = useState('');
  const [wvProgram, setWvProgram] = useState(WINDERVALE_PROGRAMS[0].name);
  const [wvFormat, setWvFormat] = useState('');
  const [wvPreviewUrl, setWvPreviewUrl] = useState('');
  const [wvStatement, setWvStatement] = useState('');
  const [wvTargetDate, setWvTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [wvConfirmed, setWvConfirmed] = useState(false);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [distData, rightsData] = await Promise.all([
        api.getDistribution(projectId),
        api.getRights(projectId).catch(() => ({ rights: [] }))
      ]);
      setRecords(distData.distribution || []);
      setRights(rightsData.rights || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category) return;

    try {
      await api.createDistribution(projectId, {
        title,
        category,
        status,
        target_date: targetDate,
        platform_or_partner: platformOrPartner || licensee,
        territory_or_details: territoryOrDetails,
        notes,
        external_url: externalUrl,
        asset_id: selectedAssetId || undefined,
        licensee: licensee || undefined,
        duration: duration || undefined,
        fee: fee ? Number(fee) : undefined,
        exclusivity: category === 'licensing' ? exclusivity : undefined,
        approval_status: category === 'licensing' ? 'pending' : undefined
      });
      setTitle('');
      setPlatformOrPartner('');
      setTerritoryOrDetails('');
      setNotes('');
      setExternalUrl('');
      setSelectedAssetId('');
      setLicensee('');
      setDuration('1 Year');
      setFee('');
      setExclusivity(false);
      setCreateModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveLicense = async (recordId: string) => {
    try {
      await api.approveDistribution(projectId, recordId);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to approve license');
    }
  };

  const handleSubmitToWindervale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wvTitle || !wvProgram) return;

    setSubmitting(true);
    try {
      await api.submitToWindervale(projectId, {
        title: wvTitle,
        program: wvProgram,
        format_details: wvFormat,
        notes: wvStatement,
        external_url: wvPreviewUrl,
        target_date: wvTargetDate
      });

      setSubmissionSuccess(true);
      setTimeout(() => {
        setSubmissionSuccess(false);
        setSubmitWindervaleModal(false);
        setWvTitle('');
        setWvFormat('');
        setWvPreviewUrl('');
        setWvStatement('');
        setWvConfirmed(false);
        loadData();
      }, 1600);
    } catch (err: any) {
      alert(err.message || 'Submission to Windervale failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this distribution record?')) return;
    try {
      await api.deleteDistribution(projectId, id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRecords = records.filter(r => activeCategory === 'ALL' || r.category === activeCategory);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'windervale':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'festival':
        return <Award className="w-3.5 h-3.5" />;
      case 'licensing':
        return <Key className="w-3.5 h-3.5" />;
      case 'audience':
        return <Users className="w-3.5 h-3.5" />;
      default:
        return <Film className="w-3.5 h-3.5" />;
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'selected':
      case 'completed':
        return 'bg-[#2D7A4C] text-white';
      case 'active':
        return 'bg-[#6A1A4C] text-white';
      case 'submitted':
        return 'bg-[#C84B31] text-white';
      default:
        return 'bg-black/10 text-black border border-black/30';
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'windervale':
        return '✦ WINDERVALE';
      default:
        return cat;
    }
  };

  // Find linked right for cross-reference
  const selectedRight = rights.find(r => r.id === selectedAssetId);

  return (
    <div className="space-y-6">
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[2px] border-black pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#6A1A4C] font-bold">09 : DISTRIBUTION</span>
            <span className="font-mono text-[10px] text-black/60 font-bold uppercase">RELEASE, FESTIVALS, LICENSING &amp; AUDIENCE</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-black mt-1">DISTRIBUTION &amp; OUTREACH</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {userRole !== 'viewer' && (
            <>
              <button
                onClick={() => setSubmitWindervaleModal(true)}
                className="bg-[#6A1A4C] hover:bg-black text-white font-mono text-xs px-3.5 py-2 border-[2px] border-black flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] cursor-pointer transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>✦ SUBMIT TO WINDERVALE</span>
              </button>

              <button
                onClick={() => setCreateModal(true)}
                className="btn-editorial-pink text-xs px-3.5 py-2 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ ADD ENTRY</span>
              </button>
            </>
          )}

          {!isFocusMode && (
            <button
              onClick={onEnterFocus}
              className="btn-editorial text-xs px-3 py-2 flex items-center gap-1.5"
              title="Focus Mode"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">FOCUS</span>
            </button>
          )}
        </div>
      </div>

      {/* Windervale Curation Desk Submission Station Banner */}
      <div className="border-[2.5px] border-black bg-[#FFFDF9] p-5 shadow-[4px_4px_0px_#000000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] bg-[#6A1A4C] text-white px-2 py-0.5 font-bold uppercase">
              WINDERVALE CURATION &middot; DIRECT DISTRIBUTION
            </span>
            <span className="font-mono text-[9px] text-black/60 font-bold uppercase">
              EDITORIAL INTAKE DESK
            </span>
          </div>
          <h3 className="font-arthouse font-black text-lg text-black uppercase">
            SUBMIT WORK TO WINDERVALE
          </h3>
          <p className="font-fun text-xs text-black/75 max-w-2xl">
            Submit finished cuts, manuscripts, prints, or master files directly to the Windervale Editorial Board for archival preservation, quarterly screenings, or library publication.
          </p>
        </div>
        {userRole !== 'viewer' && (
          <button
            onClick={() => setSubmitWindervaleModal(true)}
            className="shrink-0 bg-black hover:bg-[#6A1A4C] text-white font-mono text-xs uppercase font-bold px-4 py-2.5 border-[2px] border-black cursor-pointer transition-colors shadow-[2px_2px_0px_#6A1A4C] flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>SUBMIT WORK NOW &rarr;</span>
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b-[2px] border-black pb-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 text-xs font-mono font-bold uppercase transition-all ${
              activeCategory === cat
                ? 'bg-black text-white border-[2px] border-black'
                : 'bg-[#fbf6f0] text-black border-[2px] border-black/30 hover:border-black'
            }`}
          >
            {getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      {/* Records Listing */}
      {loading ? (
        <div className="py-12 text-center font-mono text-xs text-black/60 animate-pulse">
          LOADING DISTRIBUTION RECORDS...
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="border-[2.5px] border-dashed border-black/30 p-8 text-center space-y-3 bg-[#fbf6f0]">
          <Globe className="w-8 h-8 text-black/40 mx-auto" />
          <p className="font-fun text-sm text-black/70">
            No distribution or release records registered under {activeCategory === 'ALL' ? 'this project' : activeCategory}.
          </p>
          {userRole !== 'viewer' && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setSubmitWindervaleModal(true)}
                className="bg-[#6A1A4C] text-white font-mono text-xs px-4 py-1.5 border-[2px] border-black hover:bg-black cursor-pointer transition-colors"
              >
                ✦ SUBMIT WORK TO WINDERVALE
              </button>
              <button
                onClick={() => setCreateModal(true)}
                className="btn-editorial text-xs px-4 py-1.5 cursor-pointer"
              >
                + RECORD OTHER DISTRIBUTION
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecords.map((r) => {
            const isWv = r.category === 'windervale';
            const isLicensing = r.category === 'licensing';
            const linkedRight = rights.find(rt => rt.id === r.asset_id);

            return (
              <div
                key={r.id}
                className={`border-[2.5px] border-black bg-[#FFFDF9] p-5 space-y-3 relative group flex flex-col justify-between ${
                  isWv ? 'border-l-[6px] border-l-[#6A1A4C]' : ''
                } ${isLicensing ? 'border-l-[6px] border-l-[#2D7A4C]' : ''}`}
              >
                <div>
                  <div className="flex items-center justify-between border-b border-black/15 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="p-1 bg-[#6A1A4C] text-white">
                        {getCategoryIcon(r.category)}
                      </span>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#6A1A4C]">
                        {isWv ? '✦ WINDERVALE CURATION' : r.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isLicensing && r.approval_status && (
                        <span className={`font-mono text-[9px] uppercase font-bold px-2 py-0.5 border ${
                          r.approval_status === 'approved'
                            ? 'bg-[#2D7A4C]/10 text-[#2D7A4C] border-[#2D7A4C]'
                            : 'bg-[#C84B31]/10 text-[#C84B31] border-[#C84B31]'
                        }`}>
                          {r.approval_status === 'approved' ? '✓ APPROVED' : '⚠ APPROVAL PENDING'}
                        </span>
                      )}
                      <span className={`font-mono text-[9px] uppercase font-bold px-2 py-0.5 ${getStatusBadge(r.status)}`}>
                        {r.status}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-arthouse font-bold text-base text-black mt-2 leading-tight">
                    {r.title}
                  </h3>

                  {(r.platform_or_partner || r.licensee) && (
                    <p className="font-mono text-xs text-black/80 font-bold mt-1">
                      {isLicensing ? 'Licensee' : 'Partner / Platform'}: {r.licensee || r.platform_or_partner}
                    </p>
                  )}

                  {r.territory_or_details && (
                    <p className="font-fun italic text-xs text-black/70 mt-1">
                      Territory / Program: {r.territory_or_details}
                    </p>
                  )}

                  {/* Licensing Cross-Reference Badge */}
                  {isLicensing && (
                    <div className="mt-2.5 p-2 bg-[#fbf6f0] border border-black/20 text-xs font-mono space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-black/60 font-bold">RIGHTS STATUS:</span>
                        <span className="text-[#2D7A4C] font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {linkedRight ? linkedRight.asset_name : 'Project Master Rights'}
                        </span>
                      </div>
                      {r.fee && (
                        <div className="flex items-center justify-between">
                          <span className="text-black/60">LICENSING FEE:</span>
                          <span className="font-bold">₹{r.fee.toLocaleString()}</span>
                        </div>
                      )}
                      {r.duration && (
                        <div className="flex items-center justify-between">
                          <span className="text-black/60">DURATION:</span>
                          <span>{r.duration}</span>
                        </div>
                      )}
                      {r.exclusivity !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-black/60">TERMS:</span>
                          <span className="font-bold">{r.exclusivity ? 'EXCLUSIVE' : 'NON-EXCLUSIVE'}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {r.notes && (
                    <p className="font-fun text-xs text-black/85 leading-relaxed mt-2 pt-2 border-t border-black/10 whitespace-pre-line">
                      {r.notes}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-black/15 flex items-center justify-between font-mono text-[10px] text-black/60">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-black/40" />
                    <span>{r.target_date || 'Date Unscheduled'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isLicensing && r.approval_status === 'pending' && userRole !== 'viewer' && (
                      <button
                        onClick={() => handleApproveLicense(r.id)}
                        className="bg-[#2D7A4C] hover:bg-black text-white font-mono text-[10px] uppercase font-bold px-2 py-1 border border-black cursor-pointer transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>APPROVE LICENSE</span>
                      </button>
                    )}

                    {r.external_url && (
                      <a
                        href={r.external_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 hover:text-[#6A1A4C] transition-colors"
                        title="Open Preview or External URL"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {userRole !== 'viewer' && (
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1 hover:text-[#C84B31] transition-colors cursor-pointer"
                        title="Delete record"
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

      {/* Submit Work to Windervale Modal */}
      {submitWindervaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-editorial-fade">
          <div className="border-[2.5px] border-black bg-[#FFFDF9] max-w-lg w-full p-6 space-y-4 shadow-[0_12px_32px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-[2px] border-black pb-3">
              <div>
                <span className="font-mono text-[10px] text-[#6A1A4C] font-bold uppercase">
                  09 : DISTRIBUTION : DIRECT CURATION INTAKE
                </span>
                <h3 className="font-arthouse font-black text-xl text-black uppercase">
                  SUBMIT WORK TO WINDERVALE
                </h3>
              </div>
              <button
                onClick={() => setSubmitWindervaleModal(false)}
                className="p-1 text-black/60 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submissionSuccess ? (
              <div className="py-10 text-center space-y-3 bg-[#fbf6f0] border-[2px] border-black p-6">
                <CheckCircle2 className="w-10 h-10 text-[#2D7A4C] mx-auto animate-bounce" />
                <h4 className="font-arthouse font-black text-lg text-black uppercase">
                  WORK TRANSMITTED TO WINDERVALE
                </h4>
                <p className="font-fun text-xs text-black/75 max-w-md mx-auto">
                  Your work has been formally submitted to the Windervale Editorial Board. A permanent record has been placed into your distribution ledger.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitToWindervale} className="space-y-4">
                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                    Work Title / Master Cut Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. The Dissolve (Festival Exhibition Cut)"
                    value={wvTitle}
                    onChange={(e) => setWvTitle(e.target.value)}
                    className="w-full p-2.5 bg-white border-[2px] border-black font-fun text-sm text-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                    Windervale Program / Destination Track *
                  </label>
                  <select
                    value={wvProgram}
                    onChange={(e) => setWvProgram(e.target.value)}
                    className="w-full p-2.5 bg-white border-[2px] border-black font-mono text-xs text-black focus:outline-none"
                  >
                    {WINDERVALE_PROGRAMS.map((prog) => (
                      <option key={prog.id} value={prog.name}>
                        {prog.name}
                      </option>
                    ))}
                  </select>
                  <p className="font-fun italic text-[11px] text-black/60 mt-1">
                    {WINDERVALE_PROGRAMS.find(p => p.name === wvProgram)?.desc}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                      Format &amp; Master Medium
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 16mm Telecine, 4K DCP, Letterpress"
                      value={wvFormat}
                      onChange={(e) => setWvFormat(e.target.value)}
                      className="w-full p-2 bg-white border-[2px] border-black font-fun text-sm text-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                      Target Release / Premiere Date
                    </label>
                    <input
                      type="date"
                      value={wvTargetDate}
                      onChange={(e) => setWvTargetDate(e.target.value)}
                      className="w-full p-2 bg-white border-[2px] border-black font-mono text-xs text-black focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                    Secure Preview URL / Master Drive Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://vimeo.com/... or Google Drive master link"
                    value={wvPreviewUrl}
                    onChange={(e) => setWvPreviewUrl(e.target.value)}
                    className="w-full p-2 bg-white border-[2px] border-black font-mono text-xs text-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                    Curatorial Statement &amp; Intent
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe the artistic intent, collaborative process, or why this work belongs in the Windervale archive..."
                    value={wvStatement}
                    onChange={(e) => setWvStatement(e.target.value)}
                    className="w-full p-2.5 bg-white border-[2px] border-black font-fun text-sm text-black focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-[#fbf6f0] border-[1.5px] border-black flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="wvConfirm"
                    required
                    checked={wvConfirmed}
                    onChange={(e) => setWvConfirmed(e.target.checked)}
                    className="mt-0.5 accent-[#6A1A4C]"
                  />
                  <label htmlFor="wvConfirm" className="font-fun text-xs text-black/80 leading-snug cursor-pointer">
                    I confirm that this submission is cleared by project collaborators (01 CREW) and covenants (03 AGREEMENT) for Windervale editorial consideration.
                  </label>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-black/15">
                  <button
                    type="button"
                    onClick={() => setSubmitWindervaleModal(false)}
                    className="px-4 py-2 border border-black font-mono text-xs uppercase text-black hover:bg-black/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#6A1A4C] hover:bg-black text-white font-mono text-xs uppercase font-bold px-5 py-2.5 border-[2px] border-black cursor-pointer transition-colors shadow-[2px_2px_0px_#000000] flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{submitting ? 'TRANSMITTING...' : 'TRANSMIT WORK TO WINDERVALE &rarr;'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Standard Creation Modal with Rights Cross-Reference */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-editorial-fade">
          <div className="border-[2.5px] border-black bg-[#FFFDF9] max-w-lg w-full p-6 space-y-4 shadow-[0_12px_32px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-[2px] border-black pb-3">
              <div>
                <span className="font-mono text-[10px] text-[#6A1A4C] font-bold uppercase">
                  RECORD ENTRY
                </span>
                <h3 className="font-arthouse font-black text-lg text-black uppercase">
                  ADD DISTRIBUTION ITEM
                </h3>
              </div>
              <button
                onClick={() => setCreateModal(false)}
                className="p-1 text-black/60 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                  Title &middot; Entry Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Venice Biennale Screening, Criterion Channel Release, Non-Exclusive VOD"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-white border-[2px] border-black font-fun text-sm text-black focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2 bg-white border-[2px] border-black font-mono text-xs text-black focus:outline-none"
                  >
                    <option value="release">Release &middot; Screenings &middot; Premieres</option>
                    <option value="festival">Festivals &middot; Submissions</option>
                    <option value="licensing">Licensing &middot; Territories</option>
                    <option value="audience">Audience &middot; Distribution Channels</option>
                    <option value="windervale">Windervale &middot; Official Platform Submission &middot; Archive</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                    Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2 bg-white border-[2px] border-black font-mono text-xs text-black focus:outline-none"
                  >
                    <option value="planned">Planned &middot; Pipeline</option>
                    <option value="submitted">Submitted &middot; In Review</option>
                    <option value="selected">Selected &middot; Accepted</option>
                    <option value="active">Active &middot; Currently Streaming/Live</option>
                    <option value="completed">Completed &middot; Archived</option>
                  </select>
                </div>
              </div>

              {/* Rights Cross-Reference Check Panel when Licensing is chosen */}
              {category === 'licensing' && (
                <div className="p-3 bg-[#fbf6f0] border-[2px] border-[#2D7A4C] space-y-3">
                  <div className="flex items-center gap-1.5 text-[#2D7A4C] font-mono text-xs font-bold uppercase">
                    <ShieldCheck className="w-4 h-4" />
                    <span>02 RIGHTS CROSS-REFERENCE CHECK</span>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase font-bold text-black mb-1">
                      Target Creative Asset in Rights Ledger:
                    </label>
                    <select
                      value={selectedAssetId}
                      onChange={(e) => setSelectedAssetId(e.target.value)}
                      className="w-full p-2 bg-white border border-black font-mono text-xs text-black focus:outline-none"
                    >
                      <option value="">Entire Project Master Rights</option>
                      {rights.map(rt => (
                        <option key={rt.id} value={rt.id}>
                          {rt.asset_name} ({rt.asset_type}) &middot; {rt.ownership_percentage}%
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedRight && (
                    <div className="text-[11px] font-mono bg-white p-2 border border-black/20 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-black/60">Asset Territory:</span>
                        <span className="font-bold">{selectedRight.territory || 'Worldwide'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black/60">Asset Exclusivity:</span>
                        <span className="font-bold">{selectedRight.exclusivity || 'Non-Exclusive'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black/60">Licensing Permission:</span>
                        <span className="text-[#2D7A4C] font-bold">
                          {selectedRight.permissions?.licensing !== false ? '✓ PERMITTED' : 'RESTRICTED'}
                        </span>
                      </div>
                      {selectedRight.restrictions && (
                        <div className="text-[#C84B31] font-fun italic pt-1 border-t border-black/10">
                          Restriction: {selectedRight.restrictions}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block font-mono text-[10px] uppercase font-bold text-black mb-1">
                        Licensee
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. MUBI"
                        value={licensee}
                        onChange={(e) => setLicensee(e.target.value)}
                        className="w-full p-1.5 bg-white border border-black font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase font-bold text-black mb-1">
                        Fee (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 50000"
                        value={fee}
                        onChange={(e) => setFee(e.target.value ? Number(e.target.value) : '')}
                        className="w-full p-1.5 bg-white border border-black font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase font-bold text-black mb-1">
                        Duration
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 2 Years"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full p-1.5 bg-white border border-black font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="exclusivityCheck"
                      checked={exclusivity}
                      onChange={(e) => setExclusivity(e.target.checked)}
                      className="accent-[#2D7A4C]"
                    />
                    <label htmlFor="exclusivityCheck" className="font-mono text-xs text-black cursor-pointer font-bold">
                      Grant Exclusive License
                    </label>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full p-2 bg-white border-[2px] border-black font-mono text-xs text-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                    Partner / Platform / Venue
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MUBI, A24, Film Forum, Windervale"
                    value={platformOrPartner}
                    onChange={(e) => setPlatformOrPartner(e.target.value)}
                    className="w-full p-2 bg-white border-[2px] border-black font-fun text-sm text-black focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                  Territory / Scope / Terms
                </label>
                <input
                  type="text"
                  placeholder="e.g. Worldwide Non-Exclusive, North America Theatrical"
                  value={territoryOrDetails}
                  onChange={(e) => setTerritoryOrDetails(e.target.value)}
                  className="w-full p-2.5 bg-white border-[2px] border-black font-fun text-sm text-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                  Notes &middot; Strategy
                </label>
                <textarea
                  rows={3}
                  placeholder="Distribution notes, submission requirements, deliverables, or audience metrics..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-white border-[2px] border-black font-fun text-sm text-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                  External URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  className="w-full p-2 bg-white border-[2px] border-black font-mono text-xs text-black focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-black/15">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="px-4 py-2 border border-black font-mono text-xs uppercase text-black hover:bg-black/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-editorial-pink text-xs px-5 py-2 cursor-pointer"
                >
                  + SAVE ENTRY
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
