import * as budgetsRepo from '../repositories/budgets.js';
import * as txRepo from '../repositories/transactions.js';
import type { BudgetDTO, BudgetComparisonPoint } from '../types/api.js';
import { AppError } from '../middleware/error-handler.js';

function toDTO(row: budgetsRepo.BudgetRow): BudgetDTO {
  const limit = parseFloat(row.limit_amount);
  const spent = parseFloat(row.spent);
  const remaining = Math.max(limit - spent, 0);
  const progress = limit > 0 ? Math.round((spent / limit) * 1000) / 10 : 0;
  let status: 'good' | 'warning' | 'danger' = 'good';
  if (progress >= 90) status = 'danger';
  else if (progress >= 75) status = 'warning';

  return {
    id: row.id,
    name: row.name,
    limit,
    spent,
    remaining,
    progress,
    status,
    period: row.period,
    categoryId: row.category_id,
  };
}

export async function listBudgets(householdId: string): Promise<BudgetDTO[]> {
  const rows = await budgetsRepo.findBudgetsByHousehold(householdId);
  return rows.map(toDTO);
}

export async function getBudget(id: string, householdId: string): Promise<BudgetDTO> {
  const row = await budgetsRepo.findBudgetById(id, householdId);
  if (!row) throw new AppError(404, 'NOT_FOUND', 'Budget not found');
  return toDTO(row);
}

export async function createBudget(
  householdId: string,
  input: { name: string; limitAmount: number; categoryId?: string; period?: string },
): Promise<BudgetDTO> {
  const row = await budgetsRepo.createBudget({ householdId, ...input });
  return toDTO(row);
}

export async function updateBudget(id: string, householdId: string, fields: Record<string, any>): Promise<BudgetDTO> {
  const row = await budgetsRepo.updateBudget(id, householdId, fields);
  if (!row) throw new AppError(404, 'NOT_FOUND', 'Budget not found');
  return toDTO(row);
}

export async function deleteBudget(id: string, householdId: string): Promise<void> {
  const ok = await budgetsRepo.deleteBudget(id, householdId);
  if (!ok) throw new AppError(404, 'NOT_FOUND', 'Budget not found');
}

export async function getBudgetComparison(id: string, householdId: string): Promise<BudgetComparisonPoint[]> {
  const rows = await budgetsRepo.getBudgetComparison(id, householdId, 5);
  return rows.map((r) => ({
    month: r.month,
    planned: parseFloat(r.planned),
    actual: parseFloat(r.actual),
  }));
}

export async function getBudgetTransactions(id: string, householdId: string) {
  const budget = await budgetsRepo.findBudgetById(id, householdId);
  if (!budget) throw new AppError(404, 'NOT_FOUND', 'Budget not found');
  if (!budget.category_id) return [];

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  const rows = await txRepo.findTransactionsByBudget(householdId, budget.category_id, periodStart, periodEnd);
  return rows.map((r) => ({
    id: r.id,
    merchant: r.merchant,
    amount: Math.abs(parseFloat(r.amount)),
    date: r.occurred_at.toISOString().split('T')[0],
  }));
}
