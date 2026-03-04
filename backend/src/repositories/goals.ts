import { query } from '../lib/db.js';

export interface GoalRow {
  id: string;
  household_id: string;
  account_id: string | null;
  name: string;
  target: string;
  saved: string;
  target_date: Date | null;
  monthly_contribution: string;
  icon: string;
  created_at: Date;
  updated_at: Date;
  account_name_en: string | null;
}

export interface GoalContributionRow {
  id: string;
  goal_id: string;
  amount: string;
  contributed_at: Date;
  running_balance: string;
}

export async function findGoalsByHousehold(householdId: string): Promise<GoalRow[]> {
  const result = await query<GoalRow>(
    `SELECT g.*, a.name_en AS account_name_en
     FROM goals g
     LEFT JOIN accounts a ON a.id = g.account_id
     WHERE g.household_id = $1
     ORDER BY g.created_at ASC`,
    [householdId],
  );
  return result.rows;
}

export async function findGoalById(id: string, householdId: string): Promise<GoalRow | null> {
  const result = await query<GoalRow>(
    `SELECT g.*, a.name_en AS account_name_en
     FROM goals g
     LEFT JOIN accounts a ON a.id = g.account_id
     WHERE g.id = $1 AND g.household_id = $2`,
    [id, householdId],
  );
  return result.rows[0] ?? null;
}

export async function createGoal(data: {
  householdId: string;
  name: string;
  target: number;
  targetDate?: string;
  monthlyContribution?: number;
  icon?: string;
  accountId?: string;
}): Promise<GoalRow> {
  const result = await query<GoalRow>(
    `INSERT INTO goals (household_id, name, target, target_date, monthly_contribution, icon, account_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *, NULL AS account_name_en`,
    [
      data.householdId, data.name, data.target,
      data.targetDate ?? null, data.monthlyContribution ?? 0,
      data.icon ?? '🎯', data.accountId ?? null,
    ],
  );
  return result.rows[0];
}

export async function updateGoal(
  id: string,
  householdId: string,
  fields: Record<string, any>,
): Promise<GoalRow | null> {
  const sets: string[] = [];
  const values: any[] = [];
  let idx = 1;

  const mapping: Record<string, string> = {
    name: 'name', target: 'target', saved: 'saved', targetDate: 'target_date',
    monthlyContribution: 'monthly_contribution', icon: 'icon', accountId: 'account_id',
  };

  for (const [key, dbCol] of Object.entries(mapping)) {
    if (fields[key] !== undefined) {
      sets.push(`${dbCol} = $${idx}`);
      values.push(fields[key]);
      idx++;
    }
  }
  if (sets.length === 0) return findGoalById(id, householdId);

  sets.push('updated_at = now()');
  values.push(id, householdId);

  await query(
    `UPDATE goals SET ${sets.join(', ')} WHERE id = $${idx} AND household_id = $${idx + 1}`,
    values,
  );
  return findGoalById(id, householdId);
}

export async function deleteGoal(id: string, householdId: string): Promise<boolean> {
  const result = await query('DELETE FROM goals WHERE id = $1 AND household_id = $2', [id, householdId]);
  return (result.rowCount ?? 0) > 0;
}

export async function addContribution(goalId: string, amount: number, transactionId?: string): Promise<void> {
  await query(
    'INSERT INTO goal_contributions (goal_id, amount, transaction_id) VALUES ($1, $2, $3)',
    [goalId, amount, transactionId ?? null],
  );
  await query(
    'UPDATE goals SET saved = saved + $1, updated_at = now() WHERE id = $2',
    [amount, goalId],
  );
}

export async function findContributionsByGoal(goalId: string): Promise<GoalContributionRow[]> {
  const result = await query<GoalContributionRow>(
    `SELECT gc.*,
       SUM(gc.amount) OVER (ORDER BY gc.contributed_at ASC) AS running_balance
     FROM goal_contributions gc
     WHERE gc.goal_id = $1
     ORDER BY gc.contributed_at DESC`,
    [goalId],
  );
  return result.rows;
}
