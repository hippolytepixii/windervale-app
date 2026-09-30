import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Share, PlusSquare, CheckCircle2, X, Sparkles } from 'lucide-react';

declare global {
  interface Window {
    deferredInstallPrompt?: any;
  }
}

export const usePwaInstall = () => {
  const [canPrompt, setCanPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );
  });
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      localStorage.getItem('windervale_pwa_installed') === 'true' ||
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );
  });
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  });

  useEffect(() => {
    // Check if running in standalone mode (already installed as an app)
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      if (isStandaloneMode) {
        setIsStandalone(true);
        setIsInstalled(true);
        localStorage.setItem('windervale_pwa_installed', 'true');
      }
    };

    checkStandalone();

    const ua = navigator.userAgent || '';
    const iosDevice = /iPhone|iPad|iPod/.test(ua) && !(window as any).MSStream;
    const androidDevice = /Android/.test(ua);
    setIsIOS(iosDevice);
    setIsAndroid(androidDevice);
    setIsMobile(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua));

    const checkPrompt = () => {
      if (window.deferredInstallPrompt) {
        setCanPrompt(true);
      }
    };

    checkPrompt();

    const handlePromptEvent = (e: any) => {
      e.preventDefault();
      window.deferredInstallPrompt = e;
      setCanPrompt(true);
    };

    const handleCustomPrompt = () => {
      setCanPrompt(true);
    };

    const handleAppInstalled = () => {
      localStorage.setItem('windervale_pwa_installed', 'true');
      setIsInstalled(true);
      setIsStandalone(true);
      setCanPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handlePromptEvent);
    window.addEventListener('pwa_prompt_available', handleCustomPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePromptEvent);
      window.removeEventListener('pwa_prompt_available', handleCustomPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async (): Promise<'prompted' | 'show_guide'> => {
    if (window.deferredInstallPrompt) {
      try {
        const promptEvent = window.deferredInstallPrompt;
        promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === 'accepted') {
          localStorage.setItem('windervale_pwa_installed', 'true');
          setIsInstalled(true);
          setIsStandalone(true);
          window.deferredInstallPrompt = null;
          setCanPrompt(false);
          return 'prompted';
        }
      } catch (err) {
        console.error('Error invoking install prompt:', err);
      }
    }
    return 'show_guide';
  };

  return {
    canPrompt,
    isStandalone,
    isInstalled,
    isIOS,
    isAndroid,
    isMobile,
    promptInstall,
  };
};

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { isIOS, isStandalone, canPrompt, promptInstall } = usePwaInstall();

  if (!isOpen) return null;

  const handleNativePrompt = async () => {
    const res = await promptInstall();
    if (res === 'prompted') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-editorial-fade">
      <div className="border-[2.5px] border-black bg-[#FFFDF9] max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-[8px_8px_0px_#000000] text-black relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-black/60 hover:text-black cursor-pointer border border-black/20 hover:border-black rounded-none"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-8">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-[#6A1A4C] text-white">
              <Smartphone className="w-4 h-4" />
            </span>
            <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-[#6A1A4C]">
              OFFICIAL STANDALONE APPLICATION
            </span>
          </div>
          <h3 className="font-arthouse font-black text-2xl uppercase tracking-tight">
            INSTALL WINDERVALE
          </h3>
          <p className="font-fun text-xs text-black/80 leading-relaxed">
            Install Windervale directly onto your mobile device as an authentic, full-screen standalone application with dedicated app storage and zero browser URL clutter.
          </p>
        </div>

        {/* Status notice if already installed */}
        {isStandalone ? (
          <div className="p-3 bg-emerald-50 border-[2px] border-emerald-600 flex items-center gap-2.5 text-emerald-900 font-mono text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Windervale is already installed and running as a standalone app!</span>
          </div>
        ) : null}

        {/* Native Android / Desktop Instant Install Button if prompt ready */}
        {canPrompt && (
          <div className="p-4 bg-[#6A1A4C]/10 border-[2px] border-[#6A1A4C] space-y-2">
            <div className="font-mono text-[10px] uppercase font-black text-[#6A1A4C] tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DIRECT ONE-TAP INSTALL READY</span>
            </div>
            <p className="font-fun text-xs text-black/85">
              Click below to initiate the native Android WebAPK system install.
            </p>
            <button
              onClick={handleNativePrompt}
              className="w-full py-3 bg-[#6A1A4C] hover:bg-black text-white font-mono text-xs uppercase font-bold border-[2px] border-black cursor-pointer shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>INSTALL NATIVE APP NOW</span>
            </button>
          </div>
        )}

        {/* Step-by-Step Instructions based on OS */}
        <div className="space-y-3 pt-1">
          <span className="font-mono text-[10px] font-black uppercase tracking-wider text-black/60 block border-b border-black/15 pb-1">
            {isIOS ? 'IPHONE & IPAD INSTALLATION GUIDE' : 'MANUAL INSTALLATION INSTRUCTIONS'}
          </span>

          {isIOS ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-start gap-3 p-3 bg-[#fbf6f0] border-[1.5px] border-black">
                <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </span>
                <div className="space-y-0.5">
                  <span className="font-black text-black uppercase flex items-center gap-1.5">
                    Tap the Share Button <Share className="w-3.5 h-3.5 text-[#6A1A4C]" />
                  </span>
                  <p className="font-fun text-xs text-black/75">
                    In Safari, tap the Share icon (square with an upward arrow) located at the bottom of your screen.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#fbf6f0] border-[1.5px] border-black">
                <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </span>
                <div className="space-y-0.5">
                  <span className="font-black text-black uppercase flex items-center gap-1.5">
                    Select &apos;Add to Home Screen&apos; <PlusSquare className="w-3.5 h-3.5 text-[#6A1A4C]" />
                  </span>
                  <p className="font-fun text-xs text-black/75">
                    Scroll down through the share options and tap &quot;Add to Home Screen&quot;.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#fbf6f0] border-[1.5px] border-black">
                <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </span>
                <div className="space-y-0.5">
                  <span className="font-black text-black uppercase">
                    Tap &apos;Add&apos; in Top-Right
                  </span>
                  <p className="font-fun text-xs text-black/75">
                    Confirm by tapping Add. Windervale will appear as a standalone app icon on your home screen.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-start gap-3 p-3 bg-[#fbf6f0] border-[1.5px] border-black">
                <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </span>
                <div className="space-y-0.5">
                  <span className="font-black text-black uppercase">
                    Open Chrome Browser Menu
                  </span>
                  <p className="font-fun text-xs text-black/75">
                    Tap the three dots (⋮) in the top-right corner of Google Chrome.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#fbf6f0] border-[1.5px] border-black">
                <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </span>
                <div className="space-y-0.5">
                  <span className="font-black text-black uppercase flex items-center gap-1.5">
                    Tap &apos;Install App&apos; or &apos;Add to Home Screen&apos;
                  </span>
                  <p className="font-fun text-xs text-black/75">
                    Select &quot;Install app&quot;. Android will compile a standalone WebAPK with its own icon in your app drawer.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Note */}
        <div className="pt-2 border-t border-black/15 flex items-center justify-between font-mono text-[9px] text-black/60 uppercase">
          <span>SECURE PWA &middot; NO APP STORE ACCOUNT NEEDED</span>
          <button
            onClick={onClose}
            className="font-bold underline text-black hover:text-[#6A1A4C] cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};

export const InstallAppButton: React.FC<{
  className?: string;
  variant?: 'masthead' | 'hero' | 'floating' | 'card';
}> = ({ className = '', variant = 'masthead' }) => {
  const [showModal, setShowModal] = useState(false);
  const { isStandalone, isInstalled, canPrompt, promptInstall } = usePwaInstall();

  // If already opened as installed standalone app or downloaded, don't show ANY install button
  if (isStandalone || isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (canPrompt) {
      const res = await promptInstall();
      if (res === 'show_guide') {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  if (variant === 'hero') {
    return (
      <>
        <button
          onClick={handleClick}
          type="button"
          className={`inline-flex items-center gap-3 bg-[#FFFDF9] hover:bg-black text-black hover:text-[#FFFDF9] border-[2.5px] border-black px-6 py-3.5 sm:py-4 rounded-full shadow-[5px_5px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200 cursor-pointer select-none font-mono text-xs font-black uppercase tracking-wider ${className}`}
        >
          <Smartphone className="w-4 h-4 text-[#6A1A4C]" />
          <span>DOWNLOAD MOBILE APP</span>
        </button>
        <InstallAppModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  if (variant === 'card') {
    return (
      <>
        <button
          onClick={handleClick}
          type="button"
          className={`w-full text-center py-3 px-5 bg-black hover:bg-[#6A1A4C] text-white font-mono text-xs uppercase font-bold border-[2px] border-black shadow-[3px_3px_0px_#000000] transition-colors cursor-pointer flex items-center justify-center gap-2 ${className}`}
        >
          <Download className="w-4 h-4" />
          <span>INSTALL STANDALONE APP</span>
        </button>
        <InstallAppModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  // Default masthead pill button
  return (
    <>
      <button
        onClick={handleClick}
        type="button"
        className={`inline-flex items-center gap-1.5 font-mono text-[10px] md:text-xs font-black uppercase tracking-widest bg-[#6A1A4C] hover:bg-black text-white px-3 py-1 rounded-full border border-black shadow-[2px_2px_0px_#000000] transition-all cursor-pointer select-none ${className}`}
        title="Install Standalone App on Mobile"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>DOWNLOAD APP</span>
      </button>
      <InstallAppModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};

export const MobileInstallTopBanner: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const { isStandalone, isInstalled, isMobile, canPrompt, promptInstall } = usePwaInstall();
  const [dismissed, setDismissed] = useState(() => {
    return (
      (typeof window !== 'undefined' && sessionStorage.getItem('windervale_install_banner_dismissed') === 'true') ||
      (typeof window !== 'undefined' && localStorage.getItem('windervale_pwa_installed') === 'true')
    );
  });

  // Remove completely if already downloaded, installed, running standalone, on desktop, or dismissed
  if (isStandalone || isInstalled || dismissed || !isMobile) {
    return null;
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    sessionStorage.setItem('windervale_install_banner_dismissed', 'true');
    setDismissed(true);
  };

  const handleInstallClick = async () => {
    if (canPrompt) {
      const res = await promptInstall();
      if (res === 'show_guide') {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <div className="w-full bg-[#6A1A4C] text-white border-b-[2px] border-black px-3 py-2 flex items-center justify-between gap-2 z-50 text-xs font-mono relative">
        <div
          onClick={handleInstallClick}
          className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
        >
          <span className="p-1 bg-white text-[#6A1A4C] rounded-sm shrink-0">
            <Smartphone className="w-3.5 h-3.5" />
          </span>
          <div className="truncate">
            <span className="font-black uppercase tracking-wider text-[10px] sm:text-xs">
              DOWNLOAD MOBILE APP
            </span>
            <span className="hidden sm:inline text-white/80 text-[10px] ml-2">
              &middot; Full-screen standalone atelier
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            type="button"
            className="px-2.5 py-1 bg-white text-black font-black uppercase text-[9px] sm:text-[10px] border border-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer hover:bg-black hover:text-white transition-colors"
          >
            INSTALL
          </button>
          <button
            onClick={handleDismiss}
            type="button"
            className="text-white/60 hover:text-white p-1 cursor-pointer"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <InstallAppModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};

export const StandaloneAppPlaque: React.FC = () => {
  const { isStandalone, isInstalled, isMobile } = usePwaInstall();
  const [dismissed, setDismissed] = useState(() => {
    return typeof window !== 'undefined' && localStorage.getItem('windervale_pwa_installed') === 'true';
  });

  // REMOVE completely if:
  // 1. App is already installed or downloaded
  // 2. App is running in standalone mode
  // 3. User is on desktop (user was on desktop in screenshot)
  // 4. User dismissed the card
  if (isStandalone || isInstalled || dismissed || !isMobile) {
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem('windervale_pwa_installed', 'true');
    setDismissed(true);
  };

  return (
    <div className="pt-6 max-w-2xl mx-auto">
      <div className="bg-[#FFFDF9] rounded-3xl border-[2.5px] border-black p-6 sm:p-7 space-y-4 shadow-[7px_7px_0px_#000000] text-black relative">
        <div className="flex items-center justify-between border-b-[2px] border-black pb-2.5">
          <span className="font-mono text-xs font-black uppercase tracking-wider text-black flex items-center gap-2">
            <span className="p-1 bg-[#6A1A4C] text-white">
              <Smartphone className="w-3.5 h-3.5" />
            </span>
            <span>STANDALONE MOBILE APPLICATION</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] uppercase tracking-wider bg-black text-white px-2.5 py-0.5 font-bold">
              DIRECT INSTALL
            </span>
            <button
              onClick={handleDismiss}
              className="p-1 text-black/60 hover:text-black cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="font-fun text-xs sm:text-sm text-black/85 leading-relaxed">
          Launch Windervale unmediated from your home screen in full screen without browser tabs or address bars. Instant access to your studio and the Human Map.
        </p>
        <InstallAppButton variant="card" />
      </div>
    </div>
  );
};
