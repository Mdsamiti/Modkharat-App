import React, { createContext, useContext, useState, useCallback } from 'react';
import { I18nManager } from 'react-native';
import type { Language } from '@/types/models';

interface AppContextType {
  language: Language;
  isRTL: boolean;
  isAuthenticated: boolean;
  toggleLanguage: () => void;
  setAuthenticated: (value: boolean) => void;
}

const AppContext = createContext<AppContextType>({
  language: 'en',
  isRTL: false,
  isAuthenticated: false,
  toggleLanguage: () => {},
  setAuthenticated: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [isAuthenticated, setAuthenticated] = useState(false);

  const isRTL = language === 'ar';

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
      value={{ language, isRTL, isAuthenticated, toggleLanguage, setAuthenticated }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
