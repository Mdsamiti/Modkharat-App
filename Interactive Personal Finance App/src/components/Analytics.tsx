import { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Plus } from 'lucide-react';

interface AnalyticsProps {
  language: 'en' | 'ar';
  onOpenBudget: (budgetId: string) => void;
}

export default function Analytics({ language, onOpenBudget }: AnalyticsProps) {
  const [selectedView, setSelectedView] = useState<'category' | 'account' | 'needs'>('category');
  const [budgetPeriod, setBudgetPeriod] = useState('monthly');

  const spendingByCategory = [
    { name: language === 'en' ? 'Housing' : 'سكن', value: 3500, color: '#ef4444' },
    { name: language === 'en' ? 'Shopping' : 'تسوق', value: 2450, color: '#3b82f6' },
    { name: language === 'en' ? 'Food' : 'طعام', value: 1820, color: '#f59e0b' },
    { name: language === 'en' ? 'Transport' : 'مواصلات', value: 980, color: '#8b5cf6' },
    { name: language === 'en' ? 'Utilities' : 'فواتير', value: 450, color: '#06b6d4' }
  ];

  const incomeVsExpenses = [
    { month: language === 'en' ? 'Jul' : 'يول', income: 11200, expense: 8900 },
    { month: language === 'en' ? 'Aug' : 'أغس', income: 10800, expense: 9200 },
    { month: language === 'en' ? 'Sep' : 'سبت', income: 12500, expense: 8700 },
    { month: language === 'en' ? 'Oct' : 'أكت', income: 11000, expense: 9500 },
    { month: language === 'en' ? 'Nov' : 'نوف', income: 12500, expense: 9200 }
  ];

  const budgets = [
    {
      id: '1',
      name: language === 'en' ? 'Shopping' : 'تسوق',
      limit: 3000,
      spent: 2450,
      remaining: 550,
      progress: 81.7,
      status: 'warning'
    },
    {
      id: '2',
      name: language === 'en' ? 'Food & Dining' : 'طعام',
      limit: 2000,
      spent: 1820,
      remaining: 180,
      progress: 91,
      status: 'danger'
    },
    {
      id: '3',
      name: language === 'en' ? 'Transportation' : 'مواصلات',
      limit: 1500,
      spent: 980,
      remaining: 520,
      progress: 65.3,
      status: 'good'
    },
    {
      id: '4',
      name: language === 'en' ? 'Utilities' : 'فواتير',
      limit: 600,
      spent: 450,
      remaining: 150,
      progress: 75,
      status: 'good'
    }
  ];

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-emerald-500';
      case 'warning': return 'bg-amber-500';
      case 'danger': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const totalIncome = 12500;
  const totalExpenses = 9200;
  const savingsRate = ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1);

  return (
    <div className="p-4 space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-xs text-slate-600 mb-1">
            {language === 'en' ? 'Income' : 'دخل'}
          </p>
          <p className="text-lg text-slate-900">
            {totalIncome.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-xs text-slate-600 mb-1">
            {language === 'en' ? 'Expenses' : 'مصروف'}
          </p>
          <p className="text-lg text-slate-900">
            {totalExpenses.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xs text-slate-600 mb-1">
            {language === 'en' ? 'Savings' : 'ادخار'}
          </p>
          <p className="text-lg text-slate-900">
            {savingsRate}%
          </p>
        </div>
      </div>

      {/* View Selector */}
      <div className="bg-white rounded-xl p-2 shadow-sm flex gap-2">
        <button
          onClick={() => setSelectedView('category')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${
            selectedView === 'category'
              ? 'bg-emerald-100 text-emerald-700'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          {language === 'en' ? 'By Category' : 'حسب الفئة'}
        </button>
        <button
          onClick={() => setSelectedView('account')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${
            selectedView === 'account'
              ? 'bg-emerald-100 text-emerald-700'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          {language === 'en' ? 'By Account' : 'حسب الحساب'}
        </button>
        <button
          onClick={() => setSelectedView('needs')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm transition-colors ${
            selectedView === 'needs'
              ? 'bg-emerald-100 text-emerald-700'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          {language === 'en' ? 'Needs vs Wants' : 'احتياجات'}
        </button>
      </div>

      {/* Spending by Category Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="text-slate-900 mb-4">
          {language === 'en' ? 'Spending by Category' : 'الإنفاق حسب الفئة'}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={spendingByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {spendingByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          {spendingByCategory.map((category) => (
            <div key={category.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: category.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-600 truncate">{category.name}</p>
                <p className="text-sm text-slate-900">{category.value.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Income vs Expenses Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="text-slate-900 mb-4">
          {language === 'en' ? 'Income vs Expenses' : 'الدخل مقابل المصروفات'}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={incomeVsExpenses}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip />
              <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expense" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Budgets Section */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900">
            {language === 'en' ? 'Budgets' : 'الميزانيات'}
          </h3>
          <select
            value={budgetPeriod}
            onChange={(e) => setBudgetPeriod(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="weekly">{language === 'en' ? 'Weekly' : 'أسبوعي'}</option>
            <option value="monthly">{language === 'en' ? 'Monthly' : 'شهري'}</option>
            <option value="custom">{language === 'en' ? 'Custom' : 'مخصص'}</option>
          </select>
        </div>

        <div className="space-y-4">
          {budgets.map((budget) => (
            <button
              key={budget.id}
              onClick={() => onOpenBudget(budget.id)}
              className="w-full text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-900">{budget.name}</span>
                <div className="text-right">
                  <span className="text-sm text-slate-900">
                    {budget.spent.toLocaleString()} / {budget.limit.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 ml-2">
                    {language === 'en' ? 'SAR' : 'ر.س'}
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getProgressColor(budget.status)}`}
                  style={{ width: `${budget.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-slate-500">
                  {budget.remaining.toLocaleString()} {language === 'en' ? 'remaining' : 'متبقي'}
                </span>
                <span className="text-xs text-slate-500">
                  {budget.progress.toFixed(1)}%
                </span>
              </div>
            </button>
          ))}
        </div>

        <button className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors">
          <Plus className="w-5 h-5" />
          <span>{language === 'en' ? 'Create New Budget' : 'إنشاء ميزانية جديدة'}</span>
        </button>
      </div>
    </div>
  );
}
