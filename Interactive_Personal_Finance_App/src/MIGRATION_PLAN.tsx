/**
 * ============================================================================
 * MODKHARAT - React Web to React Native Expo Migration Plan
 * ============================================================================
 *
 * This file is a comprehensive migration guide for Cursor AI.
 * It covers project setup, component-by-component conversion,
 * database schema, API integration points, and native feature setup.
 *
 * IMPORTANT: This is a PLAN file, not executable code.
 * Each section contains instructions, pseudocode, and templates.
 * ============================================================================
 */

// ============================================================================
// TABLE OF CONTENTS
// ============================================================================
//
// PHASE 1: Project Setup & Foundation
//   1.1  Create Expo project
//   1.2  Install dependencies
//   1.3  Configure NativeWind (Tailwind for RN)
//   1.4  Configure i18n and RTL
//   1.5  Set up Expo Router (file-based routing)
//
// PHASE 2: Core Infrastructure
//   2.1  Authentication context & service layer
//   2.2  API service layer (placeholder)
//   2.3  Database service layer (placeholder)
//   2.4  State management (Zustand or Context)
//   2.5  Shared types/interfaces
//
// PHASE 3: Component Migration (screen by screen)
//   3.1  SignIn & SignUp screens
//   3.2  Layout: TopBar → custom Header
//   3.3  Layout: BottomNav → Bottom Tab Navigator
//   3.4  Dashboard screen
//   3.5  Transactions screen
//   3.6  Analytics screen (charts)
//   3.7  Saving Planner screen
//   3.8  Family Space screen
//   3.9  Settings screen
//   3.10 Notifications screen
//   3.11 Detail screens (BudgetDetail, GoalDetail, NewGoalFlow, FamilyMembers)
//   3.12 Transaction flow (AddTransactionSheet, TransactionForm)
//
// PHASE 4: Native Features
//   4.1  Camera/Receipt scanning
//   4.2  Voice input
//   4.3  SMS reading
//   4.4  Push notifications
//   4.5  Biometric authentication
//
// PHASE 5: Database Schema & API Routes
//   5.1  Complete database schema (Supabase/PostgreSQL)
//   5.2  API endpoints list
//   5.3  Row Level Security policies
//
// PHASE 6: Testing, Polish & Deployment
//   6.1  Testing strategy
//   6.2  Performance optimization
//   6.3  App store preparation
//
// ============================================================================


// ============================================================================
// PHASE 1: PROJECT SETUP & FOUNDATION
// ============================================================================

/**
 * 1.1 CREATE EXPO PROJECT
 * -----------------------
 * Run these commands in your terminal:
 *
 * npx create-expo-app@latest modkharat --template tabs
 * cd modkharat
 *
 * This creates an Expo project with file-based routing (Expo Router).
 */

/**
 * 1.2 INSTALL DEPENDENCIES
 * ------------------------
 * Core navigation & UI:
 *   npx expo install expo-router expo-linking expo-constants
 *   npx expo install @react-navigation/native @react-navigation/bottom-tabs
 *   npx expo install react-native-screens react-native-safe-area-context
 *   npx expo install react-native-gesture-handler react-native-reanimated
 *
 * Styling (NativeWind = Tailwind for React Native):
 *   npm install nativewind tailwindcss
 *   npx tailwindcss init
 *
 * Charts (replaces recharts):
 *   npm install victory-native react-native-svg
 *
 * Icons (replaces lucide-react):
 *   npm install lucide-react-native react-native-svg
 *   NOTE: lucide-react-native has the SAME icon names, so imports stay similar
 *
 * State management:
 *   npm install zustand
 *
 * i18n & RTL:
 *   npm install i18next react-i18next expo-localization
 *
 * Forms:
 *   npm install react-hook-form@7.55.0
 *
 * Backend/API:
 *   npm install @supabase/supabase-js
 *   npx expo install expo-secure-store  (for token storage)
 *
 * Native features:
 *   npx expo install expo-camera          (receipt scanning)
 *   npx expo install expo-speech          (voice - TTS)
 *   npx expo install expo-av              (audio recording)
 *   npx expo install expo-sms             (SMS reading - Android only)
 *   npx expo install expo-notifications   (push notifications)
 *   npx expo install expo-local-authentication  (biometrics)
 *   npx expo install expo-image-picker    (photo picking)
 *   npx expo install expo-haptics         (haptic feedback)
 *
 * Animation:
 *   Already included via react-native-reanimated
 */

/**
 * 1.3 CONFIGURE NATIVEWIND (Tailwind for RN)
 * -------------------------------------------
 * File: tailwind.config.js
 */
const tailwindConfig = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: "#ecfdf5", 100: "#d1fae5", 200: "#a7f3d0",
          300: "#6ee7b7", 400: "#34d399", 500: "#10b981",
          600: "#059669", 700: "#047857", 800: "#065f46",
          900: "#064e3b",
        },
        // Keep your existing color tokens
      },
    },
  },
  plugins: [],
};

/**
 * In babel.config.js, add:
 *   plugins: ["nativewind/babel"]
 *
 * In app/_layout.tsx, import the global CSS:
 *   import "../global.css";
 */


/**
 * 1.4 CONFIGURE i18n AND RTL
 * --------------------------
 * Create: /lib/i18n.ts
 *
 * React Native has BUILT-IN RTL support via I18nManager.
 * Unlike web where you toggle `dir="rtl"` on divs,
 * RN requires I18nManager.forceRTL(true) and an app restart.
 */
const i18nSetupExample = `
// lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import * as Updates from 'expo-updates';
import { getLocales } from 'expo-localization';

// Import translation files
import en from './locales/en.json';
import ar from './locales/ar.json';

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ar: { translation: ar } },
  lng: getLocales()[0]?.languageCode || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

// Function to toggle language
export const toggleLanguage = async () => {
  const newLang = i18n.language === 'en' ? 'ar' : 'en';
  const isRTL = newLang === 'ar';

  i18n.changeLanguage(newLang);

  if (I18nManager.isRTL !== isRTL) {
    I18nManager.forceRTL(isRTL);
    // Requires app restart for RTL to take effect
    await Updates.reloadAsync();
  }
};

export default i18n;
`;

/**
 * Translation files structure:
 *
 * /lib/locales/en.json
 * /lib/locales/ar.json
 *
 * Extract ALL the bilingual text objects from every component
 * into these JSON files. Example:
 *
 * en.json:
 * {
 *   "dashboard": {
 *     "totalBalance": "Total Balance",
 *     "income": "Income",
 *     "expenses": "Expenses",
 *     "thisMonth": "This Month",
 *     ...
 *   },
 *   "transactions": { ... },
 *   "analytics": { ... },
 *   "planner": { ... },
 *   "family": { ... },
 *   "auth": {
 *     "welcomeBack": "Welcome Back",
 *     "signIn": "Sign In",
 *     ...
 *   }
 * }
 *
 * ar.json:
 * {
 *   "dashboard": {
 *     "totalBalance": "الرصيد الإجمالي",
 *     ...
 *   }
 * }
 */


