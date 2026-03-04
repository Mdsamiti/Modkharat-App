import * as goalsRepo from '../repositories/goals.js';
import type { GoalDTO, GoalContributionDTO, GoalProjectionPoint } from '../types/api.js';
import { AppError } from '../middleware/error-handler.js';

function toDTO(row: goalsRepo.GoalRow): GoalDTO {
  const saved = parseFloat(row.saved);
  const target = parseFloat(row.target);
  const monthly = parseFloat(row.monthly_contribution);
  const progress = target > 0 ? Math.round((saved / target) * 1000) / 10 : 0;

  let estimatedCompletion: string | null = null;
  if (monthly > 0 && saved < target) {
    const monthsLeft = Math.ceil((target - saved) / monthly);
    const est = new Date();
    est.setMonth(est.getMonth() + monthsLeft);
    estimatedCompletion = est.toISOString().split('T')[0];
  }

  return {
    id: row.id,
    name: row.name,
    saved,
    target,
    progress,
    targetDate: row.target_date ? row.target_date.toISOString().split('T')[0] : null,
    estimatedCompletion,
    monthlyContribution: monthly,
    icon: row.icon,
    account: row.account_name_en,
  };
}

export async function listGoals(householdId: string): Promise<GoalDTO[]> {
  const rows = await goalsRepo.findGoalsByHousehold(householdId);
  return rows.map(toDTO);
}

export async function getGoal(id: string, householdId: string): Promise<GoalDTO> {
  const row = await goalsRepo.findGoalById(id, householdId);
  if (!row) throw new AppError(404, 'NOT_FOUND', 'Goal not found');
  return toDTO(row);
}

export async function createGoal(householdId: string, input: {
  name: string; target: number; targetDate?: string; monthlyContribution?: number; icon?: string; accountId?: string;
}): Promise<GoalDTO> {
  const row = await goalsRepo.createGoal({ householdId, ...input });
  return toDTO(row);
}

export async function updateGoal(id: string, householdId: string, fields: Record<string, any>): Promise<GoalDTO> {
  const row = await goalsRepo.updateGoal(id, householdId, fields);
  if (!row) throw new AppError(404, 'NOT_FOUND', 'Goal not found');
  return toDTO(row);
}

export async function deleteGoal(id: string, householdId: string): Promise<void> {
  const ok = await goalsRepo.deleteGoal(id, householdId);
  if (!ok) throw new AppError(404, 'NOT_FOUND', 'Goal not found');
}

export async function addContribution(goalId: string, householdId: string, amount: number): Promise<GoalDTO> {
  const goal = await goalsRepo.findGoalById(goalId, householdId);
  if (!goal) throw new AppError(404, 'NOT_FOUND', 'Goal not found');
  await goalsRepo.addContribution(goalId, amount);
  return getGoal(goalId, householdId);
}

export async function getContributions(goalId: string, householdId: string): Promise<GoalContributionDTO[]> {
  const goal = await goalsRepo.findGoalById(goalId, householdId);
  if (!goal) throw new AppError(404, 'NOT_FOUND', 'Goal not found');

  const rows = await goalsRepo.findContributionsByGoal(goalId);
  return rows.map((r) => ({
    date: r.contributed_at.toISOString().split('T')[0],
    amount: parseFloat(r.amount),
    balance: parseFloat(r.running_balance),
  }));
}

export async function getProjection(goalId: string, householdId: string): Promise<GoalProjectionPoint[]> {
  const goal = await goalsRepo.findGoalById(goalId, householdId);
  if (!goal) throw new AppError(404, 'NOT_FOUND', 'Goal not found');

  const saved = parseFloat(goal.saved);
  const target = parseFloat(goal.target);
  const monthly = parseFloat(goal.monthly_contribution);
  const points: GoalProjectionPoint[] = [];
  const now = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Current month as actual
  points.push({ month: monthNames[now.getMonth()], actual: saved, projected: saved });

  // Future projected months
  if (monthly > 0) {
    let projected = saved;
    for (let i = 1; i <= 12 && projected < target; i++) {
      projected = Math.min(projected + monthly, target);
      const futureMonth = new Date(now.getFullYear(), now.getMonth() + i, 1);
      points.push({
        month: monthNames[futureMonth.getMonth()],
        actual: null,
        projected,
      });
    }
  }

  return points;
}
