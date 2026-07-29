import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../../types';
import { apiRequest } from '../../lib/api';

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

  useEffect(() => {
    // Check local storage for persisted user session
    const storedUser = localStorage.getItem('authUser');
    const storedToken = localStorage.getItem('authToken');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
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
    } else {
      throw new Error('Invalid response from server or missing token');
    }
  };

  const logout = async () => {
    try {
      await apiRequest('POST', '/booking/auth/logout');
    } catch (e) {
      console.warn('Logout API failed, but clearing local session anyway', e);
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!user && !!token }}>
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