/**
 * 1.5 SET UP EXPO ROUTER (file-based routing)
 * --------------------------------------------
 * Expo Router uses file-system-based routing like Next.js.
 *
 * Directory structure:
 *
 * app/
 * ├── _layout.tsx              ← Root layout (providers, auth check)
 * ├── (auth)/
 * │   ├── _layout.tsx          ← Auth layout (no tabs)
 * │   ├── sign-in.tsx          ← SignIn screen
 * │   └── sign-up.tsx          ← SignUp screen
 * ├── (tabs)/
 * │   ├── _layout.tsx          ← Tab layout (BottomNav equivalent)
 * │   ├── index.tsx            ← Dashboard (home tab)
 * │   ├── transactions.tsx     ← Transactions tab
 * │   ├── analytics.tsx        ← Analytics tab
 * │   ├── planner.tsx          ← Saving Planner tab
 * │   └── family.tsx           ← Family Space tab
 * ├── budget/
 * │   └── [id].tsx             ← BudgetDetail (dynamic route)
 * ├── goal/
 * │   ├── [id].tsx             ← GoalDetail (dynamic route)
 * │   └── new.tsx              ← NewGoalFlow
 * ├── family/
 * │   └── members.tsx          ← FamilyMembers
 * ├── notifications.tsx        ← Notifications screen
 * └── settings.tsx             ← Settings screen
 */

const rootLayoutExample = `
// app/_layout.tsx
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import '../global.css';
import '../lib/i18n';

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />; // Your loading screen
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="budget/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="goal/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="goal/new" options={{ presentation: 'modal' }} />
          <Stack.Screen name="family/members" options={{ presentation: 'card' }} />
          <Stack.Screen name="notifications" options={{ presentation: 'card' }} />
          <Stack.Screen name="settings" options={{ presentation: 'card' }} />
        </>
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
`;

const tabLayoutExample = `
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Home, Receipt, BarChart3, PiggyBank, Users } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#059669', // emerald-600
        tabBarInactiveTintColor: '#64748b', // slate-500
        tabBarStyle: {
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
        // Custom header component (replaces TopBar)
        header: () => <CustomHeader />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('dashboard.title'),
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: t('transactions.title'),
          tabBarIcon: ({ color, size }) => <Receipt color={color} size={size} />,
        }}
      />
      {/* Add spacer for FAB */}
      <Tabs.Screen
        name="analytics"
        options={{
          title: t('analytics.title'),
          tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: t('planner.title'),
          tabBarIcon: ({ color, size }) => <PiggyBank color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="family"
        options={{
          title: t('family.title'),
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
`;


// ============================================================================
// PHASE 2: CORE INFRASTRUCTURE
// ============================================================================

/**
 * 2.1 AUTHENTICATION CONTEXT & SERVICE
 * -------------------------------------
 *
 * Create: /contexts/AuthContext.tsx
 * Create: /services/auth.ts
 *
 * *** DATABASE INTEGRATION POINT ***
 * The auth service is where you'll connect Supabase Auth.
 * For now, use mock/local state. Replace later.
 */
const authServiceTemplate = `
// services/auth.ts
// ============================================================
// >>> DATABASE/API INTEGRATION POINT: AUTHENTICATION <<<
// Replace these mock functions with Supabase Auth calls.
// ============================================================

import { supabase } from '../lib/supabase';  // Create this later

// --- MOCK IMPLEMENTATION (remove when connecting Supabase) ---
let mockUser: any = null;

export const authService = {
  // >>> REPLACE WITH: supabase.auth.signInWithPassword({ email, password })
  signIn: async (email: string, password: string) => {
    // MOCK: Simulate successful sign-in
    mockUser = { id: '1', email, name: 'Ahmed' };
    return { user: mockUser, error: null };
  },

  // >>> REPLACE WITH: supabase.auth.signUp({ email, password, options: { data: { name } } })
  signUp: async (name: string, email: string, password: string) => {
    // MOCK: Simulate successful sign-up
    mockUser = { id: '1', email, name };
    return { user: mockUser, error: null };
  },

  // >>> REPLACE WITH: supabase.auth.signOut()
  signOut: async () => {
    mockUser = null;
    return { error: null };
  },

  // >>> REPLACE WITH: supabase.auth.getUser()
  getCurrentUser: async () => {
    return { user: mockUser, error: null };
  },

  // >>> REPLACE WITH: supabase.auth.onAuthStateChange(callback)
  onAuthStateChange: (callback: (user: any) => void) => {
    // MOCK: No-op
    return { unsubscribe: () => {} };
  },

  // >>> REPLACE WITH: supabase.auth.resetPasswordForEmail(email)
  resetPassword: async (email: string) => {
    return { error: null };
  },
};
`;

const authContextTemplate = `
// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    authService.getCurrentUser().then(({ user }) => {
      setUser(user);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { unsubscribe } = authService.onAuthStateChange((user) => {
      setUser(user);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    const { user, error } = await authService.signIn(email, password);
    if (error) return { error: error.message };
    setUser(user);
    return {};
  };

  const signUp = async (name: string, email: string, password: string) => {
    const { user, error } = await authService.signUp(name, email, password);
    if (error) return { error: error.message };
    setUser(user);
    return {};
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, isLoading, signIn, signUp, signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
`;


/**
 * 2.2 API SERVICE LAYER
 * ----------------------
 * Create: /services/api.ts
 *
 * This is the centralized place where ALL API calls go.
 * Currently returns mock data. Replace with Supabase queries.
 */
