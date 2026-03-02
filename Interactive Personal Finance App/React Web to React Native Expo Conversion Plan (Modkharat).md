# React Web to React Native Expo Conversion Plan (Modkharat)

## Summary
This plan is based on the actual code in the folder, especially [App.tsx](c:/Users/mdsamti/Modkharat-App/Interactive%20Personal%20Finance%20App/src/App.tsx), [package.json](c:/Users/mdsamti/Modkharat-App/Interactive%20Personal%20Finance%20App/package.json), [TopBar.tsx](c:/Users/mdsamti/Modkharat-App/Interactive%20Personal%20Finance%20App/src/components/TopBar.tsx), [BottomNav.tsx](c:/Users/mdsamti/Modkharat-App/Interactive%20Personal%20Finance%20App/src/components/BottomNav.tsx), [Analytics.tsx](c:/Users/mdsamti/Modkharat-App/Interactive%20Personal%20Finance%20App/src/components/Analytics.tsx), [GoalDetail.tsx](c:/Users/mdsamti/Modkharat-App/Interactive%20Personal%20Finance%20App/src/components/GoalDetail.tsx), and [TransactionForm.tsx](c:/Users/mdsamti/Modkharat-App/Interactive%20Personal%20Finance%20App/src/components/TransactionForm.tsx).  
Chosen defaults from your answers: `UI parity first`, `NativeWind`, `Expo Router tabs+stack`.

Current-state facts that drive this plan:
- App is a Vite web project with DOM/Tailwind classes and manual state-based navigation in `App.tsx`.
- Major web-only deps are present: Radix UI, Recharts, shadcn-style UI wrappers, and CSS-centric patterns.
- Only `SignIn`/`SignUp` use local `ui/*` wrappers directly; most screens are plain JSX+className.
- There are 5 tab-like main screens plus multiple detail/flow screens, matching mobile navigation well.
- There are already migration notes in [MIGRATION_PLAN.tsx](c:/Users/mdsamti/Modkharat-App/Interactive%20Personal%20Finance%20App/src/MIGRATION_PLAN.tsx) and [SETUP_GUIDE.tsx](c:/Users/mdsamti/Modkharat-App/Interactive%20Personal%20Finance%20App/src/SETUP_GUIDE.tsx), but scope here is frontend parity first.

## Step-by-step conversion plan

1. Create a clean Expo Router project for mobile conversion.
Action: scaffold a new Expo app (`tabs` template) in a sibling folder, not inside the web folder, to avoid mixed web/native dependency conflicts.
Output: isolated mobile app baseline for iOS/Android with Expo Router.
Responsive note: start from phone-first layout and keep tablet-safe structure from day one.

2. Install Expo-compatible libraries and remove web-only UI/runtime dependencies from the mobile app.
Add: `expo-router`, `nativewind`, `tailwindcss`, `react-native-reanimated`, `react-native-gesture-handler`, `react-native-safe-area-context`, `lucide-react-native`, `react-native-svg`, `victory-native`, `expo-linear-gradient`, `@gorhom/bottom-sheet`, `@react-native-picker/picker`, `i18next`, `react-i18next`, `expo-localization`.
Do not add in mobile app: Radix packages, `recharts`, `react-dom`, `next-themes`, `vaul`, `cmdk`, `embla-carousel-react`, `react-day-picker`, `react-resizable-panels`.
Output: dependency set fully compatible with Expo-managed workflow.

3. Configure NativeWind and Expo runtime foundations.
Action: configure `babel.config.js`, `tailwind.config.js`, `metro.config.js`, `global.css`, and NativeWind typing.
Action: configure `react-native-reanimated` plugin ordering correctly.
Output: `className`-style migration path from web components with minimal style rewrite risk.

4. Define final mobile folder architecture and route map before converting screens.
Target routes:
- `(auth)/sign-in`, `(auth)/sign-up`
- `(tabs)/index` (Dashboard)
- `(tabs)/transactions`
- `(tabs)/analytics`
- `(tabs)/planner`
- `(tabs)/family`
- `budget/[id]`
- `goal/[id]`
- `goal/new`
- `family/members`
- `notifications`
- `settings`
Output: route contract that replaces the boolean/tab state machine currently in `App.tsx`.

5. Build shared app shell and navigation primitives.
Action: implement `AppHeader` (replacement for `TopBar`), tabs layout (replacement for `BottomNav`), and floating add button integrated in tab layout.
Action: convert in-screen back actions to router back navigation.
Output: reusable navigation shell used by all screens.

6. Extract and centralize data models and mock data services.
Action: move hardcoded arrays from screens into `types/*` and `services/mock/*`.
Action: define consistent interfaces for `Transaction`, `Budget`, `Goal`, `FamilyMember`, `NotificationItem`, and `Language`.
Output: one source of truth for mock data and easier later backend integration.

7. Migrate authentication screens first.
Source: `SignIn.tsx`, `SignUp.tsx`, `ui/button.tsx`, `ui/input.tsx`, `ui/label.tsx`, `ui/checkbox.tsx`.
Action: replace HTML form elements with RN primitives (`View`, `Text`, `TextInput`, `Pressable`, `Switch`/custom checkbox).
Action: replace `onSubmit` form behavior with explicit button handlers.
Action: keep validation logic and bilingual labels.
Output: fully native auth screens with same UI intent and validation behavior.

8. Migrate core tab screens (Dashboard, Transactions, Analytics, Planner, Family).
Action: replace web tags (`div`, `button`, `input`, `select`) with RN equivalents.
Action: convert scroll-heavy content to `ScrollView`; convert repeated lists to `FlatList` where useful.
Action: replace `<select>` with `@react-native-picker/picker` or controlled option sheets.
Output: 5 working tab screens matching existing content and interactions.

