import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function MainLayout() {
  const location = useLocation();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    const handleLogoutModalToggle = (e: Event) => {
      const customEvent = e as CustomEvent<{ open: boolean }>;
      setIsLogoutModalOpen(!!customEvent.detail?.open);
    };

    window.addEventListener('toggle-logout-modal', handleLogoutModalToggle);
    return () => {
      window.removeEventListener('toggle-logout-modal', handleLogoutModalToggle);
    };
  }, []);

  const hideBottomNav = 
    isLogoutModalOpen ||
    location.pathname.includes('/report') || 
    location.pathname.includes('/trucks/submit-bill') ||
    location.pathname.includes('/bookings/new') ||
    location.pathname.includes('/bookings/edit') ||
    location.pathname.includes('/bookings/view') ||
    location.pathname.includes('/transporter/quotes/submit') ||
    location.pathname.includes('/transporter/quotes/assign-drivers');

  return (
    <>
      <div key={location.pathname} className="animate-page-transition">
        <Outlet />
      </div>
      {!hideBottomNav && <BottomNav />}
    </>
  );
}
