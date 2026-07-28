import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function MainLayout() {
  const location = useLocation();

  return (
    <>
      <div key={location.pathname}>
        <Outlet />
      </div>
      <BottomNav />
    </>
  );
}
