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

vi.mock('../lib/ocr.js', () => ({
  recognizeReceipt: vi.fn(),
}));

import { handleOcrJob } from './ocr-handler.js';
import * as jobRepo from '../repositories/ingestion-jobs.js';
import * as txRepo from '../repositories/transactions.js';
import * as storage from '../lib/storage.js';
import * as ocr from '../lib/ocr.js';

const mockFindJob = jobRepo.findJobById as ReturnType<typeof vi.fn>;
const mockUpdateStatus = jobRepo.updateJobStatus as ReturnType<typeof vi.fn>;
const mockLinkSource = jobRepo.linkTransactionSource as ReturnType<typeof vi.fn>;
const mockCreateTx = txRepo.createTransaction as ReturnType<typeof vi.fn>;
const mockDownload = storage.downloadFile as ReturnType<typeof vi.fn>;
const mockRecognize = ocr.recognizeReceipt as ReturnType<typeof vi.fn>;

const JOB_ID = 'job-ocr-1';
const HH = 'household-1';

beforeEach(() => {
  vi.clearAllMocks();
  mockUpdateStatus.mockResolvedValue(undefined);
  mockLinkSource.mockResolvedValue(undefined);
});

describe('OCR Job Handler', () => {
  it('processes a receipt image and creates a draft transaction', async () => {
    mockFindJob.mockResolvedValue({
      id: JOB_ID, input_ref: 'hh-1/receipt.jpg', created_by: 'user-1',
    });
    mockDownload.mockResolvedValue(Buffer.from('fake-image'));
    mockRecognize.mockResolvedValue({
      fullText: 'Carrefour\nItems\nTOTAL SAR 245.50\n04/03/2026',
      confidence: 92,
    });
    mockCreateTx.mockResolvedValue({ id: 'tx-1' });

    await handleOcrJob({ data: { jobId: JOB_ID, householdId: HH } });

    expect(mockUpdateStatus).toHaveBeenCalledWith(JOB_ID, 'processing');
    expect(mockDownload).toHaveBeenCalledWith('receipts', 'hh-1/receipt.jpg');
    expect(mockRecognize).toHaveBeenCalled();
    expect(mockCreateTx).toHaveBeenCalledWith(expect.objectContaining({
      householdId: HH,
      method: 'scan',
      status: 'draft',
    }));
    expect(mockLinkSource).toHaveBeenCalled();
    expect(mockUpdateStatus).toHaveBeenCalledWith(JOB_ID, 'completed', expect.objectContaining({
      outputTransactionId: 'tx-1',
    }));
  });

  it('fails when no text is detected in the image', async () => {
    mockFindJob.mockResolvedValue({
      id: JOB_ID, input_ref: 'hh-1/blank.jpg', created_by: 'user-1',
    });
    mockDownload.mockResolvedValue(Buffer.from('blank'));
    mockRecognize.mockResolvedValue({ fullText: '', confidence: 0 });

    await handleOcrJob({ data: { jobId: JOB_ID, householdId: HH } });

    expect(mockCreateTx).not.toHaveBeenCalled();
    expect(mockUpdateStatus).toHaveBeenCalledWith(JOB_ID, 'failed', expect.objectContaining({
      errorMessage: 'No text detected in receipt image',
    }));
  });

  it('fails when job is not found', async () => {
    mockFindJob.mockResolvedValue(null);

    await handleOcrJob({ data: { jobId: JOB_ID, householdId: HH } });

    expect(mockUpdateStatus).toHaveBeenCalledWith(JOB_ID, 'processing');
    expect(mockUpdateStatus).toHaveBeenCalledWith(JOB_ID, 'failed', expect.objectContaining({
      errorMessage: expect.stringContaining('not found'),
    }));
  });

  it('fails gracefully when OCR provider throws', async () => {
    mockFindJob.mockResolvedValue({
      id: JOB_ID, input_ref: 'hh-1/receipt.jpg', created_by: 'user-1',
    });
    mockDownload.mockResolvedValue(Buffer.from('img'));
    mockRecognize.mockRejectedValue(new Error('Vision API quota exceeded'));

    await handleOcrJob({ data: { jobId: JOB_ID, householdId: HH } });

    expect(mockUpdateStatus).toHaveBeenCalledWith(JOB_ID, 'failed', expect.objectContaining({
      errorMessage: 'Vision API quota exceeded',
    }));
  });
});
