import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { idempotency } from './idempotency.js';

function mockReqRes(overrides: Partial<Request> = {}) {
  const req = {
    method: 'POST',
    headers: {},
    userId: 'user-1',
    ...overrides,
  } as unknown as Request;

  const jsonFn = vi.fn().mockReturnThis();
  const res = {
    status: vi.fn().mockReturnThis(),
    statusCode: 201,
    json: jsonFn,
  } as unknown as Response;

  const next: NextFunction = vi.fn();
  return { req, res, next };
}

describe('idempotency middleware', () => {
  it('passes through GET requests without idempotency key', () => {
    const { req, res, next } = mockReqRes({ method: 'GET' } as any);
    idempotency(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('passes through POST without idempotency key (opt-in)', () => {
    const { req, res, next } = mockReqRes();
    idempotency(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('passes through on first request with idempotency key', () => {
    const { req, res, next } = mockReqRes({
      headers: { 'idempotency-key': 'key-unique-1' },
    } as any);
    idempotency(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('returns cached response on duplicate idempotency key', () => {
    const key = 'key-dup-' + Date.now();

    // First request — goes through and captures response
    const first = mockReqRes({ headers: { 'idempotency-key': key } } as any);
    idempotency(first.req, first.res, first.next);
    expect(first.next).toHaveBeenCalled();

    // Simulate the route handler calling res.json
    first.res.statusCode = 201;
    (first.res.json as any)({ data: { id: 'tx-1' } });

    // Second request with same key — should return cached
    const second = mockReqRes({ headers: { 'idempotency-key': key } } as any);
    idempotency(second.req, second.res, second.next);

    expect(second.next).not.toHaveBeenCalled();
    expect(second.res.status).toHaveBeenCalledWith(201);
    expect(second.res.json).toHaveBeenCalledWith({ data: { id: 'tx-1' } });
  });

  it('different users with same key are treated independently', () => {
    const key = 'key-shared-' + Date.now();

    // User A
    const a = mockReqRes({ headers: { 'idempotency-key': key }, userId: 'user-a' } as any);
    idempotency(a.req, a.res, a.next);
    expect(a.next).toHaveBeenCalled();
    a.res.statusCode = 201;
    (a.res.json as any)({ data: { id: 'tx-a' } });

    // User B with same key — should go through (different user)
    const b = mockReqRes({ headers: { 'idempotency-key': key }, userId: 'user-b' } as any);
    idempotency(b.req, b.res, b.next);
    expect(b.next).toHaveBeenCalled();
  });
});
