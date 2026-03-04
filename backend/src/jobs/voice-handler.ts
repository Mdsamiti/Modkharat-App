import * as jobRepo from '../repositories/ingestion-jobs.js';
import * as txRepo from '../repositories/transactions.js';
import { downloadFile } from '../lib/storage.js';
import { transcribeAudio } from '../lib/speech.js';
import { parseVoiceTranscript } from '../lib/parsers/voice-parser.js';
import pino from 'pino';

const logger = pino({ name: 'voice-handler' });

export async function handleVoiceJob(job: { data: { jobId: string; householdId: string; language?: string } }) {
  const { jobId, householdId, language = 'ar-SA' } = job.data;
  logger.info({ jobId, language }, 'Processing voice job');

  try {
    // Mark as processing
    await jobRepo.updateJobStatus(jobId, 'processing');

    // Fetch the job to get storage path
    const jobRow = await jobRepo.findJobById(jobId, householdId);
    if (!jobRow || !jobRow.input_ref) {
      throw new Error('Job not found or missing input reference');
    }

    // Download audio from Supabase Storage
    const audioBuffer = await downloadFile('voice-recordings', jobRow.input_ref);

    // Transcribe audio
    const sttResult = await transcribeAudio(audioBuffer, language);
    if (!sttResult.transcript) {
      await jobRepo.updateJobStatus(jobId, 'failed', {
        errorMessage: 'No speech detected in audio',
        confidence: 0,
        parsedResult: { transcript: '' },
      });
      return;
    }

    // Parse transcript into transaction fields
    const parsed = parseVoiceTranscript(sttResult.transcript);
    if (!parsed) {
      await jobRepo.updateJobStatus(jobId, 'failed', {
        errorMessage: 'Could not extract transaction data from transcript',
        confidence: sttResult.confidence,
        parsedResult: { transcript: sttResult.transcript, language: sttResult.languageCode },
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
      method: 'voice',
      status: 'draft',
      occurredAt: parsed.date ?? undefined,
    });

    // Link transaction source
    await jobRepo.linkTransactionSource({
      transactionId: tx.id,
      jobId,
      rawText: sttResult.transcript,
      confidence: parsed.confidence,
      providerResponse: { sttConfidence: sttResult.confidence, language: sttResult.languageCode },
    });

    // Mark completed
    await jobRepo.updateJobStatus(jobId, 'completed', {
      parsedResult: { ...parsed, transcript: sttResult.transcript },
      confidence: parsed.confidence,
      outputTransactionId: tx.id,
    });

    logger.info({ jobId, transactionId: tx.id, confidence: parsed.confidence }, 'Voice job completed');
  } catch (err: any) {
    logger.error({ err, jobId }, 'Voice job failed');
    await jobRepo.updateJobStatus(jobId, 'failed', {
      errorMessage: err.message,
    });
  }
}
