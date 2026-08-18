import React, { useState, useEffect } from 'react';

const WifiOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23"></line>
    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
    <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
    <line x1="12" y1="20" x2="12.01" y2="20"></line>
  </svg>
);

export function NetworkBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleNetworkError = (e: Event) => {
      const customEvent = e as CustomEvent<{ isOffline: boolean }>;
      setIsOffline(customEvent.detail.isOffline);
    };

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('network-error', handleNetworkError);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('network-error', handleNetworkError);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="sticky top-0 w-full z-[99999] bg-red-600/95 backdrop-blur-md text-white px-4 pt-[calc(env(safe-area-inset-top,0px)+0.375rem)] pb-1.5 -mb-3 text-center text-[12px] font-bold tracking-wide shadow-lg flex items-center justify-center gap-2 animate-fade-in-down">
      <WifiOffIcon />
      <span>Cannot connect to server. Please check your network.</span>
    </div>
  );
}
