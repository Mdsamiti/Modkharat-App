import * as txRepo from '../repositories/transactions.js';
import type { TransactionDTO, TransactionCreateInput, PaginationMeta } from '../types/api.js';
import { AppError } from '../middleware/error-handler.js';
import { cacheInvalidate } from '../lib/cache.js';

function toDTO(row: txRepo.TransactionRow): TransactionDTO {
  const amount = parseFloat(row.amount);
  return {
    id: row.id,
    merchant: row.merchant,
    category: row.category_name_en ?? 'Other',
    categoryId: row.category_id,
    amount: row.type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
    date: row.occurred_at.toISOString().split('T')[0],
    type: row.type,
    method: row.method,
    hasReceipt: row.has_receipt,
    notes: row.notes,
    status: row.status,
    accountId: row.account_id,
    createdBy: row.created_by,
  };
}

export async function listTransactions(
  filters: txRepo.TransactionFilters,
): Promise<{ transactions: TransactionDTO[]; meta: PaginationMeta }> {
  const { rows, total } = await txRepo.findTransactions(filters);
  const page = filters.page ?? 1;
  const limit = Math.min(filters.limit ?? 50, 100);
  return {
    transactions: rows.map(toDTO),
    meta: { page, limit, total },
  };
}

export async function getTransaction(id: string, householdId: string): Promise<TransactionDTO> {
  const row = await txRepo.findTransactionById(id, householdId);
  if (!row) throw new AppError(404, 'NOT_FOUND', 'Transaction not found');
  return toDTO(row);
}

export async function createTransaction(
  householdId: string,
  userId: string,
  input: TransactionCreateInput,
): Promise<TransactionDTO> {
  const row = await txRepo.createTransaction({
    householdId,
    createdBy: userId,
    type: input.type,
    amount: input.amount,
    merchant: input.merchant,
    categoryId: input.categoryId,
    accountId: input.accountId,
    method: input.method,
    notes: input.notes,
    hasReceipt: input.hasReceipt,
    occurredAt: input.occurredAt,
  });
  // Re-fetch to get joined category name
  const full = await txRepo.findTransactionById(row.id, householdId);
  cacheInvalidate(`analytics:${householdId}`);
  return toDTO(full!);
}

export async function updateTransaction(id: string, householdId: string, fields: Record<string, any>): Promise<TransactionDTO> {
  const row = await txRepo.updateTransaction(id, householdId, fields);
  if (!row) throw new AppError(404, 'NOT_FOUND', 'Transaction not found');
  const full = await txRepo.findTransactionById(row.id, householdId);
  cacheInvalidate(`analytics:${householdId}`);
  return toDTO(full!);
}

export async function deleteTransaction(id: string, householdId: string): Promise<void> {
  const ok = await txRepo.softDeleteTransaction(id, householdId);
  if (!ok) throw new AppError(404, 'NOT_FOUND', 'Transaction not found');
  cacheInvalidate(`analytics:${householdId}`);
}
