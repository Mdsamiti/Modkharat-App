/**
 * ============================================================================
 * MODKHARAT - SETUP GUIDE & FILE PLACEMENT MAP
 * ============================================================================
 *
 * This file answers TWO questions:
 *   1. What setup do I do BEFORE I start migrating?
 *   2. Where does each React web file go in the Expo project?
 *
 * Follow this BEFORE opening the MIGRATION_PLAN.tsx
 * ============================================================================
 */


// ============================================================================
// PART 1: INITIAL SETUP (do this in Terminal BEFORE opening Cursor)
// ============================================================================

/**
 * STEP 0: PREREQUISITES
 * ─────────────────────
 * Make sure you have these installed on your machine:
 *
 *   - Node.js 18+ (check: node --version)
 *   - npm 9+ or yarn (check: npm --version)
 *   - Expo CLI: npm install -g expo-cli
 *   - EAS CLI (for builds later): npm install -g eas-cli
 *   - Xcode (macOS only, for iOS simulator)
 *   - Android Studio (for Android emulator)
 *   - Expo Go app on your phone (for testing on real device)
 *
 * Download Expo Go:
 *   iOS:     https://apps.apple.com/app/expo-go/id982107779
 *   Android: https://play.google.com/store/apps/details?id=host.exp.exponent
 */


/**
 * STEP 1: CREATE THE EXPO PROJECT
 * ────────────────────────────────
 * Open Terminal and run:
 *
 *   npx create-expo-app@latest modkharat-mobile --template tabs
 *   cd modkharat-mobile
 *
 * This creates a project with Expo Router (file-based routing) already set up.
 * The "tabs" template gives you the bottom tab navigation structure.
 *
 * After creation, your project looks like:
 *
 *   modkharat-mobile/
 *   ├── app/                  ← Screens go here (file-based routing)
 *   │   ├── (tabs)/           ← Tab screens
 *   │   │   ├── index.tsx     ← First tab
 *   │   │   ├── explore.tsx   ← Second tab (we'll rename/replace these)
 *   │   │   └── _layout.tsx   ← Tab navigator config
 *   │   ├── _layout.tsx       ← Root layout
 *   │   ├── +not-found.tsx    ← 404 screen
 *   │   └── +html.tsx         ← Web HTML template (optional)
 *   ├── assets/               ← Images, fonts
 *   ├── components/           ← Reusable components
 *   ├── constants/            ← Colors, config
 *   ├── hooks/                ← Custom hooks
 *   ├── node_modules/
 *   ├── app.json              ← App config (name, icon, splash, etc.)
 *   ├── babel.config.js
 *   ├── package.json
 *   └── tsconfig.json
 */


/**
 * STEP 2: INSTALL ALL DEPENDENCIES
 * ─────────────────────────────────
 * Run these commands ONE BY ONE in order:
 *
 * --- Core (some may already be installed by template) ---
 * npx expo install expo-router expo-linking expo-constants expo-status-bar
 * npx expo install react-native-screens react-native-safe-area-context
 * npx expo install react-native-gesture-handler react-native-reanimated
 *
 * --- Styling (NativeWind = Tailwind CSS for React Native) ---
 * npm install nativewind@^4
 * npm install --save-dev tailwindcss@^3.4
 *
 * --- Icons (same names as lucide-react, just different package) ---
 * npm install lucide-react-native
 * npx expo install react-native-svg
 *
 * --- Charts (replaces recharts which doesn't work in RN) ---
 * npm install victory-native
 *
 * --- State Management ---
 * npm install zustand
 *
 * --- Internationalization & RTL ---
 * npm install i18next react-i18next
 * npx expo install expo-localization
 *
 * --- Gradient backgrounds (replaces CSS gradients) ---
 * npx expo install expo-linear-gradient
 *
 * --- Bottom Sheet (replaces the web modal/sheet) ---
 * npm install @gorhom/bottom-sheet
 *
 * --- Backend (placeholder - configure later) ---
 * npm install @supabase/supabase-js
 * npx expo install expo-secure-store
 * npm install react-native-url-polyfill
 *
 * --- Native Features (add as needed) ---
 * npx expo install expo-camera
 * npx expo install expo-av
 * npx expo install expo-image-picker
 * npx expo install expo-notifications
 * npx expo install expo-local-authentication
 * npx expo install expo-haptics
 *
 * --- Forms ---
 * npm install react-hook-form@7.55.0
 */


