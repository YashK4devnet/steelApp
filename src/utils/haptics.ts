import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * Unified haptic feedback utility for mobile interactions.
 * Safely executes native device vibrations on Android and iOS,
 * with silent no-op on desktop browsers without throwing exceptions.
 */
export const hapticFeedback = {
  /**
   * Subtle light tap for standard button presses, tab bar switches, and card taps.
   */
  light: async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      // Graceful fallback for non-supported environments
    }
  },

  /**
   * Medium tactile click for pull-to-refresh snap and sheet toggles.
   */
  medium: async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {
      // Graceful fallback
    }
  },

  /**
   * Satisfying success confirmation pattern for completed bookings, quotes, and bilty uploads.
   */
  success: async () => {
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch {
      // Graceful fallback
    }
  },

  /**
   * Warning/error buzz when validation fails or request fails.
   */
  error: async () => {
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch {
      // Graceful fallback
    }
  },

  /**
   * Subtle tick for list selections, dropdowns, and date picker taps.
   */
  selection: async () => {
    try {
      await Haptics.selectionStart();
      await Haptics.selectionChanged();
      await Haptics.selectionEnd();
    } catch {
      // Graceful fallback
    }
  },
};