const apiServiceTemplate = `
// services/api.ts
// ============================================================
// >>> DATABASE/API INTEGRATION POINT: ALL DATA OPERATIONS <<<
// Each function below is a placeholder. Replace the mock data
// with actual Supabase queries when you connect your database.
// ============================================================

import { supabase } from '../lib/supabase';

// ------ TRANSACTIONS ------
// >>> REPLACE WITH: supabase.from('transactions').select('*').eq('user_id', userId)
export const getTransactions = async (userId: string, filters?: any) => {
  // MOCK DATA - replace with Supabase query
  return {
    data: [
      { id: '1', merchant: 'Carrefour', category: 'Shopping', amount: -245.50, date: '2025-11-26', type: 'expense', method: 'sms', hasReceipt: true },
      { id: '2', merchant: 'Salary - November', category: 'Income', amount: 8500, date: '2025-11-25', type: 'income', method: 'manual', hasReceipt: false },
      // ... more mock data
    ],
    error: null
  };
};

// >>> REPLACE WITH: supabase.from('transactions').insert(transaction)
export const createTransaction = async (transaction: any) => {
  return { data: { id: 'new-id', ...transaction }, error: null };
};

// >>> REPLACE WITH: supabase.from('transactions').update(updates).eq('id', id)
export const updateTransaction = async (id: string, updates: any) => {
  return { data: { id, ...updates }, error: null };
};

// >>> REPLACE WITH: supabase.from('transactions').delete().eq('id', id)
export const deleteTransaction = async (id: string) => {
  return { error: null };
};


// ------ BUDGETS ------
// >>> REPLACE WITH: supabase.from('budgets').select('*').eq('user_id', userId)
export const getBudgets = async (userId: string) => {
  return {
    data: [
      { id: '1', name: 'Shopping', limit: 3000, spent: 2450, period: 'monthly' },
      { id: '2', name: 'Food & Dining', limit: 2000, spent: 1820, period: 'monthly' },
      // ...
    ],
    error: null
  };
};

// >>> REPLACE WITH: supabase.from('budgets').select('*').eq('id', id)
export const getBudgetById = async (id: string) => {
  return { data: { /* budget detail */ }, error: null };
};

// >>> REPLACE WITH: supabase.from('budgets').insert(budget)
export const createBudget = async (budget: any) => {
  return { data: { id: 'new-id', ...budget }, error: null };
};

// >>> REPLACE WITH: supabase.from('budgets').update(updates).eq('id', id)
export const updateBudget = async (id: string, updates: any) => {
  return { data: { id, ...updates }, error: null };
};


// ------ SAVINGS GOALS ------
// >>> REPLACE WITH: supabase.from('goals').select('*').eq('user_id', userId)
export const getGoals = async (userId: string) => {
  return { data: [ /* mock goals */ ], error: null };
};

// >>> REPLACE WITH: supabase.from('goals').select('*, contributions(*)').eq('id', id)
export const getGoalById = async (id: string) => {
  return { data: { /* goal with contributions */ }, error: null };
};

// >>> REPLACE WITH: supabase.from('goals').insert(goal)
export const createGoal = async (goal: any) => {
  return { data: { id: 'new-id', ...goal }, error: null };
};

// >>> REPLACE WITH: supabase.from('goal_contributions').insert(contribution)
export const addGoalContribution = async (goalId: string, amount: number) => {
  return { data: { id: 'new-id', goalId, amount }, error: null };
};


// ------ FAMILY ------
// >>> REPLACE WITH: supabase.from('family_groups').select('*, family_members(*, profiles(*))').eq('id', groupId)
export const getFamilyGroup = async (groupId: string) => {
  return { data: { /* family group with members */ }, error: null };
};

// >>> REPLACE WITH: supabase.from('family_invites').insert(invite)
export const inviteFamilyMember = async (groupId: string, email: string) => {
  return { data: { /* invite */ }, error: null };
};

// >>> REPLACE WITH: supabase.from('family_members').update(updates).eq('id', memberId)
export const updateMemberPermissions = async (memberId: string, permissions: any) => {
  return { data: { memberId, ...permissions }, error: null };
};


// ------ NOTIFICATIONS ------
// >>> REPLACE WITH: supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false })
export const getNotifications = async (userId: string) => {
  return { data: [ /* mock notifications */ ], error: null };
};

// >>> REPLACE WITH: supabase.from('notifications').update({ read: true }).eq('id', id)
export const markNotificationRead = async (id: string) => {
  return { error: null };
};


// ------ ANALYTICS ------
// >>> REPLACE WITH: supabase.rpc('get_spending_by_category', { user_id: userId, period: period })
export const getSpendingByCategory = async (userId: string, period: string) => {
  return { data: [ /* category breakdown */ ], error: null };
};

// >>> REPLACE WITH: supabase.rpc('get_income_vs_expenses', { user_id: userId, months: 5 })
export const getIncomeVsExpenses = async (userId: string, months: number) => {
  return { data: [ /* monthly comparison */ ], error: null };
};


// ------ AI / SMART FEATURES ------
// >>> REPLACE WITH: Call to your AI endpoint (e.g., Edge Function or external API)
export const getAIGoalRecommendation = async (goalId: string, userId: string) => {
  // This would call a Supabase Edge Function or external AI API
  // Example: supabase.functions.invoke('ai-goal-recommendation', { body: { goalId, userId } })
  return {
    data: {
      monthlyContribution: 1500,
      tips: [
        { title: 'Cut 100 SAR from groceries', text: '...' },
      ]
    },
    error: null
  };
};

// >>> REPLACE WITH: Call to OCR/AI endpoint for receipt parsing
export const parseReceipt = async (imageBase64: string) => {
  // This would call a Supabase Edge Function with OCR capability
  // Example: supabase.functions.invoke('parse-receipt', { body: { image: imageBase64 } })
  return {
    data: { amount: 156.75, merchant: 'IKEA', date: '2025-11-27', category: 'Shopping' },
    error: null
  };
};

// >>> REPLACE WITH: Call to SMS parser endpoint
export const parseSMS = async (smsText: string) => {
  // Example: supabase.functions.invoke('parse-sms', { body: { text: smsText } })
  return {
    data: { amount: 245.50, merchant: 'Carrefour', date: '2025-11-27' },
    error: null
  };
};

// >>> REPLACE WITH: Call to speech-to-text endpoint
export const parseVoice = async (audioBase64: string) => {
  // Example: supabase.functions.invoke('parse-voice', { body: { audio: audioBase64 } })
  return {
    data: { transcript: 'I spent 32 riyals at Starbucks', amount: 32, merchant: 'Starbucks' },
    error: null
  };
};
`;


/**
 * 2.3 SUPABASE CLIENT SETUP
 * --------------------------
 * Create: /lib/supabase.ts
 *
 * *** DATABASE INTEGRATION POINT ***
 */
const supabaseClientTemplate = `
// lib/supabase.ts
// ============================================================
// >>> DATABASE INTEGRATION POINT: SUPABASE CLIENT <<<
// Replace the placeholder URL and key with your actual values.
// ============================================================

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = 'YOUR_SUPABASE_URL_HERE';      // <<< REPLACE
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';   // <<< REPLACE

// Secure storage adapter for React Native (stores auth tokens securely)
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Important for React Native
  },
});
`;


/**
 * 2.4 STATE MANAGEMENT (Zustand)
 * ------------------------------
 * Create: /stores/useAppStore.ts
 *
 * Replaces all the useState calls in App.tsx.
 * Components can access state from any screen without prop drilling.
 */
const zustandStoreTemplate = `
// stores/useAppStore.ts
import { create } from 'zustand';

interface AppState {
  // Language
  language: 'en' | 'ar';
  toggleLanguage: () => void;

  // Transaction flow
  showAddTransaction: boolean;
  transactionType: 'income' | 'expense' | null;
  captureMethod: 'manual' | 'sms' | 'voice' | 'scan' | null;
  openAddTransaction: () => void;
  closeAddTransaction: () => void;
  setTransactionType: (type: 'income' | 'expense') => void;
  setCaptureMethod: (method: 'manual' | 'sms' | 'voice' | 'scan') => void;
}

export const useAppStore = create<AppState>((set) => ({
  language: 'en',
  toggleLanguage: () => set((state) => ({ language: state.language === 'en' ? 'ar' : 'en' })),

  showAddTransaction: false,
  transactionType: null,
  captureMethod: null,
  openAddTransaction: () => set({ showAddTransaction: true, transactionType: null, captureMethod: null }),
  closeAddTransaction: () => set({ showAddTransaction: false, transactionType: null, captureMethod: null }),
  setTransactionType: (type) => set({ transactionType: type }),
  setCaptureMethod: (method) => set({ captureMethod: method }),
}));
`;


/**
 * 2.5 SHARED TYPES / INTERFACES
 * ------------------------------
 * Create: /types/index.ts
 *
 * Extract all interfaces into a shared types file.
 */
