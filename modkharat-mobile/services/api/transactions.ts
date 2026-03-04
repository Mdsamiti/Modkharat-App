import { get, post, patch, del } from './client';
import type { Transaction } from '@/types/models';

interface TransactionListResponse {
  data: Transaction[];
  meta: { page: number; limit: number; total: number };
}

interface TransactionResponse {
  data: Transaction;
}

export interface TransactionFilters {
  type?: 'income' | 'expense';
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function listTransactions(filters: TransactionFilters = {}) {
  return get<TransactionListResponse>('/v1/transactions', filters as any);
}

export async function getTransaction(id: string) {
  return get<TransactionResponse>(`/v1/transactions/${id}`);
}

export async function createTransaction(input: {
  type: 'income' | 'expense';
  amount: number;
  merchant: string;
  categoryId?: string;
  accountId?: string;
  method?: 'manual' | 'sms' | 'voice' | 'scan';
  notes?: string;
  hasReceipt?: boolean;
  occurredAt?: string;
}) {
  return post<TransactionResponse>('/v1/transactions', input);
}

export async function updateTransaction(id: string, fields: Partial<{
  type: 'income' | 'expense';
  amount: number;
  merchant: string;
  categoryId: string | null;
  accountId: string | null;
  method: 'manual' | 'sms' | 'voice' | 'scan';
  notes: string | null;
  hasReceipt: boolean;
  occurredAt: string;
  status: 'draft' | 'confirmed' | 'rejected';
}>) {
  return patch<TransactionResponse>(`/v1/transactions/${id}`, fields);
}

export async function deleteTransaction(id: string) {
  return del(`/v1/transactions/${id}`);
}
