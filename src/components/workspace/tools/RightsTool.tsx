import React, { useState, useEffect } from 'react';
import { RightRecord, ProjectMember } from '../../../types';
import { api } from '../../../services/api';
import {
  Shield,
  Plus,
  Trash2,
  Maximize2,
  X,
  PieChart,
  Key,
  DollarSign,
  Award,
  Layers,
  CheckCircle2,
  Globe,
  Clock,
  Lock,
  FileCheck
} from 'lucide-react';

interface ToolProps {
  projectId: string;
  members: ProjectMember[];
  userRole: 'owner' | 'member' | 'viewer';
  onEnterFocus: () => void;
  isFocusMode: boolean;
  onNavigateModule?: (moduleKey: string) => void;
}

const ASSET_TYPES = [
  'Composition',
  'Master Recording',
  'Script / Screenplay',
  'Footage / Film Print',
  'Photograph',
  'Illustration',
  'Artwork',
  'Manuscript',
  'Final Master Film',
  'Packaging / Identity',
  'Other Creative Asset'
];

const PERMISSION_OPTIONS = [
  { id: 'reproduce', label: 'Reproduce' },
  { id: 'distribute', label: 'Distribute' },
  { id: 'license', label: 'License' },
  { id: 'adapt', label: 'Adapt' },
  { id: 'publish', label: 'Publish' },
  { id: 'exhibit', label: 'Exhibit' },
  { id: 'sync', label: 'Synchronize (Sync)' },
  { id: 'sublicense', label: 'Sublicense' },
  { id: 'monetize', label: 'Monetize' }
];