/**
 * STEP 3: CONFIGURE NATIVEWIND (Tailwind for RN)
 * ────────────────────────────────────────────────
 *
 * 3a. Create/update tailwind.config.js in project root:
 *
 *     /** @type {import('tailwindcss').Config} *\/
 *     module.exports = {
 *       content: [
 *         "./app/**\/*.{js,jsx,ts,tsx}",
 *         "./components/**\/*.{js,jsx,ts,tsx}",
 *       ],
 *       presets: [require("nativewind/preset")],
 *       theme: {
 *         extend: {
 *           colors: {
 *             // Your Modkharat emerald theme is already in Tailwind defaults
 *             // Add custom colors here if needed
 *           },
 *         },
 *       },
 *       plugins: [],
 *     };
 *
 * 3b. Create global.css in project root:
 *
 *     @tailwind base;
 *     @tailwind components;
 *     @tailwind utilities;
 *
 * 3c. Update babel.config.js:
 *
 *     module.exports = function (api) {
 *       api.cache(true);
 *       return {
 *         presets: [
 *           ["babel-preset-expo", { jsxImportSource: "nativewind" }],
 *           "nativewind/babel",
 *         ],
 *       };
 *     };
 *
 * 3d. Create/update metro.config.js in project root:
 *
 *     const { getDefaultConfig } = require("expo/metro-config");
 *     const { withNativeWind } = require("nativewind/metro");
 *     const config = getDefaultConfig(__dirname);
 *     module.exports = withNativeWind(config, { input: "./global.css" });
 *
 * 3e. Import global.css in app/_layout.tsx:
 *
 *     import "../global.css";  // Add this at the top
 *
 * 3f. Add NativeWind types. Create or update nativewind-env.d.ts:
 *
 *     /// <reference types="nativewind/types" />
 */


/**
 * STEP 4: CONFIGURE app.json
 * ──────────────────────────
 * Update app.json with your app's info:
 *
 *   {
 *     "expo": {
 *       "name": "Modkharat",
 *       "slug": "modkharat",
 *       "version": "1.0.0",
 *       "orientation": "portrait",
 *       "icon": "./assets/images/icon.png",
 *       "scheme": "modkharat",
 *       "userInterfaceStyle": "light",
 *       "splash": {
 *         "image": "./assets/images/splash.png",
 *         "resizeMode": "contain",
 *         "backgroundColor": "#059669"
 *       },
 *       "ios": {
 *         "supportsTablet": true,
 *         "bundleIdentifier": "com.yourname.modkharat",
 *         "infoPlist": {
 *           "CFBundleAllowMixedLocalizations": true
 *         }
 *       },
 *       "android": {
 *         "adaptiveIcon": {
 *           "foregroundImage": "./assets/images/adaptive-icon.png",
 *           "backgroundColor": "#059669"
 *         },
 *         "package": "com.yourname.modkharat",
 *         "supportsRTL": true
 *       },
 *       "locales": {
 *         "ar": "./locales/ar.json",
 *         "en": "./locales/en.json"
 *       },
 *       "plugins": [
 *         "expo-router",
 *         "expo-localization",
 *         ["expo-camera", { "cameraPermission": "Allow Modkharat to scan receipts" }],
 *         ["expo-av", { "microphonePermission": "Allow Modkharat to record voice transactions" }]
 *       ]
 *     }
 *   }
 */


/**
 * STEP 5: TEST THE SETUP
 * ──────────────────────
 * Run: npx expo start
 *
 * - Press "i" for iOS simulator
 * - Press "a" for Android emulator
 * - Scan QR code with Expo Go on your phone
 *
 * If it loads the default tabs app, your setup is complete.
 * If NativeWind classes work (try className="bg-red-500" on a View), styling is ready.
 *
 * NOW you can start migrating components.
 */


