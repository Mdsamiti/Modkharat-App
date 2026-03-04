// ============================================================
// Standardized API Response Envelopes
// ============================================================

export interface ApiSuccess<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    traceId: string;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

// ============================================================
// Domain DTOs (aligned with frontend types/models.ts)
// ============================================================

export interface TransactionDTO {
  id: string;
  merchant: string;
  category: string;
  categoryId: string | null;
  amount: number;
  date: string;           // ISO 8601
  type: 'income' | 'expense';
  method: 'manual' | 'sms' | 'voice' | 'scan';
  hasReceipt: boolean;
  notes: string | null;
  status: 'draft' | 'confirmed' | 'rejected';
  accountId: string | null;
  createdBy: string;
}

export interface BudgetDTO {
  id: string;
  name: string;
  limit: number;
  spent: number;
  remaining: number;
  progress: number;       // 0-100
  status: 'good' | 'warning' | 'danger';
  period: string;
  categoryId: string | null;
}

export interface GoalDTO {
  id: string;
  name: string;
  saved: number;
  target: number;
  progress: number;       // 0-100
  targetDate: string | null;
  estimatedCompletion: string | null;
  monthlyContribution: number;
  icon: string;
  account: string | null;
}

export interface GoalContributionDTO {
  date: string;
  amount: number;
  balance: number;
}

export interface GoalProjectionPoint {
  month: string;
  actual: number | null;
  projected: number;
}

export interface BudgetComparisonPoint {
  month: string;
  planned: number;
  actual: number;
}

export interface FamilyMemberDTO {
  id: string;
  name: string;
  email: string | null;
  role: 'organizer' | 'member';
  avatar: string;
  color: string;
  permissions: {
    viewOnly: boolean;
    canAddTransactions: boolean;
    canEditBudgets: boolean;
    canManageMembers: boolean;
  };
}

export interface NotificationDTO {
  id: string;
  type: 'budget' | 'goal' | 'unusual' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: string;
  iconColor: string;
  bgColor: string;
  link: string | null;
}

export interface CategoryDTO {
  id: string;
  nameEn: string;
  nameAr: string;
  icon: string;
  color: string;
  isSystem: boolean;
}

export interface AccountDTO {
  id: string;
  nameEn: string;
  nameAr: string;
}

export interface ProfileDTO {
  id: string;
  displayName: string;
  avatarEmoji: string;
  email: string;
  language: 'en' | 'ar';
  timezone: string;
}

// ============================================================
// Input Schemas (used with Zod in controllers)
// ============================================================

export interface TransactionCreateInput {
  type: 'income' | 'expense';
  amount: number;
  merchant: string;
  categoryId?: string;
  accountId?: string;
  method?: 'manual' | 'sms' | 'voice' | 'scan';
  notes?: string;
  hasReceipt?: boolean;
  occurredAt?: string;
}

export interface BudgetCreateInput {
  name: string;
  limitAmount: number;
  categoryId?: string;
  period?: 'weekly' | 'monthly' | 'yearly';
}

export interface GoalCreateInput {
  name: string;
  target: number;
  targetDate?: string;
  monthlyContribution?: number;
  icon?: string;
  accountId?: string;
}