const typesTemplate = `
// types/index.ts

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  language: 'en' | 'ar';
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  merchant?: string;
  date: string;
  method: 'manual' | 'sms' | 'voice' | 'scan';
  notes?: string;
  receiptUrl?: string;
  accountId: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  name: string;
  limit: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'custom';
  categoryId: string;
  startDate: string;
  endDate: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string;
  monthlyContribution: number;
  accountId: string;
  icon: string;
  familyGroupId?: string;  // null = personal, set = shared
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number;
  date: string;
  balance: number;
}

export interface FamilyGroup {
  id: string;
  name: string;
  organizerId: string;
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'organizer' | 'member';
  permissions: {
    viewOnly: boolean;
    canAddTransactions: boolean;
    canEditBudgets: boolean;
    canManageMembers: boolean;
  };
}

export interface Notification {
  id: string;
  userId: string;
  type: 'budget' | 'goal' | 'unusual' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: 'main' | 'savings' | 'cash' | 'investment';
  balance: number;
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  color: string;
  isDefault: boolean;
}
`;


// ============================================================================
// PHASE 3: COMPONENT MIGRATION (screen by screen)
// ============================================================================

/**
 * CRITICAL CONVERSION RULES (apply to EVERY component):
 * ======================================================
 *
 * 1. HTML → React Native element mapping:
 *    <div>            → <View>
 *    <span>, <p>      → <Text>
 *    <button>         → <TouchableOpacity> or <Pressable>
 *    <input>          → <TextInput>
 *    <img>            → <Image>
 *    <select>         → Custom picker or @react-native-picker/picker
 *    <textarea>       → <TextInput multiline>
 *    <svg>            → Use react-native-svg or lucide-react-native
 *    <form>           → <View> (no form element in RN)
 *    <label>          → <Text>
 *    <a>              → <TouchableOpacity> with Linking.openURL
 *    <header>, <main>, <nav> → <View>
 *
 * 2. Styling:
 *    className="..." → className="..." (with NativeWind)
 *    OR use StyleSheet.create()
 *    NOTE: Some Tailwind classes DON'T work in NativeWind:
 *      - No hover: states (use Pressable with pressed state)
 *      - No CSS animations (use react-native-reanimated)
 *      - No backdrop-blur (use @react-native-community/blur)
 *      - No gradients via Tailwind (use expo-linear-gradient)
 *      - No grid (use flex layouts)
 *      - No ::before/::after pseudo-elements
 *
 * 3. Text must ALWAYS be inside <Text>:
 *    WRONG:  <View>Hello</View>
 *    RIGHT:  <View><Text>Hello</Text></View>
 *
 * 4. Scrolling:
 *    overflow-y-auto → <ScrollView> or <FlatList>
 *    The main content area should use ScrollView
 *
 * 5. Navigation:
 *    onClick + setState → router.push('/path') from expo-router
 *    e.g., onOpenBudget(id) → router.push(\`/budget/\${id}\`)
 *
 * 6. Icons:
 *    import { Home } from 'lucide-react'     →  import { Home } from 'lucide-react-native'
 *    <Home className="w-5 h-5" />            →  <Home size={20} color="#334155" />
 *
 * 7. Gradients:
 *    bg-gradient-to-br from-emerald-500...   →  <LinearGradient colors={['#10b981', '#059669']} />
 *    Install: npx expo install expo-linear-gradient
 *
 * 8. Safe Areas:
 *    Always wrap screens with SafeAreaView or use useSafeAreaInsets()
 *
 * 9. Platform-specific:
 *    import { Platform } from 'react-native'
 *    Platform.OS === 'ios' / 'android'
 *
 * 10. Events:
 *     onClick    → onPress
 *     onChange   → onChangeText (for TextInput)
 *     onSubmit   → handleSubmit manually
 */


/**
 * 3.1 SIGN IN & SIGN UP SCREENS
 * -------------------------------
 * Files: app/(auth)/sign-in.tsx, app/(auth)/sign-up.tsx
 *
 * Migration notes:
 * - Replace <form onSubmit> with manual handleSubmit
 * - Replace <Input> with <TextInput>
 * - Replace <Button> with <TouchableOpacity>
 * - Use KeyboardAvoidingView for form screens
 * - Replace fixed positioning language toggle with absolute positioning
 * - The gradient background uses LinearGradient
 *
 * *** API INTEGRATION POINT ***
 * handleSignIn calls authService.signIn() → Supabase auth
 * handleSignUp calls authService.signUp() → Supabase auth
 */
const signInMigrationExample = `
// app/(auth)/sign-in.tsx
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

export default function SignInScreen() {
  const { signIn } = useAuth();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async () => {
    // Validation logic (same as current)
    // ...

    // >>> API INTEGRATION POINT <<<
    const { error } = await signIn(email, password);
    if (error) {
      setErrors({ general: error });
    }
    // Auth context handles navigation automatically via _layout.tsx
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView className="flex-1 bg-emerald-50" contentContainerClassName="flex-1 justify-center p-4">
        {/* ... converted UI ... */}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
`;


/**
 * 3.2 TOP BAR → CUSTOM HEADER
 * ----------------------------
 * File: /components/CustomHeader.tsx
 *
 * The TopBar becomes a custom header component used in the tab layout.
 * Uses useSafeAreaInsets() for proper status bar spacing.
 */
const customHeaderExample = `
// components/CustomHeader.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Settings } from 'lucide-react-native';
import { useRouter, useSegments } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { toggleLanguage } from '../lib/i18n';

export default function CustomHeader() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();
  const { t } = useTranslation();

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="bg-white border-b border-slate-200"
    >
      <View className="flex-row items-center justify-between px-4 h-14">
        <Text className="text-slate-900 text-lg flex-1">{/* dynamic title */}</Text>

        <View className="flex-row items-center gap-2">
          <TouchableOpacity onPress={toggleLanguage} className="px-3 py-1.5 bg-slate-100 rounded-lg">
            <Text className="text-slate-700">{/* lang toggle */}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/notifications')} className="p-2">
            <Bell size={20} color="#334155" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/settings')} className="p-2">
            <Settings size={20} color="#334155" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
`;


/**
 * 3.3 BOTTOM NAV → TAB NAVIGATOR
 * --------------------------------
 * The BottomNav.tsx is replaced by Expo Router's <Tabs> in
 * app/(tabs)/_layout.tsx (shown above in 1.5).
 *
 * The floating "+" button can be added as an absolute-positioned
 * component overlaying the tabs, OR as a custom tab button.
 */
const fabButtonExample = `
// components/FloatingActionButton.tsx
import { TouchableOpacity, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useAppStore } from '../stores/useAppStore';

export default function FloatingActionButton() {
  const openAddTransaction = useAppStore(s => s.openAddTransaction);

  return (
    <TouchableOpacity
      onPress={openAddTransaction}
      className="absolute bottom-20 self-center w-14 h-14 bg-emerald-600 rounded-full shadow-lg items-center justify-center z-40"
      activeOpacity={0.8}
    >
      <Plus size={24} color="white" />
    </TouchableOpacity>
  );
}
`;


/**
 * 3.4 DASHBOARD SCREEN
 * ---------------------
 * File: app/(tabs)/index.tsx
 *
 * Key changes:
 * - Wrap in <ScrollView>
 * - Replace <div> with <View>, text with <Text>
 * - Replace gradient div with <LinearGradient>
 * - Replace onOpenBudget(id) with router.push(\`/budget/\${id}\`)
 * - Replace onOpenGoal(id) with router.push(\`/goal/\${id}\`)
 *
 * *** API INTEGRATION POINT ***
 * All data (balance, categories, goals, transactions) should come from:
 *   - getTransactions(userId)
 *   - getBudgets(userId)
 *   - getGoals(userId)
 * Use useEffect + useState, or React Query for caching.
 */


