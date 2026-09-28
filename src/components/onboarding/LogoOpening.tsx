import React, { useEffect, useState } from 'react';

interface LogoOpeningProps {
  onComplete: () => void;
}

export const LogoOpening: React.FC<LogoOpeningProps> = ({ onComplete }) => {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Normal app duration: hold for 2.8s, then transition to Stage 2
    const timer = setTimeout(() => {
      setFadingOut(true);
      setTimeout(() => {
        onComplete();
      }, 500);
    }, 2800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleSkip = () => {
    if (!fadingOut) {
      setFadingOut(true);
      setTimeout(() => {
        onComplete();
      }, 250);
    }
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[9999] bg-[#0a090b] flex items-center justify-center cursor-pointer select-none overflow-hidden transition-opacity duration-500 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 0,
        padding: 0,
        backgroundColor: '#0a090b',
      }}
      aria-label="windervale"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 0,
          padding: 0,
        }}
      >
        <img
          src="/windervale-logo.png"
          alt="windervale"
          className="animate-ink-appearance"
          style={{
            width: '190px',
            height: '190px',
            maxWidth: '50vw',
            maxHeight: '50vh',
            objectFit: 'contain',
            display: 'block',
            margin: '0 auto',
            filter: 'drop-shadow(0 0 28px rgba(216,162,158,0.3))',
          }}
        />
      </div>
    </div>
  );
};
