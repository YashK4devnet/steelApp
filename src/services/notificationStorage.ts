export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  isRead: boolean;
  route?: string;
  type?: string;
  data?: Record<string, unknown>;
}

const MAX_NOTIFICATIONS = 50;
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const STORAGE_EVENT = 'app-notifications-updated';

function getStorageKey(): string {
  try {
    const rawUser = localStorage.getItem('authUser');
    if (rawUser) {
      const user = JSON.parse(rawUser);
      if (user?.id) {
        return `app_notifications_user_${user.id}`;
      }
    }
  } catch {
    // fallback to generic key
  }
  return 'app_notifications_general';
}

/**
 * Resolves the destination deep-link route based on notification data payload.
 * Matches .agents/README.md Section "Notification payload (tap handling)" lines 1952-1970.
 */
export function resolveNotificationRoute(data: Record<string, unknown> = {}): string | undefined {
  if (typeof data.route === 'string' && data.route.trim()) {
    return data.route;
  }

  const type = String(data.type || '').trim();
  const quotationLineId = data.quotation_line_id || data.quote_id;
  const truckLineId = data.truck_line_id;
  const truckId = data.truck_id;
  const bookingId = data.booking_id || data.vendor_booking_id || (String(data.type).startsWith('po_') || data.role === 'po_approver' ? data.id : undefined);

  switch (type) {
    // 1. Transporter: New Quotation Request -> Submit Quote page
    case 'transporter_new_quotation':
      return quotationLineId ? `/transporter/quotes/submit/${quotationLineId}` : '/transporter/quotes';

    // 2. Transporter: Quote Approved -> Assign Drivers page
    case 'transporter_truck_quote_approved':
      return quotationLineId ? `/transporter/quotes/assign-drivers/${quotationLineId}` : '/transporter/quotes';

    // 3. Transporter: Quote Rejected -> Quoted History tab
    case 'transporter_truck_quote_rejected':
      return '/transporter/quotes?tab=quoted';

    // 4. Transporter: Loading / Submit Bilty
    case 'transporter_bilty':
      return '/transporter/upload-bilty';

    // 5. Seller: Loading / Submit Vendor Bill -> Submit Vendor Bill page
    case 'seller_vendor_bill':
      return truckLineId ? `/trucks/submit-bill/${truckLineId}` : '/trucks/loading';

    // 6. Security: Incoming Truck Reporting -> Report Truck page
    case 'security_incoming_unloading':
      return truckLineId ? `/trucks/report/${truckLineId}` : '/trucks/loaded';

    // 7. Security: Outgoing Truck Reporting -> Report Outgoing Truck page
    case 'security_outgoing_loading':
      return truckId ? `/trucks/outgoing/report/${truckId}` : '/trucks/outgoing';

    // 8, 9, 10. Customer / Buyer: Truck Accepted, Rejected, Cancelled -> View Booking page
    case 'customer_truck_accepted':
    case 'customer_truck_rejected':
    case 'customer_truck_cancelled':
      return truckId ? `/bookings/view/${truckId}` : '/bookings';

    // 11. PO Approver: Vendor Booking Waiting for Approval -> PO Approval Detail page
    case 'po_approver_vendor_booking_approval':
      return bookingId ? `/po/approval/${bookingId}` : '/po/approval';

    default:
      // Fallback by role or prefix
      if (type.startsWith('po_') || type.startsWith('po-')) {
        return bookingId ? `/po/approval/${bookingId}` : '/po/approval';
      }
      if (type.startsWith('transporter_')) {
        return quotationLineId ? `/transporter/quotes/submit/${quotationLineId}` : '/transporter/quotes';
      }
      if (type.startsWith('security_')) {
        return '/trucks/loaded';
      }
      if (type.startsWith('seller_')) {
        return '/trucks/loading';
      }
      if (type.startsWith('customer_')) {
        return '/bookings';
      }
      if (data.role === 'po_approver' || data.role === 'po approver' || String(data.role).includes('approver')) {
        return bookingId ? `/po/approval/${bookingId}` : '/po/approval';
      }
      if (data.role === 'transporter') return '/transporter/quotes';
      if (data.role === 'seller') return '/trucks/loading';
      if (data.role === 'security') return '/trucks/loaded';
      if (data.role === 'buyer' || data.role === 'customer') return '/bookings';

      return undefined;
  }
}

/**
 * Retrieves stored notifications for the current user, purging expired entries (> 30 days).
 */
export function getStoredNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(getStorageKey());
    if (!raw) return [];
    const parsed: AppNotification[] = JSON.parse(raw);
    const now = Date.now();

    // Purge items older than 30 days (TTL)
    const valid = parsed.filter((n) => now - (n.timestamp || 0) < MAX_AGE_MS);
    if (valid.length !== parsed.length) {
      saveNotifications(valid, false);
    }
    return valid;
  } catch (err) {
    console.warn('[NotificationStorage] Failed to read stored notifications:', err);
    return [];
  }
}

/**
 * Persists notifications to localStorage and fires a custom event.
 */
function saveNotifications(notifications: AppNotification[], notify = true): void {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS)));
    if (notify) {
      window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
    }
  } catch (err) {
    console.warn('[NotificationStorage] Failed to save notifications:', err);
  }
}

/**
 * Stores a new incoming notification (FIFO capped at 50).
 */
export function addNotification(payload: {
  id?: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  timestamp?: number;
}): AppNotification {
  const current = getStoredNotifications();
  const id = payload.id || `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  
  // Deduplicate if identical ID already exists
  const existingIdx = current.findIndex((n) => n.id === id);
  const data = payload.data || {};
  const route = resolveNotificationRoute(data);

  const newNotif: AppNotification = {
    id,
    title: payload.title || 'Notification',
    body: payload.body || '',
    timestamp: payload.timestamp || Date.now(),
    isRead: false,
    route,
    type: typeof data.type === 'string' ? data.type : undefined,
    data,
  };

  let updated: AppNotification[];
  if (existingIdx >= 0) {
    // Update existing
    updated = [...current];
    updated[existingIdx] = { ...updated[existingIdx], ...newNotif };
  } else {
    // Prepend to top
    updated = [newNotif, ...current].slice(0, MAX_NOTIFICATIONS);
  }

  saveNotifications(updated);
  return newNotif;
}

/**
 * Marks a specific notification as read.
 */
export function markNotificationAsRead(id: string): void {
  const current = getStoredNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  saveNotifications(updated);
}

/**
 * Marks all notifications as read.
 */
export function markAllNotificationsAsRead(): void {
  const current = getStoredNotifications();
  const updated = current.map((n) => ({ ...n, isRead: true }));
  saveNotifications(updated);
}

/**
 * Deletes a specific notification from storage.
 */
export function deleteNotification(id: string): void {
  const current = getStoredNotifications();
  const updated = current.filter((n) => n.id !== id);
  saveNotifications(updated);
}

/**
 * Clears all notifications.
 */
export function clearAllNotifications(): void {
  saveNotifications([]);
}
