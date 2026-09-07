import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import type { AppNotification } from '../../services/notificationStorage';
import { hapticFeedback } from '../../utils/haptics';

interface NotificationSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const BellOutlineIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const TruckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 17h4V5H2v12h3" />
    <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" />
    <path d="M14 17h1" />
    <circle cx="7.5" cy="17.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const AlertCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

function getNotificationIcon(notif: AppNotification) {
  const type = String(notif.type || notif.data?.type || '').toLowerCase();
  if (type.includes('approved')) {
    return {
      icon: <CheckCircleIcon />,
      bg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    };
  }
  if (type.includes('rejected')) {
    return {
      icon: <AlertCircleIcon />,
      bg: 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400',
    };
  }
  if (type.includes('quotation') || type.includes('truck') || type.includes('transporter')) {
    return {
      icon: <TruckIcon />,
      bg: 'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
    };
  }
  return {
    icon: <BellOutlineIcon />,
    bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  };
}

export function NotificationSheet({ isOpen, onClose }: NotificationSheetProps) {
  const navigate = useNavigate();
  const [isClosing, setIsClosing] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      document.body.style.overflow = 'hidden';
      hapticFeedback.light();
    } else {
      document.body.style.overflow = '';
    }
    window.dispatchEvent(new CustomEvent('toggle-modal-overlay', { detail: { open: isOpen } }));
    return () => {
      document.body.style.overflow = '';
      window.dispatchEvent(new CustomEvent('toggle-modal-overlay', { detail: { open: false } }));
    };
  }, [isOpen]);

  const handleClose = () => {
    if (isClosing) return;
    hapticFeedback.light();
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 240);
  };

  const handleItemClick = (notif: AppNotification) => {
    hapticFeedback.light();
    if (!notif.isRead) {
      markAsRead(notif.id);
    }
    if (notif.route) {
      handleClose();
      navigate(notif.route);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-250 cursor-pointer ${
        isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100 animate-page-transition'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg bg-white dark:bg-surface rounded-t-[32px] sm:rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.35)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-slate-900/10 dark:border-white/10 p-5 sm:p-6 pb-[calc(env(safe-area-inset-bottom,1rem)+1.25rem)] sm:pb-6 flex flex-col gap-4 max-h-[85vh] cursor-default ${
          isClosing ? 'animate-slide-down-bottom' : 'animate-slide-up-bottom'
        }`}
      >
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto -mt-1 mb-1 sm:hidden shrink-0" />

        {/* Sheet Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-white/10 pb-3.5 shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[18px] font-bold text-text-primary tracking-tight">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-accent text-white shadow-sm">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  hapticFeedback.light();
                  markAllAsRead();
                }}
                className="text-xs font-bold text-primary hover:underline px-2 py-1 cursor-pointer transition-colors"
              >
                Mark all read
              </button>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  hapticFeedback.light();
                  clearAll();
                }}
                className="text-xs font-semibold text-text-secondary hover:text-red-500 dark:hover:text-red-400 px-2 py-1 cursor-pointer transition-colors"
              >
                Clear all
              </button>
            )}

            <button 
              type="button"
              onClick={handleClose}
              aria-label="Close notifications"
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors active:scale-95 cursor-pointer ml-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Notification List Content - Dynamically hugs content up to max-h */}
        <div className="overflow-y-auto pr-0.5 flex flex-col gap-2.5 min-h-0">
          {notifications.length === 0 ? (
            /* Empty State */
            <div className="py-8 px-4 flex flex-col items-center justify-center text-center gap-2.5 my-auto">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center shadow-inner">
                <BellOutlineIcon />
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-text-primary">You're all caught up! ✨</h4>
                <p className="text-xs font-medium text-text-secondary mt-0.5 max-w-xs">
                  No notifications at the moment. High-priority cargo and quote alerts will appear here.
                </p>
              </div>
            </div>
          ) : (
            notifications.map((item) => {
              const { icon, bg } = getNotificationIcon(item);
              const isClickable = Boolean(item.route);

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3.5 rounded-[18px] transition-all flex items-start gap-3.5 relative group ${
                    isClickable ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'
                  } ${
                    !item.isRead
                      ? 'bg-blue-50/50 dark:bg-blue-950/25 border-l-4 border-l-primary border-t border-r border-b border-slate-200/80 dark:border-white/10 shadow-sm'
                      : 'bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/60 dark:border-white/5 opacity-85 hover:opacity-100'
                  }`}
                >
                  {/* Category Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${bg}`}>
                    {icon}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className={`text-sm tracking-tight truncate ${
                        !item.isRead ? 'font-bold text-text-primary' : 'font-semibold text-text-primary'
                      }`}>
                        {item.title}
                      </h4>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed font-medium">
                      {item.body}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                        {formatRelativeTime(item.timestamp)}
                      </span>
                      {isClickable && (
                        <span className="text-[11px] font-bold text-primary dark:text-blue-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                          <span>View Details</span>
                          <span>→</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Individual Delete Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      hapticFeedback.light();
                      deleteNotification(item.id);
                    }}
                    title="Dismiss"
                    className="absolute top-3 right-3 w-6 h-6 rounded-full text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 flex items-center justify-center transition-colors text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
