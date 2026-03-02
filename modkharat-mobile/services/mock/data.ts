import type { Transaction, Budget, Goal, FamilyMember, NotificationItem } from '@/types/models';

export const mockBalance = 24580.0;
export const mockIncome = 12500;
export const mockExpenses = 9200;
export const mockBudgetTotal = 12000;

export const mockCategories = [
  { id: '1', name: { en: 'Shopping', ar: 'التسوق' }, amount: 2450, icon: '🛍️', color: '#8b5cf6' },
  { id: '2', name: { en: 'Food & Dining', ar: 'الطعام والمطاعم' }, amount: 1820, icon: '☕', color: '#f59e0b' },
  { id: '3', name: { en: 'Transport', ar: 'المواصلات' }, amount: 980, icon: '🚗', color: '#3b82f6' },
  { id: '4', name: { en: 'Housing', ar: 'السكن' }, amount: 3500, icon: '🏠', color: '#10b981' },
  { id: '5', name: { en: 'Utilities', ar: 'الخدمات' }, amount: 450, icon: '⚡', color: '#ef4444' },
];

export const mockGoals: Goal[] = [
  { id: '1', name: 'Emergency Fund', saved: 15000, target: 30000, progress: 50, icon: '🛡️' },
  { id: '2', name: 'Umrah Trip', saved: 8500, target: 20000, progress: 42.5, icon: '🕌' },
  { id: '3', name: 'New Car', saved: 25000, target: 60000, progress: 41.7, icon: '🚗' },
];

export const mockRecentTransactions: Transaction[] = [
  { id: '1', merchant: 'Carrefour', category: 'Shopping', amount: -245.5, date: '2025-11-27', type: 'expense', method: 'sms' },
  { id: '2', merchant: 'Salary', category: 'Income', amount: 12500, date: '2025-11-25', type: 'income', method: 'sms' },
  { id: '3', merchant: 'Starbucks', category: 'Food & Dining', amount: -32.0, date: '2025-11-26', type: 'expense', method: 'manual' },
  { id: '4', merchant: 'Uber', category: 'Transport', amount: -45.0, date: '2025-11-26', type: 'expense', method: 'manual' },
];

export const mockTransactions: Transaction[] = [
  { id: '1', merchant: 'Carrefour', category: 'Shopping', amount: -245.5, date: '2025-11-27', type: 'expense', method: 'sms', hasReceipt: true },
  { id: '2', merchant: 'Salary', category: 'Income', amount: 12500, date: '2025-11-25', type: 'income', method: 'sms', hasReceipt: false },
  { id: '3', merchant: 'Starbucks', category: 'Food & Dining', amount: -32.0, date: '2025-11-26', type: 'expense', method: 'manual', hasReceipt: false },
  { id: '4', merchant: 'Uber', category: 'Transport', amount: -45.0, date: '2025-11-26', type: 'expense', method: 'manual', hasReceipt: false },
  { id: '5', merchant: 'Amazon', category: 'Shopping', amount: -189.0, date: '2025-11-24', type: 'expense', method: 'sms', hasReceipt: true },
  { id: '6', merchant: 'Freelance Payment', category: 'Income', amount: 3500, date: '2025-11-23', type: 'income', method: 'manual', hasReceipt: false },
  { id: '7', merchant: 'STC Bill', category: 'Utilities', amount: -299.0, date: '2025-11-22', type: 'expense', method: 'sms', hasReceipt: false },
  { id: '8', merchant: 'Jarir Bookstore', category: 'Shopping', amount: -450.0, date: '2025-11-21', type: 'expense', method: 'scan', hasReceipt: true },
];

export const mockSpendingByCategory = [
  { name: { en: 'Housing', ar: 'السكن' }, value: 3500, color: '#10b981' },
  { name: { en: 'Shopping', ar: 'التسوق' }, value: 2450, color: '#8b5cf6' },
  { name: { en: 'Food', ar: 'الطعام' }, value: 1820, color: '#f59e0b' },
  { name: { en: 'Transport', ar: 'المواصلات' }, value: 980, color: '#3b82f6' },
  { name: { en: 'Utilities', ar: 'الخدمات' }, value: 450, color: '#ef4444' },
];

