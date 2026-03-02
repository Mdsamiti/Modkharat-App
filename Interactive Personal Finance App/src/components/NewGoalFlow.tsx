import { useState } from 'react';
import { ArrowLeft, X, Target, DollarSign, Calendar, Wallet, Sparkles } from 'lucide-react';

interface NewGoalFlowProps {
  language: 'en' | 'ar';
  onClose: () => void;
}

export default function NewGoalFlow({ language, onClose }: NewGoalFlowProps) {
  const [step, setStep] = useState(1);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('savings');

  const accounts = [
    { id: 'main', name: language === 'en' ? 'Main Account' : 'الحساب الرئيسي' },
    { id: 'savings', name: language === 'en' ? 'Savings Account' : 'حساب التوفير' },
    { id: 'investment', name: language === 'en' ? 'Investment Account' : 'حساب الاستثمار' }
  ];

  const goalPresets = [
    { name: language === 'en' ? 'Emergency Fund' : 'صندوق الطوارئ', icon: '🛡️', suggestedAmount: 30000 },
    { name: language === 'en' ? 'Umrah Trip' : 'رحلة عمرة', icon: '🕋', suggestedAmount: 20000 },
    { name: language === 'en' ? 'New Car' : 'سيارة جديدة', icon: '🚗', suggestedAmount: 60000 },
    { name: language === 'en' ? 'Home Down Payment' : 'دفعة أولى للمنزل', icon: '🏡', suggestedAmount: 150000 },
    { name: language === 'en' ? 'Wedding' : 'زفاف', icon: '💍', suggestedAmount: 80000 },
    { name: language === 'en' ? 'Education' : 'تعليم', icon: '🎓', suggestedAmount: 50000 }
  ];

  const calculateRecommendation = () => {
    if (!targetAmount || !targetDate) return null;

    const amount = parseFloat(targetAmount);
    const today = new Date();
    const target = new Date(targetDate);
    const monthsDiff = Math.max(1, Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    const monthlyAmount = Math.ceil(amount / monthsDiff);

    return {
      monthlyAmount,
      monthsDiff,
      isRealistic: monthlyAmount < 5000 // Assuming 5000 SAR/month is reasonable
    };
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSave = () => {
    // Save goal logic here
    onClose();
  };

  const recommendation = calculateRecommendation();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={step === 1 ? onClose : handleBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  s === step ? 'w-8 bg-emerald-600' : s < step ? 'w-6 bg-emerald-300' : 'w-6 bg-slate-200'
                }`}
              />
            ))}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-700" />
          </button>
        </div>

        {/* Step 1: Goal Name and Amount */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-slate-900 mb-2">
                {language === 'en' ? 'Create New Goal' : 'إنشاء هدف جديد'}
              </h2>
              <p className="text-sm text-slate-600">
                {language === 'en' ? 'What are you saving for?' : 'لماذا تدخر؟'}
              </p>
            </div>

            {/* Preset Goals */}
            <div>
              <label className="block text-sm text-slate-700 mb-3">
                {language === 'en' ? 'Popular Goals' : 'الأهداف الشائعة'}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {goalPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setGoalName(preset.name);
                      setTargetAmount(preset.suggestedAmount.toString());
                    }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-colors ${
                      goalName === preset.name
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-2xl">{preset.icon}</span>
                    <span className="text-xs text-slate-700 text-center leading-tight">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Goal Name */}
            <div>
              <label className="block text-sm text-slate-700 mb-2">
                {language === 'en' ? 'Goal Name' : 'اسم الهدف'}
              </label>
              <input
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder={language === 'en' ? 'e.g., Emergency Fund' : 'مثال: صندوق الطوارئ'}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Target Amount */}
            <div>
              <label className="block text-sm text-slate-700 mb-2">
                {language === 'en' ? 'Target Amount' : 'المبلغ المستهدف'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                  {language === 'en' ? 'SAR' : 'ر.س'}
                </span>
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={!goalName || !targetAmount}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {language === 'en' ? 'Next' : 'التالي'}
            </button>
          </div>
        )}

        {/* Step 2: Target Date */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-slate-900 mb-2">
                {language === 'en' ? 'When do you want to achieve this?' : 'متى تريد تحقيق هذا؟'}
              </h2>
              <p className="text-sm text-slate-600">{goalName}</p>
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-2">
                {language === 'en' ? 'Target Date' : 'التاريخ المستهدف'}
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Quick Date Presets */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: language === 'en' ? '6 months' : '٦ أشهر', months: 6 },
                { label: language === 'en' ? '1 year' : 'سنة', months: 12 },
                { label: language === 'en' ? '2 years' : 'سنتين', months: 24 }
              ].map((preset) => (
                <button
                  key={preset.months}
                  onClick={() => {
                    const date = new Date();
                    date.setMonth(date.getMonth() + preset.months);
                    setTargetDate(date.toISOString().split('T')[0]);
                  }}
                  className="px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {targetDate && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-900">
                  {language === 'en'
                    ? `You have ${Math.ceil((new Date(targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30))} months to reach your goal.`
                    : `لديك ${Math.ceil((new Date(targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30))} شهر للوصول لهدفك.`}
                </p>
              </div>
            )}

            <button
              onClick={handleNext}
              disabled={!targetDate}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {language === 'en' ? 'Next' : 'التالي'}
            </button>
          </div>
        )}

        {/* Step 3: Select Account */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-slate-900 mb-2">
                {language === 'en' ? 'Choose funding account' : 'اختر حساب التمويل'}
              </h2>
              <p className="text-sm text-slate-600">
                {language === 'en' ? 'Where will the savings come from?' : 'من أين سيأتي الادخار؟'}
              </p>
            </div>

            <div className="space-y-3">
              {accounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => setSelectedAccount(account.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${
                    selectedAccount === account.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedAccount === account.id ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}>
                      <Wallet className={`w-5 h-5 ${
                        selectedAccount === account.id ? 'text-white' : 'text-slate-600'
                      }`} />
                    </div>
                    <span className="text-slate-900">{account.name}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedAccount === account.id
                      ? 'border-emerald-500 bg-emerald-500'
                      : 'border-slate-300'
                  }`}>
                    {selectedAccount === account.id && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
            >
              {language === 'en' ? 'Next' : 'التالي'}
            </button>
          </div>
        )}

        {/* Step 4: AI Recommendation */}
        {step === 4 && recommendation && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-slate-900 mb-2">
                {language === 'en' ? 'AI Recommendation' : 'توصية الذكاء الاصطناعي'}
              </h2>
              <p className="text-sm text-slate-600">
                {language === 'en' ? 'Based on your income and spending patterns' : 'بناءً على دخلك وأنماط الإنفاق'}
              </p>
            </div>

            {/* Goal Summary */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                <span className="text-sm text-slate-600">{language === 'en' ? 'Goal' : 'الهدف'}</span>
                <span className="text-slate-900">{goalName}</span>
              </div>
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                <span className="text-sm text-slate-600">{language === 'en' ? 'Target' : 'الهدف'}</span>
                <span className="text-slate-900">
                  {parseFloat(targetAmount).toLocaleString()} {language === 'en' ? 'SAR' : 'ر.س'}
                </span>
              </div>
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                <span className="text-sm text-slate-600">{language === 'en' ? 'Timeline' : 'المدة'}</span>
                <span className="text-slate-900">
                  {recommendation.monthsDiff} {language === 'en' ? 'months' : 'أشهر'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{language === 'en' ? 'Account' : 'الحساب'}</span>
                <span className="text-slate-900">
                  {accounts.find(a => a.id === selectedAccount)?.name}
                </span>
              </div>
            </div>

            {/* AI Recommendation Card */}
            <div className={`p-5 rounded-2xl ${
              recommendation.isRealistic
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                : 'bg-gradient-to-br from-amber-500 to-amber-600'
            } text-white`}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-sm">
                  {language === 'en' ? 'AI Suggestion' : 'اقتراح الذكاء الاصطناعي'}
                </span>
              </div>
              <p className="text-2xl mb-2">
                {recommendation.monthlyAmount.toLocaleString()} {language === 'en' ? 'SAR' : 'ر.س'}
              </p>
              <p className="text-sm text-white/80">
                {language === 'en' ? 'Recommended monthly contribution' : 'المساهمة الشهرية الموصى بها'}
              </p>
            </div>

            {!recommendation.isRealistic && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-900">
                  {language === 'en'
                    ? 'This goal may be challenging. Consider extending the timeline or adjusting the amount.'
                    : 'قد يكون هذا الهدف صعبًا. فكر في تمديد الجدول الزمني أو تعديل المبلغ.'}
                </p>
              </div>
            )}

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-900">
                {language === 'en'
                  ? 'The AI planner will automatically adjust your contribution schedule based on your actual income and spending patterns.'
                  : 'سيقوم المخطط الذكي بتعديل جدول مساهماتك تلقائيًا بناءً على دخلك وأنماط إنفاقك الفعلية.'}
              </p>
            </div>

            <button
              onClick={handleSave}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
            >
              {language === 'en' ? 'Create Goal' : 'إنشاء الهدف'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
