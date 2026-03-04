import { query } from '../lib/db.js';

export interface TransactionRow {
  id: string;
  household_id: string;
  category_id: string | null;
  account_id: string | null;
  created_by: string;
  type: 'income' | 'expense';
  amount: string; // numeric comes as string from pg
  merchant: string;
  notes: string | null;
  method: 'manual' | 'sms' | 'voice' | 'scan';
  status: 'draft' | 'confirmed' | 'rejected';
  has_receipt: boolean;
  occurred_at: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  category_name_en: string | null;
}

export interface TransactionFilters {
  householdId: string;
  type?: 'income' | 'expense';
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function findTransactions(filters: TransactionFilters): Promise<{ rows: TransactionRow[]; total: number }> {
  const conditions: string[] = ['t.household_id = $1', 't.deleted_at IS NULL'];
  const values: any[] = [filters.householdId];
  let idx = 2;

  if (filters.type) {
    conditions.push(`t.type = $${idx}`);
    values.push(filters.type);
    idx++;
  }
  if (filters.categoryId) {
    conditions.push(`t.category_id = $${idx}`);
    values.push(filters.categoryId);
    idx++;
  }
  if (filters.dateFrom) {
    conditions.push(`t.occurred_at >= $${idx}`);
    values.push(filters.dateFrom);
    idx++;
  }
  if (filters.dateTo) {
    conditions.push(`t.occurred_at <= $${idx}`);
    values.push(filters.dateTo);
    idx++;
  }
  if (filters.search) {
    conditions.push(`t.merchant ILIKE $${idx}`);
    values.push(`%${filters.search}%`);
    idx++;
  }

  const where = conditions.join(' AND ');
  const page = filters.page ?? 1;
  const limit = Math.min(filters.limit ?? 50, 100);
  const offset = (page - 1) * limit;

  const [dataResult, countResult] = await Promise.all([
    query<TransactionRow>(
      `SELECT t.*, c.name_en AS category_name_en
       FROM transactions t
       LEFT JOIN categories c ON c.id = t.category_id
       WHERE ${where}
       ORDER BY t.occurred_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limit, offset],
    ),
    query<{ count: string }>(
      `SELECT COUNT(*) as count FROM transactions t WHERE ${where}`,
      values,
    ),
  ]);

  return { rows: dataResult.rows, total: parseInt(countResult.rows[0].count, 10) };
}

export async function findTransactionById(id: string, householdId: string): Promise<TransactionRow | null> {
  const result = await query<TransactionRow>(
    `SELECT t.*, c.name_en AS category_name_en
     FROM transactions t
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE t.id = $1 AND t.household_id = $2 AND t.deleted_at IS NULL`,
    [id, householdId],
  );
  return result.rows[0] ?? null;
}

export async function createTransaction(data: {
  householdId: string;
  createdBy: string;
  type: 'income' | 'expense';
  amount: number;
  merchant: string;
  categoryId?: string;
  accountId?: string;
  method?: string;
  notes?: string;
  hasReceipt?: boolean;
  occurredAt?: string;
  status?: string;
}): Promise<TransactionRow> {
  const result = await query<TransactionRow>(
    `INSERT INTO transactions (household_id, created_by, type, amount, merchant, category_id, account_id, method, notes, has_receipt, occurred_at, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11::timestamptz, now()), COALESCE($12::transaction_status, 'confirmed'))
     RETURNING *`,
    [
      data.householdId, data.createdBy, data.type, data.amount, data.merchant,
      data.categoryId ?? null, data.accountId ?? null, data.method ?? 'manual',
      data.notes ?? null, data.hasReceipt ?? false, data.occurredAt ?? null, data.status ?? null,
    ],
  );
  return result.rows[0];
}

export async function updateTransaction(
  id: string,
  householdId: string,
  fields: Record<string, any>,
): Promise<TransactionRow | null> {
  const sets: string[] = [];
  const values: any[] = [];
  let idx = 1;

  const allowedFields: Record<string, string> = {
    type: 'type', amount: 'amount', merchant: 'merchant', categoryId: 'category_id',
    accountId: 'account_id', method: 'method', notes: 'notes', hasReceipt: 'has_receipt',
    occurredAt: 'occurred_at', status: 'status',
  };

  for (const [key, dbCol] of Object.entries(allowedFields)) {
    if (fields[key] !== undefined) {
      sets.push(`${dbCol} = $${idx}`);
      values.push(fields[key]);
      idx++;
    }
  }
  if (sets.length === 0) return findTransactionById(id, householdId);

  sets.push('updated_at = now()');
  values.push(id, householdId);

  const result = await query<TransactionRow>(
    `UPDATE transactions SET ${sets.join(', ')} WHERE id = $${idx} AND household_id = $${idx + 1} AND deleted_at IS NULL RETURNING *`,
    values,
  );
  return result.rows[0] ?? null;
}

export async function softDeleteTransaction(id: string, householdId: string): Promise<boolean> {
  const result = await query(
    'UPDATE transactions SET deleted_at = now() WHERE id = $1 AND household_id = $2 AND deleted_at IS NULL',
    [id, householdId],
  );
  return (result.rowCount ?? 0) > 0;
}

/**
 * Get spending by category for a household within a date range.
 */
export async function getSpendingByCategory(householdId: string, dateFrom: string, dateTo: string) {
  const result = await query<{ category_name_en: string; category_name_ar: string; color: string; total: string }>(
    `SELECT c.name_en AS category_name_en, c.name_ar AS category_name_ar, c.color,
            SUM(ABS(t.amount)) AS total
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE t.household_id = $1 AND t.type = 'expense' AND t.status = 'confirmed'
       AND t.deleted_at IS NULL AND t.occurred_at >= $2 AND t.occurred_at <= $3
     GROUP BY c.id, c.name_en, c.name_ar, c.color
     ORDER BY total DESC`,
    [householdId, dateFrom, dateTo],
  );
  return result.rows;
}

/**
 * Get monthly income vs expenses for a household.
 */
export async function getIncomeVsExpenses(householdId: string, months: number) {
  const result = await query<{ month: string; income: string; expense: string }>(
    `SELECT TO_CHAR(occurred_at, 'Mon') AS month,
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
            SUM(CASE WHEN type = 'expense' THEN ABS(amount) ELSE 0 END) AS expense
     FROM transactions
     WHERE household_id = $1 AND status = 'confirmed' AND deleted_at IS NULL
       AND occurred_at >= date_trunc('month', now()) - ($2 || ' months')::interval
     GROUP BY date_trunc('month', occurred_at), TO_CHAR(occurred_at, 'Mon')
     ORDER BY date_trunc('month', occurred_at) ASC`,
    [householdId, months],
  );
  return result.rows;
}

/**
 * Get transactions for a specific budget (by category + period).
 */
export async function findTransactionsByBudget(
  householdId: string,
  categoryId: string,
  periodStart: string,
  periodEnd: string,
) {
  const result = await query<TransactionRow>(
    `SELECT t.*, c.name_en AS category_name_en
     FROM transactions t
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE t.household_id = $1 AND t.category_id = $2 AND t.type = 'expense'
       AND t.status = 'confirmed' AND t.deleted_at IS NULL
       AND t.occurred_at >= $3 AND t.occurred_at <= $4
     ORDER BY t.occurred_at DESC`,
    [householdId, categoryId, periodStart, periodEnd],
  );
  return result.rows;
}
