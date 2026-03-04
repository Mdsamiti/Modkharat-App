import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { AppError, errorHandler } from './error-handler.js';

function mockReqRes(traceId = 'test-trace-123') {
  const req = { traceId } as unknown as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn();
  return { req, res, next };
}

describe('AppError', () => {
  it('stores statusCode, code, and message', () => {
    const err = new AppError(404, 'NOT_FOUND', 'Resource not found');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe('Resource not found');
    expect(err.name).toBe('AppError');
  });
});

describe('errorHandler', () => {
  it('returns structured error for AppError', () => {
    const { req, res, next } = mockReqRes();
    const err = new AppError(403, 'FORBIDDEN', 'Access denied');

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'FORBIDDEN', message: 'Access denied', traceId: 'test-trace-123' },
    });
  });

  it('returns 500 with generic message for unknown errors', () => {
    const { req, res, next } = mockReqRes();
    const err = new Error('something broke');

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred', traceId: 'test-trace-123' },
    });
  });

  it('uses empty string when traceId is missing', () => {
    const { res, next } = mockReqRes();
    const req = {} as unknown as Request;
    const err = new AppError(400, 'BAD', 'Bad');

    errorHandler(err, req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.objectContaining({ traceId: '' }) }),
    );
  });
});
