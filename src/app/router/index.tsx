import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { DashboardPage } from '../../features/dashboard/pages/DashboardPage';
import { ProfilePage } from '../../features/profile/pages/ProfilePage';
import { LoadedTrucksPage } from '../../features/trucks/pages/LoadedTrucksPage';
import { LoadingTrucksPage } from '../../features/trucks/pages/LoadingTrucksPage';
import { ReportTruckPage } from '../../features/trucks/pages/ReportTruckPage';
import { SubmitVendorBillPage } from '../../features/trucks/pages/SubmitVendorBillPage';
import { OutgoingTrucksPage } from '../../features/trucks/pages/OutgoingTrucksPage';
import { ReportOutgoingTruckPage } from '../../features/trucks/pages/ReportOutgoingTruckPage';
import { ProtectedRoute } from '../guards/ProtectedRoute';
import { PublicRoute } from '../guards/PublicRoute';
import { MainLayout } from '../../components/layout/MainLayout';
import { NetworkBanner } from '../../components/ui/NetworkBanner';

export interface PageLevelConfig {
  level: number;
  parent: string;
}

export const PAGE_LEVEL_MAP: Record<string, PageLevelConfig> = {
  '/dashboard': { level: 0, parent: '' },
  '/profile': { level: 0, parent: '/dashboard' },
  '/login': { level: 0, parent: '' },
  '/trucks/loading': { level: 1, parent: '/dashboard' },
  '/trucks/loaded': { level: 1, parent: '/dashboard' },
  '/trucks/outgoing': { level: 1, parent: '/dashboard' },
  '/trucks/submit-bill': { level: 2, parent: '/trucks/loading' },
  '/trucks/report': { level: 2, parent: '/trucks/loaded' },
  '/trucks/outgoing/report': { level: 2, parent: '/trucks/outgoing' },
};

export function getPageConfig(pathname: string): PageLevelConfig {
  if (pathname.startsWith('/trucks/submit-bill')) return PAGE_LEVEL_MAP['/trucks/submit-bill'];
  if (pathname.startsWith('/trucks/outgoing/report')) return PAGE_LEVEL_MAP['/trucks/outgoing/report'];
  if (pathname.startsWith('/trucks/report')) return PAGE_LEVEL_MAP['/trucks/report'];
  if (pathname.startsWith('/trucks/loading')) return PAGE_LEVEL_MAP['/trucks/loading'];
  if (pathname.startsWith('/trucks/loaded')) return PAGE_LEVEL_MAP['/trucks/loaded'];
  if (pathname.startsWith('/trucks/outgoing')) return PAGE_LEVEL_MAP['/trucks/outgoing'];
  if (pathname.startsWith('/profile')) return PAGE_LEVEL_MAP['/profile'];
  if (pathname.startsWith('/login')) return PAGE_LEVEL_MAP['/login'];
  return PAGE_LEVEL_MAP['/dashboard'];
}

function CapacitorNativeSetup() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationRef = useRef(location.pathname);
  const lastBackPressTimeRef = useRef<number>(0);
  const [showExitToast, setShowExitToast] = useState(false);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    locationRef.current = location.pathname;
    setShowExitToast(false);
  }, [location.pathname]);

  useEffect(() => {
    // Configure native status bar
    StatusBar.setStyle({ style: Style.Light }).catch(() => {});
    StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});

    // Native Android hardware back button handler
    const listener = CapacitorApp.addListener('backButton', () => {
      const path = locationRef.current;
      const config = getPageConfig(path);

      if (config.level === 0) {
        // Level 0 (Top-level tabs: Dashboard, Profile, Login)
        const now = Date.now();
        if (now - lastBackPressTimeRef.current < 2000) {
          // Double back press within 2 seconds -> minimize app natively
          setShowExitToast(false);
          CapacitorApp.minimizeApp().catch(() => {
            CapacitorApp.exitApp();
          });
        } else {
          // First back press -> set timestamp & show double-back toast
          lastBackPressTimeRef.current = now;
          setShowExitToast(true);
          if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
          toastTimeoutRef.current = setTimeout(() => {
            setShowExitToast(false);
          }, 2000);
        }
      } else {
        // Sub-page (Level 1 or Level 2) -> navigate strictly to parent level replacing history
        navigate(config.parent, { replace: true });
      }
    });

    return () => {
      listener.then(handle => handle.remove());
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      setShowExitToast(false);
    };
  }, [navigate]);

  return (
    <>
      {showExitToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none transition-all duration-200 animate-fade-in-up">
          <div className="bg-slate-900/90 text-white backdrop-blur-md px-5 py-2.5 rounded-full shadow-[0_8px_24px_rgba(15,23,42,0.3)] text-xs font-semibold tracking-wide border border-slate-700/50 flex items-center gap-2">
            <span>Press back again to exit</span>
          </div>
        </div>
      )}
    </>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <CapacitorNativeSetup />
      <NetworkBanner />
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/trucks/loaded" element={<LoadedTrucksPage />} />
            <Route path="/trucks/outgoing" element={<OutgoingTrucksPage />} />
            <Route path="/trucks/loading" element={<LoadingTrucksPage />} />
            <Route path="/trucks/submit-bill/:id" element={<SubmitVendorBillPage />} />
            <Route path="/trucks/report/:id" element={<ReportTruckPage />} />
            <Route path="/trucks/outgoing/report/:id" element={<ReportOutgoingTruckPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>
        
        {/* Redirect root and unknown routes to dashboard (which will redirect to login if unauthenticated) */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
