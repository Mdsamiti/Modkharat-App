import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireHousehold, requirePermission } from '../middleware/context.js';
import * as budgetsService from '../services/budgets.js';

const router = Router();

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

router.get('/', requireHousehold, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const budgets = await budgetsService.listBudgets(req.householdId!);
    res.json({ data: budgets });
  } catch (err) { next(err); }
});

router.post(
  '/',
  requireHousehold,
  requirePermission('canEditBudgets'),
  validate(createSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const budget = await budgetsService.createBudget(req.householdId!, req.body);
      res.status(201).json({ data: budget });
    } catch (err) { next(err); }
  },
);

router.get('/:id', requireHousehold, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const budget = await budgetsService.getBudget(req.params.id as string, req.householdId!);
    res.json({ data: budget });
  } catch (err) { next(err); }
});

router.patch(
  '/:id',
  requireHousehold,
  requirePermission('canEditBudgets'),
  validate(updateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const budget = await budgetsService.updateBudget(req.params.id as string, req.householdId!, req.body);
      res.json({ data: budget });
    } catch (err) { next(err); }
  },
);

router.delete('/:id', requireHousehold, requirePermission('canEditBudgets'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await budgetsService.deleteBudget(req.params.id as string, req.householdId!);
    res.status(204).send();
  } catch (err) { next(err); }
});

router.get('/:id/transactions', requireHousehold, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactions = await budgetsService.getBudgetTransactions(req.params.id as string, req.householdId!);
    res.json({ data: transactions });
  } catch (err) { next(err); }
});

router.get('/:id/comparison', requireHousehold, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const comparison = await budgetsService.getBudgetComparison(req.params.id as string, req.householdId!);
    res.json({ data: comparison });
  } catch (err) { next(err); }
});

export default router;