// ============================================================================
// PART 2: WHERE TO PUT YOUR REACT WEB FILES
// ============================================================================

/**
 * IMPORTANT: You do NOT copy-paste the web files directly!
 * Each file needs conversion (HTML → RN components, etc.)
 *
 * The recommended approach is:
 *
 *   1. Create a folder called /web-reference/ in your Expo project
 *   2. Copy ALL your web component files there (for reference)
 *   3. Create the new RN files in the correct locations
 *   4. Convert each component using the web file as reference
 *   5. Delete /web-reference/ when done
 *
 * Here's the command to copy your web files for reference:
 *
 *   mkdir -p web-reference/components
 *   # Then copy all .tsx files from your web project into web-reference/
 */


// ============================================================================
// PART 3: COMPLETE FOLDER STRUCTURE (what to create)
// ============================================================================

/**
 * Here is the EXACT folder structure you need to create.
 * Files marked with [CREATE] need to be created from scratch.
 * Files marked with [CONVERT FROM: xxx] should be converted from the web file.
 *
 * modkharat-mobile/
 * │
 * ├── app/                                    ← SCREENS (Expo Router)
 * │   ├── _layout.tsx                         [CREATE] Root layout with AuthProvider
 * │   │
 * │   ├── (auth)/                             ← Auth screens (shown when logged out)
 * │   │   ├── _layout.tsx                     [CREATE] Simple Stack layout, no tabs
 * │   │   ├── sign-in.tsx                     [CONVERT FROM: /components/SignIn.tsx]
 * │   │   └── sign-up.tsx                     [CONVERT FROM: /components/SignUp.tsx]
 * │   │
 * │   ├── (tabs)/                             ← Main app tabs (shown when logged in)
 * │   │   ├── _layout.tsx                     [CREATE] Tab navigator (replaces BottomNav.tsx)
 * │   │   ├── index.tsx                       [CONVERT FROM: /components/Dashboard.tsx]
 * │   │   ├── transactions.tsx                [CONVERT FROM: /components/Transactions.tsx]
 * │   │   ├── analytics.tsx                   [CONVERT FROM: /components/Analytics.tsx]
 * │   │   ├── planner.tsx                     [CONVERT FROM: /components/SavingPlanner.tsx]
 * │   │   └── family.tsx                      [CONVERT FROM: /components/FamilySpace.tsx]
 * │   │
 * │   ├── budget/
 * │   │   └── [id].tsx                        [CONVERT FROM: /components/BudgetDetail.tsx]
 * │   │
 * │   ├── goal/
 * │   │   ├── [id].tsx                        [CONVERT FROM: /components/GoalDetail.tsx]
 * │   │   └── new.tsx                         [CONVERT FROM: /components/NewGoalFlow.tsx]
 * │   │
 * │   ├── family/
 * │   │   └── members.tsx                     [CONVERT FROM: /components/FamilyMembers.tsx]
 * │   │
 * │   ├── transaction/
 * │   │   └── new.tsx                         [CONVERT FROM: /components/TransactionForm.tsx]
 * │   │
 * │   ├── notifications.tsx                   [CONVERT FROM: /components/Notifications.tsx]
 * │   └── settings.tsx                        [CONVERT FROM: /components/Settings.tsx]
 * │
 * ├── components/                             ← SHARED COMPONENTS
 * │   ├── CustomHeader.tsx                    [CONVERT FROM: /components/TopBar.tsx]
 * │   ├── FloatingActionButton.tsx            [CREATE] The "+" button over tabs
 * │   ├── AddTransactionSheet.tsx             [CONVERT FROM: /components/AddTransactionSheet.tsx]
 * │   ├── ReceiptScanner.tsx                  [CREATE] Native camera component
 * │   ├── VoiceInput.tsx                      [CREATE] Native audio recording component
 * │   └── ui/                                 ← Simple reusable UI primitives
 * │       ├── Card.tsx                        [CREATE] Simple card wrapper
 * │       ├── ProgressBar.tsx                 [CREATE] Progress bar component
 * │       └── Badge.tsx                       [CREATE] Badge/chip component
 * │
 * ├── contexts/                               ← REACT CONTEXTS
 * │   └── AuthContext.tsx                     [CREATE] Auth state provider
 * │
 * ├── services/                               ← API & BACKEND CALLS
 * │   ├── auth.ts                             [CREATE] Auth functions (mock → Supabase)
 * │   └── api.ts                              [CREATE] All data functions (mock → Supabase)
 * │
 * ├── stores/                                 ← ZUSTAND STORES
 * │   └── useAppStore.ts                      [CREATE] Global app state
 * │
 * ├── lib/                                    ← UTILITIES & CONFIG
 * │   ├── supabase.ts                         [CREATE] Supabase client (placeholder)
 * │   ├── i18n.ts                             [CREATE] i18next setup
 * │   ├── notifications.ts                    [CREATE] Push notification setup
 * │   ├── biometrics.ts                       [CREATE] Biometric auth helper
 * │   └── locales/
 * │       ├── en.json                         [CREATE] English translations
 * │       └── ar.json                         [CREATE] Arabic translations
 * │
 * ├── types/                                  ← TYPESCRIPT TYPES
 * │   └── index.ts                            [CREATE] All shared interfaces
 * │
 * ├── assets/                                 ← STATIC ASSETS
 * │   ├── images/
 * │   │   ├── icon.png                        [CREATE] App icon (1024x1024)
 * │   │   ├── splash.png                      [CREATE] Splash screen
 * │   │   └── adaptive-icon.png               [CREATE] Android adaptive icon
 * │   └── fonts/                              ← Custom fonts if needed
 * │
 * ├── web-reference/                          ← YOUR WEB FILES (temporary, for reference)
 * │   ├── App.tsx                             ← Copy of web App.tsx
 * │   └── components/
 * │       ├── Dashboard.tsx                   ← Copy of web Dashboard.tsx
 * │       ├── Transactions.tsx                ← Copy of web Transactions.tsx
 * │       ├── Analytics.tsx                   ← Copy of web Analytics.tsx
 * │       ├── SavingPlanner.tsx               ← Copy of web SavingPlanner.tsx
 * │       ├── FamilySpace.tsx                 ← Copy of web FamilySpace.tsx
 * │       ├── TopBar.tsx                      ← Copy of web TopBar.tsx
 * │       ├── BottomNav.tsx                   ← Copy of web BottomNav.tsx
 * │       ├── SignIn.tsx                      ← Copy of web SignIn.tsx
 * │       ├── SignUp.tsx                      ← Copy of web SignUp.tsx
 * │       ├── Settings.tsx                    ← Copy of web Settings.tsx
 * │       ├── Notifications.tsx               ← Copy of web Notifications.tsx
 * │       ├── BudgetDetail.tsx                ← Copy of web BudgetDetail.tsx
 * │       ├── GoalDetail.tsx                  ← Copy of web GoalDetail.tsx
 * │       ├── NewGoalFlow.tsx                 ← Copy of web NewGoalFlow.tsx
 * │       ├── FamilyMembers.tsx               ← Copy of web FamilyMembers.tsx
 * │       ├── AddTransactionSheet.tsx         ← Copy of web AddTransactionSheet.tsx
 * │       └── TransactionForm.tsx             ← Copy of web TransactionForm.tsx
 * │
 * ├── global.css                              [CREATE] NativeWind base styles
 * ├── nativewind-env.d.ts                     [CREATE] TypeScript types for NativeWind
 * ├── tailwind.config.js                      [CREATE/UPDATE] Tailwind config
 * ├── babel.config.js                         [UPDATE] Add NativeWind preset
 * ├── metro.config.js                         [CREATE/UPDATE] Metro bundler config
 * ├── app.json                                [UPDATE] App metadata
 * ├── package.json
 * └── tsconfig.json
 */


