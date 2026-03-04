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
  const result = await query<{ id: string; name_en: string; name_ar: string }>(
    'SELECT id, name_en, name_ar FROM accounts WHERE household_id = $1 ORDER BY created_at ASC',
    [householdId],
  );
  return result.rows;
}
