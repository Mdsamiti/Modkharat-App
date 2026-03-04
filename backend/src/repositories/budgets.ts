import { query } from '../lib/db.js';

export interface BudgetRow {
  id: string;
  household_id: string;
  category_id: string | null;
  name: string;
  limit_amount: string;
  period: string;
  created_at: Date;
  updated_at: Date;
  spent: string;
}

export async function findBudgetsByHousehold(householdId: string): Promise<BudgetRow[]> {
  const result = await query<BudgetRow>(
    `SELECT b.*,
       COALESCE(
         (SELECT SUM(ABS(t.amount))
          FROM transactions t
          WHERE t.household_id = b.household_id
            AND t.category_id = b.category_id
            AND t.type = 'expense'
            AND t.status = 'confirmed'
            AND t.deleted_at IS NULL
            AND t.occurred_at >= date_trunc('month', now())
            AND t.occurred_at < date_trunc('month', now()) + INTERVAL '1 month'
         ), 0
       ) AS spent
     FROM budgets b
     WHERE b.household_id = $1
     ORDER BY b.created_at ASC`,
    [householdId],
  );
  return result.rows;
}

export async function findBudgetById(id: string, householdId: string): Promise<BudgetRow | null> {
  const result = await query<BudgetRow>(
    `SELECT b.*,
       COALESCE(
         (SELECT SUM(ABS(t.amount))
          FROM transactions t
          WHERE t.household_id = b.household_id
            AND t.category_id = b.category_id
            AND t.type = 'expense'
            AND t.status = 'confirmed'
            AND t.deleted_at IS NULL
            AND t.occurred_at >= date_trunc('month', now())
            AND t.occurred_at < date_trunc('month', now()) + INTERVAL '1 month'
         ), 0
       ) AS spent
     FROM budgets b
     WHERE b.id = $1 AND b.household_id = $2`,
    [id, householdId],
  );
  return result.rows[0] ?? null;
}

export async function createBudget(data: {
  householdId: string;
  name: string;
  limitAmount: number;
  categoryId?: string;
  period?: string;
}): Promise<BudgetRow> {
  const result = await query<BudgetRow>(
    `INSERT INTO budgets (household_id, name, limit_amount, category_id, period)
     VALUES ($1, $2, $3, $4, COALESCE($5::budget_period, 'monthly'))
     RETURNING *, 0 AS spent`,
    [data.householdId, data.name, data.limitAmount, data.categoryId ?? null, data.period ?? null],
  );
  return result.rows[0];
}

export async function updateBudget(
  id: string,
  householdId: string,
  fields: { name?: string; limitAmount?: number; categoryId?: string; period?: string },
): Promise<BudgetRow | null> {
  const sets: string[] = [];
  const values: any[] = [];
  let idx = 1;

  const mapping: Record<string, string> = {
    name: 'name', limitAmount: 'limit_amount', categoryId: 'category_id', period: 'period',
  };

  for (const [key, dbCol] of Object.entries(mapping)) {
    const val = (fields as any)[key];
    if (val !== undefined) {
      sets.push(`${dbCol} = $${idx}`);
      values.push(val);
      idx++;
    }
  }
  if (sets.length === 0) return findBudgetById(id, householdId);

  sets.push('updated_at = now()');
  values.push(id, householdId);

  await query(
    `UPDATE budgets SET ${sets.join(', ')} WHERE id = $${idx} AND household_id = $${idx + 1}`,
    values,
  );
  return findBudgetById(id, householdId);
}

export async function deleteBudget(id: string, householdId: string): Promise<boolean> {
  const result = await query('DELETE FROM budgets WHERE id = $1 AND household_id = $2', [id, householdId]);
  return (result.rowCount ?? 0) > 0;
}

/**
 * Get monthly planned vs actual for a budget over the last N months.
 */
export async function getBudgetComparison(budgetId: string, householdId: string, months: number) {
  const result = await query<{ month: string; planned: string; actual: string }>(
    `WITH budget AS (
       SELECT limit_amount, category_id FROM budgets WHERE id = $1 AND household_id = $2
     )
     SELECT TO_CHAR(m.month, 'Mon') AS month,
            (SELECT limit_amount FROM budget) AS planned,
            COALESCE(SUM(ABS(t.amount)), 0) AS actual
     FROM generate_series(
       date_trunc('month', now()) - ($3 || ' months')::interval,
       date_trunc('month', now()),
       '1 month'
     ) AS m(month)
     LEFT JOIN transactions t ON t.household_id = $2
       AND t.category_id = (SELECT category_id FROM budget)
       AND t.type = 'expense' AND t.status = 'confirmed' AND t.deleted_at IS NULL
       AND t.occurred_at >= m.month AND t.occurred_at < m.month + INTERVAL '1 month'
     GROUP BY m.month
     ORDER BY m.month ASC`,
    [budgetId, householdId, months],
  );
  return result.rows;
}
