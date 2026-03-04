import { query } from '../lib/db.js';

export async function logAction(params: {
  userId: string;
  householdId?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}): Promise<void> {
  await query(
    `INSERT INTO audit_logs (user_id, household_id, action, target_type, target_id, metadata, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      params.userId, params.householdId ?? null, params.action,
      params.targetType ?? null, params.targetId ?? null,
      JSON.stringify(params.metadata ?? {}), params.ipAddress ?? null,
    ],
  );
}
