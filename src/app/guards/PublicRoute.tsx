import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

export function PublicRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
