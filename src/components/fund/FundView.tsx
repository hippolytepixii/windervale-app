import React, { useState, useEffect } from 'react';
import { FundGrant, Project } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Banknote, Calendar, CheckCircle2, ArrowRight, X, AlertCircle, Sparkles, Clock } from 'lucide-react';

interface FundViewProps {
  onOpenWorkspace: (projectId: string) => void;
}

export const FundView: React.FC<FundViewProps> = ({ onOpenWorkspace }) => {
  const { user } = useAuth();
  const [grants, setGrants] = useState<FundGrant[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyModal, setApplyModal] = useState<FundGrant | null>(null);

  // Application form state
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [proposal, setProposal] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    loadFundData();
  }, []);

  const loadFundData = async () => {
    setLoading(true);
    try {
      const [grantsData, appsData, projsData] = await Promise.all([
        api.getGrants(),
        user ? api.getFundApplications() : Promise.resolve({ applications: [] }),
        user ? api.getProjects() : Promise.resolve({ projects: [] })
      ]);
      setGrants(grantsData.grants || []);
      setApplications(appsData.applications || []);
      setUserProjects(projsData.projects || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyModal || !selectedProjectId || !proposal || !requestedAmount) return;

    setSubmitting(true);
    try {
      await api.applyGrant({
        grant_id: applyModal.id,
        project_id: selectedProjectId,
        proposal,
        requested_amount: parseFloat(requestedAmount)
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setApplyModal(null);
        setProposal('');
        setRequestedAmount('');
        loadFundData();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* Masthead Header */}
      <div className="border-b-2 border-wv-paper pb-8">
        <span className="font-mono text-xs uppercase text-wv-dustyrose">INDEPENDENT CAPITAL ARCHITECTURE</span>
        <h1 className="font-display font-black text-5xl sm:text-6xl text-wv-paper tracking-tight mt-1">
          WINDERVALE FUND
        </h1>
        <p className="font-serif italic text-base text-wv-dirtywhite mt-2 max-w-2xl leading-relaxed">
          Direct, non-dilutive endowment capital supporting experimental moving-image, physical print publications, and acoustic research without commercial studio compromise.
        </p>
      </div>

      {/* User Applications Section (if any exist) */}
      {applications.length > 0 && (
        <div className="p-6 bg-wv-charcoal border border-wv-border">
          <span className="font-mono text-xs uppercase text-wv-pink block mb-3">YOUR ACTIVE GRANT APPLICATIONS</span>
          <div className="space-y-3">
            {applications.map((app) => (
              <div key={app.id} className="p-4 bg-wv-surface border border-wv-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 border border-wv-dustyrose text-wv-dustyrose font-bold">
                      {app.status.toUpperCase()}
                    </span>
                    <h3 className="font-display font-bold text-base text-wv-paper">{app.grant_title}</h3>
                  </div>
                  <p className="font-mono text-xs text-wv-dust mt-1">
                    PROJECT: <strong className="text-wv-paper">{app.project_title}</strong> • REQUESTED: ₹{app.requested_amount?.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => onOpenWorkspace(app.project_id)}
                  className="btn-editorial text-[10px] px-3 py-1.5 self-start sm:self-auto"
                >
                  VIEW PROJECT WORKSPACE ↗
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Grants Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-black text-2xl sm:text-3xl text-wv-paper">
            OPEN ENDOWMENT OPPORTUNITIES
          </h2>
          <span className="font-mono text-xs text-wv-dust">NON-DILUTIVE ARTIST GRANTS</span>
        </div>

        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-wv-dust animate-pulse">
            LOADING FUNDING PORTFOLIO...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {grants.map((grant) => (
              <div
                key={grant.id}
                className="p-8 bg-wv-charcoal border border-wv-border hover:border-wv-paper transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 border-b border-wv-border pb-4 mb-4">
                    <div>
                      <span className="font-mono text-[10px] uppercase text-wv-dust block">
                        FUNDER: {grant.funder_name}
                      </span>
                      <h3 className="font-display font-black text-2xl text-wv-paper mt-1 group-hover:text-wv-dustyrose transition-colors">
                        {grant.title}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="font-display font-black text-2xl sm:text-3xl text-wv-dustyrose">
                        ₹{grant.grant_amount.toLocaleString()}
                      </span>
                      <span className="font-mono text-[9px] uppercase text-wv-dust block">MAX GRANT VALUE</span>
                    </div>
                  </div>

                  <p className="font-serif text-sm text-wv-dirtywhite leading-relaxed mb-4">
                    {grant.description}
                  </p>

                  <div className="p-3.5 bg-wv-surface border border-wv-border/70 mb-4 text-xs font-serif">
                    <strong className="font-mono text-[10px] text-wv-dust uppercase block mb-1">ELIGIBILITY:</strong>
                    {grant.eligibility}
                  </div>

                  {grant.criteria && grant.criteria.length > 0 && (
                    <div className="space-y-1.5 mb-6">
                      <strong className="font-mono text-[10px] text-wv-dust uppercase block">EVALUATION CRITERIA:</strong>
                      {grant.criteria.map((c, i) => (
                        <div key={i} className="flex items-start gap-2 font-mono text-xs text-wv-dust">
                          <CheckCircle2 className="w-3.5 h-3.5 text-wv-dustyrose flex-shrink-0 mt-0.5" />
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-wv-border flex items-center justify-between">
                  <span className="font-mono text-xs text-wv-dust flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-wv-pink" />
                    DEADLINE: {grant.deadline}
                  </span>

                  <button
                    onClick={() => {
                      setApplyModal(grant);
                      setRequestedAmount(grant.grant_amount.toString());
                    }}
                    className="btn-editorial-cobalt text-xs px-5 py-2 flex items-center gap-1.5"
                  >
                    <span>SUBMIT PROPOSAL</span>
                    <span>↗</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {applyModal && (
        <div className="fixed inset-0 z-50 bg-wv-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-wv-charcoal border-2 border-wv-paper p-6 sm:p-8  max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-wv-border pb-3 mb-4">
              <div>
                <span className="font-mono text-xs text-wv-dustyrose uppercase">GRANT APPLICATION PIPELINE</span>
                <h3 className="font-display font-bold text-xl text-wv-paper">
                  Apply for {applyModal.title}
                </h3>
              </div>
              <button onClick={() => setApplyModal(null)} className="text-wv-dust hover:text-wv-paper">
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-8 text-center space-y-2">
                <span className="w-8 h-8 rounded-full bg-wv-dustyrose/20 text-wv-dustyrose flex items-center justify-center mx-auto text-lg">✓</span>
                <p className="font-display font-bold text-lg text-wv-paper">APPLICATION SUBMITTED</p>
                <p className="font-mono text-xs text-wv-dust">Your proposal is queued for jury review.</p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block font-mono text-xs uppercase text-wv-dust mb-1">
                    Select Collaborative Project Workspace
                  </label>
                  <select
                    required
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full bg-wv-surface border border-wv-border p-2.5 font-mono text-xs text-wv-paper focus:outline-none"
                  >
                    <option value="">-- Choose Project Workspace --</option>
                    {userProjects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title} [{p.project_type.toUpperCase()}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-wv-dust mb-1">
                    Requested Grant Amount (INR)
                  </label>
                  <input
                    type="number"
                    required
                    value={requestedAmount}
                    onChange={(e) => setRequestedAmount(e.target.value)}
                    max={applyModal.grant_amount}
                    className="w-full bg-wv-surface border border-wv-border px-3 py-2 font-mono text-sm text-wv-paper focus:outline-none"
                  />
                  <span className="font-mono text-[10px] text-wv-dust mt-1 block">
                    Maximum ceiling for this grant: ₹{applyModal.grant_amount.toLocaleString()}
                  </span>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-wv-dust mb-1">
                    Project Proposal & Methodology
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    placeholder="Outline your creative thesis, material methodology (e.g. 16mm celluloid / reel tape), and how funding will be allocated..."
                    className="w-full bg-wv-surface border border-wv-border p-3 font-serif text-xs text-wv-paper focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-wv-border">
                  <button
                    type="button"
                    onClick={() => setApplyModal(null)}
                    className="font-mono text-xs text-wv-dust hover:text-wv-paper"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !selectedProjectId}
                    className="btn-editorial-cobalt text-xs px-6 py-2.5 disabled:opacity-40"
                  >
                    {submitting ? 'DISPATCHING PROPOSAL...' : 'SUBMIT APPLICATION ↗'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
