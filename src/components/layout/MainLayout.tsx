import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function MainLayout() {
  const location = useLocation();
  const hideBottomNav = location.pathname.includes('/trucks/report') || location.pathname.includes('/trucks/submit-bill');

  return (
    <>
      <div key={location.pathname}>
        <Outlet />
      </div>
      {!hideBottomNav && <BottomNav />}
    </>
  );
}