export const mockIncomeVsExpenses = [
  { month: 'Jul', income: 12500, expense: 8900 },
  { month: 'Aug', income: 12500, expense: 9300 },
  { month: 'Sep', income: 13000, expense: 8700 },
  { month: 'Oct', income: 12500, expense: 9800 },
  { month: 'Nov', income: 12500, expense: 9200 },
];

export const mockBudgets: Budget[] = [
  { id: '1', name: 'Shopping', limit: 3000, spent: 2450, remaining: 550, progress: 81.7, status: 'warning' },
  { id: '2', name: 'Food & Dining', limit: 2500, spent: 1820, remaining: 680, progress: 72.8, status: 'good' },
  { id: '3', name: 'Transport', limit: 1500, spent: 980, remaining: 520, progress: 65.3, status: 'good' },
  { id: '4', name: 'Utilities', limit: 800, spent: 750, remaining: 50, progress: 93.8, status: 'danger' },
];

export const mockSavingGoals: Goal[] = [
  {
    id: '1', name: 'Emergency Fund', saved: 15000, target: 30000, progress: 50,
    targetDate: new Date('2026-06-30'), estimatedCompletion: new Date('2026-05-15'),
    monthlyContribution: 1500, icon: '🛡️',
  },
  {
    id: '2', name: 'Umrah Trip', saved: 8500, target: 20000, progress: 42.5,
    targetDate: new Date('2026-03-01'), estimatedCompletion: new Date('2026-04-10'),
    monthlyContribution: 2000, icon: '🕌',
  },
  {
    id: '3', name: 'New Car', saved: 25000, target: 60000, progress: 41.7,
    targetDate: new Date('2027-01-01'), estimatedCompletion: new Date('2027-03-15'),
    monthlyContribution: 2500, icon: '🚗',
  },
  {
    id: '4', name: 'Home Down Payment', saved: 50000, target: 150000, progress: 33.3,
    targetDate: new Date('2028-06-01'), estimatedCompletion: new Date('2028-09-01'),
    monthlyContribution: 3500, icon: '🏠',
  },
];

export const mockFamilyMembers: FamilyMember[] = [
  {
    id: '1', name: 'Ahmed', email: 'ahmed@email.com', role: 'organizer', avatar: '👨', color: '#3b82f6',
    permissions: { viewOnly: false, canAddTransactions: true, canEditBudgets: true, canManageMembers: true },
  },
  {
    id: '2', name: 'Fatima', email: 'fatima@email.com', role: 'member', avatar: '👩', color: '#ec4899',
    permissions: { viewOnly: false, canAddTransactions: true, canEditBudgets: false, canManageMembers: false },
  },
  {
    id: '3', name: 'Sarah', email: 'sarah@email.com', role: 'member', avatar: '👧', color: '#8b5cf6',
    permissions: { viewOnly: true, canAddTransactions: false, canEditBudgets: false, canManageMembers: false },
  },
];

export const mockSharedGoals = [
  { id: 's1', name: 'Family Umrah Trip', saved: 12000, target: 40000, progress: 30, members: ['1', '2'], icon: '🕌' },
  { id: 's2', name: 'Home Renovation', saved: 8000, target: 25000, progress: 32, members: ['1', '2', '3'], icon: '🏠' },
];

export const mockSharedBudgets: Budget[] = [
  { id: 'sb1', name: 'Groceries', limit: 4000, spent: 3200, remaining: 800, progress: 80, status: 'warning' },
  { id: 'sb2', name: 'Utilities', limit: 1500, spent: 980, remaining: 520, progress: 65.3, status: 'good' },
  { id: 'sb3', name: 'Entertainment', limit: 1000, spent: 450, remaining: 550, progress: 45, status: 'good' },
];

