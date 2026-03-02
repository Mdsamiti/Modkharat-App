import { Users, TrendingUp, TrendingDown, Target, Settings, Plus, User } from 'lucide-react';

interface FamilySpaceProps {
  language: 'en' | 'ar';
  onOpenGoal: (goalId: string) => void;
  onOpenMembers: () => void;
}

export default function FamilySpace({ language, onOpenGoal, onOpenMembers }: FamilySpaceProps) {
  const familyMembers = [
    { id: '1', name: language === 'en' ? 'Ahmed' : 'أحمد', role: 'Organizer', avatar: '👨', color: 'bg-blue-100' },
    { id: '2', name: language === 'en' ? 'Fatima' : 'فاطمة', role: 'Member', avatar: '👩', color: 'bg-pink-100' },
    { id: '3', name: language === 'en' ? 'Sarah' : 'سارة', role: 'Member', avatar: '👧', color: 'bg-purple-100' }
  ];

  const sharedGoals = [
    {
      id: 'f1',
      name: language === 'en' ? 'Family Umrah Trip' : 'رحلة عمرة عائلية',
      saved: 45000,
      target: 80000,
      progress: 56.25,
      members: ['1', '2'],
      icon: '🕋'
    },
    {
      id: 'f2',
      name: language === 'en' ? 'Home Renovation' : 'تجديد المنزل',
      saved: 28000,
      target: 100000,
      progress: 28,
      members: ['1', '2', '3'],
      icon: '🏡'
    }
  ];

  const sharedBudgets = [
    {
      id: 'b1',
      name: language === 'en' ? 'Groceries' : 'بقالة',
      limit: 4000,
      spent: 2850,
      remaining: 1150,
      progress: 71.25,
      status: 'good'
    },
    {
      id: 'b2',
      name: language === 'en' ? 'Utilities' : 'فواتير',
      limit: 1500,
      spent: 1320,
      remaining: 180,
      progress: 88,
      status: 'warning'
    },
    {
      id: 'b3',
      name: language === 'en' ? 'Entertainment' : 'ترفيه',
      limit: 2000,
      spent: 1560,
      remaining: 440,
      progress: 78,
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

  return (
    <div className="p-4 space-y-4">
      {/* Family Header */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl">
                {language === 'en' ? 'Family Space' : 'مساحة العائلة'}
              </h2>
              <p className="text-sm text-blue-100">
                {familyMembers.length} {language === 'en' ? 'members' : 'أعضاء'}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenMembers}
            className="p-2 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs text-blue-100">
                {language === 'en' ? 'Combined Income' : 'الدخل المشترك'}
              </span>
            </div>
            <p className="text-lg">24,500 {language === 'en' ? 'SAR' : 'ر.س'}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4" />
              <span className="text-xs text-blue-100">
                {language === 'en' ? 'Family Spending' : 'مصروفات العائلة'}
              </span>
            </div>
            <p className="text-lg">15,730 {language === 'en' ? 'SAR' : 'ر.س'}</p>
          </div>
        </div>
      </div>

      {/* Family Members */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900">
            {language === 'en' ? 'Family Members' : 'أفراد العائلة'}
          </h3>
          <button
            onClick={onOpenMembers}
            className="text-sm text-emerald-600 hover:text-emerald-700"
          >
            {language === 'en' ? 'Manage' : 'إدارة'}
          </button>
        </div>
        <div className="flex items-center gap-3">
          {familyMembers.map((member) => (
            <div key={member.id} className="flex flex-col items-center gap-2">
              <div className={`w-12 h-12 ${member.color} rounded-full flex items-center justify-center text-2xl`}>
                {member.avatar}
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-900">{member.name}</p>
                <p className="text-xs text-slate-500">{member.role}</p>
              </div>
            </div>
          ))}
          <button className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center hover:border-emerald-500 hover:text-emerald-600 transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-500">
              {language === 'en' ? 'Invite' : 'دعوة'}
            </p>
          </button>
        </div>
      </div>

      {/* Shared Goals */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900">
            {language === 'en' ? 'Shared Goals' : 'الأهداف المشتركة'}
          </h3>
          <button className="text-sm text-emerald-600 hover:text-emerald-700">
            {language === 'en' ? 'Add Goal' : 'إضافة هدف'}
          </button>
        </div>
        <div className="space-y-4">
          {sharedGoals.map((goal) => (
            <button
              key={goal.id}
              onClick={() => onOpenGoal(goal.id)}
              className="w-full text-left"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="text-2xl flex-shrink-0">{goal.icon}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm text-slate-900 mb-1">{goal.name}</h4>
                  <div className="flex items-center gap-1">
                    {goal.members.map((memberId) => {
                      const member = familyMembers.find(m => m.id === memberId);
                      return member ? (
                        <div
                          key={memberId}
                          className={`w-6 h-6 ${member.color} rounded-full flex items-center justify-center text-xs`}
                          title={member.name}
                        >
                          {member.avatar}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-slate-500">{goal.progress.toFixed(1)}%</p>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">
                  {goal.saved.toLocaleString()} {language === 'en' ? 'SAR' : 'ر.س'}
                </span>
                <span className="text-slate-600">
                  {goal.target.toLocaleString()} {language === 'en' ? 'SAR' : 'ر.س'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Shared Budgets */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900">
            {language === 'en' ? 'Shared Budgets' : 'الميزانيات المشتركة'}
          </h3>
          <button className="text-sm text-emerald-600 hover:text-emerald-700">
            {language === 'en' ? 'View All' : 'عرض الكل'}
          </button>
        </div>
        <div className="space-y-4">
          {sharedBudgets.map((budget) => (
            <div key={budget.id}>
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
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button className="flex flex-col items-center gap-3 p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-emerald-600" />
          </div>
          <span className="text-sm text-slate-900">
            {language === 'en' ? 'Add Family Goal' : 'إضافة هدف عائلي'}
          </span>
        </button>
        <button className="flex flex-col items-center gap-3 p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-sm text-slate-900">
            {language === 'en' ? 'Invite Member' : 'دعوة عضو'}
          </span>
        </button>
      </div>
    </div>
  );
}
