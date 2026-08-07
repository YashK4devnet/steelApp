import React from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { BellIcon } from '../components/Icons';
import { LogoutIcon } from '../../profile/components/Icons';
import { SecurityDashboard } from '../components/SecurityDashboard';
import { ManagerDashboard } from '../components/ManagerDashboard';
import { SellerDashboard } from '../components/SellerDashboard';

export function DashboardPage() {
  const { user, logout } = useAuth();

  const userRole = user?.role?.toLowerCase() || '';
  const isSecurity = userRole === 'security';
  const isAdmin = userRole === 'admin';
  const isSeller = userRole.includes('seller') || userRole.includes('vendor') || (!isSecurity && !isAdmin);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEF3FA] to-[#FFFFFF] relative z-0">
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(env(safe-area-inset-top,2rem)+1rem)] pb-32">
        {/* Header Section */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-base font-medium text-text-secondary mb-0.5">
              Good Morning,
            </h1>
            <h2 className="text-[32px] font-bold text-text-primary tracking-tight leading-tight">
              {user?.name} 👋
            </h2>
            <p className="text-sm font-medium text-primary mb-1">{user?.login}</p>
            <p className="text-sm text-text-secondary mt-1">
              What would you like to do today?
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)] border border-slate-900/5 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors active:scale-95">
              <BellIcon />
            </button>
            <button 
              onClick={() => {
                if (window.confirm('Are you sure you want to sign out?')) {
                  logout();
                }
              }}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(200,16,46,0.1)] border border-slate-900/5 text-error hover:bg-error/5 active:scale-95 transition-all"
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
    </div>
  );
}


