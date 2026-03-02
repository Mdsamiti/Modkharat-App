import {
  ArrowLeft,
  TrendingUp,
  Calendar,
  Wallet,
  Edit,
  DollarSign,
  LineChart as LineChartIcon,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface GoalDetailProps {
  language: "en" | "ar";
  goalId: string;
  onClose: () => void;
}

export default function GoalDetail({
  language,
  goalId,
  onClose,
}: GoalDetailProps) {
  const goal = {
    id: goalId,
    name:
      language === "en" ? "Emergency Fund" : "صندوق الطوارئ",
    saved: 15000,
    target: 30000,
    progress: 50,
    targetDate: "2026-06-30",
    estimatedCompletion: "2026-05-15",
    monthlyContribution: 1500,
    icon: "🛡️",
    account:
      language === "en" ? "Savings Account" : "حساب التوفير",
  };

  const contributions = [
    { date: "2025-10-01", amount: 1500, balance: 12000 },
    { date: "2025-10-15", amount: 500, balance: 12500 },
    { date: "2025-11-01", amount: 1500, balance: 14000 },
    { date: "2025-11-15", amount: 1000, balance: 15000 },
  ];

  const projectionData = [
    { month: "Nov", actual: 15000, projected: null },
    { month: "Dec", actual: null, projected: 16500 },
    { month: "Jan", actual: null, projected: 18000 },
    { month: "Feb", actual: null, projected: 19500 },
    { month: "Mar", actual: null, projected: 21000 },
    { month: "Apr", actual: null, projected: 22500 },
    { month: "May", actual: null, projected: 24000 },
    { month: "Jun", actual: null, projected: 25500 },
    { month: "Jul", actual: null, projected: 27000 },
    { month: "Aug", actual: null, projected: 28500 },
    { month: "Sep", actual: null, projected: 30000 },
  ];

  const aiTips = [
    {
      id: "1",
      type: "success",
      titleEn: "Cut 100 SAR from groceries",
      titleAr: "خفض ١٠٠ ر.س من البقالة",
      textEn:
        "You're typically under your groceries budget by about 100 SAR each month. Lower the groceries budget by 100 SAR next month and increase this goal's planned contribution by the same amount.",
      textAr:
        "عادةً تكون أقل من ميزانية البقالة بحوالي ١٠٠ ر.س كل شهر. خفّض ميزانية البقالة بمقدار ١٠٠ ر.س الشهر القادم وزِد مساهمة هذا الهدف بنفس المبلغ.",
      ctaLabelEn: "Apply to next month's budgets",
      ctaLabelAr: "تطبيق على ميزانيات الشهر القادم",
      ctaType: "adjust-budgets",
    },
    {
      id: "2",
      type: "tip",
      titleEn: "Use leftover from Entertainment",
      titleAr: "استخدم المتبقي من الترفيه",
      textEn:
        "Last month you had 200 SAR leftover in your Entertainment budget. Add it as a one-time contribution to boost this goal.",
      textAr:
        "الشهر الماضي كان لديك ٢٠٠ ر.س متبقية في ميزانية الترفيه. أضفها كمساهمة لمرة واحدة لتعزيز هذا الهدف.",
      ctaLabelEn: "Add 200 SAR to goal",
      ctaLabelAr: "إضافة ٢٠٠ ر.س للهدف",
      ctaType: "add-contribution",
    },
    {
      id: "3",
      type: "insight",
      titleEn: "Small habit change",
      titleAr: "تغيير عادة صغيرة",
      textEn:
        "Skip one food delivery order per week. That's about 80 SAR weekly (320 SAR/month) you can redirect toward this goal. Set a reminder to help you stay consistent.",
      textAr:
        "تخطى طلب توصيل طعام واحد أسبوعياً. هذا حوالي ٨٠ ر.س أسبوعياً (٣٢٠ ر.س شهرياً) يمكنك توجيهها نحو هذا الهدف. ضع تذكيراً لمساعدتك على الالتزام.",
      ctaLabelEn: "Set weekly reminder",
      ctaLabelAr: "تعيين تذكير أسبوعي",
      ctaType: "set-reminder",
    },
    {
      id: "4",
      type: "success",
      titleEn: "Stay on track",
      titleAr: "ابق على المسار",
      textEn:
        "You're doing great! Keep your current monthly contribution of 1,500 SAR. Review your budgets once a month to find new saving opportunities.",
      textAr:
        "أنت تقوم بعمل رائع! حافظ على مساهمتك الشهرية الحالية البالغة ١٥٠٠ ر.س. راجع ميزانياتك مرة واحدة شهرياً لإيجاد فرص ادخار جديدة.",
      ctaLabelEn: "Review budgets",
      ctaLabelAr: "مراجعة الميزانيات",
      ctaType: "review-budgets",
    },
  ];

  const remaining = goal.target - goal.saved;
  const monthsRemaining = Math.ceil(
    remaining / goal.monthlyContribution,
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-4 space-y-4">
        {/* Back Button */}
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>
            {language === "en"
              ? "Back to Goals"
              : "العودة للأهداف"}
          </span>
        </button>

        {/* Goal Header Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-start gap-4 mb-4">
            <div className="text-4xl">{goal.icon}</div>
            <div className="flex-1">
              <h2 className="text-xl mb-2">{goal.name}</h2>
              <div className="flex items-center gap-2 text-sm text-emerald-100">
                <Calendar className="w-4 h-4" />
                <span>
                  {language === "en" ? "Target:" : "الهدف:"}{" "}
                  {new Date(goal.targetDate).toLocaleDateString(
                    language === "en" ? "en-US" : "ar-SA",
                    {
                      month: "long",
                      year: "numeric",
                    },
                  )}
                </span>
              </div>
            </div>
            <button className="p-2 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition-colors">
              <Edit className="w-5 h-5" />
            </button>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>
                {language === "en" ? "Progress" : "التقدم"}
              </span>
              <span>{goal.progress}%</span>
            </div>
            <div className="w-full bg-white/20 backdrop-blur rounded-full h-3 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all"
                style={{ width: `${goal.progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-emerald-100">
                {goal.saved.toLocaleString()}{" "}
                {language === "en" ? "SAR" : "ر.س"}
              </span>
              <span className="text-emerald-100">
                {goal.target.toLocaleString()}{" "}
                {language === "en" ? "SAR" : "ر.س"}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              <span className="text-xs text-slate-600">
                {language === "en"
                  ? "Monthly Contribution"
                  : "المساهمة الشهرية"}
              </span>
            </div>
            <p className="text-xl text-slate-900">
              {goal.monthlyContribution.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {language === "en" ? "SAR" : "ر.س"}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-xs text-slate-600">
                {language === "en" ? "Remaining" : "المتبقي"}
              </span>
            </div>
            <p className="text-xl text-slate-900">
              {remaining.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {language === "en" ? "SAR" : "ر.س"}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span className="text-xs text-slate-600">
                {language === "en"
                  ? "Months Left"
                  : "الأشهر المتبقية"}
              </span>
            </div>
            <p className="text-xl text-slate-900">
              {monthsRemaining}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {language === "en" ? "months" : "أشهر"}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-amber-600" />
              <span className="text-xs text-slate-600">
                {language === "en" ? "Account" : "الحساب"}
              </span>
            </div>
            <p className="text-sm text-slate-900">
              {goal.account}
            </p>
          </div>
        </div>

        {/* Projection Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <LineChartIcon className="w-5 h-5 text-emerald-600" />
            <h3 className="text-slate-900">
              {language === "en"
                ? "Savings Projection"
                : "توقعات الادخار"}
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData}>
                <defs>
                  <linearGradient
                    id="colorActual"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#10b981"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="#10b981"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient
                    id="colorProjected"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#3b82f6"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="#3b82f6"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="month"
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorActual)"
                />
                <Area
                  type="monotone"
                  dataKey="projected"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fillOpacity={1}
                  fill="url(#colorProjected)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              <span className="text-xs text-slate-600">
                {language === "en" ? "Actual" : "الفعلي"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-xs text-slate-600">
                {language === "en" ? "Projected" : "المتوقع"}
              </span>
            </div>
          </div>
        </div>

        {/* AI Guidance */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">AI</span>
            </div>
            <h3 className="text-slate-900">
              {language === "en"
                ? "AI Guidance"
                : "إرشادات الذكاء الاصطناعي"}
            </h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            {language === "en"
              ? "How can I save more for this goal using my existing budget?"
              : "كيف يمكنني الادخار أكثر لهذا الهدف باستخدام ميزانيتي الحالية؟"}
          </p>
          <div className="space-y-3">
            {aiTips.map((tip) => (
              <div
                key={tip.id}
                className={`p-4 rounded-xl border ${
                  tip.type === "success"
                    ? "bg-emerald-50 border-emerald-200"
                    : tip.type === "tip"
                      ? "bg-blue-50 border-blue-200"
                      : "bg-purple-50 border-purple-200"
                }`}
              >
                <h4 className="text-sm text-slate-900 mb-2">
                  {language === "en" ? tip.titleEn : tip.titleAr}
                </h4>
                <p className="text-sm text-slate-700 mb-3 leading-relaxed">
                  {language === "en" ? tip.textEn : tip.textAr}
                </p>
                <button
                  className={`w-full px-4 py-2 rounded-lg text-sm transition-colors ${
                    tip.type === "success"
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : tip.type === "tip"
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-purple-600 hover:bg-purple-700 text-white"
                  }`}
                >
                  {language === "en" ? tip.ctaLabelEn : tip.ctaLabelAr}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Contribution History */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-slate-900 mb-4">
            {language === "en"
              ? "Contribution History"
              : "سجل المساهمات"}
          </h3>
          <div className="space-y-3">
            {contributions.map((contribution, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
              >
                <div>
                  <p className="text-sm text-slate-900">
                    +{contribution.amount.toLocaleString()}{" "}
                    {language === "en" ? "SAR" : "ر.س"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(
                      contribution.date,
                    ).toLocaleDateString(
                      language === "en" ? "en-US" : "ar-SA",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">
                    {language === "en" ? "Balance" : "الرصيد"}
                  </p>
                  <p className="text-sm text-slate-900">
                    {contribution.balance.toLocaleString()}{" "}
                    {language === "en" ? "SAR" : "ر.س"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pb-4">
          <button className="py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors">
            {language === "en"
              ? "Add Contribution"
              : "إضافة مساهمة"}
          </button>
          <button className="py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl transition-colors">
            {language === "en" ? "Adjust Goal" : "تعديل الهدف"}
          </button>
        </div>
      </div>
    </div>
  );
}