// ============================================================================
// PART 4: DETAILED CONVERSION GUIDE PER FILE
// ============================================================================

/**
 * For each web file, here's EXACTLY what changes and what stays the same.
 */

// ─────────────────────────────────────────────────────────────────────────────
// FILE 1: App.tsx → app/_layout.tsx + app/(tabs)/_layout.tsx
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Your web App.tsx does THREE things:
 *   1. Auth check (isAuthenticated state)     → moves to app/_layout.tsx
 *   2. Tab switching (activeTab state)        → moves to app/(tabs)/_layout.tsx
 *   3. Sub-screen navigation (selected*)      → becomes Expo Router navigation
 *
 * WHAT GETS DELETED:
 *   - ALL useState for navigation (activeTab, selectedBudget, selectedGoal, etc.)
 *   - The renderContent() function
 *   - The showBottomNav logic
 *   - Manual screen switching with if/switch statements
 *   WHY: Expo Router handles all navigation via the file system
 *
 * WHAT STAYS (moves to _layout.tsx):
 *   - Auth check logic (simplified with AuthContext)
 *   - Language state (moves to Zustand store or i18n)
 */

const appLayoutConversion = `
// ┌──────────────────────────────────────────────────┐
// │  WEB: App.tsx (BEFORE)                           │
// │  Your current 245-line App.tsx                    │
// └──────────────────────────────────────────────────┘
//   BECOMES these TWO files:

// ┌──────────────────────────────────────────────────┐
// │  RN: app/_layout.tsx (Root Layout)               │
// └──────────────────────────────────────────────────┘
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import '../global.css';
import '../lib/i18n';

function RootNav() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null; // or splash screen

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
      {/* Detail screens as stack screens */}
      <Stack.Screen name="budget/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="goal/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="goal/new" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="family/members" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="transaction/new" options={{ presentation: 'modal', headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNav />
    </AuthProvider>
  );
}

// ┌──────────────────────────────────────────────────┐
// │  RN: app/(tabs)/_layout.tsx (Tab Navigator)      │
// │  This replaces BottomNav.tsx                      │
// └──────────────────────────────────────────────────┘
import { Tabs } from 'expo-router';
import { View, TouchableOpacity } from 'react-native';
import { Home, Receipt, BarChart3, PiggyBank, Users, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import CustomHeader from '../../components/CustomHeader';
import FloatingActionButton from '../../components/FloatingActionButton';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#059669',
          tabBarInactiveTintColor: '#64748b',
          header: () => <CustomHeader />,
        }}
      >
        <Tabs.Screen name="index"
          options={{ title: t('tabs.dashboard'), tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }} />
        <Tabs.Screen name="transactions"
          options={{ title: t('tabs.transactions'), tabBarIcon: ({ color, size }) => <Receipt color={color} size={size} /> }} />
        <Tabs.Screen name="analytics"
          options={{ title: t('tabs.analytics'), tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} /> }} />
        <Tabs.Screen name="planner"
          options={{ title: t('tabs.planner'), tabBarIcon: ({ color, size }) => <PiggyBank color={color} size={size} /> }} />
        <Tabs.Screen name="family"
          options={{ title: t('tabs.family'), tabBarIcon: ({ color, size }) => <Users color={color} size={size} /> }} />
      </Tabs>
      <FloatingActionButton />
    </View>
  );
}
`;


