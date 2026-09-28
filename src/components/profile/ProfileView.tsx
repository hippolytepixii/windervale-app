import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Profile, User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { MonogramSeal } from '../common/MonogramSeal';
import { Settings as SettingsIcon, MapPin, ExternalLink, CheckCircle, Clock, Link as LinkIcon, Film } from 'lucide-react';

interface ProfileViewProps {
  userId?: string;
  onOpenWorkspace?: (projectId: string) => void;
  onOpenSettings?: () => void;
  onOpenAdminDesk?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ userId, onOpenWorkspace, onOpenSettings, onOpenAdminDesk }) => {
  const { user: currentUser, profile: currentProfile, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = !userId || userId === currentUser?.id;

  useEffect(() => {
    loadData();
  }, [userId, currentUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (isOwnProfile) {
        if (currentUser && currentProfile) {
          setUser(currentUser);
          setProfile(currentProfile);
        } else {
          const data = await api.getMe();
          setUser(data.user);
          setProfile(data.profile);
        }
      } else {
        const data = await api.getProfile(userId!);
        setUser(data.user);
        setProfile(data.profile);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center font-mono text-xs text-black/60 animate-pulse font-bold">
        RETRIEVING ARTHOUSE DOSSIER...
      </div>
    );
  }

  if (!profile || !user) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="font-fun font-bold text-base text-black">DOSSIER NOT FOUND</p>
      </div>
    );
  }

  const showAvatar = profile.avatar_url && (isOwnProfile || profile.avatar_public !== 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-white min-h-full text-black">
      {/* Top Folio Header */}
      <div className="flex items-center justify-between border-b-[2.5px] border-black pb-4">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-black font-black block">
            INDIE PRAXIS &middot; CREATIVE MONOGRAPH
          </span>
          <h1 className="font-fun font-bold text-2xl sm:text-3xl text-black tracking-tight mt-0.5 lowercase">
            creative dossier
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {isOwnProfile && onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-2 bg-black text-white border-[2px] border-black text-xs flex items-center gap-1.5 font-arthouse font-bold cursor-pointer hover:bg-[#6A1A4C] hover:text-white transition-colors"
              title="Settings"
            >
              <SettingsIcon className="w-3.5 h-3.5 text-[#6A1A4C]" />
              <span className="text-[10px] uppercase">SETTINGS</span>
            </button>
          )}
        </div>
      </div>

      {/* 2-Column Broadsheet Grid on Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Identity, Disciplines & Mediums */}
        <div className="md:col-span-5 space-y-5">
          {/* Dossier Monograph Box */}
          <div className="p-5 bg-[#fbf6f0] border-[2.5px] border-black space-y-4">
            <div className="flex items-start gap-4">
              {showAvatar ? (
                <div className="w-20 h-20 border-[2.5px] border-black bg-black shrink-0 overflow-hidden">
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name || user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 border-[2.5px] border-black bg-black text-white flex items-center justify-center font-fun font-bold text-2xl shrink-0">
                  {(profile.display_name || user.name).slice(0, 1).toUpperCase()}
                </div>
              )}

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Purple Verified Fellow Badge */}
                  <span className="font-mono text-[9px] uppercase px-2 py-0.5 bg-[#6A1A4C] text-[#f3e8ff] border border-black font-bold">
                    {profile.approval_status || 'VERIFIED PRAXIS'}
                  </span>
                  {profile.id_verification_status === 'pending' ? (
                    <span className="font-mono text-[9px] uppercase px-2 py-0.5 border-[1.5px] border-black text-black flex items-center gap-1 bg-[#6A1A4C]/20 font-bold">
                      <Clock className="w-3 h-3 text-[#6A1A4C]" />
                      ID PENDING
                    </span>
                  ) : profile.id_verification_status === 'verified' || profile.verification_status === 'verified' ? (
                    <span className="font-mono text-[9px] uppercase px-2 py-0.5 bg-black text-white flex items-center gap-1 font-bold">
                      <CheckCircle className="w-3 h-3 text-[#6A1A4C]" />
                      AUTHENTICATED
                    </span>
                  ) : (
                    <span className="font-mono text-[9px] uppercase px-2 py-0.5 border-[1.5px] border-black text-black/70 font-bold">
                      INDEPENDENT
                    </span>
                  )}
                </div>

                <h2 className="font-fun font-bold text-2xl text-black truncate leading-tight">
                  {profile.display_name || user.name}
                </h2>
                <p className="font-mono text-xs text-black/80 font-bold">
                  @{profile.handle}
                </p>
              </div>
            </div>

            {/* Location & Availability */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t-[2px] border-black font-mono text-[11px]">
              <div className="flex items-center gap-1.5 text-black font-medium">
                <MapPin className="w-3.5 h-3.5 text-black shrink-0" />
                <span>{profile.location || 'Location Unset'}</span>
              </div>
              <div className="text-right text-black font-bold">
                {profile.availability || 'Available for Projects'}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="font-fun text-sm text-black/90 leading-relaxed pt-3 border-t-[1.5px] border-black/20 font-normal italic">
                "{profile.bio}"
              </p>
            )}
          </div>

          {/* Disciplines & Mediums Box */}
          <div className="p-5 bg-[#fbf6f0] border-[2.5px] border-black space-y-3">
            <div>
              <span className="font-arthouse text-[10px] uppercase font-bold text-black tracking-wider block mb-2">
                CREATIVE DISCIPLINES
              </span>
              <div className="flex flex-wrap gap-1.5">
                {profile.disciplines?.map((d: string) => (
                  <span
                    key={d}
                    className="px-2.5 py-1 bg-[#6A1A4C] text-white font-arthouse font-bold text-xs uppercase"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {profile.practices && profile.practices.length > 0 && (
              <div className="pt-3 border-t-[1.5px] border-black/20">
                <span className="font-arthouse text-[10px] uppercase font-bold text-black tracking-wider block mb-2">
                  PHYSICAL MEDIUMS &amp; TOOLS
                </span>
                <div className="flex flex-wrap gap-1">
                  {profile.practices.map((p: string) => (
                    <span
                      key={p}
                      className="px-2 py-0.5 bg-white border-[1.5px] border-black font-mono text-[11px] font-medium text-black"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Collaboration Exchange & Portfolio */}
        <div className="md:col-span-7 space-y-5">
          {/* Collaboration Exchange (What Can You Offer & What Do You Want) */}
          {profile.collaboration_interests && (
            <div className="p-5 bg-[#fbf6f0] border-[2.5px] border-black space-y-2">
              <span className="font-arthouse text-[10px] uppercase text-black font-bold tracking-wider block">
                COLLABORATION EXCHANGE
              </span>
              <p className="font-fun text-sm text-black/90 leading-relaxed whitespace-pre-line">
                {profile.collaboration_interests}
              </p>
            </div>
          )}

          {/* Portfolio Archive Link */}
          {profile.selected_works && profile.selected_works.length > 0 && (
            <div className="p-5 bg-[#fbf6f0] border-[2.5px] border-black space-y-3">
              <span className="font-arthouse text-[10px] uppercase font-bold text-black tracking-wider block">
                PORTFOLIO REEL &amp; ARCHIVE
              </span>
              <div className="space-y-2">
                {profile.selected_works.map((w: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white border-[2px] border-black">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Film className="w-4 h-4 text-black shrink-0" />
                      <span className="font-fun font-bold text-sm truncate text-black">{w.title}</span>
                    </div>
                    {w.link && (
                      <a
                        href={w.link}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-black text-white hover:bg-[#6A1A4C] font-mono text-[10px] uppercase font-bold shrink-0 flex items-center gap-1.5 transition-colors"
                      >
                        <span>VIEW REEL</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sign Out Action if Own Profile */}
          {isOwnProfile && (
            <div className="pt-2 text-center md:text-left">
              <button
                onClick={logout}
                className="font-mono text-xs text-black/70 hover:text-black hover:underline font-bold py-2 cursor-pointer transition-colors"
              >
                DISCONNECT SESSION (LOG OUT) &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
