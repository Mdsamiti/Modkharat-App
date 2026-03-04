import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('../repositories/ingestion-jobs.js', () => ({
  createJob: vi.fn(),
  findJobById: vi.fn(),
  findJobByInputHash: vi.fn(),
  updateJobStatus: vi.fn(),
  linkTransactionSource: vi.fn(),
}));

vi.mock('../repositories/sms-messages.js', () => ({
  createSmsMessage: vi.fn(),
}));

vi.mock('../repositories/transactions.js', () => ({
  createTransaction: vi.fn(),
}));

vi.mock('../lib/storage.js', () => ({
  hashFile: vi.fn().mockReturnValue('abc123hash'),
  uploadReceipt: vi.fn().mockResolvedValue('hh-1/abc123hash.jpg'),
  uploadVoiceRecording: vi.fn().mockResolvedValue('hh-1/uuid.webm'),
}));

import * as importService from './import.js';
import * as jobRepo from '../repositories/ingestion-jobs.js';
import * as smsRepo from '../repositories/sms-messages.js';
import * as txRepo from '../repositories/transactions.js';

const mockCreateJob = jobRepo.createJob as ReturnType<typeof vi.fn>;
const mockFindJobById = jobRepo.findJobById as ReturnType<typeof vi.fn>;
const mockFindJobByInputHash = jobRepo.findJobByInputHash as ReturnType<typeof vi.fn>;
const mockLinkSource = jobRepo.linkTransactionSource as ReturnType<typeof vi.fn>;
const mockCreateSms = smsRepo.createSmsMessage as ReturnType<typeof vi.fn>;
const mockCreateTx = txRepo.createTransaction as ReturnType<typeof vi.fn>;

const HH = 'household-1';
const USER = 'user-1';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Import service — submitSmsJob', () => {
  it('parses a valid Saudi bank SMS and creates a draft transaction', async () => {
    mockCreateTx.mockResolvedValue({ id: 'tx-1', amount: '245.50', merchant: 'Carrefour' });
    mockCreateJob.mockResolvedValue({
      id: 'job-1', type: 'sms', status: 'completed', confidence: '90',
      output_transaction_id: 'tx-1', parsed_result: {}, raw_payload: {},
      created_at: new Date(), updated_at: new Date(),
      household_id: HH, created_by: USER, input_ref: null, input_hash: null,
      error_message: null, attempts: 0,
    });
    mockCreateSms.mockResolvedValue({});
    mockLinkSource.mockResolvedValue(undefined);

    const result = await importService.submitSmsJob(HH, USER, 'Purchase of SAR 245.50 at Carrefour on 04/03/2026');

    expect(result.transaction).not.toBeNull();
    expect(mockCreateTx).toHaveBeenCalledWith(expect.objectContaining({
      householdId: HH,
      type: 'expense',
      amount: 245.50,
      merchant: 'Carrefour',
      method: 'sms',
      status: 'draft',
    }));
    expect(mockCreateJob).toHaveBeenCalledWith(expect.objectContaining({
      type: 'sms',
      status: 'completed',
    }));
    expect(mockCreateSms).toHaveBeenCalled();
    expect(mockLinkSource).toHaveBeenCalled();
  });

  it('handles unrecognized SMS gracefully', async () => {
    mockCreateJob.mockResolvedValue({
      id: 'job-2', type: 'sms', status: 'completed', confidence: '0',
      output_transaction_id: null, parsed_result: { error: 'No matching bank pattern found' },
      raw_payload: {}, created_at: new Date(), updated_at: new Date(),
      household_id: HH, created_by: USER, input_ref: null, input_hash: null,
      error_message: null, attempts: 0,
    });
    mockCreateSms.mockResolvedValue({});

    const result = await importService.submitSmsJob(HH, USER, 'Your OTP is 123456');

    expect(result.transaction).toBeNull();
    expect(mockCreateTx).not.toHaveBeenCalled();
    expect(mockCreateSms).toHaveBeenCalled(); // Still stores for audit
  });
});

describe('Import service — submitOcrJob', () => {
  it('detects duplicate submissions via input hash', async () => {
    const existingJob = {
      id: 'existing-job', type: 'ocr', status: 'completed', confidence: '85',
      output_transaction_id: 'tx-existing', parsed_result: {},
      raw_payload: null, created_at: new Date(), updated_at: new Date(),
      household_id: HH, created_by: USER, input_ref: 'hh-1/abc.jpg',
      input_hash: 'abc123hash', error_message: null, attempts: 1,
    };
    mockFindJobByInputHash.mockResolvedValue(existingJob);

    const file = { buffer: Buffer.from('fake-image'), originalname: 'receipt.jpg' };
    const result = await importService.submitOcrJob(HH, USER, file);

    expect(result.id).toBe('existing-job');
    expect(mockCreateJob).not.toHaveBeenCalled(); // No new job created
  });
});

describe('Import service — getJobStatus', () => {
  it('returns job DTO when found', async () => {
    mockFindJobById.mockResolvedValue({
      id: 'job-3', type: 'ocr', status: 'processing', confidence: null,
      output_transaction_id: null, parsed_result: null, raw_payload: null,
      created_at: new Date(), updated_at: new Date(),
      household_id: HH, created_by: USER, input_ref: 'path.jpg',
      input_hash: 'hash', error_message: null, attempts: 1,
    });

    const result = await importService.getJobStatus('job-3', HH);
    expect(result).not.toBeNull();
    expect(result!.id).toBe('job-3');
    expect(result!.status).toBe('processing');
  });

  it('returns null when job not found', async () => {
    mockFindJobById.mockResolvedValue(null);
    const result = await importService.getJobStatus('nonexistent', HH);
    expect(result).toBeNull();
  });
});
