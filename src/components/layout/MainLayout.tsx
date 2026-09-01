import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function MainLayout() {
  const location = useLocation();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isOverlayModalOpen, setIsOverlayModalOpen] = useState(false);

  useEffect(() => {
    const handleLogoutModalToggle = (e: Event) => {
      const customEvent = e as CustomEvent<{ open: boolean }>;
      setIsLogoutModalOpen(!!customEvent.detail?.open);
    };

    const handleOverlayModalToggle = (e: Event) => {
      const customEvent = e as CustomEvent<{ open: boolean }>;
      setIsOverlayModalOpen(!!customEvent.detail?.open);
    };

    window.addEventListener('toggle-logout-modal', handleLogoutModalToggle);
    window.addEventListener('toggle-modal-overlay', handleOverlayModalToggle);
    return () => {
      window.removeEventListener('toggle-logout-modal', handleLogoutModalToggle);
      window.removeEventListener('toggle-modal-overlay', handleOverlayModalToggle);
    };
  }, []);

  const hideBottomNav = 
    isLogoutModalOpen ||
    isOverlayModalOpen ||
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
