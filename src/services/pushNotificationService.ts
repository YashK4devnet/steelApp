import { Capacitor } from '@capacitor/core';
import { PushNotifications, type Token, type ActionPerformed, type PushNotificationSchema } from '@capacitor/push-notifications';
import { Device } from '@capacitor/device';
import { apiRequest } from '../lib/api';
import { dispatchGlobalToast } from '../app/providers/ToastProvider';

let isInitialized = false;
let pendingDeepLinkRoute: string | null = null;

/**
 * Service to handle Firebase Cloud Messaging (FCM) push notifications
 * with Android channel setup, native device ID tracking, role safeguards,
 * foreground toast alerts, and deep-link routing.
 */
export const pushNotificationService = {
  /**
   * Retrieves the stable unique hardware device identifier using @capacitor/device.
   * Falls back to a persistent localStorage UUID if native call fails.
   */
  getDeviceId: async (): Promise<string> => {
    try {
      const info = await Device.getId();
      if (info.identifier) {
        return info.identifier;
      }
    } catch (err) {
      console.warn('[PushService] Could not retrieve native device ID, using fallback:', err);
    }

    let fallback = localStorage.getItem('app_device_id');
    if (!fallback) {
      fallback = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `dev-${Date.now()}`;
      localStorage.setItem('app_device_id', fallback);
    }
    return fallback;
  },

  /**
   * Initializes push notifications and registers listener hooks.
   * Safe to call multiple times; will only register once.
   */
  init: async (onNavigate?: (route: string) => void) => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    if (isInitialized) {
      if (pendingDeepLinkRoute && onNavigate) {
        onNavigate(pendingDeepLinkRoute);
        pendingDeepLinkRoute = null;
      }
      return;
    }

    isInitialized = true;

    try {
      // 1. Create Android Notification Channel for High-Priority Alerts
      if (Capacitor.getPlatform() === 'android') {
        await PushNotifications.createChannel({
          id: 'transporter_quotes',
          name: 'Transporter Quotations',
          description: 'High-priority alerts for new quote requests and cargo updates',
          importance: 5, // High priority (sound + heads-up banner)
          visibility: 1,
          sound: 'default',
          vibration: true,
          lights: true,
          lightColor: '#0A2E63',
        });
      }

      // 2. Check and Request Permissions
      const permStatus = await PushNotifications.checkPermissions();
      let granted = permStatus.receive === 'granted';

      if (!granted) {
        const reqStatus = await PushNotifications.requestPermissions();
        granted = reqStatus.receive === 'granted';
      }

      if (!granted) {
        console.warn('[PushService] Push notification permissions were denied by user.');
        return;
      }

      // 3. Register with Apple APNS / Google FCM
      await PushNotifications.register();

      // 4. Token Registration Listener
      await PushNotifications.addListener('registration', (token: Token) => {
        const fcmToken = token.value;
        console.log('====================================================');
        console.log('🔥 FCM DEVICE TOKEN ACQUIRED:');
        console.log(fcmToken);
        console.log('====================================================');

        // Persist token locally for debugging and offline inspection
        localStorage.setItem('fcm_device_token', fcmToken);

        // Sync token with backend if user is already authenticated
        pushNotificationService.registerDeviceWithBackend(fcmToken);
      });

      // 5. Registration Error Listener
      await PushNotifications.addListener('registrationError', (error) => {
        console.error('[PushService] Error during FCM registration:', error);
      });

      // 6. Foreground Notification Received Listener
      await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        console.log('[PushService] Foreground push notification received:', notification);

        // Role Safeguard: Verify the currently logged-in user matches the notification target role
        const data = notification.data || {};
        const storedUser = localStorage.getItem('authUser');
        if (storedUser && data.role) {
          try {
            const user = JSON.parse(storedUser);
            const userRole = (user.role || '').toLowerCase();
            const targetRole = String(data.role).toLowerCase();
            if (targetRole && userRole && targetRole !== userRole) {
              console.log(`[PushService] Suppressed toast: current user is ${userRole}, notification was for ${targetRole}`);
              return;
            }
          } catch {
            // Ignore parse error and continue
          }
        }

        // Display in-app toast since heads-up banner may not trigger in foreground on all Android builds
        dispatchGlobalToast({
          type: 'info',
          title: notification.title || 'New Notification',
          message: notification.body || 'You have a new update.',
          duration: 5000,
        });
      });

      // 7. Notification Click / Tap (Deep Link) Listener
      await PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
        console.log('[PushService] Notification tapped by user:', action);
        const data = action.notification.data || {};

        // Role Safeguard: Verify user role before performing deep-link navigation
        const storedUser = localStorage.getItem('authUser');
        if (storedUser && data.role) {
          try {
            const user = JSON.parse(storedUser);
            const userRole = (user.role || '').toLowerCase();
            const targetRole = String(data.role).toLowerCase();
            if (targetRole && userRole && targetRole !== userRole) {
              console.log(`[PushService] Ignored notification tap: current user is ${userRole}, notification was for ${targetRole}`);
              return;
            }
          } catch {
            // Ignore parse error and continue
          }
        }

        const qId = data.quotation_line_id || data.quote_id;

        // Resolve target route matching README Notification payload specification:
        // - transporter_new_quotation -> /transporter/quotes/submit/<quotation_line_id>
        // - transporter_truck_quote_approved -> /transporter/quotes/assign-drivers/<quotation_line_id>
        // - transporter_truck_quote_rejected -> /transporter/quotes?tab=quoted
        let targetRoute = '/transporter/quotes';

        if (data.route) {
          targetRoute = data.route;
        } else if (data.type === 'transporter_new_quotation' && qId) {
          targetRoute = `/transporter/quotes/submit/${qId}`;
        } else if (data.type === 'transporter_truck_quote_approved' && qId) {
          targetRoute = `/transporter/quotes/assign-drivers/${qId}`;
        } else if (data.type === 'transporter_truck_quote_rejected') {
          targetRoute = '/transporter/quotes?tab=quoted';
        } else if (qId) {
          targetRoute = `/transporter/quotes/submit/${qId}`;
        }

        if (onNavigate) {
          onNavigate(targetRoute);
        } else {
          // If router is not ready yet (cold launch), queue route
          pendingDeepLinkRoute = targetRoute;
        }
      });
    } catch (err) {
      console.error('[PushService] Failed to initialize push notifications:', err);
    }
  },

  /**
   * Retrieves the locally cached FCM token.
   */
  getCachedToken: (): string | null => {
    return localStorage.getItem('fcm_device_token');
  },

  /**
   * Registers the device FCM token and unique device ID with the backend Odoo API.
   * Endpoint: POST /booking/auth/register_device
   * Called on login and on token refresh.
   */
  registerDeviceWithBackend: async (token?: string) => {
    if (!Capacitor.isNativePlatform()) return;

    const fcmToken = token || localStorage.getItem('fcm_device_token');
    const authToken = localStorage.getItem('authToken');

    // Only register if both device token and active user session exist
    if (!fcmToken || !authToken) return;

    try {
      const deviceId = await pushNotificationService.getDeviceId();

      const res = await apiRequest<{ status: string; message?: string; device_id?: number }>(
        'POST',
        '/booking/auth/register_device',
        {
          token: fcmToken,
          platform: Capacitor.getPlatform() === 'ios' ? 'ios' : 'android',
          device_id: deviceId,
        },
        {},
        { silentError: true }
      );
      console.log('[PushService] Device token registered with backend (Device ID:', deviceId, '):', res);
    } catch (err) {
      console.warn('[PushService] Failed to register device token with backend:', err);
    }
  },

  /**
   * Unregisters the device FCM token with the backend Odoo API.
   * Endpoint: POST /booking/auth/unregister_device
   * Called on user logout before clearing local session.
   */
  unregisterDeviceWithBackend: async () => {
    if (!Capacitor.isNativePlatform()) return;

    const fcmToken = localStorage.getItem('fcm_device_token');
    const authToken = localStorage.getItem('authToken');

    if (!authToken) return;

    try {
      await apiRequest<{ status: string; message?: string }>(
        'POST',
        '/booking/auth/unregister_device',
        fcmToken ? { token: fcmToken } : {},
        {},
        { silentError: true }
      );
      console.log('[PushService] Device unregistered successfully on logout.');
    } catch (err) {
      console.warn('[PushService] Failed to unregister device on logout:', err);
    }
  },
};
