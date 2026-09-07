import { useState, useEffect, useCallback } from 'react';
import type { AppNotification } from '../services/notificationStorage';
import {
  getStoredNotifications,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
} from '../services/notificationStorage';

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getStoredNotifications());

  const refresh = useCallback(() => {
    setNotifications(getStoredNotifications());
  }, []);

  useEffect(() => {
    refresh();

    const handleUpdate = () => {
      refresh();
    };

    window.addEventListener('app-notifications-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('app-notifications-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refresh]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead: markNotificationAsRead,
    markAllAsRead: markAllNotificationsAsRead,
    deleteNotification,
    clearAll: clearAllNotifications,
    refresh,
  };
}
