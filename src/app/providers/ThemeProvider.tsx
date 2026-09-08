import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, startTransition } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'app_theme';

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    return stored || 'light';
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Listen to OS system color scheme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const resolvedTheme: 'light' | 'dark' = theme === 'system' ? (systemIsDark ? 'dark' : 'light') : theme;
  const isDark = resolvedTheme === 'dark';

  // Apply .dark class to root <html> element immediately
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Sync native Android status bar if running inside Capacitor
    // Defer slightly to avoid blocking the first frame of the toggle animation
    if (Capacitor.isNativePlatform()) {
      const timer = setTimeout(async () => {
        try {
          // Style.Dark: Light icons (for dark backgrounds), Style.Light: Dark icons (for light backgrounds)
          await StatusBar.setStyle({
            style: isDark ? Style.Dark : Style.Light,
          });
          await StatusBar.setBackgroundColor({
            color: isDark ? '#1E293B' : '#FFFFFF',
          });
        } catch (err) {
          // Non-blocking in dev or environments where status bar plugin is unconfigured
          console.warn('[ThemeProvider] Could not update StatusBar:', err);
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isDark]);

  const setTheme = useCallback((newTheme: Theme) => {
    startTransition(() => {
      setThemeState(newTheme);
    });
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // Ignore localStorage quotas or disabled storage
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme: Theme = isDark ? 'light' : 'dark';
    setTheme(nextTheme);
  }, [isDark, setTheme]);

  const contextValue = useMemo(() => ({
    theme,
    resolvedTheme,
    isDark,
    setTheme,
    toggleTheme,
  }), [theme, resolvedTheme, isDark, setTheme, toggleTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
