import { query } from '../lib/db.js';

export interface ProfileRow {
  id: string;
  display_name: string;
  avatar_emoji: string;
  language: string;
  timezone: string;
  first_day_of_month: number;
  created_at: Date;
  updated_at: Date;
}

export async function findProfileById(userId: string): Promise<ProfileRow | null> {
  const result = await query<ProfileRow>(
    'SELECT * FROM profiles WHERE id = $1',
    [userId],
  );
  return result.rows[0] ?? null;
}

export async function updateProfile(
  userId: string,
  fields: Partial<Pick<ProfileRow, 'display_name' | 'avatar_emoji' | 'language' | 'timezone' | 'first_day_of_month'>>,
): Promise<ProfileRow | null> {
  const sets: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      sets.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }
  }
  if (sets.length === 0) return findProfileById(userId);

  sets.push(`updated_at = now()`);
  values.push(userId);

  const result = await query<ProfileRow>(
    `UPDATE profiles SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
    values,
  );
  return result.rows[0] ?? null;
}
