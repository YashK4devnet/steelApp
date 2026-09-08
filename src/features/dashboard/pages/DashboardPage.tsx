import React, { useState } from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useNotifications } from '../../../hooks/useNotifications';
import { BellIcon } from '../components/Icons';
import { LogoutIcon } from '../../profile/components/Icons';
import { SecurityDashboard } from '../components/SecurityDashboard';
import { ManagerDashboard } from '../components/ManagerDashboard';
import { SellerDashboard } from '../components/SellerDashboard';
import { CustomerDashboard } from '../components/CustomerDashboard';
import { TransporterDashboard } from '../components/TransporterDashboard';
import { LogoutModal } from '../../../components/ui/LogoutModal';
import { NotificationSheet } from '../../../components/ui/NotificationSheet';
import { ThemeToggleButton } from '../../../components/ui/ThemeToggleButton';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotificationSheet, setShowNotificationSheet] = useState(false);

  const userRole = user?.role?.toLowerCase() || '';
  const isTransporter = userRole.includes('transporter');
  const isSecurity = userRole === 'security';
  const isAdmin = userRole === 'admin';
  const isSeller = userRole.includes('seller') || userRole.includes('vendor');
  const isBuyer = userRole === 'buyer' || userRole === 'customer';

  return (
    <div className="min-h-screen bg-white dark:bg-[#1E293B] relative z-0 flex flex-col transition-colors duration-200">
      {/* Top Header Bar Layer (Lighter shade in dark mode to distinguish header and keep in-app logo visible) */}
      <header className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(env(safe-area-inset-top,1.5rem)+1.25rem)] pb-4 sm:pb-5 bg-white dark:bg-[#1E293B] transition-colors duration-200">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Identity */}
          <div className="flex items-center gap-2.5 min-w-0">
            <img 
              src="/in-app-logo.png" 
              alt="RNE Logo" 
              className="h-8 sm:h-9 w-auto object-contain flex-shrink-0 dark:hidden"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <img 
              src="/in-app-logo-dark.png" 
              alt="RNE Logo" 
              className="h-8 sm:h-9 w-auto object-contain flex-shrink-0 hidden dark:block"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="flex flex-col leading-tight select-none">
              <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wide">
                <span className="text-primary">RATHI </span>
                <span className="text-accent">NORTH EAST</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-extrabold text-primary uppercase tracking-wider">
                BROTHERS
              </span>
            </div>
          </div>

          {/* Action Buttons - Premium Pill Buttons */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <ThemeToggleButton />

            <button 
              onClick={() => setShowNotificationSheet(true)}
              className="relative w-[42px] h-[42px] rounded-full bg-slate-50 dark:bg-slate-700/80 shadow-[0_4px_12px_rgba(15,23,42,0.05)] border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-600 active:scale-95 transition-all duration-200 cursor-pointer"
              title="Notifications"
              aria-label="Notifications"
            >
              <BellIcon />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-accent text-white text-[11px] font-extrabold flex items-center justify-center ring-2 ring-white dark:ring-[#1E293B] shadow-sm animate-fade-in">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => setShowLogoutModal(true)}
              className="w-[42px] h-[42px] rounded-full bg-slate-50 dark:bg-slate-700/80 shadow-[0_4px_12px_rgba(220,38,38,0.08)] border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50/80 dark:hover:bg-red-950/50 hover:border-red-200/80 active:scale-95 transition-all duration-200"
              title="Sign Out"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>
      </header>

      {/* Main App Sheet Canvas (Soft Layered Gradient Container Spanning Bottom Screen) */}
      <main className="flex-1 w-full bg-gradient-to-b from-[#EEF3FA] via-[#F1F5F9] to-[#FFFFFF] dark:from-[#0B1120] dark:via-[#0E172A] dark:to-[#070B14] rounded-t-[28px] sm:rounded-t-[36px] shadow-[0_-8px_30px_rgba(15,23,42,0.06)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.4)] border-t border-slate-900/10 dark:border-white/10 px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-32 transition-colors duration-200">
        <div className="max-w-[1200px] mx-auto">
          {/* User Greeting Section */}
          <div className="mb-6 sm:mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
              Good Morning,
            </p>
            <h2 className="text-[26px] sm:text-[30px] font-bold text-text-primary tracking-tight leading-snug break-words pr-2">
              {user?.name} 👋
            </h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-xs font-semibold text-primary dark:text-blue-400 bg-primary/10 dark:bg-blue-500/20 px-3 py-1 rounded-full">
                {user?.login}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary mt-2 font-normal">
              What would you like to do today?
            </p>
          </div>

          {/* Role Content */}
          {isTransporter ? (
            <TransporterDashboard />
          ) : isSecurity ? (
            <SecurityDashboard />
          ) : isAdmin ? (
            <ManagerDashboard />
          ) : isSeller ? (
            <SellerDashboard />
          ) : (
            <CustomerDashboard />
          )}
        </div>
      </main>

      {/* Reusable Custom Logout Modal */}
      <LogoutModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={logout}
      />

      {/* In-App Notification Center Bottom Sheet */}
      <NotificationSheet
        isOpen={showNotificationSheet}
        onClose={() => setShowNotificationSheet(false)}
      />
    </div>
  );
}
