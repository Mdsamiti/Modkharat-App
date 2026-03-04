import { Router, Request, Response, NextFunction } from 'express';
import { query } from '../lib/db.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { logAction } from '../repositories/audit.js';
import { AppError } from '../middleware/error-handler.js';

const router = Router();

/**
 * POST /v1/settings/export
 * Triggers a data export for the current user's household.
 * Returns a JSON dump of all transactions, budgets, goals.
 */
router.post('/export', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.householdId) throw new AppError(403, 'NO_HOUSEHOLD', 'No household found');

    const [transactions, budgets, goals] = await Promise.all([
      query(
        `SELECT id, type, amount, merchant, occurred_at, method, status
         FROM transactions WHERE household_id = $1 AND deleted_at IS NULL
         ORDER BY occurred_at DESC`,
        [req.householdId],
      ),
      query(
        'SELECT id, name, limit_amount, period FROM budgets WHERE household_id = $1',
        [req.householdId],
      ),
      query(
        'SELECT id, name, target, saved, target_date, monthly_contribution FROM goals WHERE household_id = $1',
        [req.householdId],
      ),
    ]);

    await logAction({
      userId: req.userId!,
      householdId: req.householdId,
      action: 'data.export',
      metadata: {
        transactionCount: transactions.rowCount,
        budgetCount: budgets.rowCount,
        goalCount: goals.rowCount,
      },
      ipAddress: req.ip,
    });

    res.json({
      data: {
        exportedAt: new Date().toISOString(),
        transactions: transactions.rows,
        budgets: budgets.rows,
        goals: goals.rows,
      },
    });
  } catch (err) { next(err); }
});

/**
 * DELETE /v1/settings/account
 * Soft-deletes the user's account. Removes them from all households.
 * The actual auth.users record is deleted via Supabase admin API.
 */
router.delete('/account', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;

    await logAction({
      userId,
      householdId: req.householdId ?? undefined,
      action: 'account.delete',
      targetType: 'user',
      targetId: userId,
      ipAddress: req.ip,
    });

    // Remove from all households
    await query('DELETE FROM household_members WHERE user_id = $1', [userId]);

    // Soft-delete all transactions created by this user
    await query(
      'UPDATE transactions SET deleted_at = now() WHERE created_by = $1 AND deleted_at IS NULL',
      [userId],
    );

    // Delete notifications
    await query('DELETE FROM notifications WHERE user_id = $1', [userId]);

    // Delete profile
    await query('DELETE FROM profiles WHERE id = $1', [userId]);

    // Delete the auth user via Supabase admin
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw new AppError(500, 'DELETE_FAILED', 'Failed to delete auth account');

    res.json({ data: { success: true, message: 'Account deleted' } });
  } catch (err) { next(err); }
});

export default router;
