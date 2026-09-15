/**
 * Global Feature & Dashboard Development Flags
 *
 * Use this file to test role dashboards and developmental features locally.
 * Production builds automatically disable all dev overrides.
 */

const IS_DEV = false;

export type DevRoleOverride =
  | 'tb_approver'
  | 'po_approver'
  | 'security'
  | 'transporter'
  | 'admin'
  | 'seller'
  | 'buyer'
  | null;

export const DASHBOARD_CONFIG = {
  /**
   * 1. Force a specific role dashboard for local testing.
   * Options: 'tb_approver' | 'po_approver' | 'security' | 'transporter' | 'admin' | 'seller' | 'buyer' | null
   * Set to null to use the logged-in user's real role.
   *
   * Example:
   *   DEV_FORCE_ROLE: (IS_DEV ? 'tb_approver' : null) as DevRoleOverride,
   */
  DEV_FORCE_ROLE: (IS_DEV ? null : null) as DevRoleOverride,

  /**
   * 2. Developmental dashboard features
   * Toggle features on/off during development.
   */
  features: {
    // Gate analytics charts & switch for Security role
    securityAnalytics: false,
    // Dispatch analytics charts & switch for Seller/Vendor role
    sellerAnalytics: false,
    // Future role analytics or experimental features can be toggled here
    transporterAnalytics: false,
    tbApproverAnalytics: false,
  },
};
