import { query } from '../lib/db.js';

export interface HouseholdRow {
  id: string;
  name: string;
  created_by: string;
  created_at: Date;
}

export interface HouseholdMemberRow {
  id: string;
  household_id: string;
  user_id: string;
  role: 'organizer' | 'member';
  view_only: boolean;
  can_add_transactions: boolean;
  can_edit_budgets: boolean;
  can_manage_members: boolean;
  joined_at: Date;
  display_name: string;
  avatar_emoji: string;
  email: string;
}

export async function createHousehold(name: string, userId: string): Promise<HouseholdRow> {
  const result = await query<HouseholdRow>(
    'INSERT INTO households (name, created_by) VALUES ($1, $2) RETURNING *',
    [name, userId],
  );
  // Add creator as organizer
  await query(
    `INSERT INTO household_members (household_id, user_id, role, view_only, can_add_transactions, can_edit_budgets, can_manage_members)
     VALUES ($1, $2, 'organizer', false, true, true, true)`,
    [result.rows[0].id, userId],
  );
  return result.rows[0];
}

export async function findHouseholdsByUser(userId: string): Promise<HouseholdRow[]> {
  const result = await query<HouseholdRow>(
    `SELECT h.* FROM households h
     JOIN household_members hm ON hm.household_id = h.id
     WHERE hm.user_id = $1
     ORDER BY h.created_at ASC`,
    [userId],
  );
  return result.rows;
}

export async function findMembersByHousehold(householdId: string): Promise<HouseholdMemberRow[]> {
  const result = await query<HouseholdMemberRow>(
    `SELECT hm.*, p.display_name, p.avatar_emoji, u.email
     FROM household_members hm
     JOIN profiles p ON p.id = hm.user_id
     JOIN auth.users u ON u.id = hm.user_id
     WHERE hm.household_id = $1
     ORDER BY hm.joined_at ASC`,
    [householdId],
  );
  return result.rows;
}

export async function updateMemberPermissions(
  householdId: string,
  memberId: string,
  permissions: { view_only?: boolean; can_add_transactions?: boolean; can_edit_budgets?: boolean; can_manage_members?: boolean },
): Promise<void> {
  const sets: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(permissions)) {
    if (value !== undefined) {
      sets.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }
  }
  if (sets.length === 0) return;

  values.push(householdId, memberId);
  await query(
    `UPDATE household_members SET ${sets.join(', ')} WHERE household_id = $${idx} AND id = $${idx + 1}`,
    values,
  );
}

export async function removeMember(householdId: string, memberId: string): Promise<void> {
  await query('DELETE FROM household_members WHERE household_id = $1 AND id = $2', [householdId, memberId]);
}

export async function createInvite(
  householdId: string,
  invitedBy: string,
  email: string,
  role: 'organizer' | 'member',
): Promise<{ token: string }> {
  const result = await query<{ token: string }>(
    `INSERT INTO family_invites (household_id, invited_by, email, channel, role)
     VALUES ($1, $2, $3, 'email', $4) RETURNING token`,
    [householdId, invitedBy, email, role],
  );
  return result.rows[0];
}
