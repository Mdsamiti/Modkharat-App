import { get, post, patch, del, postFormData } from './client';
import type { Transaction } from '@/types/models';

interface TransactionListResponse {
  data: Transaction[];
  meta: { page: number; limit: number; total: number };
}

interface TransactionResponse {
  data: Transaction;
}

export interface TransactionFilters {
  type?: 'income' | 'expense';
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function listTransactions(filters: TransactionFilters = {}) {
  return get<TransactionListResponse>('/v1/transactions', filters as any);
}

export async function getTransaction(id: string) {
  return get<TransactionResponse>(`/v1/transactions/${id}`);
}

export async function createTransaction(input: {
  type: 'income' | 'expense';
  amount: number;
  merchant: string;
  categoryId?: string;
  accountId?: string;
  method?: 'manual' | 'sms' | 'voice' | 'scan';
  notes?: string;
  hasReceipt?: boolean;
  occurredAt?: string;
}) {
  return post<TransactionResponse>('/v1/transactions', input);
}

export async function updateTransaction(id: string, fields: Partial<{
  type: 'income' | 'expense';
  amount: number;
  merchant: string;
  categoryId: string | null;
  accountId: string | null;
  method: 'manual' | 'sms' | 'voice' | 'scan';
  notes: string | null;
  hasReceipt: boolean;
  occurredAt: string;
  status: 'draft' | 'confirmed' | 'rejected';
}>) {
  return patch<TransactionResponse>(`/v1/transactions/${id}`, fields);
}

export async function deleteTransaction(id: string) {
  return del(`/v1/transactions/${id}`);
}

// --- Import / Ingestion APIs ---

export interface IngestionJobDTO {
  id: string;
  type: 'ocr' | 'voice' | 'sms';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  transactionId: string | null;
  confidence: number | null;
  errorMessage: string | null;
  parsedResult: Record<string, any> | null;
  createdAt: string;
}

interface ImportJobResponse {
  data: IngestionJobDTO;
}

interface SmsImportResponse {
  data: IngestionJobDTO;
  transaction: Transaction | null;
}

/** Submit a receipt image for OCR processing */
export async function submitOcr(formData: FormData) {
  return postFormData<ImportJobResponse>('/v1/import/ocr', formData);
}

/** Submit an audio recording for voice transcription */
export async function submitVoice(formData: FormData) {
  return postFormData<ImportJobResponse>('/v1/import/voice', formData);
}

/** Submit a bank SMS for parsing (synchronous) */
export async function submitSms(input: { rawText: string; senderPhone?: string }) {
  return post<SmsImportResponse>('/v1/import/sms', input);
}

/** Poll ingestion job status */
export async function getJobStatus(jobId: string) {
  return get<ImportJobResponse>(`/v1/import/jobs/${jobId}`);
}
