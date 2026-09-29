import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';

export const MobileInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already running as standalone PWA
    const isApp = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
    setIsStandalone(isApp);
    if (isApp) return;

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);
    setIsIos(ios);

    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem('windervale_install_dismissed');
    if (!dismissed) {
      // Auto-show banner on mobile
      if (window.innerWidth < 768 || ios) {
        setShowBanner(true);
      }
    }

    // Android/Chrome install prompt listener
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!sessionStorage.getItem('windervale_install_dismissed')) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(true);
    } else {
      // Fallback for browsers without beforeinstallprompt
      alert('To install: open your browser menu (three dots) and select "Add to Home screen" or "Install App".');
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('windervale_install_dismissed', 'true');
  };

  if (isStandalone) return null;

  return (
    <>
      {/* FLOATING MOBILE INSTALL BAR */}
      {showBanner && (
        <div className="fixed top-0 left-0 right-0 z-[99998] bg-[#0a0a0c] text-white border-b-2 border-white/20 px-3.5 py-2.5 shadow-2xl flex items-center justify-between gap-3 animate-slide-down">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded bg-white text-black flex items-center justify-center shrink-0 font-black text-xs">
              W
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-white truncate">
                Install Windervale
              </p>
              <p className="font-fun italic text-[10px] text-white/70 truncate">
                Add to your phone's Home Screen
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="bg-white text-black hover:bg-[#FAF7F2] font-mono text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded border border-black shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Install</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-white/60 hover:text-white cursor-pointer"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* IOS INSTALL INSTRUCTIONS MODAL */}
      {showIosGuide && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#FFFDF9] text-black border-[2.5px] border-black p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-[8px_8px_0px_#000000]">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <span className="font-mono text-xs font-black uppercase tracking-wider">
                Install on iPhone / iPad
              </span>
              <button
                onClick={() => setShowIosGuide(false)}
                className="p-1 hover:bg-black hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-fun text-sm text-black/90">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-black text-white font-mono text-xs flex items-center justify-center shrink-0">1</span>
                <p>Tap the <strong>Share</strong> button <Share className="w-4 h-4 inline mx-1 text-blue-600" /> at the bottom of Safari.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-black text-white font-mono text-xs flex items-center justify-center shrink-0">2</span>
                <p>Scroll down and select <strong>Add to Home Screen</strong> <PlusSquare className="w-4 h-4 inline mx-1" />.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-black text-white font-mono text-xs flex items-center justify-center shrink-0">3</span>
                <p>Tap <strong>Add</strong> in the top right to complete installation.</p>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2 bg-black text-white font-mono text-xs uppercase font-bold tracking-wider rounded"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
