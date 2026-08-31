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
import { BookingsPage } from '../../features/bookings/pages/BookingsPage';
import { CreateBookingStep1Page } from '../../features/bookings/pages/CreateBookingStep1Page';
import { CreateBookingStep2Page } from '../../features/bookings/pages/CreateBookingStep2Page';
import { QuotesPage } from '../../features/transporter/pages/QuotesPage';
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
  '/bookings': { level: 1, parent: '/dashboard' },
  '/bookings/new': { level: 2, parent: '/bookings' },
  '/bookings/new/step2': { level: 3, parent: '/bookings/new' },
  '/trucks/loading': { level: 1, parent: '/dashboard' },
  '/trucks/loaded': { level: 1, parent: '/dashboard' },
  '/trucks/outgoing': { level: 1, parent: '/dashboard' },
  '/trucks/submit-bill': { level: 2, parent: '/trucks/loading' },
  '/trucks/report': { level: 2, parent: '/trucks/loaded' },
  '/trucks/outgoing/report': { level: 2, parent: '/trucks/outgoing' },
  '/transporter/quotes': { level: 1, parent: '/dashboard' },
};

export function getPageConfig(pathname: string): PageLevelConfig {
  if (pathname.startsWith('/transporter/quotes')) return PAGE_LEVEL_MAP['/transporter/quotes'];
  if (pathname.startsWith('/trucks/outgoing/report')) return PAGE_LEVEL_MAP['/trucks/outgoing/report'];
  if (pathname.startsWith('/trucks/report')) return PAGE_LEVEL_MAP['/trucks/report'];
  if (pathname.startsWith('/trucks/submit-bill')) return PAGE_LEVEL_MAP['/trucks/submit-bill'];
  if (pathname.startsWith('/trucks/loaded')) return PAGE_LEVEL_MAP['/trucks/loaded'];
  if (pathname.startsWith('/trucks/outgoing')) return PAGE_LEVEL_MAP['/trucks/outgoing'];
  if (pathname.startsWith('/trucks/loading')) return PAGE_LEVEL_MAP['/trucks/loading'];

  if (pathname.match(/^\/bookings\/view\/\d+\/step2/)) {
    const id = pathname.split('/')[3];
    return { level: 3, parent: `/bookings/view/${id}` };
  }
  if (pathname.match(/^\/bookings\/view\/\d+/)) {
    return { level: 2, parent: '/bookings' };
  }
  if (pathname.match(/^\/bookings\/edit\/\d+\/step2/)) {
    const id = pathname.split('/')[3];
    return { level: 3, parent: `/bookings/edit/${id}` };
  }
  if (pathname.match(/^\/bookings\/edit\/\d+/)) {
    return { level: 2, parent: '/bookings' };
  }
  if (pathname.startsWith('/bookings/new/step2')) return PAGE_LEVEL_MAP['/bookings/new/step2'];
  if (pathname.startsWith('/bookings/new')) return PAGE_LEVEL_MAP['/bookings/new'];
  if (pathname.startsWith('/bookings')) return PAGE_LEVEL_MAP['/bookings'];
  if (pathname.startsWith('/profile')) return PAGE_LEVEL_MAP['/profile'];
  if (pathname.startsWith('/login')) return PAGE_LEVEL_MAP['/login'];
  if (PAGE_LEVEL_MAP[pathname]) return PAGE_LEVEL_MAP[pathname];

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
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/bookings/new" element={<CreateBookingStep1Page />} />
            <Route path="/bookings/new/step2" element={<CreateBookingStep2Page />} />
            <Route path="/bookings/edit/:id" element={<CreateBookingStep1Page />} />
            <Route path="/bookings/edit/:id/step2" element={<CreateBookingStep2Page />} />
            <Route path="/bookings/view/:id" element={<CreateBookingStep1Page />} />
            <Route path="/bookings/view/:id/step2" element={<CreateBookingStep2Page />} />
            <Route path="/transporter/quotes" element={<QuotesPage />} />
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
