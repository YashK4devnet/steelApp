import React, { useState } from 'react';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AlertTriangleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export function SessionExpiredModal({ isOpen, onClose }: SessionExpiredModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  if (!isOpen && !isClosing) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 220);
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity duration-200 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div 
        className={`bg-white rounded-t-[32px] sm:rounded-[24px] shadow-[0_20px_50px_rgba(15,23,42,0.22)] border border-slate-900/10 p-6 sm:p-7 max-w-md w-full relative overflow-hidden ${
          isClosing ? 'animate-slide-down-bottom' : 'animate-slide-up-bottom'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bottom sheet pull bar visual indicator for mobile */}
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-5 sm:hidden" />

        {/* Header Icon */}
        <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mb-4 border border-orange-100">
          <AlertTriangleIcon />
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-text-primary tracking-tight mb-1">
          Session Expired
        </h3>
        <p className="text-sm font-medium text-text-secondary mb-6 leading-relaxed">
          For your security, your session has expired due to inactivity or a network change. Please log in again to continue.
        </p>

        {/* Action Button */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-3.5 px-4 rounded-full bg-primary text-white font-semibold text-sm shadow-[0_4px_14px_rgba(10,46,99,0.25)] hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center"
          >
            Log In Again
          </button>
        </div>
      </div>
    </div>
  );
}
