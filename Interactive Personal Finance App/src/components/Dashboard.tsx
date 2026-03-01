import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, ShoppingBag, Coffee, Car, Home, Zap, Target } from 'lucide-react';

interface DashboardProps {
  language: 'en' | 'ar';
  onOpenBudget: (budgetId: string) => void;
  onOpenGoal: (goalId: string) => void;
}

export default function Dashboard({ language, onOpenBudget, onOpenGoal }: DashboardProps) {
  const isRTL = language === 'ar';

  const categories = [
    { id: '1', name: language === 'en' ? 'Shopping' : 'تسوق', amount: 2450, icon: ShoppingBag, color: 'bg-blue-100 text-blue-600' },
    { id: '2', name: language === 'en' ? 'Food & Dining' : 'طعام', amount: 1820, icon: Coffee, color: 'bg-amber-100 text-amber-600' },
    { id: '3', name: language === 'en' ? 'Transportation' : 'مواصلات', amount: 980, icon: Car, color: 'bg-purple-100 text-purple-600' },
    { id: '4', name: language === 'en' ? 'Housing' : 'سكن', amount: 3500, icon: Home, color: 'bg-rose-100 text-rose-600' },
    { id: '5', name: language === 'en' ? 'Utilities' : 'فواتير', amount: 450, icon: Zap, color: 'bg-cyan-100 text-cyan-600' }
  ];

  const goals = [
    { id: '1', name: language === 'en' ? 'Emergency Fund' : 'صندوق الطوارئ', saved: 15000, target: 30000, progress: 50 },
    { id: '2', name: language === 'en' ? 'Umrah Trip' : 'رحلة عمرة', saved: 8500, target: 20000, progress: 42 },
    { id: '3', name: language === 'en' ? 'New Car' : 'سيارة جديدة', saved: 12000, target: 60000, progress: 20 }
  ];

  const recentTransactions = [
    { id: '1', merchant: 'Carrefour', category: language === 'en' ? 'Shopping' : 'تسوق', amount: -245.50, date: '2025-11-26', type: 'expense' },
    { id: '2', merchant: language === 'en' ? 'Salary' : 'راتب', category: language === 'en' ? 'Income' : 'دخل', amount: 8500, date: '2025-11-25', type: 'income' },
    { id: '3', merchant: 'Starbucks', category: language === 'en' ? 'Food' : 'طعام', amount: -32.00, date: '2025-11-24', type: 'expense' },
    { id: '4', merchant: 'Uber', category: language === 'en' ? 'Transportation' : 'مواصلات', amount: -45.80, date: '2025-11-23', type: 'expense' }
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Total Balance Card */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
        <p className="text-emerald-100 text-sm mb-2">
          {language === 'en' ? 'Total Balance' : 'الرصيد الإجمالي'}
        </p>
        <h2 className="text-3xl mb-4">24,580.00 {language === 'en' ? 'SAR' : 'ر.س'}</h2>
        <div className="flex gap-4">
          <div className="flex-1 bg-white/10 backdrop-blur rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-xs text-emerald-100">{language === 'en' ? 'Income' : 'دخل'}</span>
            </div>
            <p className="text-lg">12,500</p>
          </div>
          <div className="flex-1 bg-white/10 backdrop-blur rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownRight className="w-4 h-4" />
              <span className="text-xs text-emerald-100">{language === 'en' ? 'Expenses' : 'مصروفات'}</span>
            </div>
            <p className="text-lg">9,200</p>
          </div>
        </div>
      </div>

      {/* Monthly Budget Overview */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900">{language === 'en' ? 'This Month' : 'هذا الشهر'}</h3>
          <span className="text-sm text-slate-500">{language === 'en' ? 'Nov 2025' : 'نوفمبر ٢٠٢٥'}</span>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">
              {language === 'en' ? 'Spent vs Budget' : 'المصروف مقابل الميزانية'}
            </span>
            <span className="text-slate-900">9,200 / 12,000</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: '76.7%' }} />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <span className="text-slate-600">
              {language === 'en' ? '2,800 remaining this month' : '٢٨٠٠ متبقية هذا الشهر'}
            </span>
          </div>
        </div>
      </div>

      {/* Top Spending Categories */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="text-slate-900 mb-4">
          {language === 'en' ? 'Top Spending Categories' : 'أعلى فئات الإنفاق'}
        </h3>
        <div className="space-y-3">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.id} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${category.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 text-sm truncate">{category.name}</p>
                </div>
                <div className="text-slate-900 text-sm">
                  {category.amount.toLocaleString()} {language === 'en' ? 'SAR' : 'ر.س'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Savings Goals */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900">{language === 'en' ? 'Savings Goals' : 'أهداف الادخار'}</h3>
          <button className="text-sm text-emerald-600 hover:text-emerald-700">
            {language === 'en' ? 'View All' : 'عرض الكل'}
          </button>
        </div>
        <div className="space-y-4">
          {goals.slice(0, 2).map((goal) => (
            <button
              key={goal.id}
              onClick={() => onOpenGoal(goal.id)}
              className="w-full text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-slate-900">{goal.name}</span>
                </div>
                <span className="text-xs text-slate-500">{goal.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-slate-500">
                  {goal.saved.toLocaleString()} {language === 'en' ? 'SAR' : 'ر.س'}
                </span>
                <span className="text-xs text-slate-500">
                  {goal.target.toLocaleString()} {language === 'en' ? 'SAR' : 'ر.س'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900">{language === 'en' ? 'Recent Transactions' : 'المعاملات الأخيرة'}</h3>
          <button className="text-sm text-emerald-600 hover:text-emerald-700">
            {language === 'en' ? 'View All' : 'عرض الكل'}
          </button>
        </div>
        <div className="space-y-3">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${transaction.type === 'income' ? 'bg-green-100' : 'bg-slate-100'} flex items-center justify-center flex-shrink-0`}>
                {transaction.type === 'income' ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-slate-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-900 text-sm truncate">{transaction.merchant}</p>
                <p className="text-xs text-slate-500">{transaction.category}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-sm ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : ''}{transaction.amount.toLocaleString()} {language === 'en' ? 'SAR' : 'ر.س'}
                </p>
                <p className="text-xs text-slate-500">{transaction.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
