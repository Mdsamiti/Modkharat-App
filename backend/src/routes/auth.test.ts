import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  avatarEmoji: z.string().max(10).optional(),
  language: z.enum(['en', 'ar']).optional(),
  timezone: z.string().max(50).optional(),
}).strict();

describe('profile update schema', () => {
  it('accepts valid partial update', () => {
    const result = updateProfileSchema.safeParse({ displayName: 'Ahmed' });
    expect(result.success).toBe(true);
  });

  it('accepts language change', () => {
    const result = updateProfileSchema.safeParse({ language: 'ar' });
    expect(result.success).toBe(true);
  });

  it('accepts empty object (no changes)', () => {
    const result = updateProfileSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('rejects invalid language', () => {
    const result = updateProfileSchema.safeParse({ language: 'fr' });
    expect(result.success).toBe(false);
  });

  it('rejects empty displayName', () => {
    const result = updateProfileSchema.safeParse({ displayName: '' });
    expect(result.success).toBe(false);
  });

  it('rejects unknown fields', () => {
    const result = updateProfileSchema.safeParse({ displayName: 'Ahmed', admin: true });
    expect(result.success).toBe(false);
  });

  it('accepts emoji avatar', () => {
    const result = updateProfileSchema.safeParse({ avatarEmoji: '👨‍💻' });
    expect(result.success).toBe(true);
  });
});
