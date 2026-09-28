import React from 'react';

interface MobileAppShellProps {
  children: React.ReactNode;
}

export const MobileAppShell: React.FC<MobileAppShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#6A1A4C] flex justify-center film-grain">
      {/* Responsive mobile container with Arthouse bold borders */}
      <main className="w-full min-h-screen max-w-md bg-[#fbf6f0] border-x-[2.5px] border-black text-black relative flex flex-col overflow-x-hidden">
        <div className="flex-1 flex flex-col overflow-y-auto pb-16 relative">
          {children}
        </div>
      </main>
    </div>
  );
};
