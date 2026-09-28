import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AdminCurationDesk } from './AdminCurationDesk';
import { Shield, KeyRound, ArrowLeft, AlertCircle } from 'lucide-react';

interface AdminPortalProps {
  onExit: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onExit }) => {
  const [passkey, setPasskey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('windervale_admin_key');
    if (saved) {
      api.verifyAdminKey(saved).then(res => {
        if (res.valid) {
          setIsAuthenticated(true);
        } else {
          sessionStorage.removeItem('windervale_admin_key');
        }
      }).catch(() => {
        sessionStorage.removeItem('windervale_admin_key');
      });
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkey.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.verifyAdminKey(passkey.trim());
      if (res.valid) {
        sessionStorage.setItem('windervale_admin_key', passkey.trim());
        setIsAuthenticated(true);
      } else {
        setError('Incorrect administrative passkey.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify passkey.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAdmin = () => {
    sessionStorage.removeItem('windervale_admin_key');
    setIsAuthenticated(false);
    setPasskey('');
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fbf6f0] p-4 sm:p-6 flex flex-col items-center justify-center">
        <AdminCurationDesk
          onClose={() => {
            handleLogoutAdmin();
            onExit();
          }}
          onActionCompleted={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#fbf6f0] text-black select-none p-4 sm:p-6 flex flex-col justify-center items-center film-grain">
      <div className="w-full max-w-md bg-white border-[2.5px] border-black p-6 sm:p-8 space-y-6">
        {/* Folio */}
        <div className="flex items-center justify-between border-b-[2.5px] border-black pb-3 font-mono text-[10px]">
          <span className="font-bold text-black tracking-widest uppercase flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#6A1A4C] stroke-[2.5]" />
            WINDERVALE CURATION DESK
          </span>
          <span className="font-bold text-white bg-[#6A1A4C] border-[1.5px] border-black px-2 py-0.5 uppercase">
            ADMIN ONLY
          </span>
        </div>

        {/* Wordmark and Header */}
        <div className="space-y-2 text-center pt-2">
          <span className="font-brand text-3xl sm:text-4xl text-black lowercase block leading-none">
            windervale
          </span>
          <h1 className="font-arthouse font-bold text-lg sm:text-xl text-black uppercase tracking-wider mt-2">
            CURATION DESK ACCESS
          </h1>
          <p className="font-fun italic text-sm text-black/80 leading-relaxed max-w-xs mx-auto">
            Restricted editorial console. Enter administrative passkey to review, approve, or reject candidate monographs.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-black text-white border-[2px] border-black font-mono text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#6A1A4C] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="block font-mono text-[10px] uppercase font-bold text-black tracking-wider">
              Administrative Passkey
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Enter admin passkey..."
                className="w-full bg-[#fbf6f0] border-[2.5px] border-black p-3 font-mono text-xs text-black focus:outline-none"
              />
              <KeyRound className="w-4 h-4 text-black/40 absolute right-3 top-3.5 pointer-events-none" />
            </div>
            <span className="font-mono text-[9px] text-black/60 block pt-0.5">
              Default secret: <code className="bg-black/10 px-1 py-0.5 font-bold text-black">windervale-curation-desk-2026</code>
            </span>
          </div>

          <button
            type="submit"
            disabled={loading || !passkey.trim()}
            className="w-full py-3 px-4 bg-black hover:bg-[#6A1A4C] hover:text-white text-white font-arthouse font-bold text-xs uppercase tracking-wider border-[2.5px] border-black cursor-pointer transition-colors disabled:opacity-50"
          >
            {loading ? 'VERIFYING PASSKEY...' : 'ENTER CURATION DESK \u2192'}
          </button>
        </form>

        <div className="text-center pt-2 border-t-[1.5px] border-black/20">
          <button
            onClick={onExit}
            className="flex items-center justify-center gap-1.5 mx-auto font-mono text-xs text-black/70 hover:text-black uppercase tracking-wider cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public App</span>
          </button>
        </div>
      </div>
    </div>
  );
};
