import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Re-create the schemas from transactions route for unit testing
const createSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive(),
  merchant: z.string().min(1).max(200),
  categoryId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),
  method: z.enum(['manual', 'sms', 'voice', 'scan']).default('manual'),
  notes: z.string().max(500).optional(),
  hasReceipt: z.boolean().default(false),
  occurredAt: z.string().datetime().optional(),
}).strict();

const updateSchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
  amount: z.number().positive().optional(),
  merchant: z.string().min(1).max(200).optional(),
  categoryId: z.string().uuid().nullable().optional(),
  accountId: z.string().uuid().nullable().optional(),
  method: z.enum(['manual', 'sms', 'voice', 'scan']).optional(),
  notes: z.string().max(500).nullable().optional(),
  hasReceipt: z.boolean().optional(),
  occurredAt: z.string().datetime().optional(),
  status: z.enum(['draft', 'confirmed', 'rejected']).optional(),
}).strict();

const listQuerySchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
  categoryId: z.string().uuid().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

describe('transaction create schema', () => {
  it('accepts valid expense input', () => {
    const input = { type: 'expense', amount: 42.50, merchant: 'Coffee Shop' };
    const result = createSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.method).toBe('manual');
      expect(result.data.hasReceipt).toBe(false);
    }
  });

  it('accepts valid income input with all fields', () => {
    const input = {
      type: 'income',
      amount: 5000,
      merchant: 'Salary',
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      accountId: '550e8400-e29b-41d4-a716-446655440001',
      method: 'sms',
      notes: 'Monthly salary',
      hasReceipt: true,
      occurredAt: '2025-01-15T10:00:00Z',
    };
    const result = createSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('rejects negative amount', () => {
    const result = createSchema.safeParse({ type: 'expense', amount: -10, merchant: 'Bad' });
    expect(result.success).toBe(false);
  });

  it('rejects zero amount', () => {
    const result = createSchema.safeParse({ type: 'expense', amount: 0, merchant: 'Zero' });
    expect(result.success).toBe(false);
  });

  it('rejects empty merchant', () => {
    const result = createSchema.safeParse({ type: 'expense', amount: 10, merchant: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid type', () => {
    const result = createSchema.safeParse({ type: 'refund', amount: 10, merchant: 'X' });
    expect(result.success).toBe(false);
  });

  it('rejects unknown fields (strict mode)', () => {
    const result = createSchema.safeParse({ type: 'expense', amount: 10, merchant: 'X', extra: true });
    expect(result.success).toBe(false);
  });

  it('rejects invalid UUID for categoryId', () => {
    const result = createSchema.safeParse({ type: 'expense', amount: 10, merchant: 'X', categoryId: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });
});

describe('transaction update schema', () => {
  it('accepts partial update', () => {
    const result = updateSchema.safeParse({ amount: 99 });
    expect(result.success).toBe(true);
  });

  it('accepts empty object (no changes)', () => {
    const result = updateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('allows nullable categoryId', () => {
    const result = updateSchema.safeParse({ categoryId: null });
    expect(result.success).toBe(true);
  });

  it('allows status change', () => {
    const result = updateSchema.safeParse({ status: 'confirmed' });
    expect(result.success).toBe(true);
  });
});

describe('transaction list query schema', () => {
  it('provides defaults for page and limit', () => {
    const result = listQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(50);
    }
  });

  it('coerces string page/limit to numbers', () => {
    const result = listQuerySchema.safeParse({ page: '3', limit: '25' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(25);
    }
  });

  it('rejects limit over 100', () => {
    const result = listQuerySchema.safeParse({ limit: '200' });
    expect(result.success).toBe(false);
  });

  it('accepts type filter', () => {
    const result = listQuerySchema.safeParse({ type: 'income' });
    expect(result.success).toBe(true);
  });
});
