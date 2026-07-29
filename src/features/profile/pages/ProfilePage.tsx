import React from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { Button } from '../../../components/ui/Button';
import { LogoutIcon, UserAvatarIcon } from '../components/Icons';

export function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEF3FA] to-[#FFFFFF] relative z-0">
      
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(env(safe-area-inset-top,2rem)+1rem)] pb-32 flex flex-col gap-6">
        
        {/* Header Profile Section */}
        <div className="flex flex-col items-center justify-center mt-6 mb-4">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 mb-4">
            <UserAvatarIcon />
          </div>
          <h1 className="text-[28px] font-bold text-text-primary tracking-tight mb-1">{user?.name}</h1>
          <p className="text-text-secondary text-[15px] font-medium capitalize">
            {user?.role || 'User'} • #{user?.employee_id || 'N/A'}
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
            <span className="text-[13px] font-medium text-text-secondary uppercase tracking-wider">Company</span>
            <span className="text-[16px] font-semibold text-text-primary">{user?.company_name || 'N/A'}</span>
          </div>

          <div className="p-5 flex flex-col gap-1 bg-gray-50/50">
            <span className="text-[13px] font-medium text-text-secondary uppercase tracking-wider">Work Location</span>
            <span className="text-[16px] font-semibold text-text-primary">{user?.employee_address_name || 'N/A'}</span>
          </div>

        </div>

        {/* Action Button */}
        <div className="mt-8 flex justify-center">
          <Button 
            variant="danger" 
            className="w-full max-w-[280px] shadow-[0_8px_24px_rgba(200,16,46,0.1)] hover:shadow-[0_8px_24px_rgba(200,16,46,0.25)]" 
            onClick={() => {
              if (window.confirm('Are you sure you want to sign out?')) {
                logout();
              }
            }}
          >
            <LogoutIcon />
            Sign Out
          </Button>
        </div>

      </main>
    </div>
  );
}
