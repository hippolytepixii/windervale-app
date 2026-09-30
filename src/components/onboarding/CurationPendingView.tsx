import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Clock, RefreshCw, LogOut, CheckCircle2 } from 'lucide-react';

interface CurationPendingViewProps {
  onApproved: () => void;
}

export const CurationPendingView: React.FC<CurationPendingViewProps> = ({ onApproved }) => {
  const { user, profile, refreshProfile, logout } = useAuth();
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleCheckStatus = async () => {
    setChecking(true);
    setMessage(null);
    try {
      const updated = await refreshProfile();
      // If refreshed profile is approved, call onApproved()
      if (updated?.approval_status === 'approved') {
        onApproved();
      } else {
        setMessage('Your application is still under review by the Windervale review board. Approvals are completed within 2 days.');
      }
    } catch (err) {
      setMessage('Status check failed. Please retry shortly.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#fbf6f0] text-black select-none p-4 sm:p-6 md:p-10 flex flex-col justify-center items-center film-grain">
      {/* 
        Arthouse Cinema Admission Pending Screen
        Palette: Glistening Grape (#6A1A4C), Stark Black (#000000), Crisp Ivory (#fbf6f0)
        Borders: Bold 2.5px Black Borders ONLY, ZERO drop shadow
        Fonts: Fraunces & Syne
      */}
      <div className="w-full max-w-md md:max-w-2xl bg-white border-[2.5px] border-black p-6 sm:p-8 md:p-10 space-y-6">
        {/* Folio */}
        <div className="flex items-center justify-between border-b-[2.5px] border-black pb-3 font-mono text-[10px]">
          <span className="font-bold text-black tracking-widest uppercase">
            WINDERVALE ADMISSION
          </span>
          <span className="font-bold text-white bg-[#6A1A4C] border-[1.5px] border-black px-2 py-0.5 uppercase">
            REVIEW IN PROGRESS
          </span>
        </div>

        {/* Wordmark and Header */}
        <div className="space-y-2 text-center pt-2">
          <span className="font-brand text-3xl sm:text-4xl text-black lowercase block leading-none">
            windervale
          </span>
          <h1 className="font-arthouse font-bold text-lg sm:text-xl text-black uppercase tracking-wider mt-2">
            PROFILE UNDER REVIEW
          </h1>
          <p className="font-fun italic text-sm text-black/80 leading-relaxed max-w-xs mx-auto">
            The Windervale review board hand-reviews each practitioner monograph to protect independent craft.
          </p>
        </div>

        {/* 2-Day Notice Box (Bold Border Only) */}
        <div className="border-[2px] border-black bg-[#fbf6f0] p-4 space-y-2">
          <div className="flex items-center gap-2 text-black">
            <Clock className="w-4 h-4 stroke-[2.5] text-[#6A1A4C]" />
            <span className="font-arthouse font-bold text-xs uppercase tracking-wider">
              2-Day Review Window
            </span>
          </div>
          <p className="font-fun text-xs text-black/85 leading-relaxed">
            The Windervale team will approve your profile within <strong>2 days</strong>. Once approved, you will receive an invitation email and immediate access to the Human Map, Creative Dossiers, and Collaborative Workspace.
          </p>
        </div>

        {/* Applicant Summary */}
        <div className="border-[2px] border-black bg-[#6A1A4C]/10 p-4 space-y-2.5 font-mono text-xs">
          <div className="flex justify-between border-b border-black/20 pb-1.5">
            <span className="text-black/60 uppercase text-[10px]">Applicant</span>
            <span className="font-bold text-black">{user?.name}</span>
          </div>
          <div className="flex justify-between border-b border-black/20 pb-1.5">
            <span className="text-black/60 uppercase text-[10px]">Base Location</span>
            <span className="text-black">{profile?.location || 'Registered Base'}</span>
          </div>
          <div className="flex justify-between border-b border-black/20 pb-1.5">
            <span className="text-black/60 uppercase text-[10px]">Disciplines</span>
            <span className="text-black">{profile?.disciplines?.join(', ') || 'Independent Creative'}</span>
          </div>
          {profile?.offerings && (
            <div className="border-b border-black/20 pb-1.5">
              <span className="text-black/60 uppercase text-[10px] block mb-0.5">Offerings</span>
              <span className="font-fun italic text-xs text-black">{profile.offerings}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-1">
            <span className="text-black/60 uppercase text-[10px]">Government ID</span>
            <span className="text-[#6A1A4C] font-bold flex items-center gap-1 text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5 stroke-[2]" />
              SUBMITTED FOR VERIFICATION
            </span>
          </div>
        </div>

        {message && (
          <div className="p-3 bg-black text-white border-[2px] border-black font-mono text-xs leading-relaxed text-center">
            {message}
          </div>
        )}

        {/* Action Controls (Bold Borders, No Shadows) */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleCheckStatus}
            disabled={checking}
            className="w-full py-3 px-4 bg-black hover:bg-[#6A1A4C] hover:text-white text-white font-arthouse font-bold text-xs uppercase tracking-wider border-[2.5px] border-black cursor-pointer transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'CHECKING ADMISSION STATUS...' : 'CHECK APPROVAL STATUS'}</span>
          </button>

          <div className="text-center pt-2">
            <button
              onClick={logout}
              className="font-mono text-xs text-black/60 hover:text-[#6A1A4C] uppercase tracking-wider underline cursor-pointer"
            >
              Sign Out / Switch Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