/**
 * 3.5 TRANSACTIONS SCREEN
 * ------------------------
 * File: app/(tabs)/transactions.tsx
 *
 * Key changes:
 * - Replace <input type="text"> with <TextInput>
 * - Replace <select> with a custom picker or bottom sheet selector
 * - Replace the transaction list with <FlatList> for performance
 * - Replace filter dropdown with a modal or bottom sheet
 *
 * *** API INTEGRATION POINT ***
 * Transaction data comes from: getTransactions(userId, filters)
 * Use pagination: supabase.from('transactions').range(0, 19)
 */


/**
 * 3.6 ANALYTICS SCREEN (Charts)
 * ------------------------------
 * File: app/(tabs)/analytics.tsx
 *
 * KEY CHANGE: recharts does NOT work in React Native!
 * Replace with victory-native:
 *
 *   recharts PieChart  → victory-native VictoryPie
 *   recharts BarChart  → victory-native VictoryBar
 *   recharts LineChart → victory-native VictoryLine
 *   recharts AreaChart → victory-native VictoryArea
 *
 * Example conversion:
 *   <ResponsiveContainer><PieChart><Pie data={data} /></PieChart></ResponsiveContainer>
 *   →
 *   <VictoryPie data={data.map(d => ({ x: d.name, y: d.value }))} colorScale={colors} />
 *
 * *** API INTEGRATION POINT ***
 * Analytics data comes from:
 *   - getSpendingByCategory(userId, period)
 *   - getIncomeVsExpenses(userId, months)
 *   - getBudgets(userId)
 */


/**
 * 3.7 SAVING PLANNER SCREEN
 * --------------------------
 * File: app/(tabs)/planner.tsx
 *
 * Migration is straightforward - mostly layout conversion.
 * - Replace onOpenGoal(id) → router.push(\`/goal/\${id}\`)
 * - Replace onStartNewGoal → router.push('/goal/new')
 * - Replace gradient with LinearGradient
 *
 * *** API INTEGRATION POINT ***
 * Goal data from: getGoals(userId)
 */


/**
 * 3.8 FAMILY SPACE SCREEN
 * -------------------------
 * File: app/(tabs)/family.tsx
 *
 * Same pattern as other screens.
 * - Replace onOpenMembers → router.push('/family/members')
 * - Replace onOpenGoal → router.push(\`/goal/\${id}\`)
 *
 * *** API INTEGRATION POINT ***
 * Family data from: getFamilyGroup(groupId)
 * This is the most complex data model - involves joins.
 */


/**
 * 3.9 SETTINGS SCREEN
 * --------------------
 * File: app/settings.tsx (stack screen, not tab)
 *
 * Uses Stack navigation (slides in from right).
 * Back button uses router.back().
 *
 * Additional native features to add:
 * - Biometric lock toggle (expo-local-authentication)
 * - Notification permissions (expo-notifications)
 * - Data export (share sheet via expo-sharing)
 * - Delete account (with confirmation dialog)
 *
 * *** API INTEGRATION POINT ***
 * User preferences: supabase.from('user_settings').select/update
 */


/**
 * 3.10 NOTIFICATIONS SCREEN
 * --------------------------
 * File: app/notifications.tsx
 *
 * Use <FlatList> with sections for grouping (Today, Yesterday, Older).
 * Or use <SectionList> which is built for this pattern.
 *
 * *** API INTEGRATION POINT ***
 * Notifications from: getNotifications(userId)
 * Mark read: markNotificationRead(id)
 *
 * For PUSH NOTIFICATIONS (native):
 * Use expo-notifications to register for push tokens.
 * Store push token in user profile.
 * Send push notifications from Supabase Edge Functions.
 */


/**
 * 3.11 DETAIL SCREENS
 * --------------------
 * BudgetDetail → app/budget/[id].tsx
 * GoalDetail   → app/goal/[id].tsx
 * NewGoalFlow  → app/goal/new.tsx
 * FamilyMembers → app/family/members.tsx
 *
 * These use dynamic routes. Access the id via:
 *   const { id } = useLocalSearchParams();
 *
 * Charts in BudgetDetail and GoalDetail: use victory-native.
 *
 * AI Guidance section in GoalDetail:
 * *** API INTEGRATION POINT ***
 * AI tips from: getAIGoalRecommendation(goalId, userId)
 * This calls a Supabase Edge Function that uses OpenAI/Anthropic API.
 */


/**
 * 3.12 TRANSACTION FLOW
 * ----------------------
 * AddTransactionSheet → Bottom sheet modal
 * TransactionForm → Full-screen modal
 *
 * Use @gorhom/bottom-sheet for the AddTransactionSheet:
 *   npm install @gorhom/bottom-sheet
 *
 * The TransactionForm becomes a full-screen modal via Stack.Screen.
 *
 * NATIVE FEATURES in TransactionForm:
 *
 * 'scan' method:
 *   - Use expo-camera to open camera
 *   - Capture photo
 *   - Send to parseReceipt() API ← API INTEGRATION POINT
 *
 * 'voice' method:
 *   - Use expo-av Audio.Recording to record
 *   - Send to parseVoice() API ← API INTEGRATION POINT
 *
 * 'sms' method:
 *   - User pastes text (same as current)
 *   - Send to parseSMS() API ← API INTEGRATION POINT
 *
 * 'manual' method:
 *   - Standard form (same as current)
 *
 * *** API INTEGRATION POINT ***
 * Save: createTransaction(transaction)
 */


// ============================================================================
// PHASE 4: NATIVE FEATURES
// ============================================================================

/**
 * 4.1 CAMERA / RECEIPT SCANNING
 * ------------------------------
 * Replace the mock camera UI with actual expo-camera.
 *
 * npm install expo-camera
 */
const cameraScanExample = `
// components/ReceiptScanner.tsx
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, Image } from 'react-native';
import { parseReceipt } from '../services/api';  // <<< API INTEGRATION POINT

export default function ReceiptScanner({ onResult, onClose }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [parsing, setParsing] = useState(false);
  const cameraRef = useRef(null);

  const takePhoto = async () => {
    if (cameraRef.current) {
      const result = await cameraRef.current.takePictureAsync({ base64: true });
      setPhoto(result);

      // >>> API INTEGRATION POINT <<<
      setParsing(true);
      const { data } = await parseReceipt(result.base64);
      setParsing(false);
      onResult(data);  // { amount, merchant, date, category }
    }
  };

  if (!permission?.granted) {
    return (
      <View>
        <Text>Camera permission required</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <CameraView ref={cameraRef} className="flex-1" facing="back">
        {/* Overlay with frame guide */}
        <TouchableOpacity onPress={takePhoto} className="...">
          {/* Capture button */}
        </TouchableOpacity>
      </CameraView>
    </View>
  );
}
`;


/**
 * 4.2 VOICE INPUT
 * ----------------
 * Replace the mock voice UI with expo-av recording.
 */
