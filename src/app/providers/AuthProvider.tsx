import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for mock session on load
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setToken('mock-token');
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (email === 'security' && password === 'security') {
          const mockUser: User = { 
            id: 23, 
            name: 'Security User', 
            login: 'security.user@example.com',
            email: 'security.user@example.com', 
            phone: '+91 12345 67890',
            company_id: 1,
            company_name: 'My Company',
            is_admin: false,
            is_security: true,
            employee_id: 15,
            employee_address_id: 45,
            employee_address_name: 'Main Warehouse',
            role: 'security' 
          };
          setUser(mockUser);
          setToken('mock-token');
          localStorage.setItem('mockUser', JSON.stringify(mockUser));
          resolve();
        } else if (email === 'manager' && password === 'manager') {
          const mockUser: User = { 
            id: '2', 
            name: 'Manager', 
            email: 'manager@example.com', 
            role: 'manager' 
          };
          setUser(mockUser);
          setToken('mock-token');
          localStorage.setItem('mockUser', JSON.stringify(mockUser));
          resolve();
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('mockUser');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!user }}>
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
