import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1).max(100),
  target: z.number().positive(),
  targetDate: z.string().optional(),
  monthlyContribution: z.number().min(0).default(0),
  icon: z.string().max(10).default('🎯'),
  accountId: z.string().uuid().optional(),
}).strict();

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  target: z.number().positive().optional(),
  saved: z.number().min(0).optional(),
  targetDate: z.string().nullable().optional(),
  monthlyContribution: z.number().min(0).optional(),
  icon: z.string().max(10).optional(),
  accountId: z.string().uuid().nullable().optional(),
}).strict();

const contributionSchema = z.object({
  amount: z.number().positive(),
}).strict();

describe('goal create schema', () => {
  it('accepts minimal input with defaults', () => {
    const result = createSchema.safeParse({ name: 'Emergency Fund', target: 10000 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.monthlyContribution).toBe(0);
      expect(result.data.icon).toBe('🎯');
    }
  });

  it('accepts all fields', () => {
    const result = createSchema.safeParse({
      name: 'New Car',
      target: 50000,
      targetDate: '2026-12-31',
      monthlyContribution: 2000,
      icon: '🚗',
      accountId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
  });

  it('rejects zero target', () => {
    const result = createSchema.safeParse({ name: 'Bad', target: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects negative monthlyContribution', () => {
    const result = createSchema.safeParse({ name: 'X', target: 100, monthlyContribution: -50 });
    expect(result.success).toBe(false);
  });
});

describe('goal update schema', () => {
  it('accepts partial update', () => {
    const result = updateSchema.safeParse({ saved: 5000 });
    expect(result.success).toBe(true);
  });

  it('allows nullable targetDate', () => {
    const result = updateSchema.safeParse({ targetDate: null });
    expect(result.success).toBe(true);
  });
});

describe('goal contribution schema', () => {
  it('accepts valid contribution', () => {
    const result = contributionSchema.safeParse({ amount: 500 });
    expect(result.success).toBe(true);
  });

  it('rejects zero amount', () => {
    const result = contributionSchema.safeParse({ amount: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects extra fields', () => {
    const result = contributionSchema.safeParse({ amount: 500, note: 'extra' });
    expect(result.success).toBe(false);
  });
});
