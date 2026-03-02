import { Target, Plus, TrendingUp, Calendar, Wallet } from 'lucide-react';

interface SavingPlannerProps {
  language: 'en' | 'ar';
  onOpenGoal: (goalId: string) => void;
  onStartNewGoal: () => void;
}

export default function SavingPlanner({ language, onOpenGoal, onStartNewGoal }: SavingPlannerProps) {
  const goals = [
    {
      id: '1',
      name: language === 'en' ? 'Emergency Fund' : 'صندوق الطوارئ',
      saved: 15000,
      target: 30000,
      progress: 50,
      targetDate: '2026-06-30',
      estimatedCompletion: '2026-05-15',
      monthlyContribution: 1500,
      icon: '🛡️'
    },
    {
      id: '2',
      name: language === 'en' ? 'Umrah Trip' : 'رحلة عمرة',
      saved: 8500,
      target: 20000,
      progress: 42.5,
      targetDate: '2026-03-15',
      estimatedCompletion: '2026-04-20',
      monthlyContribution: 1200,
      icon: '🕋'
    },
    {
      id: '3',
      name: language === 'en' ? 'New Car' : 'سيارة جديدة',
      saved: 12000,
      target: 60000,
      progress: 20,
      targetDate: '2027-12-31',
      estimatedCompletion: '2027-11-10',
      monthlyContribution: 2000,
      icon: '🚗'
    },
    {
      id: '4',
      name: language === 'en' ? 'Home Down Payment' : 'دفعة أولى للمنزل',
      saved: 45000,
      target: 150000,
      progress: 30,
      targetDate: '2028-06-30',
      estimatedCompletion: '2028-07-20',
      monthlyContribution: 3500,
      icon: '🏡'
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return language === 'en'
      ? date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : date.toLocaleDateString('ar-SA', { month: 'short', year: 'numeric' });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-emerald-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-amber-500';
    return 'bg-slate-400';
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl">
              {language === 'en' ? 'AI Saving Planner' : 'مخطط الادخار الذكي'}
            </h2>
            <p className="text-sm text-emerald-100">
              {language === 'en' ? 'Track and achieve your financial goals' : 'تتبع وحقق أهدافك المالية'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur rounded-xl p-3">
            <p className="text-xs text-emerald-100 mb-1">
              {language === 'en' ? 'Total Saved' : 'إجمالي المدخر'}
            </p>
            <p className="text-lg">80,500 {language === 'en' ? 'SAR' : 'ر.س'}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-3">
            <p className="text-xs text-emerald-100 mb-1">
              {language === 'en' ? 'Active Goals' : 'الأهداف النشطة'}
            </p>
            <p className="text-lg">{goals.length}</p>
          </div>
        </div>
      </div>

      {/* Add Goal Button */}
      <button
        onClick={onStartNewGoal}
        className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors shadow-sm"
      >
        <Plus className="w-5 h-5" />
        <span>{language === 'en' ? 'Add New Goal' : 'إضافة هدف جديد'}</span>
      </button>

      {/* Goals List */}
      <div className="space-y-3">
        {goals.map((goal) => (
          <button
            key={goal.id}
            onClick={() => onOpenGoal(goal.id)}
            className="w-full bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow text-left"
          >
            {/* Goal Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="text-3xl flex-shrink-0">{goal.icon}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-slate-900 mb-1">{goal.name}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {language === 'en' ? 'Target:' : 'الهدف:'} {formatDate(goal.targetDate)}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-slate-500 mb-1">
                  {goal.progress.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getProgressColor(goal.progress)}`}
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>

            {/* Amount Info */}
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-slate-600">
                {goal.saved.toLocaleString()} {language === 'en' ? 'SAR' : 'ر.س'}
              </span>
              <span className="text-slate-600">
                {goal.target.toLocaleString()} {language === 'en' ? 'SAR' : 'ر.س'}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-xs text-slate-500">
                    {language === 'en' ? 'Monthly' : 'شهري'}
                  </p>
                  <p className="text-sm text-slate-900">
                    {goal.monthlyContribution.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-xs text-slate-500">
                    {language === 'en' ? 'Remaining' : 'متبقي'}
                  </p>
                  <p className="text-sm text-slate-900">
                    {(goal.target - goal.saved).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* AI Estimation */}
            <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">AI</span>
              </div>
              <p className="text-xs text-purple-900">
                {language === 'en' ? 'Estimated completion:' : 'الإنجاز المتوقع:'} {formatDate(goal.estimatedCompletion)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
