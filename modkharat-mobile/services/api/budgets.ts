import { get, post, patch, del } from './client';
import type { Budget, Transaction } from '@/types/models';

interface BudgetListResponse {
  data: Budget[];
}

interface BudgetResponse {
  data: Budget;
}

interface BudgetComparisonPoint {
  month: string;
  planned: number;
  actual: number;
}

export async function listBudgets() {
  return get<BudgetListResponse>('/v1/budgets');
}

export async function getBudget(id: string) {
  return get<BudgetResponse>(`/v1/budgets/${id}`);
}

export async function createBudget(input: {
  name: string;
  limitAmount: number;
  categoryId?: string;
  period?: 'weekly' | 'monthly' | 'yearly';
}) {
  return post<BudgetResponse>('/v1/budgets', input);
}

export async function updateBudget(id: string, fields: Partial<{
  name: string;
  limitAmount: number;
  categoryId: string | null;
  period: 'weekly' | 'monthly' | 'yearly';
}>) {
  return patch<BudgetResponse>(`/v1/budgets/${id}`, fields);
}

export async function deleteBudget(id: string) {
  return del(`/v1/budgets/${id}`);
}

export async function getBudgetTransactions(id: string) {
  return get<{ data: Transaction[] }>(`/v1/budgets/${id}/transactions`);
}

export async function getBudgetComparison(id: string) {
  return get<{ data: BudgetComparisonPoint[] }>(`/v1/budgets/${id}/comparison`);
}
