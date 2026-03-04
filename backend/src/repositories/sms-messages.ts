import { query } from '../lib/db.js';

export interface SmsMessageRow {
  id: string;
  household_id: string;
  user_id: string;
  raw_text: string;
  sender_phone: string | null;
  parsed_result: Record<string, any> | null;
  confidence: string | null;
  job_id: string | null;
  created_at: Date;
}

export async function createSmsMessage(data: {
  householdId: string;
  userId: string;
  rawText: string;
  senderPhone?: string;
  parsedResult?: Record<string, any>;
  confidence?: number;
  jobId?: string;
}): Promise<SmsMessageRow> {
  const result = await query<SmsMessageRow>(
    `INSERT INTO sms_messages (household_id, user_id, raw_text, sender_phone, parsed_result, confidence, job_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      data.householdId, data.userId, data.rawText,
      data.senderPhone ?? null,
      data.parsedResult ? JSON.stringify(data.parsedResult) : null,
      data.confidence ?? null,
      data.jobId ?? null,
    ],
  );
  return result.rows[0];
}

export async function findByHousehold(householdId: string, limit = 50): Promise<SmsMessageRow[]> {
  const result = await query<SmsMessageRow>(
    'SELECT * FROM sms_messages WHERE household_id = $1 ORDER BY created_at DESC LIMIT $2',
    [householdId, limit],
  );
  return result.rows;
}
