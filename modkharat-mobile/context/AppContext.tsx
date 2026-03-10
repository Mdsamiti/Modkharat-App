import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { I18nManager } from 'react-native';
import type { Language } from '@/types/models';
import { supabase } from '@/services/api/supabase';
import { householdsApi } from '@/services/api';

interface AppContextType {
  language: Language;
  isRTL: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  householdId: string | null;
  toggleLanguage: () => void;
  setAuthenticated: (value: boolean) => void;
}

const AppContext = createContext<AppContextType>({
  language: 'en',
  isRTL: false,
  isAuthenticated: false,
  isLoading: true,
  householdId: null,
  toggleLanguage: () => {},
  setAuthenticated: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [householdId, setHouseholdId] = useState<string | null>(null);

  const isRTL = language === 'ar';

  // Ensure user has a household — create a default one if none exists
  const ensureHousehold = useCallback(async () => {
    try {
      const res = await householdsApi.listHouseholds();
      if (res.data && res.data.length > 0) {
        setHouseholdId(res.data[0].id);
      } else {
        // Auto-create a default household for new users
        const created = await householdsApi.createHousehold('My Family');
        setHouseholdId(created.data.id);
      }
    } catch {
      // Silently fail — household will be retried on next app open
    }
  }, []);

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
      if (!session) {
        setHouseholdId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // When authenticated, ensure a household exists
  useEffect(() => {
    if (isAuthenticated) {
      ensureHousehold();
    }
  }, [isAuthenticated, ensureHousehold]);

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
      value={{ language, isRTL, isAuthenticated, isLoading, householdId, toggleLanguage, setAuthenticated }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
