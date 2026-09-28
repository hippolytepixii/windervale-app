import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { X, Check, ShieldCheck, ExternalLink, AlertCircle, RefreshCw, UserCheck, UserX, Download, Search, FileText } from 'lucide-react';

interface AdminCurationDeskProps {
  onClose: () => void;
  onActionCompleted?: () => void;
}

export const AdminCurationDesk: React.FC<AdminCurationDeskProps> = ({ onClose, onActionCompleted }) => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ total_applications: number; pending: number; approved: number; rejected: number; total_projects: number } | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeFilter]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [appData, statsData] = await Promise.all([
        api.getApplications(activeFilter, searchQuery),
        api.getAdminStats().catch(() => null)
      ]);
      setApplications(appData.applications || []);
      if (statsData) setStats(statsData.stats);
    } catch (err: any) {
      setError(err.message || 'Failed to load applications from database');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleApprove = async (userId: string) => {
    setActionUserId(userId);
    try {
      await api.approveUser(userId);
      setApplications(prev =>
        prev.map(app => (app.user_id === userId ? { ...app, approval_status: 'approved', verification_status: 'verified' } : app))
      );
      if (stats) {
        setStats({
          ...stats,
          pending: Math.max(0, stats.pending - 1),
          approved: stats.approved + 1
        });
      }
      if (onActionCompleted) onActionCompleted();
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    } finally {
      setActionUserId(null);
    }
  };

  const handleReject = async (userId: string) => {
    const reason = prompt('Enter editorial rejection rationale (or leave default):', 'Application does not meet current editorial focus.');
    if (reason === null) return;
    setActionUserId(userId);
    try {
      await api.rejectUser(userId, reason || 'Does not meet current curation criteria');
      setApplications(prev =>
        prev.map(app => (app.user_id === userId ? { ...app, approval_status: 'rejected', rejection_reason: reason } : app))
      );
      if (stats) {
        setStats({
          ...stats,
          pending: Math.max(0, stats.pending - 1),
          rejected: stats.rejected + 1
        });
      }
      if (onActionCompleted) onActionCompleted();
    } catch (err: any) {
      alert(err.message || 'Rejection failed');
    } finally {
      setActionUserId(null);
    }
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const blob = await api.exportApplicationsCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `windervale_applications_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Failed to export CSV: ' + (err.message || 'Error'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-5xl bg-[#fbf6f0] border-[2.5px] border-black p-5 sm:p-7 space-y-5 my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-[2.5px] border-black pb-4 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase text-[#6A1A4C] font-black tracking-widest">
                WINDERVALE CURATION DESK
              </span>
              <span className="font-mono text-[9px] bg-black text-[#fbf6f0] px-1.5 py-0.2 font-bold uppercase">
                ADMIN DATABASE CONSOLE
              </span>
            </div>
            <h2 className="font-fun font-bold text-2xl sm:text-3xl text-black lowercase tracking-tight mt-0.5">
              candidate applications &amp; monographs
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6A1A4C] hover:bg-[#4a1235] text-white font-mono text-xs font-bold uppercase border-[2px] border-black cursor-pointer transition-colors"
              title="Download full applicants database as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{exporting ? 'EXPORTING...' : 'EXPORT CSV'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 border-[2px] border-black hover:bg-black hover:text-white cursor-pointer transition-colors"
              title="Exit Curation Desk"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
            <div className="p-2.5 bg-white border-[2px] border-black">
              <span className="text-black/60 text-[10px] uppercase block font-bold">TOTAL REGISTERED</span>
              <span className="font-fun font-bold text-xl text-black">{stats.total_applications}</span>
            </div>
            <div className="p-2.5 bg-[#6A1A4C]/10 border-[2px] border-[#6A1A4C]">
              <span className="text-[#6A1A4C] text-[10px] uppercase block font-black">PENDING REVIEW</span>
              <span className="font-fun font-bold text-xl text-[#6A1A4C]">{stats.pending}</span>
            </div>
            <div className="p-2.5 bg-black text-white border-[2px] border-black">
              <span className="text-white/60 text-[10px] uppercase block font-bold">APPROVED FELLOWS</span>
              <span className="font-fun font-bold text-xl text-white">{stats.approved}</span>
            </div>
            <div className="p-2.5 bg-white border-[2px] border-black">
              <span className="text-black/60 text-[10px] uppercase block font-bold">REJECTED</span>
              <span className="font-fun font-bold text-xl text-black">{stats.rejected}</span>
            </div>
          </div>
        )}

        {/* Controls: Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Status Tabs */}
          <div className="flex items-center divide-x-[2px] divide-black border-[2px] border-black bg-white self-start">
            {[
              { id: 'all', label: 'ALL' },
              { id: 'pending', label: 'PENDING' },
              { id: 'approved', label: 'APPROVED' },
              { id: 'rejected', label: 'REJECTED' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3 py-1.5 font-mono text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-black text-[#fbf6f0]'
                    : 'bg-white text-black hover:bg-black/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5 flex-1 sm:max-w-xs">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-black/50 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, craft..."
                className="w-full bg-white border-[2px] border-black pl-8 pr-2.5 py-1.5 font-mono text-xs text-black focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-black text-white font-mono text-xs font-bold uppercase border-[2px] border-black hover:bg-[#6A1A4C] cursor-pointer"
            >
              FIND
            </button>
          </form>
        </div>

        {error && (
          <div className="p-3 bg-black text-white border-[2px] border-black font-mono text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#6A1A4C] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Applications List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {loading ? (
            <div className="py-20 text-center font-mono text-xs text-black animate-pulse font-bold">
              Querying Windervale Curation Database...
            </div>
          ) : applications.length === 0 ? (
            <div className="py-16 text-center border-[2px] border-black bg-white p-6 space-y-2">
              <Check className="w-8 h-8 mx-auto text-black stroke-[2.5]" />
              <h3 className="font-arthouse font-bold text-base text-black uppercase">
                NO APPLICATIONS FOUND
              </h3>
              <p className="font-fun italic text-xs text-black/70">
                No candidate monographs match the selected filter ({activeFilter.toUpperCase()}).
              </p>
            </div>
          ) : (
            applications.map(applicant => {
              const isPending = applicant.approval_status === 'pending';
              const isApproved = applicant.approval_status === 'approved';
              const isRejected = applicant.approval_status === 'rejected';

              return (
                <div
                  key={applicant.user_id}
                  className="border-[2px] border-black bg-white p-5 space-y-4 shadow-none"
                >
                  {/* Top row: Identity & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b-[1.5px] border-black/20 pb-3">
                    <div className="flex items-start gap-3">
                      {applicant.avatar_url ? (
                        <div className="w-13 h-13 border-[2px] border-black overflow-hidden shrink-0 bg-black">
                          <img
                            src={applicant.avatar_url}
                            alt={applicant.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-13 h-13 border-[2px] border-black bg-[#6A1A4C] flex items-center justify-center font-bold text-white text-base shrink-0 font-fun">
                          {applicant.name?.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-fun font-bold text-xl text-black">
                            {applicant.name}
                          </h3>
                          <span className="font-mono text-[9px] text-black/60">
                            [{applicant.email}]
                          </span>
                        </div>
                        <p className="font-mono text-xs text-black/70 mt-0.5">
                          {applicant.location || 'Nomadic'} &middot; {applicant.country || 'Global'} &middot; Registered {new Date(applicant.registered_at).toLocaleDateString()}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {applicant.disciplines?.map((d: string) => (
                            <span
                              key={d}
                              className="font-mono text-[9px] font-bold uppercase px-2 py-0.5 bg-black text-[#fbf6f0]"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 self-start">
                      {isApproved && (
                        <span className="font-mono text-[10px] font-bold uppercase px-2.5 py-1 border-[1.5px] border-black bg-black text-white flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#6A1A4C]" />
                          <span>VERIFIED FELLOW</span>
                        </span>
                      )}
                      {isPending && (
                        <span className="font-mono text-[10px] font-black uppercase px-2.5 py-1 border-[1.5px] border-[#6A1A4C] bg-[#6A1A4C] text-white">
                          PENDING REVIEW
                        </span>
                      )}
                      {isRejected && (
                        <span className="font-mono text-[10px] font-bold uppercase px-2.5 py-1 border-[1.5px] border-black bg-white text-black/70">
                          DECLINED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bio statement */}
                  {applicant.bio && (
                    <p className="font-fun italic text-xs sm:text-sm text-black/90 leading-relaxed bg-[#fbf6f0] p-3 border-l-[3px] border-black">
                      "{applicant.bio}"
                    </p>
                  )}

                  {/* Offerings & Collaboration Seeking */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 border-[1.5px] border-black bg-[#6A1A4C]/5">
                      <span className="font-black text-[10px] uppercase text-[#6A1A4C] block mb-1">
                        WHAT THEY OFFER:
                      </span>
                      <p className="font-fun italic text-xs text-black leading-relaxed">
                        {applicant.offerings || 'None specified.'}
                      </p>
                    </div>
                    <div className="p-3 border-[1.5px] border-black bg-black text-white">
                      <span className="font-black text-[10px] uppercase text-[#fbf6f0] block mb-1">
                        WHAT THEY ARE SEEKING:
                      </span>
                      <p className="font-fun italic text-xs text-white/90 leading-relaxed">
                        {applicant.collaboration_interests || 'Open to independent collaborations.'}
                      </p>
                    </div>
                  </div>

                  {/* Verification Proofs, Portfolios & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-[1.5px] border-black/20 text-xs font-mono">
                    <div className="flex flex-wrap items-center gap-4">
                      {/* ID Document Preview */}
                      {applicant.id_document_url ? (
                        <a
                          href={applicant.id_document_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 font-bold text-[#6A1A4C] hover:underline bg-[#6A1A4C]/10 border border-[#6A1A4C] px-2.5 py-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>VIEW {applicant.id_document_type?.toUpperCase() || 'ID'} DOCUMENT ↗</span>
                        </a>
                      ) : (
                        <span className="text-black/50 italic text-[11px]">No ID document attached</span>
                      )}

                      {/* Portfolio Reel */}
                      {applicant.portfolio_url && (
                        <a
                          href={applicant.portfolio_url.startsWith('http') ? applicant.portfolio_url : `https://${applicant.portfolio_url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-black font-bold hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Portfolio Archive ↗</span>
                        </a>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!isRejected && (
                        <button
                          onClick={() => handleReject(applicant.user_id)}
                          disabled={actionUserId === applicant.user_id}
                          className="px-3.5 py-1.5 border-[2px] border-black bg-white hover:bg-black hover:text-white text-black font-mono text-xs uppercase font-bold cursor-pointer transition-colors"
                        >
                          Decline
                        </button>
                      )}
                      {!isApproved && (
                        <button
                          onClick={() => handleApprove(applicant.user_id)}
                          disabled={actionUserId === applicant.user_id}
                          className="px-4 py-1.5 border-[2px] border-black bg-[#6A1A4C] hover:bg-[#4a1235] text-white font-mono text-xs uppercase font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{actionUserId === applicant.user_id ? 'Approving...' : 'Approve & Verify \u2192'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t-[2.5px] border-black pt-3 font-mono text-xs">
          <button
            onClick={loadData}
            className="flex items-center gap-1 text-black hover:underline cursor-pointer font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Curation Queue</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-black text-white border-[2px] border-black font-bold uppercase cursor-pointer hover:bg-[#6A1A4C]"
          >
            Close Desk
          </button>
        </div>
      </div>
    </div>
  );
};
