import React, { useState } from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { BellIcon } from '../components/Icons';
import { LogoutIcon } from '../../profile/components/Icons';
import { SecurityDashboard } from '../components/SecurityDashboard';
import { ManagerDashboard } from '../components/ManagerDashboard';
import { SellerDashboard } from '../components/SellerDashboard';
import { CustomerDashboard } from '../components/CustomerDashboard';
import { TransporterDashboard } from '../components/TransporterDashboard';
import { LogoutModal } from '../../../components/ui/LogoutModal';

// Temporary override to force Transporter Dashboard while developing without backend role
const FORCE_TRANSPORTER_DASHBOARD = true;

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const userRole = user?.role?.toLowerCase() || '';
  const isTransporter = FORCE_TRANSPORTER_DASHBOARD || userRole.includes('transporter');
  const isSecurity = userRole === 'security';
  const isAdmin = userRole === 'admin';
  const isSeller = userRole.includes('seller') || userRole.includes('vendor');
  const isBuyer = userRole === 'buyer' || userRole === 'customer';

  return (
    <div className="min-h-screen bg-white relative z-0 flex flex-col">
      {/* Top Header Bar Layer (White Background) */}
      <header className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(env(safe-area-inset-top,1.5rem)+1.25rem)] pb-4 sm:pb-5 bg-white">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Identity */}
          <div className="flex items-center gap-2.5 min-w-0">
            <img 
              src="/in-app-logo.png" 
              alt="RNE Logo" 
              className="h-8 sm:h-9 w-auto object-contain flex-shrink-0"
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

          {/* Action Buttons - Premium Glass Pill Buttons */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button 
              className="relative w-[42px] h-[42px] rounded-full bg-slate-50 shadow-[0_4px_12px_rgba(15,23,42,0.05)] border border-slate-900/10 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:shadow-[0_6px_16px_rgba(15,23,42,0.08)] active:scale-95 transition-all duration-200"
              title="Notifications"
            >
              <BellIcon />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-accent ring-2 ring-white animate-pulse" />
            </button>

            <button 
              onClick={() => setShowLogoutModal(true)}
              className="w-[42px] h-[42px] rounded-full bg-slate-50 shadow-[0_4px_12px_rgba(220,38,38,0.08)] border border-slate-900/10 flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50/80 hover:border-red-200/80 active:scale-95 transition-all duration-200"
              title="Sign Out"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>
      </header>

      {/* Main App Sheet Canvas (Soft Layered Gradient Container Spanning Bottom Screen) */}
      <main className="flex-1 w-full bg-gradient-to-b from-[#EEF3FA] via-[#F1F5F9] to-[#FFFFFF] rounded-t-[28px] sm:rounded-t-[36px] shadow-[0_-8px_30px_rgba(15,23,42,0.06)] border-t border-slate-900/10 px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-32">
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
              <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
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
    </div>
  );
}
