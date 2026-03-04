import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../repositories/ingestion-jobs.js', () => ({
  findJobById: vi.fn(),
  updateJobStatus: vi.fn(),
  linkTransactionSource: vi.fn(),
}));

vi.mock('../repositories/transactions.js', () => ({
  createTransaction: vi.fn(),
}));

vi.mock('../lib/storage.js', () => ({
  downloadFile: vi.fn(),
}));

vi.mock('../lib/speech.js', () => ({
  transcribeAudio: vi.fn(),
}));

import { handleVoiceJob } from './voice-handler.js';
import * as jobRepo from '../repositories/ingestion-jobs.js';
import * as txRepo from '../repositories/transactions.js';
import * as storage from '../lib/storage.js';
import * as speech from '../lib/speech.js';

const mockFindJob = jobRepo.findJobById as ReturnType<typeof vi.fn>;
const mockUpdateStatus = jobRepo.updateJobStatus as ReturnType<typeof vi.fn>;
const mockLinkSource = jobRepo.linkTransactionSource as ReturnType<typeof vi.fn>;
const mockCreateTx = txRepo.createTransaction as ReturnType<typeof vi.fn>;
const mockDownload = storage.downloadFile as ReturnType<typeof vi.fn>;
const mockTranscribe = speech.transcribeAudio as ReturnType<typeof vi.fn>;

const JOB_ID = 'job-voice-1';
const HH = 'household-1';

beforeEach(() => {
  vi.clearAllMocks();
  mockUpdateStatus.mockResolvedValue(undefined);
  mockLinkSource.mockResolvedValue(undefined);
});

describe('Voice Job Handler', () => {
  it('transcribes audio and creates a draft transaction', async () => {
    mockFindJob.mockResolvedValue({
      id: JOB_ID, input_ref: 'hh-1/recording.webm', created_by: 'user-1',
    });
    mockDownload.mockResolvedValue(Buffer.from('fake-audio'));
    mockTranscribe.mockResolvedValue({
      transcript: 'صرفت مائة ريال في كارفور',
      confidence: 88,
      languageCode: 'ar-SA',
    });
    mockCreateTx.mockResolvedValue({ id: 'tx-v1' });

    await handleVoiceJob({ data: { jobId: JOB_ID, householdId: HH } });

    expect(mockUpdateStatus).toHaveBeenCalledWith(JOB_ID, 'processing');
    expect(mockDownload).toHaveBeenCalledWith('voice-recordings', 'hh-1/recording.webm');
    expect(mockTranscribe).toHaveBeenCalledWith(Buffer.from('fake-audio'), 'ar-SA');
    expect(mockCreateTx).toHaveBeenCalledWith(expect.objectContaining({
      householdId: HH,
      method: 'voice',
      status: 'draft',
    }));
    expect(mockUpdateStatus).toHaveBeenCalledWith(JOB_ID, 'completed', expect.objectContaining({
      outputTransactionId: 'tx-v1',
    }));
  });

  it('fails when no speech is detected', async () => {
    mockFindJob.mockResolvedValue({
      id: JOB_ID, input_ref: 'hh-1/silence.webm', created_by: 'user-1',
    });
    mockDownload.mockResolvedValue(Buffer.from('silence'));
    mockTranscribe.mockResolvedValue({ transcript: '', confidence: 0, languageCode: 'ar-SA' });

    await handleVoiceJob({ data: { jobId: JOB_ID, householdId: HH } });

    expect(mockCreateTx).not.toHaveBeenCalled();
    expect(mockUpdateStatus).toHaveBeenCalledWith(JOB_ID, 'failed', expect.objectContaining({
      errorMessage: 'No speech detected in audio',
    }));
  });

  it('fails when transcript cannot be parsed into transaction', async () => {
    mockFindJob.mockResolvedValue({
      id: JOB_ID, input_ref: 'hh-1/chat.webm', created_by: 'user-1',
    });
    mockDownload.mockResolvedValue(Buffer.from('audio'));
    mockTranscribe.mockResolvedValue({
      transcript: 'مرحبا كيف حالك',
      confidence: 90,
      languageCode: 'ar-SA',
    });

    await handleVoiceJob({ data: { jobId: JOB_ID, householdId: HH } });

    expect(mockCreateTx).not.toHaveBeenCalled();
    expect(mockUpdateStatus).toHaveBeenCalledWith(JOB_ID, 'failed', expect.objectContaining({
      errorMessage: 'Could not extract transaction data from transcript',
    }));
  });

  it('uses custom language when provided', async () => {
    mockFindJob.mockResolvedValue({
      id: JOB_ID, input_ref: 'hh-1/en.webm', created_by: 'user-1',
    });
    mockDownload.mockResolvedValue(Buffer.from('audio'));
    mockTranscribe.mockResolvedValue({
      transcript: 'I spent 50 riyals at Starbucks',
      confidence: 95,
      languageCode: 'en-US',
    });
    mockCreateTx.mockResolvedValue({ id: 'tx-v2' });

    await handleVoiceJob({ data: { jobId: JOB_ID, householdId: HH, language: 'en-US' } });

    expect(mockTranscribe).toHaveBeenCalledWith(Buffer.from('audio'), 'en-US');
    expect(mockCreateTx).toHaveBeenCalled();
  });

  it('handles STT provider errors gracefully', async () => {
    mockFindJob.mockResolvedValue({
      id: JOB_ID, input_ref: 'hh-1/rec.webm', created_by: 'user-1',
    });
    mockDownload.mockResolvedValue(Buffer.from('audio'));
    mockTranscribe.mockRejectedValue(new Error('Speech API unavailable'));

    await handleVoiceJob({ data: { jobId: JOB_ID, householdId: HH } });

    expect(mockUpdateStatus).toHaveBeenCalledWith(JOB_ID, 'failed', expect.objectContaining({
      errorMessage: 'Speech API unavailable',
    }));
  });
});
