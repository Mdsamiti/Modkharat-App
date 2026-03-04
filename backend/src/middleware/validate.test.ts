import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from './validate.js';

function mockReqRes(overrides: Partial<Request> = {}) {
  const req = { traceId: 'trace-1', body: {}, query: {}, params: {}, ...overrides } as unknown as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next: NextFunction = vi.fn();
  return { req, res, next };
}

const schema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
});

describe('validate middleware', () => {
  it('calls next() when body is valid', () => {
    const { req, res, next } = mockReqRes({ body: { name: 'Test', amount: 100 } });
    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 400 with VALIDATION_ERROR for invalid body', () => {
    const { req, res, next } = mockReqRes({ body: { name: '', amount: -5 } });
    validate(schema)(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          traceId: 'trace-1',
        }),
      }),
    );
  });

  it('validates query source when specified', () => {
    const querySchema = z.object({ page: z.coerce.number().int().positive() });
    const { req, res, next } = mockReqRes({ query: { page: '3' } as any });
    validate(querySchema, 'query')(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('replaces source with parsed data (coercion)', () => {
    const querySchema = z.object({ page: z.coerce.number().int().positive() });
    const { req, res, next } = mockReqRes({ query: { page: '5' } as any });
    validate(querySchema, 'query')(req, res, next);

    expect((req as any).query.page).toBe(5);
  });
});
