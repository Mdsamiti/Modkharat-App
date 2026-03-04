import * as jobRepo from '../repositories/ingestion-jobs.js';
import * as txRepo from '../repositories/transactions.js';
import { downloadFile } from '../lib/storage.js';
import { recognizeReceipt } from '../lib/ocr.js';
import { parseReceiptText } from '../lib/parsers/receipt-parser.js';
import pino from 'pino';

const logger = pino({ name: 'ocr-handler' });

export async function handleOcrJob(job: { data: { jobId: string; householdId: string } }) {
  const { jobId, householdId } = job.data;
  logger.info({ jobId }, 'Processing OCR job');

  try {
    // Mark as processing
    await jobRepo.updateJobStatus(jobId, 'processing');

    // Fetch the job to get storage path
    const jobRow = await jobRepo.findJobById(jobId, householdId);
    if (!jobRow || !jobRow.input_ref) {
      throw new Error('Job not found or missing input reference');
    }

    // Download image from Supabase Storage
    const imageBuffer = await downloadFile('receipts', jobRow.input_ref);

    // Run OCR
    const ocrResult = await recognizeReceipt(imageBuffer);
    if (!ocrResult.fullText) {
      await jobRepo.updateJobStatus(jobId, 'failed', {
        errorMessage: 'No text detected in receipt image',
        confidence: 0,
        parsedResult: { ocrText: '' },
      });
      return;
    }

    // Parse OCR text into transaction fields
    const parsed = parseReceiptText(ocrResult.fullText);
    if (!parsed) {
      await jobRepo.updateJobStatus(jobId, 'failed', {
        errorMessage: 'Could not extract transaction data from receipt',
        confidence: ocrResult.confidence,
        parsedResult: { ocrText: ocrResult.fullText },
      });
      return;
    }

    // Create draft transaction
    const tx = await txRepo.createTransaction({
      householdId,
      createdBy: jobRow.created_by,
      type: parsed.type,
      amount: parsed.amount,
      merchant: parsed.merchant,
      method: 'scan',
      status: 'draft',
      occurredAt: parsed.date ?? undefined,
      hasReceipt: true,
    });

    // Link transaction source
    await jobRepo.linkTransactionSource({
      transactionId: tx.id,
      jobId,
      rawText: ocrResult.fullText,
      confidence: parsed.confidence,
      providerResponse: { ocrConfidence: ocrResult.confidence },
    });

    // Mark completed
    await jobRepo.updateJobStatus(jobId, 'completed', {
      parsedResult: parsed,
      confidence: parsed.confidence,
      outputTransactionId: tx.id,
    });

    logger.info({ jobId, transactionId: tx.id, confidence: parsed.confidence }, 'OCR job completed');
  } catch (err: any) {
    logger.error({ err, jobId }, 'OCR job failed');
    await jobRepo.updateJobStatus(jobId, 'failed', {
      errorMessage: err.message,
    });
  }
}
