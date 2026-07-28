import React from 'react';

const WrenchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary/40">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

export function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEF3FA] to-[#FFFFFF] relative z-0">
      
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32 flex flex-col items-center justify-center min-h-[70vh]">
        
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 mb-6">
          <WrenchIcon />
        </div>
        
        <h1 className="text-[28px] font-bold text-text-primary tracking-tight mb-2">Settings</h1>
        <p className="text-text-secondary text-[15px] text-center max-w-sm">
          This page is currently under construction. Please check back later for configuration options.
        </p>

      </main>
    </div>
  );
}