// ─────────────────────────────────────────────────────────────────────────────
// FILE 2: SignIn.tsx → app/(auth)/sign-in.tsx
// ─────────────────────────────────────────────────────────────────────────────
/**
 * WHAT CHANGES:
 *   - <div> → <View>
 *   - <p>, <span>, <h1>, <h2> → <Text>
 *   - <button> → <TouchableOpacity>
 *   - <form onSubmit> → just call handleSubmit on button press
 *   - <Input> (shadcn) → <TextInput> (React Native)
 *   - <Label> → <Text>
 *   - <Button> (shadcn) → <TouchableOpacity>
 *   - CSS gradient background → <LinearGradient>
 *   - className="fixed top-4 right-4" → absolute positioning with style
 *   - className="min-h-screen" → style={{ flex: 1 }}
 *   - Wrap with <KeyboardAvoidingView> for keyboard handling
 *   - SVG logo → use lucide-react-native icon or <Svg> from react-native-svg
 *
 * WHAT STAYS THE SAME:
 *   - All validation logic (validateEmail, error handling)
 *   - State management (email, password, showPassword, errors)
 *   - Bilingual text object (but should move to i18n JSON files)
 *   - Form field structure
 *
 * NAVIGATION CHANGE:
 *   - onSwitchToSignUp → router.push('/sign-up')
 *   - onSignIn → useAuth().signIn() (no navigation needed, auto-redirects)
 */