export const mockNotifications: NotificationItem[] = [
  { id: '1', type: 'budget', title: 'Budget Alert', message: 'Shopping budget is at 82%. Consider slowing down.', time: '2h ago', read: false, icon: 'alert-circle', iconColor: '#f59e0b', bgColor: '#fef3c7', link: 'budget/1' },
  { id: '2', type: 'goal', title: 'Goal Milestone', message: 'Emergency Fund reached 50%! Keep it up.', time: '5h ago', read: false, icon: 'target', iconColor: '#10b981', bgColor: '#d1fae5', link: 'goal/1' },
  { id: '3', type: 'unusual', title: 'Unusual Spending', message: 'Your shopping spending is 30% higher than usual this week.', time: '1d ago', read: true, icon: 'trending-up', iconColor: '#ef4444', bgColor: '#fee2e2' },
  { id: '4', type: 'system', title: 'New Feature', message: 'Voice input for transactions is now available!', time: '2d ago', read: true, icon: 'info', iconColor: '#3b82f6', bgColor: '#dbeafe' },
  { id: '5', type: 'budget', title: 'Utilities Budget', message: 'Utilities budget is at 94%. Almost exceeded.', time: '3d ago', read: true, icon: 'alert-circle', iconColor: '#ef4444', bgColor: '#fee2e2', link: 'budget/4' },
  { id: '6', type: 'goal', title: 'Monthly Savings', message: 'Great job! You saved SAR 1,500 towards Emergency Fund this month.', time: '5d ago', read: true, icon: 'target', iconColor: '#10b981', bgColor: '#d1fae5' },
];

export const mockBudgetDetail = {
  id: '1', name: 'Shopping', limit: 3000, spent: 2450, remaining: 550, progress: 81.7, status: 'warning' as const, period: 'monthly',
};

export const mockBudgetTransactions = [
  { id: '1', merchant: 'Carrefour', amount: 245.5, date: '2025-11-27' },
  { id: '2', merchant: 'Amazon', amount: 189, date: '2025-11-24' },
  { id: '3', merchant: 'Noon', amount: 350, date: '2025-11-22' },
  { id: '4', merchant: 'IKEA', amount: 520, date: '2025-11-20' },
  { id: '5', merchant: 'H&M', amount: 280, date: '2025-11-18' },
  { id: '6', merchant: 'Zara', amount: 190, date: '2025-11-15' },
  { id: '7', merchant: 'Extra', amount: 375, date: '2025-11-12' },
  { id: '8', merchant: 'Carrefour', amount: 300.5, date: '2025-11-10' },
];

export const mockBudgetComparison = [
  { month: 'Jul', planned: 3000, actual: 2800 },
  { month: 'Aug', planned: 3000, actual: 3100 },
  { month: 'Sep', planned: 3000, actual: 2650 },
  { month: 'Oct', planned: 3000, actual: 2900 },
  { month: 'Nov', planned: 3000, actual: 2450 },
];

export const mockGoalDetail = {
  id: '1', name: 'Emergency Fund', saved: 15000, target: 30000, progress: 50,
  targetDate: new Date('2026-06-30'), estimatedCompletion: new Date('2026-05-15'),
  monthlyContribution: 1500, icon: '🛡️', account: 'Savings Account',
};

export const mockGoalContributions = [
  { date: '2025-11-01', amount: 1500, balance: 15000 },
  { date: '2025-10-01', amount: 1500, balance: 13500 },
  { date: '2025-09-01', amount: 1500, balance: 12000 },
  { date: '2025-08-01', amount: 1500, balance: 10500 },
];

