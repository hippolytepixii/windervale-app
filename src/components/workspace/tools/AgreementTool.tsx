import React, { useState, useEffect } from 'react';
import { AgreementItem, ProjectMember, RightRecord } from '../../../types';
import { api } from '../../../services/api';
import {
  ScrollText,
  Plus,
  CheckCircle,
  AlertTriangle,
  Maximize2,
  X,
  Trash2,
  PenTool,
  ShieldCheck,
  Users,
  Layers,
  DollarSign,
  FileCheck,
  Check
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface ToolProps {
  projectId: string;
  members: ProjectMember[];
  userRole: 'owner' | 'member' | 'viewer';
  onEnterFocus: () => void;
  isFocusMode: boolean;
  onRefreshProject?: () => void;
  onNavigateModule?: (moduleKey: string) => void;
}

const COVENANT_FLOW_STEPS = [
  '01 PARTIES',
  '02 CONTRIBUTIONS',
  '03 ASSETS',
  '04 OWNERSHIP',
  '05 RIGHTS',
  '06 REVENUE',
  '07 EXPENSES',
  '08 RECOUPMENT',
  '09 DECISION RIGHTS',
  '10 TERM & TERRITORY',
  '11 EXIT & DISPUTES',
  '12 CONFIRMATION'
];

export const AgreementTool: React.FC<ToolProps> = ({
  projectId,
  members,
  userRole,
  onEnterFocus,
  isFocusMode,
  onRefreshProject,
  onNavigateModule
}) => {
  const { user } = useAuth();
  const [agreements, setAgreements] = useState<AgreementItem[]>([]);
  const [rights, setRights] = useState<RightRecord[]>([]);
  const [disclaimer, setDisclaimer] = useState('');
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Form states
  const [title, setTitle] = useState('');
  const [terms, setTerms] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [participantInput, setParticipantInput] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [agreeData, rightsData] = await Promise.all([
        api.getAgreements(projectId),
        api.getRights(projectId)
      ]);
      setAgreements(agreeData.agreements || []);
      setDisclaimer(agreeData.disclaimer || '');
      setRights(rightsData.rights || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !terms) return;

    const parts = participantInput
      ? participantInput.split(',').map((p) => p.trim()).filter(Boolean)
      : members.map((m) => `${m.name} (${m.project_role || m.contribution_area})`);

    try {
      await api.createAgreement(projectId, {
        title,
        terms,
        participants: parts,
        effective_date: effectiveDate
      });
      setTitle('');
      setTerms('');
      setParticipantInput('');
      setCreateModal(false);
      await loadData();
      onRefreshProject?.();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSign = async (id: string) => {
    try {
      await api.signAgreement(projectId, id);
      await loadData();
      onRefreshProject?.();
    } catch (err: any) {
      alert(err.message || 'Unable to confirm agreement');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Archive or remove this covenant from project?')) return;
    try {
      await api.deleteAgreement(projectId, id);
      await loadData();
      onRefreshProject?.();
    } catch (err) {
      console.error(err);
    }
  };

  // Find the active user's specific project role and contribution
  const myMemberRecord = members.find((m) => m.user_id === user?.id);
  const myRights = rights.filter(
    (r) => (r.user_id && r.user_id === user?.id) || (user?.name && r.contributor_name.toLowerCase().includes(user.name.toLowerCase()))
  );
  const myTotalEquity = myRights.reduce((acc, r) => acc + (r.ownership_percentage || 0), 0);

  return (
    <div className="space-y-6">
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[2px] border-black pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#6A1A4C] font-bold">03 : AGREEMENT</span>
            <span className="font-mono text-[10px] text-black/60 font-bold uppercase">
              COVENANTS &amp; DIGITAL CONFIRMATIONS
            </span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-black mt-1">
            PROJECT COVENANT &amp; DIGITAL CHARTER
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {userRole === 'owner' && (
            <button
              onClick={() => setCreateModal(true)}
              className="btn-editorial-wine text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ NEW COVENANT</span>
            </button>
          )}

          {!isFocusMode && (
            <button
              onClick={onEnterFocus}
              className="btn-editorial text-xs px-3 py-2 flex items-center gap-1.5"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>FOCUS</span>
            </button>
          )}
        </div>
      </div>

      {/* Structured Covenant Lifecycle Bar */}
      <div className="border-[2px] border-black bg-[#fbf6f0] p-4 shadow-[2px_2px_0px_0px_#000] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="font-mono text-[10px] text-black/60 uppercase font-bold tracking-wider">
            STRUCTURED COVENANT FLOW
          </span>
          <span className="font-mono text-[10px] text-[#6A1A4C] font-bold uppercase">
            LIVE PROJECT DATA LINKED
          </span>
        </div>

        {/* 12-Gate Horizontal Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {COVENANT_FLOW_STEPS.map((step, idx) => (
            <span
              key={step}
              className={`px-2 py-0.5 font-mono text-[9px] uppercase font-bold border border-black ${
                idx <= 5 ? 'bg-black text-white' : 'bg-white text-black/70'
              }`}
            >
              {step}
            </span>
          ))}
        </div>
      </div>

      {/* "YOU ARE AGREEING TO:" - PERSONALIZED COVENANT BREAKDOWN */}
      <div className="border-[2.5px] border-black bg-white p-6 shadow-[3px_3px_0px_0px_#000] space-y-4">
        <div className="flex items-center justify-between border-b-[2px] border-black pb-3">
          <div>
            <span className="font-mono text-[10px] uppercase font-bold text-[#6A1A4C] tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              PERSONALIZED CONTRACTUAL SUMMARY
            </span>
            <h3 className="font-display font-black text-xl text-black">
              You are agreeing to:
            </h3>
          </div>
          <span className="font-mono text-xs font-bold text-black uppercase bg-[#fbf6f0] px-2.5 py-1 border border-black">
            PRACTITIONER : {user?.name || 'Current Collaborator'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          {/* Contribution */}
          <div className="bg-[#fbf6f0] p-3.5 border border-black/20 space-y-1">
            <span className="font-bold text-[9px] uppercase text-black/50 block">
              YOUR ROLE &amp; CONTRIBUTION:
            </span>
            <p className="font-fun font-bold text-sm text-black">
              {myMemberRecord?.project_role || myMemberRecord?.contribution_area || 'Creative Collaborator'}
            </p>
            <p className="font-fun text-xs text-black/75">
              {myMemberRecord?.contribution || 'Standard project contribution as assigned.'}
            </p>
          </div>

          {/* Ownership */}
          <div className="bg-[#fbf6f0] p-3.5 border border-black/20 space-y-1">
            <span className="font-bold text-[9px] uppercase text-black/50 block">
              RECORDED IP OWNERSHIP:
            </span>
            <p className="font-mono font-black text-xl text-[#6A1A4C]">
              {myTotalEquity}%
            </p>
            <p className="font-fun text-[11px] text-black/60">
              Reflected in 02 RIGHTS Ledger across {myRights.length} asset{myRights.length !== 1 ? 's' : ''}.
            </p>
          </div>

          {/* Revenue Split */}
          <div className="bg-[#fbf6f0] p-3.5 border border-black/20 space-y-1">
            <span className="font-bold text-[9px] uppercase text-black/50 block">
              REVENUE ENTITLEMENT:
            </span>
            {myRights.length > 0 ? (
              <div className="text-[11px] space-y-0.5">
                <div>Streaming: {myRights[0]?.revenue_splits?.streaming ?? myTotalEquity}%</div>
                <div>Sync / Lic: {myRights[0]?.revenue_splits?.sync ?? myTotalEquity}%</div>
              </div>
            ) : (
              <p className="font-fun text-xs text-black/70">As per project revenue waterfall.</p>
            )}
            <p className="font-fun text-[10px] text-black/50">Calculated in 08 MONEY.</p>
          </div>

          {/* Moral Rights & Approvals */}
          <div className="bg-[#fbf6f0] p-3.5 border border-black/20 space-y-1">
            <span className="font-bold text-[9px] uppercase text-black/50 block">
              PERMANENT ATTRIBUTION:
            </span>
            <p className="font-fun text-xs text-black font-bold">
              Irrevocable Cinema-Grade Colophon Credit
            </p>
            <p className="font-fun text-[11px] text-black/70">
              Preserved in 10 CREDITS and Creative Dossier history.
            </p>
          </div>
        </div>
      </div>

      {/* Agreements List */}
      <div className="space-y-4">
        {agreements.map((agr) => {
          const signatures = agr.signed_by || [];
          const isSignedByMe = user && signatures.some((s) => s.user_id === user.id);
          const isRatified = agr.status === 'agreed' || signatures.length >= members.length;

          return (
            <div
              key={agr.id}
              className="border-[2.5px] border-black bg-white p-6 space-y-4 shadow-[2px_2px_0px_0px_#000]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/15 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs uppercase font-bold text-[#6A1A4C]">
                      COVENANT CHARTER
                    </span>
                    <span
                      className={`font-mono text-[9px] uppercase font-bold px-2 py-0.5 border border-black ${
                        isRatified
                          ? 'bg-[#2D7A4C] text-white'
                          : 'bg-[#C84B31] text-white'
                      }`}
                    >
                      {isRatified ? 'RATIFIED : EFFECTIVE' : 'PENDING COLLABORATOR SIGNATURES'}
                    </span>
                  </div>
                  <h3 className="font-fun font-bold text-xl text-black mt-1">
                    {agr.title}
                  </h3>
                  {agr.effective_date && (
                    <span className="font-mono text-[10px] text-black/60">
                      EFFECTIVE DATE : {agr.effective_date}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {!isSignedByMe ? (
                    <button
                      onClick={() => handleSign(agr.id)}
                      className="px-4 py-2 bg-[#6A1A4C] hover:bg-black text-white font-mono text-xs uppercase font-bold border border-black cursor-pointer transition-colors flex items-center gap-1.5 animate-pulse"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>SIGN &amp; RATIFY COVENANT</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1 bg-[#2D7A4C]/15 border border-[#2D7A4C] text-[#2D7A4C] font-mono text-xs font-bold uppercase flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      SIGNED BY YOU
                    </span>
                  )}

                  {userRole === 'owner' && (
                    <button
                      onClick={() => handleDelete(agr.id)}
                      className="p-1.5 text-black/40 hover:text-[#C84B31] border border-black/20 hover:border-black cursor-pointer"
                      title="Archive Covenant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Terms Body */}
              <div className="bg-[#fbf6f0] p-4 border border-black/20 font-mono text-xs text-black/85 whitespace-pre-line leading-relaxed max-h-72 overflow-y-auto">
                {agr.terms}
              </div>

              {/* Signatures Roster */}
              <div className="border-t border-black/15 pt-3">
                <span className="font-mono text-[10px] text-black/60 uppercase font-bold block mb-2">
                  CONFIRMATION STATUS ({signatures.length}/{members.length} COLLABORATORS SIGNED):
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {members.map((m) => {
                    const hasSigned = signatures.some((s) => s.user_id === m.user_id);
                    return (
                      <span
                        key={m.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10px] uppercase font-bold border border-black ${
                          hasSigned ? 'bg-black text-white' : 'bg-white text-black/60 border-dashed'
                        }`}
                      >
                        {hasSigned ? <Check className="w-3 h-3 text-white" /> : <Clock className="w-3 h-3 text-black/40" />}
                        {m.name} ({m.project_role || m.role})
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE COVENANT MODAL */}
      {createModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#fbf6f0] border-[2.5px] border-black p-6 space-y-4 shadow-[4px_4px_0px_0px_#000]">
            <div className="flex items-center justify-between border-b-[2px] border-black pb-3">
              <div>
                <span className="font-mono text-[10px] text-[#6A1A4C] font-bold uppercase">
                  PROJECT COVENANT AUTHORING
                </span>
                <h3 className="font-fun font-bold text-xl text-black">
                  Draft Project Covenant Charter
                </h3>
              </div>
              <button
                onClick={() => setCreateModal(false)}
                className="p-1 hover:bg-black hover:text-white border border-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                  Covenant Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-white border-[2px] border-black font-fun text-sm text-black focus:outline-none"
                  placeholder="e.g. Master Production Covenant &amp; Mutual Consensus Charter"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                  Effective Date
                </label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full p-2.5 bg-white border-[2px] border-black font-mono text-sm text-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                  Covenant Terms &amp; Articles *
                </label>
                <textarea
                  rows={8}
                  required
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full p-2.5 bg-white border-[2px] border-black font-mono text-xs text-black focus:outline-none"
                  placeholder="1. CREATIVE AUTONOMY &amp; INTEGRITY&#10;2. OWNERSHIP &amp; REVENUE SPLITS&#10;3. DECISION RIGHTS&#10;4. CREDITS &amp; ATTRIBUTION"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/15">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="px-4 py-2 border-[2px] border-black font-mono text-xs uppercase font-bold text-black hover:bg-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-editorial-wine text-xs px-5 py-2 cursor-pointer font-bold"
                >
                  PUBLISH COVENANT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Legal Consensus Disclaimer */}
      <div className="border border-black/20 bg-[#fbf6f0] p-3 text-black/60 font-mono text-[10px] leading-relaxed">
        {disclaimer}
      </div>
    </div>
  );
};

function Clock({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );
}