// ─────────────────────────────────────────────────────────────────────────────
// FILE 3: Dashboard.tsx → app/(tabs)/index.tsx
// ─────────────────────────────────────────────────────────────────────────────
/**
 * WHAT CHANGES:
 *   - Wrap everything in <ScrollView> (not <div>)
 *   - <div className="bg-gradient-to-br..."> → <LinearGradient colors={[...]}>
 *   - All <div> → <View>, text → <Text>
 *   - Icons: import from 'lucide-react-native', use size={} and color={} props
 *   - onOpenBudget(id) → router.push(`/budget/${id}`)
 *   - onOpenGoal(id) → router.push(`/goal/${id}`)
 *   - Tailwind classes mostly work with NativeWind
 *     EXCEPT: hover:, group-hover:, backdrop-blur (remove these)
 *
 * WHAT STAYS:
 *   - Mock data arrays (categories, goals, recentTransactions)
 *   - Layout structure (cards, progress bars, lists)
 *   - Color scheme
 *
 * LATER (API integration):
 *   - Replace mock data with: const { data } = await api.getTransactions(userId);
 */


// ─────────────────────────────────────────────────────────────────────────────
// FILE 4: Transactions.tsx → app/(tabs)/transactions.tsx
// ─────────────────────────────────────────────────────────────────────────────
/**
 * WHAT CHANGES:
 *   - <input type="text"> → <TextInput>
 *   - <select> → Use a custom modal picker or @react-native-picker/picker
 *     (React Native has no <select>! This is a KEY difference)
 *   - Transaction list: use <FlatList> instead of .map()
 *     (FlatList is more performant for long lists - handles virtualization)
 *   - Filter section: use a bottom sheet or expandable section
 *
 * EXAMPLE of <select> replacement:
 *   Web:    <select value={x} onChange={e => setX(e.target.value)}>
 *   RN:     Use a modal with a list of options, or @react-native-picker/picker
 *
 * EXAMPLE of FlatList:
 *   Web:    {transactions.map(t => <div key={t.id}>...</div>)}
 *   RN:     <FlatList data={transactions} keyExtractor={t => t.id}
 *             renderItem={({ item }) => <TransactionRow item={item} />} />
 */


// ─────────────────────────────────────────────────────────────────────────────
// FILE 5: Analytics.tsx → app/(tabs)/analytics.tsx
// ─────────────────────────────────────────────────────────────────────────────
/**
 * BIGGEST CHANGE: recharts → victory-native
 *
 * recharts does NOT work in React Native at all.
 * You must rewrite all charts using victory-native.
 *
 * Conversion map:
 *   recharts                    →  victory-native
 *   ─────────────────────────────────────────────
 *   <PieChart><Pie>             →  <VictoryPie>
 *   <BarChart><Bar>             →  <VictoryChart><VictoryBar>
 *   <LineChart><Line>           →  <VictoryChart><VictoryLine>
 *   <AreaChart><Area>           →  <VictoryChart><VictoryArea>
 *   <ResponsiveContainer>      →  Not needed (victory auto-sizes)
 *   <CartesianGrid>            →  <VictoryAxis> with grid
 *   <XAxis>                    →  <VictoryAxis>
 *   <YAxis>                    →  <VictoryAxis dependentAxis>
 *   <Tooltip>                  →  <VictoryTooltip>
 *   <Cell fill={color}>        →  colorScale={[...colors]}
 *
 * Example:
 *   // WEB (recharts):
 *   <ResponsiveContainer width="100%" height="100%">
 *     <PieChart>
 *       <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={80}>
 *         {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
 *       </Pie>
 *     </PieChart>
 *   </ResponsiveContainer>
 *
 *   // REACT NATIVE (victory-native):
 *   <VictoryPie
 *     data={data.map(d => ({ x: d.name, y: d.value }))}
 *     colorScale={data.map(d => d.color)}
 *     radius={80}
 *     innerRadius={0}
 *     style={{ labels: { fontSize: 12 } }}
 *   />
 */


