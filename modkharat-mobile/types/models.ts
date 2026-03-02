export interface Transaction {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  method?: 'manual' | 'sms' | 'voice' | 'scan';
  hasReceipt?: boolean;
}

export interface Budget {
  id: string;
  name: string;
  limit: number;
  spent: number;
  remaining: number;
  progress: number;
  status: 'good' | 'warning' | 'danger';
  period?: string;
}

export interface Goal {
  id: string;
  name: string;
  saved: number;
  target: number;
  progress: number;
  targetDate?: Date;
  estimatedCompletion?: Date;
  monthlyContribution?: number;
  icon?: string;
  account?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  email?: string;
  role: 'organizer' | 'member';
  avatar: string;
  color: string;
  permissions?: {
    viewOnly: boolean;
    canAddTransactions: boolean;
    canEditBudgets: boolean;
    canManageMembers: boolean;
  };
}

export interface NotificationItem {
  id: string;
  type: 'budget' | 'goal' | 'unusual' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: string;
  iconColor: string;
  bgColor: string;
  link?: string;
}

export type Language = 'en' | 'ar';
export type TransactionType = 'income' | 'expense';
export type CaptureMethod = 'manual' | 'sms' | 'voice' | 'scan';
