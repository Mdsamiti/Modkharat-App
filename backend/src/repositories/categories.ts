import { query } from '../lib/db.js';

export interface CategoryRow {
  id: string;
  household_id: string | null;
  name_en: string;
  name_ar: string;
  icon: string;
  color: string;
  is_system: boolean;
}

export interface AccountRow {
  id: string;
  name_en: string;
  name_ar: string;
  balance: string;
}

/**
 * Returns system categories + household-specific custom categories.
 */
export async function findCategories(householdId?: string): Promise<CategoryRow[]> {
  const result = await query<CategoryRow>(
    `SELECT * FROM categories
     WHERE is_system = true OR household_id = $1
     ORDER BY is_system DESC, name_en ASC`,
    [householdId ?? null],
  );
  return result.rows;
}

export async function findAccountsByHousehold(householdId: string) {
  const result = await query<AccountRow>(
    'SELECT id, name_en, name_ar, balance FROM accounts WHERE household_id = $1 ORDER BY created_at ASC',
    [householdId],
  );
  return result.rows;
}

export async function createAccount(householdId: string, nameEn: string, nameAr: string, balance: number = 0) {
  const result = await query<AccountRow>(
    'INSERT INTO accounts (household_id, name_en, name_ar, balance) VALUES ($1, $2, $3, $4) RETURNING id, name_en, name_ar, balance',
    [householdId, nameEn, nameAr, balance],
  );
  return result.rows[0];
}

export async function updateAccount(id: string, householdId: string, nameEn: string, nameAr: string, balance?: number) {
  if (balance !== undefined) {
    const result = await query<AccountRow>(
      'UPDATE accounts SET name_en = $1, name_ar = $2, balance = $3 WHERE id = $4 AND household_id = $5 RETURNING id, name_en, name_ar, balance',
      [nameEn, nameAr, balance, id, householdId],
    );
    return result.rows[0] ?? null;
  }
  const result = await query<AccountRow>(
    'UPDATE accounts SET name_en = $1, name_ar = $2 WHERE id = $3 AND household_id = $4 RETURNING id, name_en, name_ar, balance',
    [nameEn, nameAr, id, householdId],
  );
  return result.rows[0] ?? null;
}

export async function deleteAccount(id: string, householdId: string) {
  const result = await query(
    'DELETE FROM accounts WHERE id = $1 AND household_id = $2',
    [id, householdId],
  );
  return (result.rowCount ?? 0) > 0;
}