const voiceInputExample = `
// components/VoiceInput.tsx
import { Audio } from 'expo-av';
import { useState } from 'react';
import { parseVoice } from '../services/api';  // <<< API INTEGRATION POINT

export default function VoiceInput({ onResult }) {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) return;

    await Audio.setAudioModeAsync({ allowsRecordingIOS: true });
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    setRecording(recording);
    setIsRecording(true);
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();

    // Convert to base64 and send to API
    // >>> API INTEGRATION POINT <<<
    const { data } = await parseVoice(audioBase64);
    onResult(data);  // { transcript, amount, merchant, category }
  };

  return (/* UI similar to current but with real recording */);
}
`;


/**
 * 4.3 SMS READING
 * ----------------
 * Android: Can potentially read SMS with permissions
 * iOS: User must paste manually (same as current web approach)
 *
 * For Android, you could use a native module to read SMS,
 * but for privacy and app store compliance, the paste approach
 * is safer and works cross-platform.
 */


/**
 * 4.4 PUSH NOTIFICATIONS
 * ------------------------
 */
const pushNotificationsSetup = `
// lib/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register for push notifications
export async function registerForPushNotifications(userId: string) {
  if (!Device.isDevice) return;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  // >>> DATABASE INTEGRATION POINT <<<
  // Store the push token in the user's profile
  await supabase
    .from('profiles')
    .update({ push_token: token })
    .eq('id', userId);

  return token;
}
`;


/**
 * 4.5 BIOMETRIC AUTHENTICATION
 * -----------------------------
 */
const biometricSetup = `
// lib/biometrics.ts
import * as LocalAuthentication from 'expo-local-authentication';

export async function authenticateWithBiometrics() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (!hasHardware || !isEnrolled) return false;

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Authenticate to access Modkharat',
    fallbackLabel: 'Use Password',
  });

  return result.success;
}
`;


// ============================================================================
// PHASE 5: DATABASE SCHEMA & API ROUTES
// ============================================================================

/**
 * 5.1 COMPLETE DATABASE SCHEMA (Supabase / PostgreSQL)
 * =====================================================
 *
 * Run this SQL in the Supabase SQL Editor to create all tables.
 * This is the COMPLETE schema for the entire app.
 */
const databaseSchema = `
-- ============================================================
-- >>> DATABASE SCHEMA FOR MODKHARAT <<<
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- PROFILES (extends Supabase auth.users)
-- =====================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'ar')),
  currency TEXT DEFAULT 'SAR',
  push_token TEXT,
  biometric_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- =====================
-- ACCOUNTS
-- =====================
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_ar TEXT,
  type TEXT NOT NULL CHECK (type IN ('main', 'savings', 'cash', 'investment')),
  balance DECIMAL(12, 2) DEFAULT 0,
  currency TEXT DEFAULT 'SAR',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================
-- CATEGORIES
-- =====================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- NULL = system default
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'both')),
  is_default BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, name_ar, icon, color, type, is_default, sort_order) VALUES
  ('Shopping',       'تسوق',     'ShoppingBag', '#3b82f6', 'expense', true, 1),
  ('Food & Dining',  'طعام',     'Coffee',      '#f59e0b', 'expense', true, 2),
  ('Transportation', 'مواصلات',   'Car',         '#8b5cf6', 'expense', true, 3),
  ('Housing',        'سكن',      'Home',        '#ef4444', 'expense', true, 4),
  ('Utilities',      'فواتير',    'Zap',         '#06b6d4', 'expense', true, 5),
  ('Entertainment',  'ترفيه',    'Film',        '#ec4899', 'expense', true, 6),
  ('Healthcare',     'صحة',      'Heart',       '#14b8a6', 'expense', true, 7),
  ('Education',      'تعليم',    'GraduationCap', '#6366f1', 'expense', true, 8),
  ('Salary',         'راتب',     'Briefcase',   '#10b981', 'income',  true, 9),
  ('Freelance',      'عمل حر',   'Laptop',      '#10b981', 'income',  true, 10),
  ('Other',          'أخرى',     'MoreHorizontal', '#64748b', 'both', true, 11);


-- =====================
-- TRANSACTIONS
-- =====================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(12, 2) NOT NULL,
  merchant TEXT,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  method TEXT NOT NULL CHECK (method IN ('manual', 'sms', 'voice', 'scan')),
  receipt_url TEXT,
  notes TEXT,
  tags TEXT[],
  family_group_id UUID REFERENCES family_groups(id),  -- if shared
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_category ON transactions(category_id);


-- =====================
-- BUDGETS
-- =====================
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id),
  name TEXT NOT NULL,
  name_ar TEXT,
  amount_limit DECIMAL(12, 2) NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly', 'custom')),
  start_date DATE,
  end_date DATE,
  is_shared BOOLEAN DEFAULT false,
  family_group_id UUID REFERENCES family_groups(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================
-- SAVINGS GOALS
-- =====================
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_ar TEXT,
  icon TEXT DEFAULT '🎯',
  target_amount DECIMAL(12, 2) NOT NULL,
  saved_amount DECIMAL(12, 2) DEFAULT 0,
  target_date DATE,
  monthly_contribution DECIMAL(12, 2) DEFAULT 0,
  account_id UUID REFERENCES accounts(id),
  is_shared BOOLEAN DEFAULT false,
  family_group_id UUID REFERENCES family_groups(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================
-- GOAL CONTRIBUTIONS
-- =====================
CREATE TABLE goal_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  amount DECIMAL(12, 2) NOT NULL,
  balance_after DECIMAL(12, 2) NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================
-- FAMILY GROUPS
-- =====================
CREATE TABLE family_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  organizer_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('organizer', 'member')),
  view_only BOOLEAN DEFAULT false,
  can_add_transactions BOOLEAN DEFAULT true,
  can_edit_budgets BOOLEAN DEFAULT false,
  can_manage_members BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE TABLE family_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES profiles(id),
  invite_email TEXT,
  invite_phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);


-- =====================
-- NOTIFICATIONS
-- =====================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('budget', 'goal', 'unusual', 'family', 'system')),
  title TEXT NOT NULL,
  title_ar TEXT,
  message TEXT NOT NULL,
  message_ar TEXT,
  read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);


-- =====================
-- USER SETTINGS
-- =====================
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  notification_budget_alerts BOOLEAN DEFAULT true,
  notification_goal_milestones BOOLEAN DEFAULT true,
  notification_unusual_spending BOOLEAN DEFAULT true,
  notification_family_updates BOOLEAN DEFAULT true,
  default_account_id UUID REFERENCES accounts(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================
-- COMPUTED VIEWS (for analytics)
-- =====================

-- Budget spending view (auto-calculates spent amount)
CREATE OR REPLACE VIEW budget_spending AS
SELECT
  b.id AS budget_id,
  b.user_id,
  b.name,
  b.amount_limit,
  COALESCE(SUM(t.amount), 0) AS spent,
  b.amount_limit - COALESCE(SUM(ABS(t.amount)), 0) AS remaining,
  CASE
    WHEN b.amount_limit > 0 THEN
      ROUND((COALESCE(SUM(ABS(t.amount)), 0) / b.amount_limit * 100), 1)
    ELSE 0
  END AS progress_pct
FROM budgets b
LEFT JOIN transactions t ON t.category_id = b.category_id
  AND t.user_id = b.user_id
  AND t.type = 'expense'
  AND t.date >= COALESCE(b.start_date, DATE_TRUNC('month', CURRENT_DATE))
  AND t.date <= COALESCE(b.end_date, (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day'))
GROUP BY b.id;


-- Monthly spending summary
CREATE OR REPLACE FUNCTION get_monthly_summary(p_user_id UUID, p_months INT DEFAULT 6)
RETURNS TABLE (
  month DATE,
  total_income DECIMAL,
  total_expenses DECIMAL,
  net_savings DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE_TRUNC('month', t.date)::DATE AS month,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) AS total_income,
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN ABS(t.amount) ELSE 0 END), 0) AS total_expenses,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -ABS(t.amount) END), 0) AS net_savings
  FROM transactions t
  WHERE t.user_id = p_user_id
    AND t.date >= DATE_TRUNC('month', CURRENT_DATE) - (p_months || ' months')::INTERVAL
  GROUP BY DATE_TRUNC('month', t.date)
  ORDER BY month DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Spending by category for a period
CREATE OR REPLACE FUNCTION get_spending_by_category(
  p_user_id UUID,
  p_start_date DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE)::DATE,
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  category_id UUID,
  category_name TEXT,
  category_name_ar TEXT,
  category_color TEXT,
  total_amount DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.name_ar,
    c.color,
    COALESCE(SUM(ABS(t.amount)), 0)
  FROM categories c
  LEFT JOIN transactions t ON t.category_id = c.id
    AND t.user_id = p_user_id
    AND t.type = 'expense'
    AND t.date BETWEEN p_start_date AND p_end_date
  WHERE (c.user_id = p_user_id OR c.is_default = true)
  GROUP BY c.id, c.name, c.name_ar, c.color
  HAVING COALESCE(SUM(ABS(t.amount)), 0) > 0
  ORDER BY total_amount DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;


/**
 * 5.2 ROW LEVEL SECURITY (RLS)
 * ==============================
 * CRITICAL: Enable RLS on all tables to protect user data.
 */
const rlsPolicies = `
-- ============================================================
-- >>> ROW LEVEL SECURITY POLICIES <<<
-- Enable these AFTER creating the tables
-- ============================================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Accounts
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own accounts" ON accounts FOR ALL USING (auth.uid() = user_id);

-- Transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);
-- Family members can view shared transactions
CREATE POLICY "Family can view shared transactions" ON transactions FOR SELECT
  USING (
    family_group_id IN (
      SELECT group_id FROM family_members WHERE user_id = auth.uid()
    )
  );

-- Budgets
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own budgets" ON budgets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Family can view shared budgets" ON budgets FOR SELECT
  USING (
    family_group_id IN (
      SELECT group_id FROM family_members WHERE user_id = auth.uid()
    )
  );

-- Goals
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own goals" ON goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Family can view shared goals" ON goals FOR SELECT
  USING (
    family_group_id IN (
      SELECT group_id FROM family_members WHERE user_id = auth.uid()
    )
  );

-- Goal contributions
ALTER TABLE goal_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own contributions" ON goal_contributions FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can add contributions to own goals" ON goal_contributions FOR INSERT
  WITH CHECK (
    goal_id IN (SELECT id FROM goals WHERE user_id = auth.uid())
  );

-- Family groups
ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view their groups" ON family_groups FOR SELECT
  USING (id IN (SELECT group_id FROM family_members WHERE user_id = auth.uid()));
CREATE POLICY "Organizers can manage groups" ON family_groups FOR ALL
  USING (organizer_id = auth.uid());

-- Family members
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view group members" ON family_members FOR SELECT
  USING (group_id IN (SELECT group_id FROM family_members fm WHERE fm.user_id = auth.uid()));
