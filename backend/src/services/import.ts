import crypto from 'crypto';
import * as jobRepo from '../repositories/ingestion-jobs.js';
import * as smsRepo from '../repositories/sms-messages.js';
import * as txRepo from '../repositories/transactions.js';
import { hashFile, uploadReceipt, uploadVoiceRecording } from '../lib/storage.js';
import { parseBankSms } from '../lib/parsers/sms-parser.js';
import type { IngestionJobDTO } from '../types/api.js';
import pino from 'pino';

const logger = pino({ name: 'import-service' });

// pg-boss instance is set by the worker; API uses enqueue only
let boss: any = null;

export function setBoss(pgBossInstance: any) {
  boss = pgBossInstance;
}

function toDTO(row: jobRepo.IngestionJobRow): IngestionJobDTO {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    transactionId: row.output_transaction_id,
    confidence: row.confidence ? parseFloat(row.confidence) : null,
    errorMessage: row.error_message,
    parsedResult: row.parsed_result,
    createdAt: row.created_at.toISOString(),
  };
}

/**
 * Submit an OCR job: upload receipt image, enqueue for async processing.
 */
export async function submitOcrJob(
  householdId: string,
  userId: string,
  file: { buffer: Buffer; originalname: string },
): Promise<IngestionJobDTO> {
  const hash = hashFile(file.buffer);

  // Dedupe: check if this exact file was already submitted
  const existing = await jobRepo.findJobByInputHash(hash, householdId);
  if (existing) {
    logger.info({ jobId: existing.id }, 'Duplicate OCR submission detected');
    return toDTO(existing);
  }

  // Upload to Supabase Storage
  const storagePath = await uploadReceipt(householdId, file.buffer, file.originalname, hash);

  // Create job record
  const job = await jobRepo.createJob({
    householdId,
    createdBy: userId,
    type: 'ocr',
    inputRef: storagePath,
    inputHash: hash,
  });

  // Enqueue for worker processing
  if (boss) {
    await boss.send('import:ocr', { jobId: job.id, householdId });
  }

  return toDTO(job);
}

/**
 * Submit a voice transcription job: upload audio, enqueue for async processing.
 */
export async function submitVoiceJob(
  householdId: string,
  userId: string,
  file: { buffer: Buffer; originalname: string },
  language: string = 'ar-SA',
): Promise<IngestionJobDTO> {
  // Upload to Supabase Storage
  const storagePath = await uploadVoiceRecording(householdId, file.buffer, file.originalname);

  // Create job record
  const job = await jobRepo.createJob({
    householdId,
    createdBy: userId,
    type: 'voice',
    inputRef: storagePath,
    rawPayload: { language },
  });

  // Enqueue for worker processing
  if (boss) {
    await boss.send('import:voice', { jobId: job.id, householdId, language });
  }

  return toDTO(job);
}

/**
 * Submit an SMS parse job: synchronous parsing (no external API needed).
 * Creates a draft transaction immediately.
 */
export async function submitSmsJob(
  householdId: string,
  userId: string,
  rawText: string,
  senderPhone?: string,
): Promise<{ job: IngestionJobDTO; transaction: any | null }> {
  // Parse SMS text
  const parsed = parseBankSms(rawText);

  if (!parsed) {
    // Store the SMS even if parsing failed for audit
    const job = await jobRepo.createJob({
      householdId,
      createdBy: userId,
      type: 'sms',
      rawPayload: { rawText, senderPhone },
      status: 'completed',
      confidence: 0,
      parsedResult: { error: 'No matching bank pattern found' },
    });

    await smsRepo.createSmsMessage({
      householdId,
      userId,
      rawText,
      senderPhone,
      confidence: 0,
      jobId: job.id,
    });

    return { job: toDTO(job), transaction: null };
  }

  // Create draft transaction from parsed data
  const tx = await txRepo.createTransaction({
    householdId,
    createdBy: userId,
    type: parsed.type,
    amount: parsed.amount,
    merchant: parsed.merchant,
    method: 'sms',
    status: 'draft',
    occurredAt: parsed.date ?? undefined,
  });

  // Create completed job
  const job = await jobRepo.createJob({
    householdId,
    createdBy: userId,
    type: 'sms',
    rawPayload: { rawText, senderPhone },
    status: 'completed',
    parsedResult: parsed,
    confidence: parsed.confidence,
    outputTransactionId: tx.id,
  });

  // Store SMS record
  await smsRepo.createSmsMessage({
    householdId,
    userId,
    rawText,
    senderPhone,
    parsedResult: parsed,
    confidence: parsed.confidence,
    jobId: job.id,
  });

  // Link transaction source
  await jobRepo.linkTransactionSource({
    transactionId: tx.id,
    jobId: job.id,
    rawText,
    confidence: parsed.confidence,
  });

  return { job: toDTO(job), transaction: tx };
}

/**
 * Get the status of an ingestion job.
 */
export async function getJobStatus(jobId: string, householdId: string): Promise<IngestionJobDTO | null> {
  const job = await jobRepo.findJobById(jobId, householdId);
  return job ? toDTO(job) : null;
}
