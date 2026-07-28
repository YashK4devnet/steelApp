import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { DashboardPage } from '../../features/dashboard/pages/DashboardPage';
import { SettingsPage } from '../../features/settings/pages/SettingsPage';
import { ProfilePage } from '../../features/profile/pages/ProfilePage';
import { LoadedTrucksPage } from '../../features/trucks/pages/LoadedTrucksPage';
import { ReportTruckPage } from '../../features/trucks/pages/ReportTruckPage';
import { ProtectedRoute } from '../guards/ProtectedRoute';
import { PublicRoute } from '../guards/PublicRoute';
import { MainLayout } from '../../components/layout/MainLayout';

function AndroidBackButtonHandler() {
  const navigate = useNavigate();
  
  useEffect(() => {
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
      <AndroidBackButtonHandler />
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/trucks/loaded" element={<LoadedTrucksPage />} />
            <Route path="/trucks/report/:id" element={<ReportTruckPage />} />
            <Route path="/settings" element={<SettingsPage />} />
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
