import { ArrowLeft, TrendingDown, Calendar, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BudgetDetailProps {
  language: 'en' | 'ar';
  budgetId: string;
  onClose: () => void;
}

export default function BudgetDetail({ language, budgetId, onClose }: BudgetDetailProps) {
  const budget = {
    id: budgetId,
    name: language === 'en' ? 'Shopping' : 'تسوق',
    limit: 3000,
    spent: 2450,
    remaining: 550,
    progress: 81.7,
    status: 'warning',
    period: 'monthly'
  };

  const transactions = [
    { id: '1', merchant: 'Carrefour', amount: 245.50, date: '2025-11-26' },
    { id: '2', merchant: 'Amazon', amount: 189.00, date: '2025-11-24' },
    { id: '3', merchant: 'Noon', amount: 456.20, date: '2025-11-22' },
    { id: '4', merchant: 'IKEA', amount: 678.30, date: '2025-11-20' },
    { id: '5', merchant: 'H&M', amount: 234.00, date: '2025-11-18' },
    { id: '6', merchant: 'Zara', amount: 347.00, date: '2025-11-15' },
    { id: '7', merchant: 'Extra', amount: 125.50, date: '2025-11-12' },
    { id: '8', merchant: 'Carrefour', amount: 174.50, date: '2025-11-08' }
  ];

  const comparisonData = [
    {
      month: language === 'en' ? 'Jul' : 'يول',
      planned: 3000,
      actual: 2800
    },
    {
      month: language === 'en' ? 'Aug' : 'أغس',
      planned: 3000,
      actual: 3200
    },
    {
      month: language === 'en' ? 'Sep' : 'سبت',
      planned: 3000,
      actual: 2600
    },
    {
      month: language === 'en' ? 'Oct' : 'أكت',
      planned: 3000,
      actual: 2900
    },
    {
      month: language === 'en' ? 'Nov' : 'نوف',
      planned: 3000,
      actual: 2450
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50' };
      case 'warning': return { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50' };
      case 'danger': return { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-50' };
      default: return { bg: 'bg-slate-500', text: 'text-slate-600', light: 'bg-slate-50' };
    }
  };

  const colors = getStatusColor(budget.status);
  const avgDailySpending = (budget.spent / 27).toFixed(2); // Assuming 27 days into the month
  const daysLeft = 3; // Days left in the month
  const projectedTotal = budget.spent + (parseFloat(avgDailySpending) * daysLeft);
  const willExceed = projectedTotal > budget.limit;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-4 space-y-4">
        {/* Back Button */}
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{language === 'en' ? 'Back to Analytics' : 'العودة للتحليلات'}</span>
        </button>

        {/* Budget Header */}
        <div className={`bg-gradient-to-br ${budget.status === 'warning' ? 'from-amber-500 to-amber-600' : 'from-emerald-500 to-emerald-600'} rounded-2xl p-6 text-white shadow-lg`}>
          <h2 className="text-xl mb-4">{budget.name}</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>{language === 'en' ? 'Spent' : 'المصروف'}</span>
              <span>{budget.progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-white/20 backdrop-blur rounded-full h-3 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all"
                style={{ width: `${budget.progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>{budget.spent.toLocaleString()} {language === 'en' ? 'SAR' : 'ر.س'}</span>
              <span>{budget.limit.toLocaleString()} {language === 'en' ? 'SAR' : 'ر.س'}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-600 mb-1">
              {language === 'en' ? 'Limit' : 'الحد'}
            </p>
            <p className="text-lg text-slate-900">
              {budget.limit.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">{language === 'en' ? 'SAR' : 'ر.س'}</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-600 mb-1">
              {language === 'en' ? 'Spent' : 'المصروف'}
            </p>
            <p className={`text-lg ${colors.text}`}>
              {budget.spent.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">{language === 'en' ? 'SAR' : 'ر.س'}</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-600 mb-1">
              {language === 'en' ? 'Left' : 'متبقي'}
            </p>
            <p className="text-lg text-emerald-600">
              {budget.remaining.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">{language === 'en' ? 'SAR' : 'ر.س'}</p>
          </div>
        </div>

        {/* Alert if approaching limit */}
        {budget.progress > 75 && (
          <div className={`p-4 ${colors.light} border ${budget.status === 'warning' ? 'border-amber-200' : 'border-red-200'} rounded-xl flex items-start gap-3`}>
            <AlertCircle className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />
            <div>
              <p className={`text-sm ${colors.text} mb-1`}>
                {language === 'en' ? 'Budget Alert' : 'تنبيه الميزانية'}
              </p>
              <p className="text-sm text-slate-700">
                {willExceed
                  ? (language === 'en'
                    ? `At your current spending rate, you may exceed your budget by ${(projectedTotal - budget.limit).toFixed(0)} SAR this month.`
                    : `بمعدل إنفاقك الحالي، قد تتجاوز ميزانيتك بمقدار ${(projectedTotal - budget.limit).toFixed(0)} ر.س هذا الشهر.`)
                  : (language === 'en'
                    ? `You've used ${budget.progress.toFixed(1)}% of your budget. ${daysLeft} days remaining.`
                    : `لقد استخدمت ${budget.progress.toFixed(1)}% من ميزانيتك. ${daysLeft} أيام متبقية.`)}
              </p>
            </div>
          </div>
        )}

        {/* Planned vs Actual Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-slate-900 mb-4">
            {language === 'en' ? 'Planned vs Actual' : 'المخطط مقابل الفعلي'}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Bar dataKey="planned" fill="#94a3b8" radius={[8, 8, 0, 0]} />
                <Bar dataKey="actual" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-slate-400 rounded" />
              <span className="text-xs text-slate-600">
                {language === 'en' ? 'Planned' : 'المخطط'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded" />
              <span className="text-xs text-slate-600">
                {language === 'en' ? 'Actual' : 'الفعلي'}
              </span>
            </div>
          </div>
        </div>

        {/* Spending Insights */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-slate-900 mb-4">
            {language === 'en' ? 'Insights' : 'رؤى'}
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <TrendingDown className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-slate-900 mb-1">
                  {language === 'en' ? 'Daily Average' : 'المتوسط اليومي'}
                </p>
                <p className="text-xs text-slate-600">
                  {language === 'en'
                    ? `You're spending an average of ${avgDailySpending} SAR per day in this category.`
                    : `تنفق في المتوسط ${avgDailySpending} ر.س يوميًا في هذه الفئة.`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-slate-900 mb-1">
                  {language === 'en' ? 'Best Performance' : 'أفضل أداء'}
                </p>
                <p className="text-xs text-slate-600">
                  {language === 'en'
                    ? 'You stayed 400 SAR under budget in September.'
                    : 'بقيت ٤٠٠ ر.س تحت الميزانية في سبتمبر.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Transactions */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-slate-900 mb-4">
            {language === 'en' ? 'Related Transactions' : 'المعاملات ذات الصلة'}
          </h3>
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-sm text-slate-900">{transaction.merchant}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(transaction.date).toLocaleDateString(language === 'en' ? 'en-US' : 'ar-SA', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <p className="text-sm text-red-600">
                  -{transaction.amount.toLocaleString()} {language === 'en' ? 'SAR' : 'ر.س'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pb-4">
          <button className="py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl transition-colors">
            {language === 'en' ? 'Edit Budget' : 'تعديل الميزانية'}
          </button>
          <button className="py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors">
            {language === 'en' ? 'Adjust Limit' : 'تعديل الحد'}
          </button>
        </div>
      </div>
    </div>
  );
}
