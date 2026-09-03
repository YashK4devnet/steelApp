import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { ProtectedRoute } from '../guards/ProtectedRoute';
import { PublicRoute } from '../guards/PublicRoute';
import { MainLayout } from '../../components/layout/MainLayout';
import { NetworkBanner } from '../../components/ui/NetworkBanner';

// Route-based code splitting for production bundle optimization
const LoginPage = React.lazy(() => import('../../features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const DashboardPage = React.lazy(() => import('../../features/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const ProfilePage = React.lazy(() => import('../../features/profile/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const LoadedTrucksPage = React.lazy(() => import('../../features/trucks/pages/LoadedTrucksPage').then((m) => ({ default: m.LoadedTrucksPage })));
const LoadingTrucksPage = React.lazy(() => import('../../features/trucks/pages/LoadingTrucksPage').then((m) => ({ default: m.LoadingTrucksPage })));
const ReportTruckPage = React.lazy(() => import('../../features/trucks/pages/ReportTruckPage').then((m) => ({ default: m.ReportTruckPage })));
const SubmitVendorBillPage = React.lazy(() => import('../../features/trucks/pages/SubmitVendorBillPage').then((m) => ({ default: m.SubmitVendorBillPage })));
const OutgoingTrucksPage = React.lazy(() => import('../../features/trucks/pages/OutgoingTrucksPage').then((m) => ({ default: m.OutgoingTrucksPage })));
const ReportOutgoingTruckPage = React.lazy(() => import('../../features/trucks/pages/ReportOutgoingTruckPage').then((m) => ({ default: m.ReportOutgoingTruckPage })));
const BookingsPage = React.lazy(() => import('../../features/bookings/pages/BookingsPage').then((m) => ({ default: m.BookingsPage })));
const CreateBookingStep1Page = React.lazy(() => import('../../features/bookings/pages/CreateBookingStep1Page').then((m) => ({ default: m.CreateBookingStep1Page })));
const CreateBookingStep2Page = React.lazy(() => import('../../features/bookings/pages/CreateBookingStep2Page').then((m) => ({ default: m.CreateBookingStep2Page })));
const QuotesPage = React.lazy(() => import('../../features/transporter/pages/QuotesPage').then((m) => ({ default: m.QuotesPage })));
const SubmitQuotePage = React.lazy(() => import('../../features/transporter/pages/SubmitQuotePage').then((m) => ({ default: m.SubmitQuotePage })));
const AssignDriversPage = React.lazy(() => import('../../features/transporter/pages/AssignDriversPage').then((m) => ({ default: m.AssignDriversPage })));
const TransporterLoadingTrucksPage = React.lazy(() => import('../../features/transporter/pages/TransporterLoadingTrucksPage').then((m) => ({ default: m.TransporterLoadingTrucksPage })));

function PageLoadingFallback() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin" />
      <span className="text-xs font-semibold text-text-secondary tracking-wide animate-pulse">Loading...</span>
    </div>
  );
}

export interface PageLevelConfig {
  level: number;
  parent: string;
  state?: Record<string, any>;
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
  '/transporter/quotes/submit': { level: 2, parent: '/transporter/quotes' },
  '/transporter/quotes/assign-drivers': { level: 2, parent: '/transporter/quotes?tab=quoted' },
  '/transporter/upload-bilty': { level: 1, parent: '/dashboard' },
};

export function getPageConfig(pathname: string): PageLevelConfig {
  if (pathname.startsWith('/transporter/upload-bilty')) return PAGE_LEVEL_MAP['/transporter/upload-bilty'];
  if (pathname.startsWith('/transporter/quotes/assign-drivers')) return PAGE_LEVEL_MAP['/transporter/quotes/assign-drivers'];
  if (pathname.startsWith('/transporter/quotes/submit')) return PAGE_LEVEL_MAP['/transporter/quotes/submit'];
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
        // Sub-page (Level 1 or Level 2) -> navigate strictly to parent level replacing history with state
        navigate(config.parent, { replace: true, state: config.state });
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
      <React.Suspense fallback={<PageLoadingFallback />}>
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
              <Route path="/transporter/quotes/submit/:id" element={<SubmitQuotePage />} />
              <Route path="/transporter/quotes/assign-drivers/:id" element={<AssignDriversPage />} />
              <Route path="/transporter/upload-bilty" element={<TransporterLoadingTrucksPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>
          
          {/* Redirect root and unknown routes to dashboard (which will redirect to login if unauthenticated) */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}
