import React, { useState, useEffect } from 'react';
import { ProjectMember, Profile, Connection } from '../../../types';
import { api } from '../../../services/api';
import {
  Users,
  UserPlus,
  Shield,
  Mail,
  MapPin,
  Maximize2,
  X,
  Check,
  Edit2,
  FileSignature,
  DollarSign,
  Award,
  Sparkles
} from 'lucide-react';
import { MonogramSeal } from '../../common/MonogramSeal';

interface ToolProps {
  projectId: string;
  members: ProjectMember[];
  userRole: 'owner' | 'member' | 'viewer';
  onEnterFocus: () => void;
  isFocusMode: boolean;
  onRefreshProject?: () => void;
  onNavigateModule?: (moduleKey: string) => void;
}

const COMMON_ROLES = [
  'Director',
  'Producer',
  'Co-Producer',
  'Executive Producer',
  'Writer',
  'Editor',
  'Cinematographer',
  'Composer',
  'Sound Designer',
  'Photographer',
  'Curator',
  'Lead Artist',
  'Creative Collaborator',
  'Production Designer'
];

export const CrewTool: React.FC<ToolProps> = ({
  projectId,
  members,
  userRole,
  onEnterFocus,
  isFocusMode,
  onRefreshProject,
  onNavigateModule
}) => {
  const [inviteModal, setInviteModal] = useState(false);
  const [friendsModalOpen, setFriendsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<ProjectMember | null>(null);
  const [creatives, setCreatives] = useState<Profile[]>([]);
  const [friends, setFriends] = useState<Connection[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  // Standard invite form
  const [selectedCreativeId, setSelectedCreativeId] = useState('');
  const [role, setRole] = useState<'owner' | 'member' | 'viewer'>('member');
  const [projectRole, setProjectRole] = useState('Creative Collaborator');
  const [contributionArea, setContributionArea] = useState('');
  const [contribution, setContribution] = useState('');
  const [inviting, setInviting] = useState(false);
  const [invitedSuccess, setInvitedSuccess] = useState(false);

  // Edit member form
  const [editRole, setEditRole] = useState<'owner' | 'member' | 'viewer'>('member');
  const [editProjectRole, setEditProjectRole] = useState('');
  const [editContribution, setEditContribution] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Friend invite form per friend
  const [friendAreaMap, setFriendAreaMap] = useState<Record<string, string>>({});
  const [friendRoleMap, setFriendRoleMap] = useState<Record<string, 'member' | 'viewer'>>({});
  const [friendProjectRoleMap, setFriendProjectRoleMap] = useState<Record<string, string>>({});
  const [invitingFriendId, setInvitingFriendId] = useState<string | null>(null);
  const [invitedFriendSuccessId, setInvitedFriendSuccessId] = useState<string | null>(null);

  useEffect(() => {
    api.getCreatives().then((data) => {
      setCreatives(data.creatives || []);
    }).catch((err) => console.error(err));
  }, []);

  const loadFriends = async () => {
    setLoadingFriends(true);
    try {
      const data = await api.getConnections();
      const accepted = (data.connections || []).filter((c: any) => c.status === 'accepted');
      setFriends(accepted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreativeId) return;
    setInviting(true);
    try {
      await api.inviteMember(
        projectId,
        selectedCreativeId,
        role,
        contributionArea || projectRole,
        projectRole,
        contribution || contributionArea
      );
      setInvitedSuccess(true);
      setTimeout(() => {
        setInvitedSuccess(false);
        setInviteModal(false);
        setSelectedCreativeId('');
        setProjectRole('Creative Collaborator');
        setContributionArea('');
        setContribution('');
        if (onRefreshProject) onRefreshProject();
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Failed to invite creative');
    } finally {
      setInviting(false);
    }
  };

  const handleInviteFriend = async (friend: Connection) => {
    const friendId = friend.partner_id;
    if (!friendId) return;

    setInvitingFriendId(friendId);
    const assignedRole = friendRoleMap[friendId] || 'member';
    const assignedProjectRole = friendProjectRoleMap[friendId] || friend.partner_disciplines?.[0] || 'Creative Collaborator';
    const assignedArea = friendAreaMap[friendId] || assignedProjectRole;

    try {
      await api.inviteMember(
        projectId,
        friendId,
        assignedRole,
        assignedArea,
        assignedProjectRole,
        assignedArea
      );
      setInvitedFriendSuccessId(friendId);
      if (onRefreshProject) onRefreshProject();
      setTimeout(() => {
        setInvitedFriendSuccessId(null);
      }, 1800);
    } catch (err: any) {
      alert(err.message || 'Failed to invite friend to crew');
    } finally {
      setInvitingFriendId(null);
    }
  };

  const startEditMember = (m: ProjectMember) => {
    setEditingMember(m);
    setEditRole(m.role);
    setEditProjectRole(m.project_role || m.contribution_area || 'Creative Collaborator');
    setEditContribution(m.contribution || m.contribution_area || '');
  };

  const handleSaveMemberEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setSavingEdit(true);
    try {
      await api.updateMember(projectId, editingMember.id, {
        role: editRole,
        project_role: editProjectRole,
        contribution_area: editProjectRole,
        contribution: editContribution
      });
      setEditingMember(null);
      if (onRefreshProject) onRefreshProject();
    } catch (err: any) {
      alert(err.message || 'Failed to update crew member');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[2px] border-black pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#6A1A4C] font-bold">01 // CREW</span>
            <span className="font-mono text-[10px] text-black/60 font-bold uppercase">
              COLLABORATOR ROSTER &amp; ROLES
            </span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-black mt-1">
            CREW &middot; PEOPLE, ROLES &amp; CONTRIBUTIONS
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {userRole === 'owner' && (
            <>
              <button
                onClick={() => {
                  loadFriends();
                  setFriendsModalOpen(true);
                }}
                className="py-2 px-3.5 bg-black hover:bg-[#6A1A4C] border-[2px] border-black text-white font-mono text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                <span>INVITE FROM ALLIES &rarr;</span>
              </button>

              <button
                onClick={() => setInviteModal(true)}
                className="btn-editorial-wine text-xs px-3.5 py-2 flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ ADD COLLABORATOR</span>
              </button>
            </>
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

      {/* Distinction Explainer Callout */}
      <div className="border border-black/20 bg-[#fbf6f0] p-3 text-[11px] font-mono text-black/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 bg-black text-white text-[9px] font-bold uppercase">
            ARCHITECTURE NOTE
          </span>
          <span>
            Crew distinguishes <strong>Person</strong> (identity) vs. <strong>Project Role</strong> (responsibility) vs. <strong>Actual Contribution</strong> (what was specifically contributed).
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold text-[#6A1A4C]">
          <span>Feeds into : Rights &middot; Agreement &middot; Credits &middot; Money</span>
        </div>
      </div>

      {/* Crew Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {members.map((m) => {
          const displayProjectRole = m.project_role || m.contribution_area || 'Creative Collaborator';
          const displayContribution = m.contribution || m.contribution_area || 'Production and creative development.';

          return (
            <div
              key={m.id}
              className="p-5 bg-white border-[2.5px] border-black flex flex-col justify-between shadow-[2px_2px_0px_0px_#000]"
            >
              <div>
                {/* Person Header */}
                <div className="flex items-start gap-3.5 pb-3 border-b border-black/15">
                  {m.avatar_url ? (
                    <img
                      src={m.avatar_url}
                      alt={m.name}
                      className="w-12 h-12 object-cover border-[2px] border-black bg-black"
                    />
                  ) : (
                    <MonogramSeal name={m.name} size="md" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-mono text-[9px] uppercase px-1.5 py-0.5 border border-black font-bold ${
                          m.role === 'owner'
                            ? 'bg-black text-white'
                            : 'bg-[#6A1A4C] text-white'
                        }`}
                      >
                        {m.role}
                      </span>
                      {userRole === 'owner' && (
                        <button
                          onClick={() => startEditMember(m)}
                          className="font-mono text-[10px] text-black/60 hover:text-black flex items-center gap-0.5 cursor-pointer"
                          title="Edit role and contribution"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      )}
                    </div>
                    <h4 className="font-fun font-bold text-lg text-black truncate mt-1">
                      {m.name}
                    </h4>
                    <span className="font-mono text-[10px] text-black/60 truncate block">
                      {m.email}
                    </span>
                  </div>
                </div>

                {/* Structured Role & Contribution Layers */}
                <div className="mt-3.5 space-y-3">
                  {/* PROJECT ROLE */}
                  <div>
                    <span className="font-mono text-[9px] uppercase text-black/50 font-bold block">
                      PROJECT ROLE:
                    </span>
                    <span className="font-mono text-xs font-bold text-black uppercase bg-[#fbf6f0] px-2 py-0.5 border border-black/40 inline-block mt-0.5">
                      {displayProjectRole}
                    </span>
                  </div>

                  {/* ACTUAL CONTRIBUTION */}
                  <div>
                    <span className="font-mono text-[9px] uppercase text-black/50 font-bold block">
                      ACTUAL CONTRIBUTION:
                    </span>
                    <p className="font-fun text-xs text-black/85 mt-0.5 leading-snug">
                      {displayContribution}
                    </p>
                  </div>

                  {m.location && (
                    <div className="font-mono text-[10px] text-black/60 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-black" />
                      <span>{m.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: OS Interconnections */}
              <div className="mt-4 pt-3 border-t border-black/15 flex items-center justify-between font-mono text-[9px]">
                <span className="text-black/50">
                  CONFIRMED: {new Date(m.joined_at).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onNavigateModule?.('02_RIGHTS')}
                    className="hover:underline text-[#6A1A4C] font-bold cursor-pointer"
                    title="View rights allocation"
                  >
                    Rights &rarr;
                  </button>
                  <span className="text-black/30">&middot;</span>
                  <button
                    onClick={() => onNavigateModule?.('10_CREDITS')}
                    className="hover:underline text-[#6A1A4C] font-bold cursor-pointer"
                    title="View colophon credit"
                  >
                    Credit &rarr;
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* EDIT MEMBER ROLE & CONTRIBUTION MODAL */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#fbf6f0] border-[2.5px] border-black p-6 space-y-4 shadow-[4px_4px_0px_0px_#000]">
            <div className="flex items-center justify-between border-b-[2px] border-black pb-3">
              <div>
                <span className="font-mono text-[10px] text-[#6A1A4C] font-bold uppercase">
                  EDIT COLLABORATOR RECORD
                </span>
                <h3 className="font-fun font-bold text-xl text-black">
                  {editingMember.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="p-1 hover:bg-black hover:text-white border border-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMemberEdit} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                  Access Level (Permission)
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full p-2.5 bg-white border-[2px] border-black font-fun text-sm text-black focus:outline-none"
                >
                  <option value="owner">Owner (Full Admin)</option>
                  <option value="member">Member (Can Edit &amp; Create)</option>
                  <option value="viewer">Viewer (Read-Only)</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                  Project Role (Official Title) *
                </label>
                <input
                  type="text"
                  required
                  value={editProjectRole}
                  onChange={(e) => setEditProjectRole(e.target.value)}
                  className="w-full p-2.5 bg-white border-[2px] border-black font-fun text-sm text-black focus:outline-none"
                  placeholder="e.g. Director, Cinematographer, Lead Artist, Editor"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {COMMON_ROLES.slice(0, 6).map((cr) => (
                    <button
                      type="button"
                      key={cr}
                      onClick={() => setEditProjectRole(cr)}
                      className="px-2 py-0.5 bg-white border border-black font-mono text-[9px] hover:bg-[#6A1A4C] hover:text-white cursor-pointer"
                    >
                      {cr}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                  Actual Contribution (What was specifically contributed) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editContribution}
                  onChange={(e) => setEditContribution(e.target.value)}
                  className="w-full p-2.5 bg-white border-[2px] border-black font-fun text-sm text-black focus:outline-none"
                  placeholder="e.g. Financing, Production management, Location scouting, Final color grading"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/15">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 border-[2px] border-black font-mono text-xs uppercase font-bold text-black hover:bg-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="btn-editorial-wine text-xs px-5 py-2 cursor-pointer font-bold"
                >
                  {savingEdit ? 'SAVING...' : 'SAVE RECORD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVITE DIRECTORY MODAL */}
      {inviteModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#fbf6f0] border-[2.5px] border-black p-6 space-y-4 shadow-[4px_4px_0px_0px_#000]">
            <div className="flex items-center justify-between border-b-[2px] border-black pb-3">
              <div>
                <span className="font-mono text-[10px] text-[#6A1A4C] font-bold uppercase">
                  DIRECTORY INVITATION
                </span>
                <h3 className="font-fun font-bold text-xl text-black">
                  Invite Creative Collaborator
                </h3>
              </div>
              <button
                onClick={() => setInviteModal(false)}
                className="p-1 hover:bg-black hover:text-white border border-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                  Select Practitioner *
                </label>
                <select
                  required
                  value={selectedCreativeId}
                  onChange={(e) => setSelectedCreativeId(e.target.value)}
                  className="w-full p-2.5 bg-white border-[2px] border-black font-fun text-sm text-black focus:outline-none"
                >
                  <option value="">-- Choose practitioner from directory --</option>
                  {creatives.map((c) => (
                    <option key={c.user_id} value={c.user_id}>
                      {c.display_name} (@{c.handle}) &middot; {c.disciplines?.join(', ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                    Project Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={projectRole}
                    onChange={(e) => setProjectRole(e.target.value)}
                    className="w-full p-2.5 bg-white border-[2px] border-black font-fun text-sm text-black focus:outline-none"
                    placeholder="e.g. Director, Producer"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                    Access Permission
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full p-2.5 bg-white border-[2px] border-black font-fun text-sm text-black focus:outline-none"
                  >
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase font-bold text-black mb-1">
                  Actual Contribution (What they will provide)
                </label>
                <textarea
                  rows={2}
                  value={contribution}
                  onChange={(e) => setContribution(e.target.value)}
                  className="w-full p-2.5 bg-white border-[2px] border-black font-fun text-sm text-black focus:outline-none"
                  placeholder="e.g. Cinematography, Camera package, Color grade"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/15">
                <button
                  type="button"
                  onClick={() => setInviteModal(false)}
                  className="px-4 py-2 border-[2px] border-black font-mono text-xs uppercase font-bold text-black hover:bg-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting || !selectedCreativeId}
                  className="btn-editorial-wine text-xs px-5 py-2 cursor-pointer font-bold"
                >
                  {inviting ? 'INVITING...' : invitedSuccess ? 'INVITED!' : 'SEND INVITATION'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVITE FROM FRIENDS MODAL */}
      {friendsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#fbf6f0] border-[2.5px] border-black p-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-[4px_4px_0px_0px_#000]">
            <div className="flex items-center justify-between border-b-[2px] border-black pb-3">
              <div>
                <span className="font-mono text-[10px] text-[#6A1A4C] font-bold uppercase">
                  NETWORK ALLIES
                </span>
                <h3 className="font-fun font-bold text-xl text-black">
                  Invite From Confirmed Allies
                </h3>
              </div>
              <button
                onClick={() => setFriendsModalOpen(false)}
                className="p-1 hover:bg-black hover:text-white border border-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingFriends ? (
              <p className="font-mono text-xs text-black/60 p-4 text-center">Loading allies...</p>
            ) : friends.length === 0 ? (
              <p className="font-fun text-sm text-black/70 p-4 text-center">
                No allies in your network yet. Connect with practitioners on the Human Map first.
              </p>
            ) : (
              <div className="space-y-3">
                {friends.map((f) => (
                  <div
                    key={f.id}
                    className="p-3 bg-white border-[2px] border-black flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-fun font-bold text-sm text-black">{f.partner_name}</h4>
                      <p className="font-mono text-[10px] text-black/60">
                        {f.partner_disciplines?.join(', ') || 'Creative Practitioner'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Project Role"
                        value={friendProjectRoleMap[f.partner_id] || ''}
                        onChange={(e) =>
                          setFriendProjectRoleMap({
                            ...friendProjectRoleMap,
                            [f.partner_id]: e.target.value
                          })
                        }
                        className="px-2 py-1 text-xs border border-black font-fun bg-[#fbf6f0] w-36"
                      />
                      <button
                        onClick={() => handleInviteFriend(f)}
                        disabled={invitingFriendId === f.partner_id}
                        className="px-3 py-1 bg-black text-white hover:bg-[#6A1A4C] font-mono text-[10px] uppercase font-bold border border-black cursor-pointer transition-colors"
                      >
                        {invitingFriendId === f.partner_id
                          ? 'ADDING...'
                          : invitedFriendSuccessId === f.partner_id
                          ? 'ADDED!'
                          : '+ INVITE'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
