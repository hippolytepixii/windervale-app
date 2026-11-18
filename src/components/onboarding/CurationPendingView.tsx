import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Clock, RefreshCw, Mail, CheckCircle2 } from 'lucide-react';

interface CurationPendingViewProps {
  onApproved: () => void;
}

export const CurationPendingView: React.FC<CurationPendingViewProps> = ({ onApproved }) => {
  const { user, profile, refreshProfile, logout } = useAuth();
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Background auto-polling: Polls every 4 seconds so that as soon as the profile is approved by the admin on the backend,
  // the user automatically enters without having to refresh or manually skip.
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const updated = await refreshProfile();
        if (updated?.approval_status === 'approved') {
          clearInterval(pollInterval);
          onApproved();
        }
      } catch {}
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [refreshProfile, onApproved]);

  const handleCheckStatus = async () => {
    setChecking(true);
    setMessage(null);
    try {
      const updated = await refreshProfile();
      if (updated?.approval_status === 'approved') {
        onApproved();
      } else {
        setMessage('Your application is queued in the curation desk. Admission and email verification are reviewed manually on the backend.');
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
        Palette: Stark Black (#000000), Crisp Ivory (#fbf6f0), Pure White (#ffffff)
        Borders: Bold 2.5px Black Borders ONLY, ZERO drop shadow
        Fonts: Fraunces & Syne
      */}
      <div className="w-full max-w-md md:max-w-2xl bg-white border-[2.5px] border-black p-6 sm:p-8 md:p-10 space-y-6">
        {/* Folio */}
        <div className="flex items-center justify-between border-b-[2.5px] border-black pb-3 font-mono text-[10px]">
          <span className="font-bold text-black tracking-widest uppercase">
            WINDERVALE ADMISSION &middot; MANUAL QUEUE
          </span>
          <span className="font-bold text-white bg-black border-[1.5px] border-black px-2 py-0.5 uppercase">
            REVIEW IN PROGRESS
          </span>
        </div>

        {/* Wordmark and Header */}
        <div className="space-y-2 text-center pt-2">
          <span className="font-brand text-3xl sm:text-4xl text-black lowercase block leading-none">
            windervale
          </span>
          <h1 className="font-arthouse font-bold text-lg sm:text-xl text-black uppercase tracking-wider mt-2">
            PROFILE QUEUED FOR REVIEW
          </h1>
          <p className="font-fun italic text-sm text-black/80 leading-relaxed max-w-sm mx-auto">
            The Windervale editorial board reviews each applicant monograph and ID document manually on the backend before admission is unlocked.
          </p>
        </div>

        {/* Manual Review Notice Box (Bold Border Only) */}
        <div className="border-[2px] border-black bg-[#fbf6f0] p-4 space-y-2">
          <div className="flex items-center gap-2 text-black">
            <Clock className="w-4 h-4 stroke-[2.5] text-black" />
            <span className="font-arthouse font-bold text-xs uppercase tracking-wider">
              Backend Curation Desk Status
            </span>
          </div>
          <p className="font-fun text-xs text-black/85 leading-relaxed">
            Fast-track skipping has been locked. All accounts, handles, and email verifications are hand-adjudicated by the administrator on the curation desk. Once approved, this screen will advance automatically into your Workspace and the Human Map.
          </p>
        </div>

        {/* Applicant Summary */}
        <div className="border-[2px] border-black bg-[#fbf6f0] p-4 space-y-2.5 font-mono text-xs">
          <div className="flex justify-between border-b border-black/20 pb-1.5">
            <span className="text-black/60 uppercase text-[10px]">Applicant</span>
            <span className="font-bold text-black">{user?.name}</span>
          </div>
          <div className="flex justify-between border-b border-black/20 pb-1.5">
            <span className="text-black/60 uppercase text-[10px]">Unique Handle</span>
            <span className="font-bold text-black font-mono">@{profile?.handle || 'registered_fellow'}</span>
          </div>
          <div className="flex justify-between border-b border-black/20 pb-1.5">
            <span className="text-black/60 uppercase text-[10px]">Registered Email</span>
            <div className="flex items-center gap-1.5 text-right">
              <span className="text-black font-mono text-[11px]">{user?.email}</span>
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 bg-black text-white">
                {user?.email_verified ? 'VERIFIED' : 'PENDING APPROVAL'}
              </span>
            </div>
          </div>
          <div className="flex justify-between border-b border-black/20 pb-1.5">
            <span className="text-black/60 uppercase text-[10px]">Base Location</span>
            <span className="text-black">{profile?.location || 'Registered Base'}</span>
          </div>
          <div className="flex justify-between border-b border-black/20 pb-1.5">
            <span className="text-black/60 uppercase text-[10px]">Disciplines</span>
            <span className="text-black">{profile?.disciplines?.join(', ') || 'Independent Creative'}</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-black/60 uppercase text-[10px]">Government ID</span>
            <span className="text-black font-bold flex items-center gap-1 text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5 stroke-[2] text-black" />
              SUBMITTED FOR VERIFICATION
            </span>
          </div>
        </div>

        {message && (
          <div className="p-3 bg-black text-white border-[2px] border-black font-mono text-xs leading-relaxed text-center">
            {message}
          </div>
        )}

        {/* Action Controls */}
        <div className="space-y-3 pt-2">
          {/* Status Check Button */}
          <button
            onClick={handleCheckStatus}
            disabled={checking}
            className="w-full py-3.5 px-4 bg-black hover:bg-white hover:text-black text-white font-arthouse font-bold text-xs uppercase tracking-wider border-[2.5px] border-black cursor-pointer transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'CHECKING CURATION DESK...' : 'CHECK ADMISSION STATUS'}</span>
          </button>

          <div className="text-center pt-2">
            <button
              onClick={logout}
              className="font-mono text-xs text-black/60 hover:text-black uppercase tracking-wider underline cursor-pointer"
            >
              Sign Out / Switch Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
