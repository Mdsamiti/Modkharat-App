import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { I18nManager } from 'react-native';
import type { Language } from '@/types/models';
import { supabase } from '@/services/api/supabase';

interface AppContextType {
  language: Language;
  isRTL: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  toggleLanguage: () => void;
  setAuthenticated: (value: boolean) => void;
}

const AppContext = createContext<AppContextType>({
  language: 'en',
  isRTL: false,
  isAuthenticated: false,
  isLoading: true,
  toggleLanguage: () => {},
  setAuthenticated: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isRTL = language === 'ar';

  // Listen for Supabase auth state changes
  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthenticated(!!session);
      setIsLoading(false);
    });

    // Subscribe to auth changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => {
      const next = prev === 'en' ? 'ar' : 'en';
      const nextRTL = next === 'ar';
      if (I18nManager.isRTL !== nextRTL) {
        I18nManager.forceRTL(nextRTL);
      }
      return next;
    });
  }, []);

  return (
    <AppContext.Provider
      value={{ language, isRTL, isAuthenticated, isLoading, toggleLanguage, setAuthenticated }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
