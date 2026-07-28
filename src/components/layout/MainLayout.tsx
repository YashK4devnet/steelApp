import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function MainLayout() {
  const location = useLocation();
  const isReportingRoute = location.pathname.includes('/trucks/report');

  return (
    <>
      <div key={location.pathname}>
        <Outlet />
      </div>
      {!isReportingRoute && <BottomNav />}
    </>
  );
}
