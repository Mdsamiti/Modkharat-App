import { useState } from 'react';
import BottomNav from './components/BottomNav';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Analytics from './components/Analytics';
import SavingPlanner from './components/SavingPlanner';
import FamilySpace from './components/FamilySpace';
import Settings from './components/Settings';
import Notifications from './components/Notifications';
import AddTransactionSheet from './components/AddTransactionSheet';
import TransactionForm from './components/TransactionForm';
import BudgetDetail from './components/BudgetDetail';
import GoalDetail from './components/GoalDetail';
import NewGoalFlow from './components/NewGoalFlow';
import FamilyMembers from './components/FamilyMembers';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<'signin' | 'signup'>('signin');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | null>(null);
  const [captureMethod, setCaptureMethod] = useState<'manual' | 'sms' | 'voice' | 'scan' | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [showFamilyMembers, setShowFamilyMembers] = useState(false);

  const isRTL = language === 'ar';

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  const handleStartAddTransaction = () => {
    setShowAddTransaction(true);
    setTransactionType(null);
    setCaptureMethod(null);
  };

  const handleSelectTransactionType = (type: 'income' | 'expense') => {
    setTransactionType(type);
  };

  const handleSelectCaptureMethod = (method: 'manual' | 'sms' | 'voice' | 'scan') => {
    setCaptureMethod(method);
  };

  const handleCloseAddTransaction = () => {
    setShowAddTransaction(false);
    setTransactionType(null);
    setCaptureMethod(null);
  };

  const handleSaveTransaction = () => {
    handleCloseAddTransaction();
  };

  const handleOpenBudget = (budgetId: string) => {
    setSelectedBudget(budgetId);
  };

  const handleCloseBudget = () => {
    setSelectedBudget(null);
  };

  const handleOpenGoal = (goalId: string) => {
    setSelectedGoal(goalId);
  };

  const handleCloseGoal = () => {
    setSelectedGoal(null);
  };

  const handleStartNewGoal = () => {
    setShowNewGoal(true);
  };

  const handleCloseNewGoal = () => {
    setShowNewGoal(false);
  };

  const handleOpenFamilyMembers = () => {
    setShowFamilyMembers(true);
  };

  const handleCloseFamilyMembers = () => {
    setShowFamilyMembers(false);
  };

  const handleSignIn = (email: string, password: string) => {
    // For now, this is frontend-only - just set authenticated to true
    console.log('Sign in:', email);
    setIsAuthenticated(true);
  };

  const handleSignUp = (name: string, email: string, password: string) => {
    // For now, this is frontend-only - just set authenticated to true
    console.log('Sign up:', name, email);
    setIsAuthenticated(true);
  };

  const getPageTitle = () => {
    if (showSettings) return language === 'en' ? 'Settings' : 'الإعدادات';
    if (showNotifications) return language === 'en' ? 'Notifications' : 'الإشعارات';
    if (selectedBudget) return language === 'en' ? 'Budget Details' : 'تفاصيل الميزانية';
    if (selectedGoal) return language === 'en' ? 'Goal Details' : 'تفاصيل الهدف';
    if (showNewGoal) return language === 'en' ? 'New Goal' : 'هدف جديد';
    if (showFamilyMembers) return language === 'en' ? 'Family Members' : 'أفراد العائلة';
    
    switch (activeTab) {
      case 'dashboard': return language === 'en' ? 'Dashboard' : 'لوحة التحكم';
      case 'transactions': return language === 'en' ? 'Transactions' : 'المعاملات';
      case 'analytics': return language === 'en' ? 'Analytics' : 'التحليلات';
      case 'planner': return language === 'en' ? 'Saving Planner' : 'مخطط الادخار';
      case 'family': return language === 'en' ? 'Family Space' : 'مساحة العائلة';
      default: return 'Modkharat';
    }
  };

  const renderContent = () => {
    if (showSettings) {
      return <Settings language={language} onClose={() => setShowSettings(false)} />;
    }
    if (showNotifications) {
      return <Notifications language={language} onClose={() => setShowNotifications(false)} />;
    }
    if (selectedBudget) {
      return <BudgetDetail language={language} budgetId={selectedBudget} onClose={handleCloseBudget} />;
    }
    if (selectedGoal) {
      return <GoalDetail language={language} goalId={selectedGoal} onClose={handleCloseGoal} />;
    }
    if (showNewGoal) {
      return <NewGoalFlow language={language} onClose={handleCloseNewGoal} />;
    }
    if (showFamilyMembers) {
      return <FamilyMembers language={language} onClose={handleCloseFamilyMembers} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard language={language} onOpenBudget={handleOpenBudget} onOpenGoal={handleOpenGoal} />;
      case 'transactions':
        return <Transactions language={language} />;
      case 'analytics':
        return <Analytics language={language} onOpenBudget={handleOpenBudget} />;
      case 'planner':
        return <SavingPlanner language={language} onOpenGoal={handleOpenGoal} onStartNewGoal={handleStartNewGoal} />;
      case 'family':
        return <FamilySpace language={language} onOpenGoal={handleOpenGoal} onOpenMembers={handleOpenFamilyMembers} />;
      default:
        return <Dashboard language={language} onOpenBudget={handleOpenBudget} onOpenGoal={handleOpenGoal} />;
    }
  };

  const showBottomNav = !showSettings && !showNotifications && !selectedBudget && !selectedGoal && !showNewGoal && !showFamilyMembers;

  // Show authentication screens if not authenticated
  if (!isAuthenticated) {
    if (authView === 'signin') {
      return (
        <SignIn
          language={language}
          onSignIn={handleSignIn}
          onSwitchToSignUp={() => setAuthView('signup')}
          onToggleLanguage={toggleLanguage}
        />
      );
    } else {
      return (
        <SignUp
          language={language}
          onSignUp={handleSignUp}
          onSwitchToSignIn={() => setAuthView('signin')}
          onToggleLanguage={toggleLanguage}
        />
      );
    }
  }

  // Main app UI (only shown when authenticated)
  return (
    <div className={`min-h-screen bg-slate-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <TopBar
        title={getPageTitle()}
        language={language}
        onToggleLanguage={toggleLanguage}
        onOpenNotifications={() => setShowNotifications(true)}
        onOpenSettings={() => setShowSettings(true)}
        notificationCount={3}
      />

      <main className={`pb-20 ${showBottomNav ? 'pt-16' : 'pt-16'}`}>
        {renderContent()}
      </main>

      {showBottomNav && (
        <>
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} language={language} />
          
          {/* Floating Add Button */}
          <button
            onClick={handleStartAddTransaction}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg flex items-center justify-center z-40 transition-transform active:scale-95"
            aria-label={language === 'en' ? 'Add transaction' : 'إضافة معاملة'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </>
      )}

      {/* Add Transaction Bottom Sheet */}
      {showAddTransaction && !captureMethod && (
        <AddTransactionSheet
          language={language}
          transactionType={transactionType}
          onSelectType={handleSelectTransactionType}
          onSelectMethod={handleSelectCaptureMethod}
          onClose={handleCloseAddTransaction}
        />
      )}

      {/* Transaction Form */}
      {showAddTransaction && captureMethod && (
        <TransactionForm
          language={language}
          transactionType={transactionType!}
          captureMethod={captureMethod}
          onSave={handleSaveTransaction}
          onBack={() => setCaptureMethod(null)}
          onClose={handleCloseAddTransaction}
        />
      )}
    </div>
  );
}