import React, { useState } from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { LogoutIcon, UserAvatarIcon } from '../components/Icons';
import { LogoutModal } from '../../../components/ui/LogoutModal';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const roleName = user?.role || 'User';
  const isSeller = !user?.employee_id || user?.role?.toLowerCase().includes('seller') || user?.role?.toLowerCase().includes('vendor');

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

          <button 
            onClick={() => setShowLogoutModal(true)}
            className="w-[42px] h-[42px] rounded-full bg-slate-50 shadow-[0_4px_12px_rgba(220,38,38,0.08)] border border-slate-900/10 flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50/80 hover:border-red-200/80 active:scale-95 transition-all duration-200"
            title="Sign Out"
          >
            <LogoutIcon />
          </button>
        </div>
      </header>

      {/* Main App Sheet Canvas (Soft Layered Gradient Container Spanning Bottom Screen) */}
      <main className="flex-1 w-full bg-gradient-to-b from-[#EEF3FA] via-[#F1F5F9] to-[#FFFFFF] rounded-t-[28px] sm:rounded-t-[36px] shadow-[0_-8px_30px_rgba(15,23,42,0.06)] border-t border-slate-900/10 px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-32">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
          {/* Header Profile Section - Center Aligned */}
          <div className="flex flex-col items-center justify-center text-center mt-2 mb-2">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(15,23,42,0.05)] border border-slate-900/5 mb-4">
              <UserAvatarIcon />
            </div>
            <h1 className="text-[28px] font-bold text-text-primary tracking-tight mb-1 text-center w-full">
              {user?.name}
            </h1>
            <p className="text-text-secondary text-[15px] font-medium capitalize text-center w-full">
              {roleName} {user?.employee_id ? `• #${user.employee_id}` : ''}
            </p>
          </div>

        {/* Info Cards */}
        <div className="bg-white rounded-[24px] shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 overflow-hidden">
          
          <div className="p-5 border-b border-slate-900/5 flex flex-col gap-1">
            <span className="text-[13px] font-medium text-text-secondary uppercase tracking-wider">Email / Login</span>
            <span className="text-[16px] font-semibold text-text-primary">{user?.login || user?.email}</span>
          </div>
          
          <div className="p-5 border-b border-slate-900/5 flex flex-col gap-1">
            <span className="text-[13px] font-medium text-text-secondary uppercase tracking-wider">Phone Number</span>
            <span className="text-[16px] font-semibold text-text-primary">{user?.phone || 'Not provided'}</span>
          </div>

          <div className="p-5 border-b border-slate-900/5 flex flex-col gap-1">
            <span className="text-[13px] font-medium text-text-secondary uppercase tracking-wider">Account Role</span>
            <span className="text-[16px] font-semibold text-text-primary capitalize">{roleName}</span>
          </div>

          <div className="p-5 border-b border-slate-900/5 flex flex-col gap-1">
            <span className="text-[13px] font-medium text-text-secondary uppercase tracking-wider">Company</span>
            <span className="text-[16px] font-semibold text-text-primary">
              {user?.company_name || (isSeller ? 'External Vendor Partner' : 'RNE Steel Logistics')}
            </span>
          </div>

          {/* Conditional Work Location */}
          {user?.employee_address_name && (
            <div className="p-5 flex flex-col gap-1 bg-gray-50/50">
              <span className="text-[13px] font-medium text-text-secondary uppercase tracking-wider">Work Location</span>
              <span className="text-[16px] font-semibold text-text-primary">{user.employee_address_name}</span>
            </div>
          )}

        </div>
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