export const mockGoalProjection = [
  { month: 'Nov', actual: 15000, projected: 15000 },
  { month: 'Dec', actual: null, projected: 16500 },
  { month: 'Jan', actual: null, projected: 18000 },
  { month: 'Feb', actual: null, projected: 19500 },
  { month: 'Mar', actual: null, projected: 21000 },
  { month: 'Apr', actual: null, projected: 22500 },
  { month: 'May', actual: null, projected: 24000 },
  { month: 'Jun', actual: null, projected: 25500 },
  { month: 'Jul', actual: null, projected: 27000 },
  { month: 'Aug', actual: null, projected: 28500 },
  { month: 'Sep', actual: null, projected: 30000 },
];

export const mockAiTips = [
  { id: '1', type: 'save', titleEn: 'Cut grocery spending', titleAr: 'قلل إنفاق البقالة', textEn: 'You could save SAR 300/month by meal planning and buying in bulk.', textAr: 'يمكنك توفير 300 ر.س شهرياً بالتخطيط للوجبات والشراء بالجملة.', ctaLabelEn: 'See tips', ctaLabelAr: 'عرض النصائح', ctaType: 'action' },
  { id: '2', type: 'optimize', titleEn: 'Use leftover entertainment budget', titleAr: 'استخدم الميزانية المتبقية للترفيه', textEn: 'You have SAR 550 remaining in Entertainment. Transfer to this goal?', textAr: 'لديك 550 ر.س متبقية في الترفيه. تحويلها لهذا الهدف؟', ctaLabelEn: 'Transfer', ctaLabelAr: 'تحويل', ctaType: 'transfer' },
  { id: '3', type: 'habit', titleEn: 'Small habit change', titleAr: 'تغيير بسيط في العادات', textEn: 'Skipping one coffee per week saves SAR 128/month towards your goal.', textAr: 'تخطي كوب قهوة واحد أسبوعياً يوفر 128 ر.س شهرياً.', ctaLabelEn: 'Track habit', ctaLabelAr: 'تتبع العادة', ctaType: 'action' },
  { id: '4', type: 'encourage', titleEn: 'Stay on track!', titleAr: 'استمر!', textEn: "You're ahead of schedule by 2 weeks. Keep up the great work!", textAr: 'أنت متقدم بأسبوعين عن الجدول. استمر!', ctaLabelEn: 'View progress', ctaLabelAr: 'عرض التقدم', ctaType: 'view' },
];

export const mockGoalPresets = [
  { name: { en: 'Emergency Fund', ar: 'صندوق الطوارئ' }, icon: '🛡️', suggestedAmount: 30000 },
  { name: { en: 'Umrah Trip', ar: 'رحلة عمرة' }, icon: '🕌', suggestedAmount: 20000 },
  { name: { en: 'New Car', ar: 'سيارة جديدة' }, icon: '🚗', suggestedAmount: 60000 },
  { name: { en: 'Home Down Payment', ar: 'دفعة أولى للمنزل' }, icon: '🏠', suggestedAmount: 150000 },
  { name: { en: 'Wedding', ar: 'زفاف' }, icon: '💍', suggestedAmount: 80000 },
  { name: { en: 'Education', ar: 'تعليم' }, icon: '🎓', suggestedAmount: 50000 },
];

export const mockAccounts = [
  { id: 'main', name: { en: 'Main Account', ar: 'الحساب الرئيسي' } },
  { id: 'savings', name: { en: 'Savings Account', ar: 'حساب المدخرات' } },
  { id: 'investment', name: { en: 'Investment Account', ar: 'حساب الاستثمار' } },
];

export const mockTransactionCategories = [
  { en: 'Shopping', ar: 'التسوق' },
  { en: 'Food & Dining', ar: 'الطعام والمطاعم' },
  { en: 'Transport', ar: 'المواصلات' },
  { en: 'Housing', ar: 'السكن' },
  { en: 'Utilities', ar: 'الخدمات' },
  { en: 'Entertainment', ar: 'الترفيه' },
  { en: 'Healthcare', ar: 'الرعاية الصحية' },
  { en: 'Education', ar: 'التعليم' },
  { en: 'Other', ar: 'أخرى' },
];
