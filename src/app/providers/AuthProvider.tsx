import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../../types';
import { apiRequest } from '../../lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for persisted user session
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Call the actual Odoo API via our native HTTP wrapper
    const response = await apiRequest<{ status: string, session_id: string, user: User }>(
      'POST',
      '/booking/auth/login',
      undefined,
      {
        Username: email,
        Password: password
      }
    );

    if (response.status === 'success' && response.user) {
      setUser(response.user);
      localStorage.setItem('authUser', JSON.stringify(response.user));
    } else {
      throw new Error('Invalid response from server');
    }
  };

  const logout = async () => {
    try {
      await apiRequest('POST', '/booking/auth/logout');
    } catch (e) {
      console.warn('Logout API failed, but clearing local session anyway', e);
    }
    setUser(null);
    localStorage.removeItem('authUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
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
