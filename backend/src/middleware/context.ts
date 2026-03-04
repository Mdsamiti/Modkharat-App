import { Request, Response, NextFunction } from 'express';
import { query } from '../lib/db.js';

/**
 * Resolves the active household, role, and permissions for the authenticated user.
 * Expects req.userId to be set by auth middleware.
 * Uses the `x-household-id` header to select which household, or defaults to the first one.
 */
export async function contextMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.userId) {
    next();
    return;
  }

  const requestedHouseholdId = req.headers['x-household-id'] as string | undefined;

  let result;
  if (requestedHouseholdId) {
    result = await query(
      `SELECT hm.household_id, hm.role, hm.view_only, hm.can_add_transactions, hm.can_edit_budgets, hm.can_manage_members
       FROM household_members hm
       WHERE hm.user_id = $1 AND hm.household_id = $2
       LIMIT 1`,
      [req.userId, requestedHouseholdId],
    );
  } else {
    result = await query(
      `SELECT hm.household_id, hm.role, hm.view_only, hm.can_add_transactions, hm.can_edit_budgets, hm.can_manage_members
       FROM household_members hm
       WHERE hm.user_id = $1
       ORDER BY hm.joined_at ASC
       LIMIT 1`,
      [req.userId],
    );
  }

  if (result.rows.length > 0) {
    const row = result.rows[0];
    req.householdId = row.household_id;
    req.memberRole = row.role;
    req.permissions = {
      viewOnly: row.view_only,
      canAddTransactions: row.can_add_transactions,
      canEditBudgets: row.can_edit_budgets,
      canManageMembers: row.can_manage_members,
    };
  }

  next();
}

/**
 * Guard that requires an active household to be resolved.
 */
export function requireHousehold(req: Request, res: Response, next: NextFunction) {
  if (!req.householdId) {
    res.status(403).json({
      error: { code: 'NO_HOUSEHOLD', message: 'No household found. Create or join one first.', traceId: req.traceId ?? '' },
    });
    return;
  }
  next();
}

/**
 * Guard factory for permission checks.
 */
export function requirePermission(permission: 'canAddTransactions' | 'canEditBudgets' | 'canManageMembers') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.memberRole === 'organizer') {
      next();
      return;
    }
    if (!req.permissions || !req.permissions[permission]) {
      res.status(403).json({
        error: { code: 'FORBIDDEN', message: `Missing permission: ${permission}`, traceId: req.traceId ?? '' },
      });
      return;
    }
    next();
  };
}
