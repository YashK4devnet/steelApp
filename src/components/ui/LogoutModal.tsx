import React, { useState, useEffect } from 'react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const LogoutBadgeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  // Notify application when logout modal state changes so Navbar can automatically hide
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('toggle-logout-modal', { detail: { open: isOpen } }));
    return () => {
      window.dispatchEvent(new CustomEvent('toggle-logout-modal', { detail: { open: false } }));
    };
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const handleLogout = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onConfirm();
      // Successful logout will clear session & unmount protected view
    } catch (err: any) {
      console.error('[LogoutModal] Logout error:', err);
      setErrorMessage(
        err.message || 'Unable to connect to server to complete logout. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setErrorMessage(null);
      onClose();
    }, 220);
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity duration-200 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleClose}
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
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4 border border-red-100">
          <LogoutBadgeIcon />
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-text-primary tracking-tight mb-1">
          Confirm Sign Out
        </h3>
        <p className="text-sm font-medium text-text-secondary mb-6 leading-relaxed">
          Are you sure you want to log out of your account? You will need to log back in to access the system.
        </p>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-150 rounded-[14px] text-xs font-semibold text-red-800 flex items-start gap-2.5 shadow-sm">
            <span className="text-base leading-none">⚠️</span>
            <div className="flex-1">
              <p className="font-bold text-red-900 mb-0.5">Logout Failed</p>
              <p className="text-[11px] font-medium text-red-700 leading-tight">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 py-3.5 px-4 rounded-full border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleLogout}
            disabled={isSubmitting}
            className="flex-1 py-3.5 px-4 rounded-full bg-red-600 text-white font-semibold text-sm shadow-[0_4px_14px_rgba(220,38,38,0.25)] hover:bg-red-700 active:scale-95 transition-all disabled:opacity-75 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <SpinnerIcon />
                <span>Signing out...</span>
              </>
            ) : (
              <span>Sign Out</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