// ─────────────────────────────────────────────────────────────────────────────
// FILE 6: BudgetDetail.tsx → app/budget/[id].tsx
// ───────────────────────────────────────────────────────────────────��─────────
/**
 * WHAT CHANGES:
 *   - Gets the budget ID from route params:
 *     const { id } = useLocalSearchParams();
 *   - Back button: router.back() instead of onClose()
 *   - Charts: recharts → victory-native (same as Analytics)
 *   - Gradient header: <LinearGradient>
 *
 * WHAT STAYS:
 *   - All the layout structure, stats grid, insights, transactions list
 *   - Budget calculation logic
 */


// ─────────────────────────────────────────────────────────────────────────────
// FILE 7: GoalDetail.tsx → app/goal/[id].tsx
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Same pattern as BudgetDetail.
 * - const { id } = useLocalSearchParams();
 * - Charts → victory-native
 * - AI Guidance section stays the same structurally
 *   (will connect to AI API later)
 */


// ─────────────────────────────────────────────────────────────────────────────
// FILE 8: AddTransactionSheet.tsx → components/AddTransactionSheet.tsx
// ─────────────────────────────────────────────────────────────────────────────
/**
 * This is the BOTTOM SHEET that slides up from the bottom.
 *
 * Web: Uses absolute positioning + CSS animation
 * RN:  Uses @gorhom/bottom-sheet library
 *
 * import BottomSheet from '@gorhom/bottom-sheet';
 *
 * The content inside (type selector, method selector) stays the same,
 * just converted to RN components.
 *
 * When user selects a capture method:
 *   router.push({ pathname: '/transaction/new', params: { type, method } })
 */


// ─────────────────────────────────────────────────────────────────────────────
// FILES NOT MIGRATED (deleted or replaced)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * These web files are NOT migrated because they're replaced by RN equivalents:
 *
 *   /components/ui/*  (accordion, alert-dialog, badge, button, card, etc.)
 *     → These are shadcn/ui components that only work on web
 *     → In RN, use native <View>, <Text>, <TouchableOpacity> with NativeWind
 *     → Create simple /components/ui/ wrappers if you want reusable primitives
 *
 *   /components/BottomNav.tsx
 *     → Replaced by app/(tabs)/_layout.tsx (Expo Router tabs)
 *
 *   /styles/globals.css
 *     → Replaced by global.css (NativeWind)
 *
 *   /components/figma/ImageWithFallback.tsx
 *     → Use <Image> from 'react-native' or expo-image
 */


// ============================================================================
// PART 5: WHAT TO TELL CURSOR
// ============================================================================

/**
 * When working in Cursor, use prompts like these for each file:
 *
 * ─── PROMPT TEMPLATE FOR CONVERTING A SCREEN ─────────────────────────
 *
 *   "Convert this React web component to React Native Expo.
 *
 *    Source file (web): [paste the web component code or reference web-reference/xxx.tsx]
 *    Target file (RN): app/(tabs)/index.tsx
 *
 *    Rules:
 *    - Use View, Text, TouchableOpacity, ScrollView from react-native
 *    - Use NativeWind (className) for styling
 *    - Replace gradients with LinearGradient from expo-linear-gradient
 *    - Use lucide-react-native for icons (size and color props, not className)
 *    - Replace recharts with victory-native
 *    - Replace <select> with a custom picker
 *    - Navigation: use router.push() from expo-router
 *    - Use useTranslation() from react-i18next for text
 *    - Wrap scrollable content in ScrollView
 *    - Keep all mock data for now
 *    - Add keyboard handling for form screens
 *
 *    Reference these for translation keys: lib/locales/en.json, lib/locales/ar.json
 *    Reference these for types: types/index.ts
 *    Reference these for API calls: services/api.ts"
 *
 * ─── PROMPT TEMPLATE FOR CREATING INFRASTRUCTURE FILES ───────────────
 *
 *   "Create the auth context for my React Native Expo app.
 *    It should:
 *    - Have signIn, signUp, signOut functions
 *    - Currently use mock/placeholder implementation
 *    - Have clear comments showing where to replace with Supabase
 *    - Follow the pattern in services/auth.ts
 *    - Wrap the app and handle loading state"
 *
 * ─── PROMPT TEMPLATE FOR CONNECTING DATABASE ─────────────────────────
 *
 *   "Replace the mock implementation in services/api.ts function
 *    getTransactions() with a real Supabase query.
 *    Use supabase.from('transactions').select('*').eq('user_id', userId)
 *    Handle errors and return the same shape as the mock."
 */