export const RightsTool: React.FC<ToolProps> = ({
  projectId,
  members,
  userRole,
  onEnterFocus,
  isFocusMode,
  onNavigateModule
}) => {
  const [rights, setRights] = useState<RightRecord[]>([]);
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [disclaimer, setDisclaimer] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeAssetFilter, setActiveAssetFilter] = useState('ALL');
  const [createModal, setCreateModal] = useState(false);

  // Form states
  const [contributorName, setContributorName] = useState('');
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('');
  const [ownershipPercentage, setOwnershipPercentage] = useState('50');
  const [assetName, setAssetName] = useState('Master Creative Asset');
  const [assetType, setAssetType] = useState(ASSET_TYPES[0]);
  const [permissions, setPermissions] = useState<string[]>(['reproduce', 'distribute', 'monetize']);
  const [territory, setTerritory] = useState('Worldwide');
  const [duration, setDuration] = useState('Perpetual');
  const [exclusivity, setExclusivity] = useState<'exclusive' | 'non-exclusive'>('non-exclusive');
  const [restrictions, setRestrictions] = useState('');
  const [approvalRequirements, setApprovalRequirements] = useState('');
  const [streamingSplit, setStreamingSplit] = useState('50');
  const [syncSplit, setSyncSplit] = useState('50');
  const [licensingSplit, setLicensingSplit] = useState('50');
  const [rightsDetails, setRightsDetails] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadRights();
  }, [projectId]);

  const loadRights = async () => {
    setLoading(true);
    try {
      const data = await api.getRights(projectId);
      setRights(data.rights || []);
      setTotalPercentage(data.totalPercentage || 0);
      setDisclaimer(data.disclaimer || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributorName || !role || !ownershipPercentage) return;

    try {
      await api.createRight(projectId, {
        contributor_name: contributorName,
        user_id: userId || undefined,
        role,
        ownership_percentage: parseFloat(ownershipPercentage),
        asset_name: assetName || 'Project IP',
        asset_type: assetType,
        permissions,
        territory: territory || 'Worldwide',
        duration: duration || 'Perpetual',
        exclusivity,
        restrictions,
        approval_requirements: approvalRequirements,
        revenue_splits: {
          streaming: parseFloat(streamingSplit) || 0,
          sync: parseFloat(syncSplit) || 0,
          licensing: parseFloat(licensingSplit) || 0
        },
        rights_details: rightsDetails,
        notes
      });

      // Reset form
      setContributorName('');
      setUserId('');
      setRole('');
      setOwnershipPercentage('50');
      setRestrictions('');
      setApprovalRequirements('');
      setRightsDetails('');
      setNotes('');
      setCreateModal(false);
      loadRights();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this rights record from ledger?')) return;
    try {
      await api.deleteRight(projectId, id);
      loadRights();
    } catch (err) {
      console.error(err);
    }
  };

  const togglePermission = (permId: string) => {
    if (permissions.includes(permId)) {
      setPermissions(permissions.filter((p) => p !== permId));
    } else {
      setPermissions([...permissions, permId]);
    }
  };

  const handleSelectMember = (memberId: string) => {
    setUserId(memberId);
    const m = members.find((x) => x.user_id === memberId);
    if (m) {
      setContributorName(m.name);
      setRole(m.project_role || m.contribution_area || 'Creative Contributor');
    }
  };

  // Distinct assets list
  const assetNames = Array.from(new Set(rights.map((r) => r.asset_name || 'Project IP')));
  const filteredRights = rights.filter((r) => {
    if (activeAssetFilter === 'ALL') return true;
    return (r.asset_name || 'Project IP') === activeAssetFilter;
  });

  return (
    <div className="space-y-6">
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[2px] border-black pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#6A1A4C] font-bold">02 // RIGHTS</span>
            <span className="font-mono text-[10px] text-black/60 font-bold uppercase">
              OWNERSHIP, PERMISSIONS, LICENSING &amp; REVENUE ALLOCATIONS
            </span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-black mt-1">
            STRUCTURED RIGHTS LEDGER
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {userRole === 'owner' && (
            <button
              onClick={() => setCreateModal(true)}
              className="btn-editorial-wine text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ RECORD RIGHTS / SPLIT</span>
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

      {/* Structured Ledger Summary & Architecture Notice */}
      <div className="border-[2px] border-black bg-[#fbf6f0] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[2px_2px_0px_0px_#000]">
        <div>
          <span className="font-mono text-[10px] text-black/60 uppercase font-bold tracking-wider">
            RIGHTS ARCHITECTURE
          </span>
          <p className="font-fun text-sm text-black font-bold">
            Asset-level ownership % and commercial revenue % are distinct allocations.
          </p>
          <p className="font-fun text-xs text-black/75">
            Rights feed directly into 03 AGREEMENT covenants, 08 MONEY waterfall payouts, and 09 DISTRIBUTION license validations.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="font-mono text-[10px] text-black/60 uppercase block">
              TOTAL EQUITY RECORDED
            </span>
            <span className="font-mono text-xl font-black text-black">
              {totalPercentage}%
            </span>
          </div>
          <div className="w-16 h-4 bg-white border border-black overflow-hidden flex">
            <div
              className={`h-full ${
                totalPercentage === 100
                  ? 'bg-[#2D7A4C]'
                  : totalPercentage > 100
                  ? 'bg-[#C84B31]'
                  : 'bg-[#6A1A4C]'
              }`}
              style={{ width: `${Math.min(totalPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Asset Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b-[2px] border-black pb-2">
        <span className="font-mono text-[10px] uppercase font-bold text-black/60 mr-2 flex items-center gap-1">
          <Layers className="w-3 h-3 text-[#6A1A4C]" />
          ASSET LEDGER:
        </span>
        <button
          onClick={() => setActiveAssetFilter('ALL')}
          className={`px-3 py-1 font-mono text-[10px] uppercase font-bold border border-black transition-colors cursor-pointer ${
            activeAssetFilter === 'ALL'
              ? 'bg-black text-white'
              : 'bg-[#fbf6f0] text-black hover:bg-white'
          }`}
        >
          ALL ASSETS ({rights.length})
        </button>
        {assetNames.map((an) => (
          <button
            key={an}
            onClick={() => setActiveAssetFilter(an)}
            className={`px-3 py-1 font-mono text-[10px] uppercase font-bold border border-black transition-colors cursor-pointer ${
              activeAssetFilter === an
                ? 'bg-[#6A1A4C] text-white'
                : 'bg-[#fbf6f0] text-black hover:bg-white'
            }`}
          >
            {an}
          </button>
        ))}
      </div>

      {/* Rights Records Table / Cards */}
      {filteredRights.length === 0 ? (
        <div className="p-8 text-center border-[2px] border-dashed border-black/30 bg-[#fbf6f0] space-y-2">
          <p className="font-fun text-sm text-black/70">
            No rights entries logged for this asset yet.
          </p>
          {userRole === 'owner' && (
            <button
              onClick={() => setCreateModal(true)}
              className="btn-editorial-wine text-xs px-4 py-2 cursor-pointer mt-1"
            >
              + RECORD FIRST RIGHT / SPLIT
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRights.map((r) => {
            const revSplits = r.revenue_splits || {};
            const perms = r.permissions || ['reproduce', 'distribute'];

            return (
              <div
                key={r.id}
                className="border-[2px] border-black bg-white p-5 shadow-[2px_2px_0px_0px_#000] space-y-4"
              >
                {/* Header row: Contributor + Asset Name + Ownership */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/15 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-black text-white font-mono text-[10px] uppercase font-bold">
                      {r.asset_type || 'Creative Asset'}
                    </span>
                    <div>
                      <h4 className="font-fun font-bold text-lg text-black leading-tight">
                        {r.contributor_name}
                      </h4>
                      <span className="font-mono text-xs text-black/60">
                        {r.role} &middot; Asset: <strong>{r.asset_name || 'Project IP'}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="font-mono text-[9px] uppercase text-black/50 block font-bold">
                        IP OWNERSHIP
                      </span>
                      <span className="font-mono text-xl font-black text-[#6A1A4C]">
                        {r.ownership_percentage}%
                      </span>
                    </div>

                    {userRole === 'owner' && (
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 text-black/40 hover:text-[#C84B31] border border-black/20 hover:border-black cursor-pointer"
                        title="Delete Rights Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid: Permissions, Terms, Revenue Splits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                  {/* Column 1: Permissions */}
                  <div className="bg-[#fbf6f0] p-3 border border-black/15 space-y-2">
                    <span className="font-bold text-[9px] text-black/60 uppercase block">
                      AUTHORIZED PERMISSIONS:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {perms.map((p) => (
                        <span
                          key={p}
                          className="px-1.5 py-0.5 bg-white border border-black/40 text-[9px] uppercase text-black font-bold"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Column 2: Licensing Terms */}
                  <div className="bg-[#fbf6f0] p-3 border border-black/15 space-y-1.5">
                    <span className="font-bold text-[9px] text-black/60 uppercase block">
                      LICENSING PARAMETERS:
                    </span>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-black/60">Territory:</span>
                      <span className="font-bold text-black">{r.territory || 'Worldwide'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-black/60">Duration:</span>
                      <span className="font-bold text-black">{r.duration || 'Perpetual'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-black/60">Exclusivity:</span>
                      <span className="font-bold uppercase text-black">
                        {r.exclusivity || 'non-exclusive'}
                      </span>
                    </div>
                    {r.approval_requirements && (
                      <div className="pt-1 text-[10px] text-black/75">
                        Req: {r.approval_requirements}
                      </div>
                    )}
                  </div>

                  {/* Column 3: Commercial Revenue Splits */}
                  <div className="bg-[#fbf6f0] p-3 border border-black/15 space-y-1.5">
                    <span className="font-bold text-[9px] text-black/60 uppercase block">
                      REVENUE TYPE SPLITS:
                    </span>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-black/60">Streaming / Direct:</span>
                      <span className="font-bold text-[#6A1A4C]">
                        {revSplits.streaming !== undefined ? revSplits.streaming : r.ownership_percentage}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-black/60">Sync / Placement:</span>
                      <span className="font-bold text-[#6A1A4C]">
                        {revSplits.sync !== undefined ? revSplits.sync : r.ownership_percentage}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-black/60">Third-Party Licensing:</span>
                      <span className="font-bold text-[#6A1A4C]">
                        {revSplits.licensing !== undefined ? revSplits.licensing : r.ownership_percentage}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional Notes or Restrictions */}
                {(r.restrictions || r.rights_details || r.notes) && (
                  <div className="pt-2 border-t border-black/10 font-fun text-xs text-black/75 space-y-1">
                    {r.restrictions && (
                      <p>
                        <strong>Restrictions:</strong> {r.restrictions}
                      </p>
                    )}
                    {r.rights_details && <p>{r.rights_details}</p>}
                    {r.notes && <p className="italic text-black/60">{r.notes}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE RIGHTS / SPLIT RECORD MODAL */}
      {createModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#fbf6f0] border-[2.5px] border-black p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-[4px_4px_0px_0px_#000]">
            <div className="flex items-center justify-between border-b-[2px] border-black pb-3">
              <div>
                <span className="font-mono text-[10px] text-[#6A1A4C] font-bold uppercase">
                  RECORD RIGHTS &middot; ASSET LEDGER
                </span>
                <h3 className="font-fun font-bold text-xl text-black">
                  New Asset Rights &amp; Revenue Allocation
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
              {/* Contributor selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                    Select Confirmed Crew Member
                  </label>
                  <select
                    value={userId}
                    onChange={(e) => handleSelectMember(e.target.value)}
                    className="w-full p-2.5 bg-white border-[2px] border-black font-fun text-sm text-black focus:outline-none"
                  >
                    <option value="">-- Choose collaborator or enter custom --</option>
                    {members.map((m) => (
                      <option key={m.user_id} value={m.user_id}>
                        {m.name} ({m.project_role || m.contribution_area})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                    Contributor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contributorName}
                    onChange={(e) => setContributorName(e.target.value)}
                    className="w-full p-2.5 bg-white border-[2px] border-black font-fun text-sm text-black focus:outline-none"
                    placeholder="Legal or professional name"
                  />
                </div>
              </div>

              {/* Asset and Role */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                    Asset Type *
                  </label>
                  <select
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value)}
                    className="w-full p-2.5 bg-white border-[2px] border-black font-fun text-sm text-black focus:outline-none"
                  >
                    {ASSET_TYPES.map((at) => (
                      <option key={at} value={at}>
                        {at}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                    Asset Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    className="w-full p-2.5 bg-white border-[2px] border-black font-fun text-sm text-black focus:outline-none"
                    placeholder="e.g. Master Recording, Screenplay"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                    IP Ownership % *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    value={ownershipPercentage}
                    onChange={(e) => setOwnershipPercentage(e.target.value)}
                    className="w-full p-2.5 bg-white border-[2px] border-black font-mono text-sm text-black focus:outline-none"
                    placeholder="e.g. 50"
                  />
                </div>
              </div>

              {/* Permissions Matrix */}
              <div>
                <label className="block font-mono text-xs uppercase font-bold text-black mb-1.5">
                  Rights &amp; Permissions Granted
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PERMISSION_OPTIONS.map((po) => {
                    const isChecked = permissions.includes(po.id);
                    return (
                      <button
                        type="button"
                        key={po.id}
                        onClick={() => togglePermission(po.id)}
                        className={`p-2 border border-black font-mono text-xs text-left flex items-center justify-between cursor-pointer ${
                          isChecked ? 'bg-black text-white' : 'bg-white text-black hover:bg-[#f3eae4]'
                        }`}
                      >
                        <span>{po.label}</span>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Territory, Duration, Exclusivity */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                    Territory
                  </label>
                  <input
                    type="text"
                    value={territory}
                    onChange={(e) => setTerritory(e.target.value)}
                    className="w-full p-2 bg-white border-[2px] border-black font-fun text-xs text-black focus:outline-none"
                    placeholder="e.g. Worldwide, India only"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                    Duration / Term
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full p-2 bg-white border-[2px] border-black font-fun text-xs text-black focus:outline-none"
                    placeholder="e.g. Perpetual, 5 Years"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                    Exclusivity
                  </label>
                  <select
                    value={exclusivity}
                    onChange={(e) => setExclusivity(e.target.value as any)}
                    className="w-full p-2 bg-white border-[2px] border-black font-fun text-xs text-black focus:outline-none"
                  >
                    <option value="non-exclusive">Non-Exclusive</option>
                    <option value="exclusive">Exclusive</option>
                  </select>
                </div>
              </div>

              {/* Revenue Splits by Type */}
              <div className="border border-black/20 bg-white p-3 space-y-2">
                <span className="font-mono text-[10px] text-black/60 uppercase font-bold block">
                  Commercial Revenue Splits by Stream (May differ from IP %)
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] uppercase font-bold text-black mb-0.5">
                      Streaming %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={streamingSplit}
                      onChange={(e) => setStreamingSplit(e.target.value)}
                      className="w-full p-1.5 bg-[#fbf6f0] border border-black font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase font-bold text-black mb-0.5">
                      Sync %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={syncSplit}
                      onChange={(e) => setSyncSplit(e.target.value)}
                      className="w-full p-1.5 bg-[#fbf6f0] border border-black font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase font-bold text-black mb-0.5">
                      Licensing %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={licensingSplit}
                      onChange={(e) => setLicensingSplit(e.target.value)}
                      className="w-full p-1.5 bg-[#fbf6f0] border border-black font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Restrictions and Approval Requirements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                    Restrictions / Reserved Rights
                  </label>
                  <input
                    type="text"
                    value={restrictions}
                    onChange={(e) => setRestrictions(e.target.value)}
                    className="w-full p-2 bg-white border-[2px] border-black font-fun text-xs text-black focus:outline-none"
                    placeholder="e.g. No political advertisements, theatrical only"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                    Approval Requirements
                  </label>
                  <input
                    type="text"
                    value={approvalRequirements}
                    onChange={(e) => setApprovalRequirements(e.target.value)}
                    className="w-full p-2 bg-white border-[2px] border-black font-fun text-xs text-black focus:outline-none"
                    placeholder="e.g. Director approval required for any sync license"
                  />
                </div>
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
                  RECORD IN RIGHTS LEDGER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Legal consensus footnote */}
      <div className="border border-black/20 bg-[#fbf6f0] p-3 text-black/60 font-mono text-[10px] leading-relaxed">
        {disclaimer}
      </div>
    </div>
  );
};
