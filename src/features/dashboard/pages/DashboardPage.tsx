import React, { useState } from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { BellIcon } from '../components/Icons';
import { LogoutIcon } from '../../profile/components/Icons';
import { SecurityDashboard } from '../components/SecurityDashboard';
import { ManagerDashboard } from '../components/ManagerDashboard';
import { SellerDashboard } from '../components/SellerDashboard';
import { LogoutModal } from '../../../components/ui/LogoutModal';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const userRole = user?.role?.toLowerCase() || '';
  const isSecurity = userRole === 'security';
  const isAdmin = userRole === 'admin';
  const isSeller = userRole.includes('seller') || userRole.includes('vendor') || (!isSecurity && !isAdmin);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEF3FA] to-[#FFFFFF] relative z-0">
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(env(safe-area-inset-top,2rem)+2rem)] pb-32">
        {/* Header Section */}
        <div className="mb-8 flex justify-between items-start gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
              Good Morning,
            </p>
            <h2 className="text-[26px] sm:text-[30px] font-bold text-text-primary tracking-tight leading-snug break-words pr-2">
              {user?.name} 👋
            </h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                {user?.login}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary mt-2 font-normal">
              What would you like to do today?
            </p>
          </div>

          {/* Action Buttons - Premium Glass Pill Buttons */}
          <div className="flex items-center gap-2.5 flex-shrink-0 pt-0.5">
            <button 
              className="relative w-[42px] h-[42px] rounded-full bg-white/90 backdrop-blur-md shadow-[0_4px_12px_rgba(15,23,42,0.05)] border border-slate-900/10 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:shadow-[0_6px_16px_rgba(15,23,42,0.08)] active:scale-95 transition-all duration-200"
              title="Notifications"
            >
              <BellIcon />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-accent ring-2 ring-white animate-pulse" />
            </button>

            <button 
              onClick={() => setShowLogoutModal(true)}
              className="w-[42px] h-[42px] rounded-full bg-white/90 backdrop-blur-md shadow-[0_4px_12px_rgba(220,38,38,0.08)] border border-slate-900/10 flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50/80 hover:border-red-200/80 active:scale-95 transition-all duration-200"
              title="Sign Out"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>

        {/* Role Content */}
        {isSecurity && <SecurityDashboard />}
        {isAdmin && <ManagerDashboard />}
        {isSeller && <SellerDashboard />}
      </main>

      {/* Reusable Custom Logout Modal */}
      <LogoutModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={logout}
      />
    </div>
  );
}
