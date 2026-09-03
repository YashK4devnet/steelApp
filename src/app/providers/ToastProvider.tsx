import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number; // ms
}

export interface ToastItem extends ToastOptions {
  id: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Helper for dispatching toasts from non-React modules (e.g. api.ts)
export function dispatchGlobalToast(options: ToastOptions) {
  window.dispatchEvent(
    new CustomEvent('app-toast', {
      detail: options,
    })
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const recentToastsRef = React.useRef<Map<string, number>>(new Map());

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (options: ToastOptions) => {
      // Prevent spamming identical toast notifications within 3.5 seconds
      const toastKey = `${options.type || 'info'}:${options.title || ''}:${options.message}`;
      const now = Date.now();
      const lastTime = recentToastsRef.current.get(toastKey);
      if (lastTime && now - lastTime < 3500) {
        return;
      }
      recentToastsRef.current.set(toastKey, now);

      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = {
        id,
        type: options.type || 'info',
        title: options.title,
        message: options.message,
        duration: options.duration || 3800,
      };

      setToasts((prev) => [...prev.slice(-3), newToast]); // keep max 4 toasts at once

      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, newToast.duration);
      }
    },
    [dismissToast]
  );

  const success = useCallback((message: string, title?: string) => {
    showToast({ type: 'success', message, title: title || 'Success' });
  }, [showToast]);

  const error = useCallback((message: string, title?: string) => {
    showToast({ type: 'error', message, title: title || 'Error' });
  }, [showToast]);

  const warning = useCallback((message: string, title?: string) => {
    showToast({ type: 'warning', message, title: title || 'Warning' });
  }, [showToast]);

  const info = useCallback((message: string, title?: string) => {
    showToast({ type: 'info', message, title });
  }, [showToast]);

  // Listen to global window toast events
  useEffect(() => {
    const handleGlobalToast = (e: Event) => {
      const customEvent = e as CustomEvent<ToastOptions>;
      if (customEvent.detail && customEvent.detail.message) {
        showToast(customEvent.detail);
      }
    };

    window.addEventListener('app-toast', handleGlobalToast);
    return () => {
      window.removeEventListener('app-toast', handleGlobalToast);
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info, dismissToast }}>
      {children}

      {/* Floating Top Toast Notification Container */}
      <div 
        aria-live="polite"
        className="fixed top-0 inset-x-0 z-[9999] pointer-events-none pt-[calc(env(safe-area-inset-top,1rem)+0.75rem)] px-4 flex flex-col items-center gap-2.5 max-w-md mx-auto"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={`pointer-events-auto w-full rounded-[20px] p-3.5 sm:p-4 shadow-[0_12px_36px_rgba(15,23,42,0.14)] border flex items-start gap-3 transition-all duration-300 ease-out animate-slide-down backdrop-blur-md ${
              t.type === 'success'
                ? 'bg-white/95 border-emerald-200 text-emerald-950 shadow-emerald-500/10'
                : t.type === 'error'
                ? 'bg-white/95 border-red-200 text-red-950 shadow-red-500/10'
                : t.type === 'warning'
                ? 'bg-white/95 border-amber-200 text-amber-950 shadow-amber-500/10'
                : 'bg-white/95 border-blue-200 text-slate-900 shadow-blue-500/10'
            }`}
          >
            {/* Status Icon */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              t.type === 'success'
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/80'
                : t.type === 'error'
                ? 'bg-red-50 text-red-600 border border-red-200/80'
                : t.type === 'warning'
                ? 'bg-amber-50 text-amber-600 border border-amber-200/80'
                : 'bg-blue-50 text-blue-600 border border-blue-200/80'
            }`}>
              {t.type === 'success' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : t.type === 'error' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : t.type === 'warning' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              )}
            </div>

            {/* Message Body */}
            <div className="flex-1 min-w-0 pt-0.5">
              {t.title && (
                <h5 className="text-[13px] font-extrabold tracking-tight leading-tight mb-0.5">
                  {t.title}
                </h5>
              )}
              <p className="text-xs font-semibold leading-snug text-slate-700 break-words">
                {t.message}
              </p>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss notification"
              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all shrink-0 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
