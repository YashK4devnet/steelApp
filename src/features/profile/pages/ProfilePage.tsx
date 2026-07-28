import React from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { Button } from '../../../components/ui/Button';

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary/40">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

export function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEF3FA] to-[#FFFFFF] relative z-0">
      
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32 flex flex-col items-center justify-center min-h-[70vh]">
        
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 mb-6">
          <UserIcon />
        </div>
        
        <h1 className="text-[28px] font-bold text-text-primary tracking-tight mb-1">{user?.name}</h1>
        <p className="text-text-secondary text-[15px] text-center mb-10 capitalize font-medium">
          Role: {user?.role}
        </p>

        <Button 
          variant="danger" 
          className="w-full max-w-[280px] shadow-[0_8px_24px_rgba(200,16,46,0.1)] hover:shadow-[0_8px_24px_rgba(200,16,46,0.25)]" 
          onClick={logout}
        >
          <LogoutIcon />
          Logout
        </Button>

      </main>
    </div>
  );
}
