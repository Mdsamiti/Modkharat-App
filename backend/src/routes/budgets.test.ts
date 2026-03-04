import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1).max(100),
  limitAmount: z.number().positive(),
  categoryId: z.string().uuid().optional(),
  period: z.enum(['weekly', 'monthly', 'yearly']).default('monthly'),
}).strict();

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  limitAmount: z.number().positive().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  period: z.enum(['weekly', 'monthly', 'yearly']).optional(),
}).strict();

describe('budget create schema', () => {
  it('accepts valid input with defaults', () => {
    const result = createSchema.safeParse({ name: 'Groceries', limitAmount: 500 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.period).toBe('monthly');
    }
  });

  it('accepts all fields', () => {
    const result = createSchema.safeParse({
      name: 'Food',
      limitAmount: 1000,
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      period: 'weekly',
    });
    expect(result.success).toBe(true);
  });

  it('rejects zero limit', () => {
    const result = createSchema.safeParse({ name: 'Bad', limitAmount: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = createSchema.safeParse({ name: '', limitAmount: 100 });
    expect(result.success).toBe(false);
  });

  it('rejects invalid period', () => {
    const result = createSchema.safeParse({ name: 'X', limitAmount: 100, period: 'daily' });
    expect(result.success).toBe(false);
  });
});

describe('budget update schema', () => {
  it('accepts partial update', () => {
    const result = updateSchema.safeParse({ limitAmount: 750 });
    expect(result.success).toBe(true);
  });

  it('allows nullable categoryId', () => {
    const result = updateSchema.safeParse({ categoryId: null });
    expect(result.success).toBe(true);
  });

  it('accepts empty object', () => {
    const result = updateSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
