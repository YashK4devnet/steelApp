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
    <div className="min-h-screen bg-gradient-to-b from-[#EEF3FA] to-[#FFFFFF] relative z-0">
      {/* Top Floating Action Button - Position & Style aligned 1:1 with Dashboard header buttons */}
      <div className="absolute top-[calc(env(safe-area-inset-top,2rem)+2rem)] right-4 sm:right-6 lg:right-8 z-20 pt-0.5">
        <button 
          onClick={() => setShowLogoutModal(true)}
          className="w-[42px] h-[42px] rounded-full bg-white/90 backdrop-blur-md shadow-[0_4px_12px_rgba(220,38,38,0.08)] border border-slate-900/10 flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50/80 hover:border-red-200/80 active:scale-95 transition-all duration-200"
          title="Sign Out"
        >
          <LogoutIcon />
        </button>
      </div>
      
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(env(safe-area-inset-top,2rem)+3.5rem)] pb-32 flex flex-col gap-6">
        
        {/* Header Profile Section - Center Aligned */}
        <div className="flex flex-col items-center justify-center text-center mt-4 mb-4">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 mb-4">
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
