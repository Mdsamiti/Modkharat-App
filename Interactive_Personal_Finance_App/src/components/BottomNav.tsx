import { Home, Receipt, BarChart3, PiggyBank, Users } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  language: 'en' | 'ar';
}

export default function BottomNav({ activeTab, onTabChange, language }: BottomNavProps) {
  const tabs = [
    {
      id: 'dashboard',
      icon: Home,
      label: language === 'en' ? 'Dashboard' : 'الرئيسية',
      badge: 0
    },
    {
      id: 'transactions',
      icon: Receipt,
      label: language === 'en' ? 'Transactions' : 'المعاملات',
      badge: 0
    },
    {
      id: 'analytics',
      icon: BarChart3,
      label: language === 'en' ? 'Analytics' : 'التحليلات',
      badge: 0
    },
    {
      id: 'planner',
      icon: PiggyBank,
      label: language === 'en' ? 'Planner' : 'المخطط',
      badge: 2
    },
    {
      id: 'family',
      icon: Users,
      label: language === 'en' ? 'Family' : 'العائلة',
      badge: 1
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2 relative group"
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    isActive ? 'text-emerald-600' : 'text-slate-500 group-hover:text-slate-700'
                  }`}
                />
                {tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-xs transition-colors ${
                  isActive ? 'text-emerald-600' : 'text-slate-500 group-hover:text-slate-700'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-emerald-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
