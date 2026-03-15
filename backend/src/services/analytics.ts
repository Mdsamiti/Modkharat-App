import * as txRepo from '../repositories/transactions.js';
import * as profilesRepo from '../repositories/profiles.js';
import { cacheGet, cacheSet } from '../lib/cache.js';

const ANALYTICS_TTL = 60 * 1000; // 1 minute

function getPeriodBounds(firstDay: number): { monthStart: string; monthEnd: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  let start: Date;
  if (day >= firstDay) {
    start = new Date(year, month, firstDay);
  } else {
    start = new Date(year, month - 1, firstDay);
  }
  const end = new Date(start.getFullYear(), start.getMonth() + 1, firstDay - 1, 23, 59, 59);

  return {
    monthStart: start.toISOString(),
    monthEnd: end.toISOString(),
  };
}

async function getFirstDay(userId: string): Promise<number> {
  const profile = await profilesRepo.findProfileById(userId);
  return profile?.first_day_of_month ?? 1;
}

export async function getOverview(householdId: string, userId: string) {
  const cacheKey = `analytics:overview:${householdId}`;
  const cached = cacheGet<{ income: number; expenses: number; savingsRate: number }>(cacheKey);
  if (cached) return cached;

  const rows = await txRepo.getIncomeVsExpenses(householdId, 1);
  const current = rows[rows.length - 1];
  const income = current ? parseFloat(current.income) : 0;
  const expenses = current ? parseFloat(current.expense) : 0;
  const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;

  const result = { income, expenses, savingsRate };
  cacheSet(cacheKey, result, ANALYTICS_TTL);
  return result;
}

export async function getSpendingByCategory(householdId: string, userId: string) {
  const cacheKey = `analytics:category:${householdId}`;
  const cached = cacheGet<any[]>(cacheKey);
  if (cached) return cached;

  const firstDay = await getFirstDay(userId);
  const { monthStart, monthEnd } = getPeriodBounds(firstDay);

  const rows = await txRepo.getSpendingByCategory(householdId, monthStart, monthEnd);
  const result = rows.map((r) => ({
    name: { en: r.category_name_en, ar: r.category_name_ar },
    value: parseFloat(r.total),
    color: r.color,
  }));

  cacheSet(cacheKey, result, ANALYTICS_TTL);
  return result;
}

export async function getIncomeVsExpenses(householdId: string, months: number = 5) {
  const cacheKey = `analytics:ive:${householdId}:${months}`;
  const cached = cacheGet<any[]>(cacheKey);
  if (cached) return cached;

  const rows = await txRepo.getIncomeVsExpenses(householdId, months);
  const result = rows.map((r) => ({
    month: r.month,
    income: parseFloat(r.income),
    expense: parseFloat(r.expense),
  }));

  cacheSet(cacheKey, result, ANALYTICS_TTL);
  return result;
}