CREATE POLICY "Organizers can manage members" ON family_members FOR ALL
  USING (
    group_id IN (SELECT id FROM family_groups WHERE organizer_id = auth.uid())
  );

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- User settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);
`;


/**
 * 5.3 SUPABASE EDGE FUNCTIONS (API Endpoints)
 * =============================================
 * For complex operations and AI features, create Edge Functions.
 *
 * Create these in: supabase/functions/
 *
 * Functions to create:
 *
 * 1. parse-receipt     → OCR + AI to extract transaction data from receipt photo
 * 2. parse-sms         → Regex/AI to extract transaction data from SMS text
 * 3. parse-voice       → Speech-to-text + NLP to extract transaction data
 * 4. ai-goal-tips      → Generate personalized saving tips based on spending patterns
 * 5. budget-alerts     → Cron: check budgets and send push notifications
 * 6. goal-reminders    → Cron: send monthly goal contribution reminders
 * 7. spending-insights → Calculate unusual spending patterns
 *
 * Example Edge Function:
 */
const edgeFunctionExample = `
// supabase/functions/parse-receipt/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { image } = await req.json();

  // >>> API INTEGRATION POINT <<<
  // Call OpenAI Vision API or Google Cloud Vision to parse the receipt
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${Deno.env.get('OPENAI_API_KEY')}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4-vision-preview',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: 'Extract: total amount, merchant name, date, and item categories from this receipt. Return JSON.' },
          { type: 'image_url', image_url: { url: \`data:image/jpeg;base64,\${image}\` } },
        ],
      }],
    }),
  });

  const result = await response.json();
  const parsed = JSON.parse(result.choices[0].message.content);

  return new Response(JSON.stringify(parsed), {
    headers: { 'Content-Type': 'application/json' },
  });
});
`;


// ============================================================================
// PHASE 6: TESTING, POLISH & DEPLOYMENT
// ============================================================================

/**
 * 6.1 TESTING STRATEGY
 * ---------------------
 * - Use Jest + React Native Testing Library for unit tests
 * - Test each service function independently
 * - Test navigation flows with Expo Router
 * - Test RTL layout on both languages
 * - Test on both iOS and Android simulators
 */

/**
 * 6.2 PERFORMANCE OPTIMIZATION
 * -----------------------------
 * - Use FlatList instead of map() for long lists
 * - Use React.memo for expensive components
 * - Use useMemo/useCallback for computed values
 * - Implement pagination for transactions
 * - Cache data with React Query or SWR
 * - Optimize images with expo-image
 */

/**
 * 6.3 APP STORE PREPARATION
 * --------------------------
 * - Run: npx expo prebuild
 * - Configure app.json with proper metadata
 * - Generate app icons and splash screens
 * - Set up EAS Build: npm install -g eas-cli
 * - Run: eas build --platform all
 * - Submit: eas submit
 */


// ============================================================================
// COMPLETE FILE MAPPING: Web → React Native
// ============================================================================

/**
 * This is the definitive mapping from your current files to the new structure:
 *
 * CURRENT WEB FILE                    →  REACT NATIVE EXPO FILE
 * ─────────────────────────────────────────────────────────────────────
 * /App.tsx                            →  app/_layout.tsx (root layout + auth check)
 *                                        app/(tabs)/_layout.tsx (tab navigator)
 *
 * /components/SignIn.tsx              →  app/(auth)/sign-in.tsx
 * /components/SignUp.tsx              →  app/(auth)/sign-up.tsx
 *
 * /components/TopBar.tsx              →  components/CustomHeader.tsx
 * /components/BottomNav.tsx           →  app/(tabs)/_layout.tsx (built into Tabs)
 *
 * /components/Dashboard.tsx           →  app/(tabs)/index.tsx
 * /components/Transactions.tsx        →  app/(tabs)/transactions.tsx
 * /components/Analytics.tsx           →  app/(tabs)/analytics.tsx
 * /components/SavingPlanner.tsx       →  app/(tabs)/planner.tsx
 * /components/FamilySpace.tsx         →  app/(tabs)/family.tsx
 *
 * /components/BudgetDetail.tsx        →  app/budget/[id].tsx
 * /components/GoalDetail.tsx          →  app/goal/[id].tsx
 * /components/NewGoalFlow.tsx         →  app/goal/new.tsx
 * /components/FamilyMembers.tsx       →  app/family/members.tsx
 *
 * /components/Settings.tsx            →  app/settings.tsx
 * /components/Notifications.tsx       →  app/notifications.tsx
 *
 * /components/AddTransactionSheet.tsx →  components/AddTransactionSheet.tsx (bottom sheet)
 * /components/TransactionForm.tsx     →  app/transaction/new.tsx (full screen modal)
 *
 * [NEW FILES]
 * (none)                              →  lib/supabase.ts
 * (none)                              →  lib/i18n.ts
 * (none)                              →  lib/locales/en.json
 * (none)                              →  lib/locales/ar.json
 * (none)                              →  lib/notifications.ts
 * (none)                              →  lib/biometrics.ts
 * (none)                              →  contexts/AuthContext.tsx
 * (none)                              →  services/auth.ts
 * (none)                              →  services/api.ts
 * (none)                              →  stores/useAppStore.ts
 * (none)                              →  types/index.ts
 * (none)                              →  components/CustomHeader.tsx
 * (none)                              →  components/FloatingActionButton.tsx
 * (none)                              →  components/ReceiptScanner.tsx
 * (none)                              →  components/VoiceInput.tsx
 *
 * DELETED (not needed in RN):
 * /components/ui/*                    →  (replace with RN primitives + NativeWind)
 * /styles/globals.css                 →  global.css (NativeWind)
 */


// ============================================================================
// MIGRATION ORDER (recommended sequence for Cursor)
// ============================================================================

/**
 * Follow this exact order for the smoothest migration:
 *
 * STEP 1: Create Expo project + install deps (Phase 1.1-1.2)
 * STEP 2: Configure NativeWind + i18n (Phase 1.3-1.4)
 * STEP 3: Set up file-based routing skeleton (Phase 1.5)
 * STEP 4: Create types/index.ts (Phase 2.5)
 * STEP 5: Create auth context + service (Phase 2.1) ← API PLACEHOLDER
 * STEP 6: Create API service layer with mock data (Phase 2.2) ← API PLACEHOLDER
 * STEP 7: Create Zustand store (Phase 2.4)
 * STEP 8: Build SignIn + SignUp screens (Phase 3.1) ← API PLACEHOLDER
 * STEP 9: Build CustomHeader (Phase 3.2)
 * STEP 10: Build Tab layout with all 5 tab screens (Phase 3.3-3.8)
 * STEP 11: Build detail screens (Phase 3.11)
 * STEP 12: Build transaction flow with bottom sheet (Phase 3.12)
 * STEP 13: Build Settings + Notifications (Phase 3.9-3.10)
 * STEP 14: Add native camera/voice features (Phase 4)
 * STEP 15: Create Supabase project + run schema SQL (Phase 5.1)
 * STEP 16: Set up Supabase client (Phase 2.3) ← CONNECT DATABASE
 * STEP 17: Replace mock data in services/api.ts with Supabase queries ← CONNECT API
 * STEP 18: Replace mock auth in services/auth.ts with Supabase Auth ← CONNECT AUTH
 * STEP 19: Create Edge Functions for AI features (Phase 5.3) ← CONNECT AI APIs
 * STEP 20: Enable RLS policies (Phase 5.2)
 * STEP 21: Test, optimize, deploy (Phase 6)
 *
 * At each "← API PLACEHOLDER" step, the app works with mock data.
 * At each "← CONNECT" step, you swap mock → real implementation.
 */


// ============================================================================
// SUMMARY OF ALL DATABASE/API INTEGRATION POINTS
// ============================================================================

/**
 * Search for ">>> DATABASE" or ">>> API" or ">>> REPLACE WITH" in this file
 * to find every single integration point. Here's the complete list:
 *
 * FILE                    FUNCTION                    CONNECTS TO
 * ───────────────────────────────────────────────────────────────────────
 * lib/supabase.ts         Supabase client             Supabase project URL + key
 * services/auth.ts        signIn()                    supabase.auth.signInWithPassword
 * services/auth.ts        signUp()                    supabase.auth.signUp
 * services/auth.ts        signOut()                   supabase.auth.signOut
 * services/auth.ts        getCurrentUser()            supabase.auth.getUser
 * services/auth.ts        onAuthStateChange()         supabase.auth.onAuthStateChange
 * services/auth.ts        resetPassword()             supabase.auth.resetPasswordForEmail
 * services/api.ts         getTransactions()           supabase.from('transactions').select
 * services/api.ts         createTransaction()         supabase.from('transactions').insert
 * services/api.ts         updateTransaction()         supabase.from('transactions').update
 * services/api.ts         deleteTransaction()         supabase.from('transactions').delete
 * services/api.ts         getBudgets()                supabase.from('budgets').select
 * services/api.ts         getBudgetById()             supabase.from('budgets').select
 * services/api.ts         createBudget()              supabase.from('budgets').insert
 * services/api.ts         updateBudget()              supabase.from('budgets').update
 * services/api.ts         getGoals()                  supabase.from('goals').select
 * services/api.ts         getGoalById()               supabase.from('goals').select (with joins)
 * services/api.ts         createGoal()                supabase.from('goals').insert
 * services/api.ts         addGoalContribution()       supabase.from('goal_contributions').insert
 * services/api.ts         getFamilyGroup()            supabase.from('family_groups').select (with joins)
 * services/api.ts         inviteFamilyMember()        supabase.from('family_invites').insert
 * services/api.ts         updateMemberPermissions()   supabase.from('family_members').update
 * services/api.ts         getNotifications()          supabase.from('notifications').select
 * services/api.ts         markNotificationRead()      supabase.from('notifications').update
 * services/api.ts         getSpendingByCategory()     supabase.rpc('get_spending_by_category')
 * services/api.ts         getIncomeVsExpenses()       supabase.rpc('get_monthly_summary')
 * services/api.ts         getAIGoalRecommendation()   supabase.functions.invoke('ai-goal-tips')
 * services/api.ts         parseReceipt()              supabase.functions.invoke('parse-receipt')
 * services/api.ts         parseSMS()                  supabase.functions.invoke('parse-sms')
 * services/api.ts         parseVoice()                supabase.functions.invoke('parse-voice')
 * lib/notifications.ts    registerForPush()           supabase.from('profiles').update (push_token)
 * contexts/AuthContext     Auth state management       All auth.ts functions
 *
 * EXTERNAL APIS (via Edge Functions):
 * ───────────────────────────────────
 * parse-receipt            OpenAI Vision API or Google Cloud Vision
 * parse-voice              Whisper API or Google Speech-to-Text
 * ai-goal-tips             OpenAI GPT-4 or Anthropic Claude
 * parse-sms                Custom regex + optional AI cleanup
 * budget-alerts (cron)     Expo Push Notification API
 * goal-reminders (cron)    Expo Push Notification API
 */

export {};
