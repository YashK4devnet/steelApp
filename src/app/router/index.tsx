import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { DashboardPage } from '../../features/dashboard/pages/DashboardPage';
import { ProfilePage } from '../../features/profile/pages/ProfilePage';
import { LoadedTrucksPage } from '../../features/trucks/pages/LoadedTrucksPage';
import { LoadingTrucksPage } from '../../features/trucks/pages/LoadingTrucksPage';
import { ReportTruckPage } from '../../features/trucks/pages/ReportTruckPage';
import { ProtectedRoute } from '../guards/ProtectedRoute';
import { PublicRoute } from '../guards/PublicRoute';
import { MainLayout } from '../../components/layout/MainLayout';

function CapacitorNativeSetup() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Set status bar icons to dark (Style.Light) and overlay web view (transparent bar)
    StatusBar.setStyle({ style: Style.Light }).catch(() => {});
    StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});

    const listener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        navigate(-1);
      } else {
        CapacitorApp.exitApp();
      }
    });

    return () => {
      listener.then(handle => handle.remove());
    };
  }, [navigate]);

  return null;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <CapacitorNativeSetup />
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/trucks/loaded" element={<LoadedTrucksPage />} />
            <Route path="/trucks/loading" element={<LoadingTrucksPage />} />
            <Route path="/trucks/report/:id" element={<ReportTruckPage />} />
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