9. Migrate detail and subflow screens.
Source: `BudgetDetail`, `GoalDetail`, `NewGoalFlow`, `FamilyMembers`, `Notifications`, `Settings`.
Action: convert each into stack screens with route params (`id` where needed).
Action: preserve multi-step logic in `NewGoalFlow` with route-safe state.
Output: all non-tab flows reachable via stack navigation.

10. Rebuild add-transaction modal flow natively.
Source: `AddTransactionSheet.tsx` and `TransactionForm.tsx`.
Action: replace fixed-position overlays and inline `<style>` keyframes with `@gorhom/bottom-sheet` and `Animated`.
Action: split into two components: method picker sheet and transaction form modal/sheet.
Action: ensure keyboard-safe behavior and dismissal gestures on iOS/Android.
Output: native-feeling transaction entry flow with manual/SMS/voice/scan UI states preserved as mock.

11. Replace Recharts with Victory Native equivalents.
Source: `Analytics`, `BudgetDetail`, `GoalDetail`.
Action: map Pie/Bar/Area charts and legends to `victory-native` using `react-native-svg`.
Action: replace web gradient defs with RN-supported chart styling.
Output: chart parity without web-only chart runtime.

12. Implement robust i18n + RTL system.
Action: extract inline bilingual text objects into `locales/en.json` and `locales/ar.json`.
Action: use `react-i18next` across all screens.
Action: apply RTL behavior with `I18nManager` and mirrored layout logic where needed.
Output: centralized translation keys, consistent Arabic/English behavior, scalable localization.

13. Do responsive hardening for varied screen sizes.
Action: use `useWindowDimensions` breakpoints for compact phones vs larger devices.
Action: avoid fixed heights where content can grow; enforce scroll wrappers for long forms.
Action: adapt grids (`grid-cols-3` style layouts) into flexible RN row/wrap patterns.
Action: verify long Arabic strings and numeric formatting do not clip.
Output: UI that works across small phones and larger iOS/Android devices.

14. Accessibility and interaction polish.
Action: add accessibility labels/roles/hints to icon buttons and tab controls.
Action: ensure color contrast and touch target size (`>=44x44`) across interactive elements.
Action: normalize feedback states (pressed, disabled, loading) for all major actions.
Output: production-grade mobile interaction baseline.

15. Testing and acceptance pass.
Action: run on iOS simulator and Android emulator + at least one physical device through Expo Go/dev client.
Action: smoke test all routes, transitions, and primary user flows.
Action: perform RTL/LTR parity test and responsive test matrix.
Output: signed-off parity build for UI-first scope.

16. Deferred phase (explicitly out of this initial scope).
Action: wire backend/auth persistence, OCR/voice/SMS parsing, push notifications, biometrics.
Output: backlog-ready second phase with minimal rework due earlier type/service abstraction.

## Important API/interface/type changes
- Component navigation props will be removed from screen interfaces.
Change: callback props like `onOpenBudget`, `onOpenGoal`, `onClose` become router navigation calls and route params.
- New typed route params will be added.
Add: `BudgetRouteParams { id: string }`, `GoalRouteParams { id: string }`, and other stack params.
- Shared domain models will be centralized.
Add: `types/models.ts` containing `Transaction`, `Budget`, `Goal`, `FamilyMember`, `NotificationItem`, `Language`.
- Translation contract will be centralized.
Add: key-based i18n structure replacing inline bilingual objects inside each component.

## Known conversion challenges and mitigation
- Web DOM/CSS constructs (`div`, `form`, `select`, fixed overlays, `<style>` keyframes) are not portable.
Mitigation: map to RN primitives, picker library, bottom sheet, and Animated.
- Recharts is web-only.
Mitigation: planned one-to-one chart replacement using `victory-native`.
- Radix/shadcn wrappers are web-specific.
Mitigation: do not port full `ui/*`; rebuild only auth-needed controls in RN-native components.
- Current navigation is state-machine based in `App.tsx`.
Mitigation: replace with Expo Router tabs+stack and route params.
- RTL currently uses `dir` attributes.
Mitigation: central i18n + `I18nManager` + mirrored layout utilities.

## Test cases and scenarios
1. Auth flow: sign-in and sign-up validation errors, password visibility toggles, language toggle.
2. Main navigation: all 5 tabs reachable; correct active tab highlighting; floating add button behavior.
3. Transaction flow: type selection, method selection, capture-step transitions, review/save path.
4. Detail screens: open/close and parameterized navigation for budget/goal/family members.
5. Charts: render correctness on both platforms with no crashes and acceptable performance.
6. i18n/RTL: language switch updates text and layout direction; Arabic strings do not overlap/truncate.
7. Responsive: small phone and larger device layouts remain readable and scrollable.
8. Accessibility: screen reader labels on key controls and minimum touch-target compliance.

## Assumptions and defaults used
- Initial delivery is frontend/UI parity with mock data only.
- Styling strategy is NativeWind-first for conversion speed and fidelity.
- Navigation strategy is Expo Router tabs + stack.
- Existing `src/MIGRATION_PLAN.tsx` and `src/SETUP_GUIDE.tsx` are references, not strict implementation scripts.
- Native features and backend integration are intentionally deferred to a second phase.

## Representative conversion patterns (for your “similar conversions” request)
I cannot claim personal project history, but these are the closest representative patterns applied in this plan:
1. Chart-heavy financial dashboard migrations commonly fail when teams keep web chart libraries; replacing charts early avoids late-stage blockers.
2. Modal-heavy web flows convert best when rebuilt around native bottom sheets and route-driven state instead of trying to replicate CSS overlay behavior exactly.
