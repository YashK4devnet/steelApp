import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../../types';
import { apiRequest } from '../../lib/api';
import { SessionExpiredModal } from '../../components/ui/SessionExpiredModal';
import { syncMasterData } from '../../features/bookings/services/bookingApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpiredModalOpen, setIsExpiredModalOpen] = useState(false);

  useEffect(() => {
    // Check local storage for persisted user session
    const storedUser = localStorage.getItem('authUser');
    const storedToken = localStorage.getItem('authToken');
    if (storedUser && storedToken) {
      const parsedUser: User = JSON.parse(storedUser);
      setUser(parsedUser);
      setToken(storedToken);
      
      const role = parsedUser.role?.toLowerCase() || '';
      if (role === 'buyer' || role === 'customer') {
        syncMasterData();
      }
    }
    setLoading(false);

    const handleAuthExpired = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('authUser');
      localStorage.removeItem('authToken');
      setIsExpiredModalOpen(true);
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, []);

  const login = async (email: string, password: string) => {
    // Call the actual Odoo API via our native HTTP wrapper
    const response = await apiRequest<{ status: string, session_id?: string, token?: string, user: User }>(
      'POST',
      '/booking/auth/login',
      undefined,
      {
        Username: email,
        Password: password
      }
    );

    const receivedToken = response.token || response.session_id;

    if (response.status === 'success' && response.user && receivedToken) {
      setUser(response.user);
      setToken(receivedToken);
      localStorage.setItem('authUser', JSON.stringify(response.user));
      localStorage.setItem('authToken', receivedToken);

      const role = response.user.role?.toLowerCase() || '';
      if (role === 'buyer' || role === 'customer') {
        syncMasterData();
      }
    } else {
      throw new Error('Invalid response from server or missing token');
    }
  };

  const logout = async () => {
    // 1. Call Odoo backend API POST /booking/auth/logout
    const res = await apiRequest<{ status?: string }>('POST', '/booking/auth/logout');

    if (res && res.status === 'error') {
      throw new Error((res as any).message || 'Server rejected logout request');
    }

    // 2. Clear local user session ONLY if API call succeeds
    setUser(null);
    setToken(null);
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!user && !!token }}>
      {children}
      <SessionExpiredModal 
        isOpen={isExpiredModalOpen} 
        onClose={() => setIsExpiredModalOpen(false)} 
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
