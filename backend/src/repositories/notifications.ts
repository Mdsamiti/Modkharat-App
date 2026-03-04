import { query } from '../lib/db.js';

export interface NotificationRow {
  id: string;
  user_id: string;
  household_id: string | null;
  type: 'budget' | 'goal' | 'unusual' | 'system';
  title: string;
  message: string;
  metadata: Record<string, any>;
  read_at: Date | null;
  created_at: Date;
}

export async function findNotificationsByUser(userId: string): Promise<NotificationRow[]> {
  const result = await query<NotificationRow>(
    'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
    [userId],
  );
  return result.rows;
}

export async function markRead(id: string, userId: string): Promise<boolean> {
  const result = await query(
    'UPDATE notifications SET read_at = now() WHERE id = $1 AND user_id = $2 AND read_at IS NULL',
    [id, userId],
  );
  return (result.rowCount ?? 0) > 0;
}

export async function markAllRead(userId: string): Promise<number> {
  const result = await query(
    'UPDATE notifications SET read_at = now() WHERE user_id = $1 AND read_at IS NULL',
    [userId],
  );
  return result.rowCount ?? 0;
}
