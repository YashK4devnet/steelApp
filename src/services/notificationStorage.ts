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
 */
export function resolveNotificationRoute(data: Record<string, unknown> = {}): string | undefined {
  if (typeof data.route === 'string' && data.route.trim()) {
    return data.route;
  }

  const qId = data.quotation_line_id || data.quote_id;
  const type = String(data.type || '');

  if (type === 'transporter_new_quotation' && qId) {
    return `/transporter/quotes/submit/${qId}`;
  }
  if (type === 'transporter_truck_quote_approved' && qId) {
    return `/transporter/quotes/assign-drivers/${qId}`;
  }
  if (type === 'transporter_truck_quote_rejected') {
    return '/transporter/quotes?tab=quoted';
  }
  if (type.startsWith('transporter_') && qId) {
    return `/transporter/quotes/submit/${qId}`;
  }
  if (type.startsWith('transporter_')) {
    return '/transporter/quotes';
  }
  if (type === 'truck_inspection' || type === 'security_alert') {
    return '/security/loading-trucks';
  }
  if (type === 'vendor_bill' || type === 'seller_alert') {
    return '/dashboard';
  }
  if (type === 'booking_status' || type === 'booking_update') {
    return '/customer/bookings';
  }

  return undefined;
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
