import { query } from '../lib/db.js';

export interface IngestionJobRow {
  id: string;
  household_id: string;
  created_by: string;
  type: 'ocr' | 'voice' | 'sms';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  input_ref: string | null;
  input_hash: string | null;
  output_transaction_id: string | null;
  raw_payload: Record<string, any> | null;
  parsed_result: Record<string, any> | null;
  confidence: string | null; // numeric comes as string from pg
  error_message: string | null;
  attempts: number;
  created_at: Date;
  updated_at: Date;
}

export async function createJob(data: {
  householdId: string;
  createdBy: string;
  type: 'ocr' | 'voice' | 'sms';
  inputRef?: string;
  inputHash?: string;
  rawPayload?: Record<string, any>;
  status?: 'queued' | 'completed';
  parsedResult?: Record<string, any>;
  confidence?: number;
  outputTransactionId?: string;
}): Promise<IngestionJobRow> {
  const result = await query<IngestionJobRow>(
    `INSERT INTO ingestion_jobs (household_id, created_by, type, input_ref, input_hash, raw_payload, status, parsed_result, confidence, output_transaction_id)
     VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7::job_status, 'queued'), $8, $9, $10)
     RETURNING *`,
    [
      data.householdId, data.createdBy, data.type,
      data.inputRef ?? null, data.inputHash ?? null,
      data.rawPayload ? JSON.stringify(data.rawPayload) : null,
      data.status ?? null,
      data.parsedResult ? JSON.stringify(data.parsedResult) : null,
      data.confidence ?? null,
      data.outputTransactionId ?? null,
    ],
  );
  return result.rows[0];
}

export async function findJobById(id: string, householdId: string): Promise<IngestionJobRow | null> {
  const result = await query<IngestionJobRow>(
    'SELECT * FROM ingestion_jobs WHERE id = $1 AND household_id = $2',
    [id, householdId],
  );
  return result.rows[0] ?? null;
}

export async function findJobByInputHash(hash: string, householdId: string): Promise<IngestionJobRow | null> {
  const result = await query<IngestionJobRow>(
    "SELECT * FROM ingestion_jobs WHERE input_hash = $1 AND household_id = $2 AND status != 'failed' LIMIT 1",
    [hash, householdId],
  );
  return result.rows[0] ?? null;
}

export async function updateJobStatus(
  id: string,
  status: 'processing' | 'completed' | 'failed',
  result?: {
    parsedResult?: Record<string, any>;
    confidence?: number;
    outputTransactionId?: string;
    errorMessage?: string;
  },
): Promise<void> {
  await query(
    `UPDATE ingestion_jobs
     SET status = $2, parsed_result = COALESCE($3, parsed_result),
         confidence = COALESCE($4, confidence),
         output_transaction_id = COALESCE($5, output_transaction_id),
         error_message = COALESCE($6, error_message),
         attempts = attempts + 1,
         updated_at = now()
     WHERE id = $1`,
    [
      id, status,
      result?.parsedResult ? JSON.stringify(result.parsedResult) : null,
      result?.confidence ?? null,
      result?.outputTransactionId ?? null,
      result?.errorMessage ?? null,
    ],
  );
}

export async function linkTransactionSource(data: {
  transactionId: string;
  jobId: string;
  rawText?: string;
  confidence?: number;
  providerResponse?: Record<string, any>;
}): Promise<void> {
  await query(
    `INSERT INTO transaction_sources (transaction_id, job_id, raw_text, confidence, provider_response)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      data.transactionId, data.jobId,
      data.rawText ?? null, data.confidence ?? null,
      data.providerResponse ? JSON.stringify(data.providerResponse) : null,
    ],
  );
}
