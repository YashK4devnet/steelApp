import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const HomeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export function BottomNav() {
  const location = useLocation();
  
  // Determine active index for the sliding pill
  let activeIndex = 0;
  if (location.pathname.startsWith('/settings')) activeIndex = 1;
  else if (location.pathname.startsWith('/profile')) activeIndex = 2;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 h-16 bg-white border border-slate-900/5 shadow-[0_8px_32px_rgba(15,23,42,0.08)] z-50 flex flex-row items-center p-1.5 gap-1 rounded-full w-max">
      
      {/* Sliding Pill Background */}
      <div 
        className="absolute top-1.5 bottom-1.5 rounded-full bg-primary/10 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] -z-10"
        style={{
          width: '104px',
          transform: `translateX(${activeIndex * 108}px)`, // 104px width + 4px gap = 108px per step
          left: '6px' // matches p-1.5 (6px) padding of container
        }}
      />

      <NavLink 
        to="/dashboard"
        className={({ isActive }) => `flex flex-row items-center justify-center gap-2 w-[104px] h-full rounded-full transition-colors duration-300 ${isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`}
      >
        <HomeIcon className="w-5 h-5" />
        <span className="text-[13px] font-semibold tracking-wide">Home</span>
      </NavLink>

      <NavLink 
        to="/settings"
        className={({ isActive }) => `flex flex-row items-center justify-center gap-2 w-[104px] h-full rounded-full transition-colors duration-300 ${isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`}
      >
        <SettingsIcon className="w-5 h-5" />
        <span className="text-[13px] font-semibold tracking-wide">Settings</span>
      </NavLink>

      <NavLink 
        to="/profile"
        className={({ isActive }) => `flex flex-row items-center justify-center gap-2 w-[104px] h-full rounded-full transition-colors duration-300 ${isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-900'}`}
      >
        <UserIcon className="w-5 h-5" />
        <span className="text-[13px] font-semibold tracking-wide">Profile</span>
      </NavLink>
    </div>
  );
}
