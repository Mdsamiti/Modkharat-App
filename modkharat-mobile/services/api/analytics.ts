import { get } from './client';

interface OverviewResponse {
  data: {
    income: number;
    expenses: number;
    savingsRate: number;
  };
}

interface SpendingByCategoryItem {
  name: { en: string; ar: string };
  value: number;
  color: string;
}

interface IncomeVsExpensesItem {
  month: string;
  income: number;
  expense: number;
}

export async function getOverview() {
  return get<OverviewResponse>('/v1/analytics/overview');
}

export async function getSpendingByCategory() {
  return get<{ data: SpendingByCategoryItem[] }>('/v1/analytics/spending-by-category');
}

export async function getIncomeVsExpenses(months?: number) {
  return get<{ data: IncomeVsExpensesItem[] }>('/v1/analytics/income-vs-expenses', { months });
}
