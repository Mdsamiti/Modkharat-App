import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { requireHousehold, requirePermission } from './context.js';

function mockReqRes(overrides: Partial<Request> = {}) {
  const req = { traceId: 'trace-ctx', ...overrides } as unknown as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next: NextFunction = vi.fn();
  return { req, res, next };
}

describe('requireHousehold', () => {
  it('calls next() when householdId exists', () => {
    const { req, res, next } = mockReqRes({ householdId: 'hh-123' } as any);
    requireHousehold(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 403 NO_HOUSEHOLD when no householdId', () => {
    const { req, res, next } = mockReqRes();
    requireHousehold(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'NO_HOUSEHOLD' }),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });
});

describe('requirePermission', () => {
  it('passes organizer regardless of permission flags', () => {
    const { req, res, next } = mockReqRes({ memberRole: 'organizer', permissions: { viewOnly: true, canAddTransactions: false, canEditBudgets: false, canManageMembers: false } } as any);
    requirePermission('canAddTransactions')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('passes member with the requested permission', () => {
    const { req, res, next } = mockReqRes({ memberRole: 'member', permissions: { viewOnly: false, canAddTransactions: true, canEditBudgets: false, canManageMembers: false } } as any);
    requirePermission('canAddTransactions')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('blocks member without the requested permission', () => {
    const { req, res, next } = mockReqRes({ memberRole: 'member', permissions: { viewOnly: false, canAddTransactions: false, canEditBudgets: false, canManageMembers: false } } as any);
    requirePermission('canEditBudgets')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'FORBIDDEN', message: 'Missing permission: canEditBudgets' }),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('blocks when permissions are undefined', () => {
    const { req, res, next } = mockReqRes({ memberRole: 'member' } as any);
    requirePermission('canManageMembers')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
