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

const ClipboardCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="m9 14 2 2 4-4" />
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
  if (
    type.includes('po_approver') ||
    type.includes('vendor_booking') ||
    type.startsWith('po_') ||
    type.startsWith('po-')
  ) {
    return {
      icon: <ClipboardCheckIcon />,
      bg: 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    };
  }
  if (type.includes('approved') || type.includes('accepted')) {
    return {
      icon: <CheckCircleIcon />,
      bg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    };
  }
  if (type.includes('rejected') || type.includes('cancelled')) {
    return {
      icon: <AlertCircleIcon />,
      bg: 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400',
    };
  }
  if (
    type.includes('quotation') ||
    type.includes('truck') ||
    type.includes('transporter') ||
    type.includes('bilty') ||
    type.includes('bill') ||
    type.includes('loading') ||
    type.includes('unloading')
  ) {
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

interface NotificationPresentation {
  category: { text: string; bg: string; textCol: string };
  title: string;
  body: string;
  chips: { label: string; text: string; icon?: string }[];
  actionLabel: string;
}

function getNotificationPresentation(notif: AppNotification): NotificationPresentation {
  const data = notif.data || {};
  const type = String(notif.type || data.type || '').trim().toLowerCase();
  const truckNumber = typeof data.truck_number === 'string' && data.truck_number ? data.truck_number : undefined;
  const truckType = typeof data.truck_type === 'string' && data.truck_type ? data.truck_type : undefined;
  const bookingNumber = (typeof data.booking_number === 'string' && data.booking_number) || (data.booking_id ? String(data.booking_id) : undefined);
  const quotationLineId = data.quotation_line_id ? String(data.quotation_line_id) : undefined;
  const truckLineId = data.truck_line_id ? String(data.truck_line_id) : undefined;
  const truckId = data.truck_id ? String(data.truck_id) : undefined;

  let category = { text: 'Notification', bg: 'bg-slate-100 dark:bg-slate-800', textCol: 'text-slate-600 dark:text-slate-300' };
  let actionLabel = 'View Details →';
  let defaultTitle = notif.title && notif.title !== 'New Notification' ? notif.title : 'New Update';
  let defaultBody = notif.body && notif.body !== 'You have a new update.' ? notif.body : 'Tap to open and view the latest cargo details.';

  switch (type) {
    case 'transporter_new_quotation':
      category = { text: 'Quote Request', bg: 'bg-blue-100 dark:bg-blue-950/60', textCol: 'text-blue-700 dark:text-blue-300' };
      defaultTitle = 'New Quotation Request';
      defaultBody = `Quotation requested for ${truckType || 'cargo'}. Tap to review specifications and propose rates.`;
      actionLabel = 'Submit Rates →';
      break;

    case 'transporter_truck_quote_approved':
      category = { text: 'Quote Approved', bg: 'bg-emerald-100 dark:bg-emerald-950/60', textCol: 'text-emerald-700 dark:text-emerald-300' };
      defaultTitle = truckNumber ? `Quote Approved: ${truckNumber}` : 'Truck Quote Approved';
      defaultBody = 'Management approved your quote proposal. Please assign driver and vehicle details to continue.';
      actionLabel = 'Assign Drivers →';
      break;

    case 'transporter_truck_quote_rejected':
      category = { text: 'Quote Rejected', bg: 'bg-red-100 dark:bg-red-950/60', textCol: 'text-red-700 dark:text-red-300' };
      defaultTitle = truckNumber ? `Quote Rejected: ${truckNumber}` : 'Quote Proposal Not Accepted';
      defaultBody = 'Your proposed quote rate was not accepted for this shipment line.';
      actionLabel = 'View Quoted History →';
      break;

    case 'transporter_bilty':
      category = { text: 'Bilty Upload', bg: 'bg-blue-100 dark:bg-blue-950/60', textCol: 'text-blue-700 dark:text-blue-300' };
      defaultTitle = truckNumber ? `Upload Bilty: ${truckNumber}` : 'Bilty Document Required';
      defaultBody = `Truck ${truckNumber || ''} is in loading state. Please submit the verified bilty document.`;
      actionLabel = 'Upload Bilty →';
      break;

    case 'seller_vendor_bill':
      category = { text: 'Vendor Bill', bg: 'bg-indigo-100 dark:bg-indigo-950/60', textCol: 'text-indigo-700 dark:text-indigo-300' };
      defaultTitle = truckNumber ? `Vendor Bill: ${truckNumber}` : 'Vendor Bill Submission';
      defaultBody = `Truck ${truckNumber || ''} is loading. Please upload the vendor bill and e-way bill document.`;
      actionLabel = 'Submit Bill →';
      break;

    case 'security_incoming_unloading':
      category = { text: 'Inbound Truck', bg: 'bg-amber-100 dark:bg-amber-950/60', textCol: 'text-amber-800 dark:text-amber-300' };
      defaultTitle = truckNumber ? `Arrived: ${truckNumber}` : 'Inbound Truck Arrived';
      defaultBody = `Inbound truck ${truckNumber || ''} has arrived for unloading and security gate reporting.`;
      actionLabel = 'Report Arrival →';
      break;

    case 'security_outgoing_loading':
      category = { text: 'Outbound Truck', bg: 'bg-purple-100 dark:bg-purple-950/60', textCol: 'text-purple-700 dark:text-purple-300' };
      defaultTitle = truckNumber ? `Outgoing: ${truckNumber}` : 'Outbound Truck Ready';
      defaultBody = `Truck ${truckNumber || ''} has completed loading and is ready for dispatch exit inspection.`;
      actionLabel = 'Report Outbound →';
      break;

    case 'customer_truck_accepted':
      category = { text: 'Booking Accepted', bg: 'bg-emerald-100 dark:bg-emerald-950/60', textCol: 'text-emerald-700 dark:text-emerald-300' };
      defaultTitle = bookingNumber ? `Booking #${bookingNumber} Accepted` : 'Truck Request Accepted';
      defaultBody = 'Your truck booking request has been confirmed and accepted by operations.';
      actionLabel = 'View Booking →';
      break;

    case 'customer_truck_rejected':
      category = { text: 'Booking Rejected', bg: 'bg-red-100 dark:bg-red-950/60', textCol: 'text-red-700 dark:text-red-300' };
      defaultTitle = bookingNumber ? `Booking #${bookingNumber} Rejected` : 'Truck Request Rejected';
      defaultBody = 'Your truck booking request could not be accepted at this time.';
      actionLabel = 'View Booking →';
      break;

    case 'customer_truck_cancelled':
      category = { text: 'Booking Cancelled', bg: 'bg-slate-100 dark:bg-slate-800', textCol: 'text-slate-700 dark:text-slate-300' };
      defaultTitle = bookingNumber ? `Booking #${bookingNumber} Cancelled` : 'Truck Request Cancelled';
      defaultBody = 'This truck booking line has been cancelled.';
      actionLabel = 'View Booking →';
      break;

    case 'po_approver_vendor_booking_approval':
      category = { text: 'PO Approval', bg: 'bg-amber-100 dark:bg-amber-950/60', textCol: 'text-amber-800 dark:text-amber-300' };
      defaultTitle = bookingNumber ? `PO Approval: ${bookingNumber}` : 'Vendor Booking Waiting for Approval';
      defaultBody = `Vendor booking ${bookingNumber ? '#' + bookingNumber : ''} is waiting for your review and authorization.`;
      actionLabel = 'Review & Approve →';
      break;
  }

  // Build metadata chips from payload
  const chips: { label: string; text: string; icon?: string }[] = [];
  if (truckNumber) {
    chips.push({ label: 'Truck', text: truckNumber, icon: '🚚' });
  }
  if (truckType) {
    chips.push({ label: 'Type', text: truckType, icon: '📐' });
  }
  if (bookingNumber) {
    const isPO = type.includes('po') || data.role === 'po_approver' || data.role === 'po approver';
    chips.push({ label: isPO ? 'PO' : 'Booking', text: `${isPO ? 'PO' : 'Order'} #${bookingNumber}`, icon: isPO ? '📋' : '📦' });
  } else if (quotationLineId) {
    chips.push({ label: 'Quote', text: `Quote #${quotationLineId}`, icon: '📄' });
  } else if (truckLineId || truckId) {
    chips.push({ label: 'Ref', text: `Ref #${truckLineId || truckId}` });
  }

  // Use custom title/body if provided and non-generic; otherwise fallback to rich defaults
  const title = (notif.title && notif.title !== 'New Notification') ? notif.title : defaultTitle;
  const body = (notif.body && notif.body !== 'You have a new update.') ? notif.body : defaultBody;

  return { category, title, body, chips, actionLabel };
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
      // Pass truck info in navigation state so destination pages can render truck plate / details immediately
      const navState: Record<string, unknown> = {};
      if (notif.data) {
        if (notif.data.truck_number || notif.data.truck_line_id || notif.data.truck_id) {
          navState.truck = {
            id: Number(notif.data.truck_line_id || notif.data.truck_id || 0),
            truck_number_plate: notif.data.truck_number,
            truck_type: notif.data.truck_type,
          };
        }
        if (notif.data.booking_id) navState.booking_id = notif.data.booking_id;
        if (notif.data.booking_number) navState.booking_number = notif.data.booking_number;
      }
      navigate(notif.route, Object.keys(navState).length > 0 ? { state: navState } : undefined);
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
              const { category, title, body, chips, actionLabel } = getNotificationPresentation(item);
              const isClickable = Boolean(item.route);

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3.5 sm:p-4 rounded-[20px] transition-all flex items-start gap-3.5 relative group ${
                    isClickable ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'
                  } ${
                    !item.isRead
                      ? 'bg-blue-50/60 dark:bg-blue-950/25 border-l-4 border-l-primary border-t border-r border-b border-slate-200/80 dark:border-white/10 shadow-sm'
                      : 'bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/60 dark:border-white/5 opacity-90 hover:opacity-100'
                  }`}
                >
                  {/* Category Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${bg}`}>
                    {icon}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    {/* Header line: Category badge + Unread indicator + Time */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide ${category.bg} ${category.textCol}`}>
                        {category.text}
                      </span>
                      {!item.isRead && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary text-white">
                          NEW
                        </span>
                      )}
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 ml-auto">
                        {formatRelativeTime(item.timestamp)}
                      </span>
                    </div>

                    {/* Notification Title */}
                    <h4 className={`text-sm tracking-tight ${
                      !item.isRead ? 'font-bold text-text-primary' : 'font-semibold text-text-primary'
                    }`}>
                      {title}
                    </h4>

                    {/* Notification Description */}
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed font-medium">
                      {body}
                    </p>

                    {/* Entity Metadata Chips */}
                    {chips.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                        {chips.map((chip, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                          >
                            {chip.icon && <span className="text-xs">{chip.icon}</span>}
                            <span>{chip.text}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Link / Context CTA */}
                    {isClickable && (
                      <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-slate-100 dark:border-white/5">
                        <span className="text-xs font-bold text-primary dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          <span>{actionLabel}</span>
                        </span>
                      </div>
                    )}
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