// ============================================================================
// PART 6: CHECKLIST (track your progress)
// ============================================================================

/**
 * SETUP PHASE:
 *   [ ] Created Expo project with tabs template
 *   [ ] Installed all dependencies
 *   [ ] Configured NativeWind (tailwind.config, babel, metro, global.css)
 *   [ ] Updated app.json
 *   [ ] Tested that the app runs (npx expo start)
 *   [ ] Copied web files to /web-reference/ folder
 *
 * INFRASTRUCTURE:
 *   [ ] Created types/index.ts
 *   [ ] Created lib/i18n.ts + locales/en.json + locales/ar.json
 *   [ ] Created lib/supabase.ts (placeholder)
 *   [ ] Created services/auth.ts (mock)
 *   [ ] Created services/api.ts (mock)
 *   [ ] Created contexts/AuthContext.tsx
 *   [ ] Created stores/useAppStore.ts
 *
 * SCREENS:
 *   [ ] app/_layout.tsx (root layout)
 *   [ ] app/(auth)/_layout.tsx
 *   [ ] app/(auth)/sign-in.tsx
 *   [ ] app/(auth)/sign-up.tsx
 *   [ ] app/(tabs)/_layout.tsx (tab navigator)
 *   [ ] components/CustomHeader.tsx
 *   [ ] components/FloatingActionButton.tsx
 *   [ ] app/(tabs)/index.tsx (Dashboard)
 *   [ ] app/(tabs)/transactions.tsx
 *   [ ] app/(tabs)/analytics.tsx
 *   [ ] app/(tabs)/planner.tsx
 *   [ ] app/(tabs)/family.tsx
 *   [ ] app/budget/[id].tsx
 *   [ ] app/goal/[id].tsx
 *   [ ] app/goal/new.tsx
 *   [ ] app/family/members.tsx
 *   [ ] app/notifications.tsx
 *   [ ] app/settings.tsx
 *   [ ] components/AddTransactionSheet.tsx
 *   [ ] app/transaction/new.tsx
 *
 * NATIVE FEATURES:
 *   [ ] components/ReceiptScanner.tsx (camera)
 *   [ ] components/VoiceInput.tsx (audio)
 *   [ ] lib/notifications.ts (push notifications)
 *   [ ] lib/biometrics.ts (fingerprint/face)
 *
 * DATABASE (do AFTER all screens work with mock data):
 *   [ ] Created Supabase project
 *   [ ] Ran database schema SQL (from MIGRATION_PLAN.tsx Phase 5.1)
 *   [ ] Enabled RLS policies (from MIGRATION_PLAN.tsx Phase 5.2)
 *   [ ] Updated lib/supabase.ts with real URL and key
 *   [ ] Replaced services/auth.ts mock → Supabase Auth
 *   [ ] Replaced services/api.ts mock → Supabase queries (one function at a time)
 *
 * AI FEATURES (do LAST):
 *   [ ] Created Supabase Edge Function: parse-receipt
 *   [ ] Created Supabase Edge Function: parse-sms
 *   [ ] Created Supabase Edge Function: parse-voice
 *   [ ] Created Supabase Edge Function: ai-goal-tips
 *   [ ] Connected Edge Functions in services/api.ts
 *
 * POLISH:
 *   [ ] Tested on iOS simulator
 *   [ ] Tested on Android emulator
 *   [ ] Tested RTL (Arabic) layout
 *   [ ] Tested on real device with Expo Go
 *   [ ] Deleted /web-reference/ folder
 *   [ ] Created app icon and splash screen
 *   [ ] Built with EAS: eas build --platform all
 */

export {};
