import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireHousehold, requirePermission } from '../middleware/context.js';
import * as txService from '../services/transactions.js';

const router = Router();

const createSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive(),
  merchant: z.string().min(1).max(200),
  categoryId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),
  method: z.enum(['manual', 'sms', 'voice', 'scan']).default('manual'),
  notes: z.string().max(500).optional(),
  hasReceipt: z.boolean().default(false),
  occurredAt: z.string().datetime().optional(),
}).strict();

const updateSchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
  amount: z.number().positive().optional(),
  merchant: z.string().min(1).max(200).optional(),
  categoryId: z.string().uuid().nullable().optional(),
  accountId: z.string().uuid().nullable().optional(),
  method: z.enum(['manual', 'sms', 'voice', 'scan']).optional(),
  notes: z.string().max(500).nullable().optional(),
  hasReceipt: z.boolean().optional(),
  occurredAt: z.string().datetime().optional(),
  status: z.enum(['draft', 'confirmed', 'rejected']).optional(),
}).strict();

const listQuerySchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
  categoryId: z.string().uuid().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

router.get('/', requireHousehold, validate(listQuerySchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transactions, meta } = await txService.listTransactions({
      householdId: req.householdId!,
      ...req.query as any,
    });
    res.json({ data: transactions, meta });
  } catch (err) { next(err); }
});

router.post(
  '/',
  requireHousehold,
  requirePermission('canAddTransactions'),
  validate(createSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tx = await txService.createTransaction(req.householdId!, req.userId!, req.body);
      res.status(201).json({ data: tx });
    } catch (err) { next(err); }
  },
);

router.get('/:id', requireHousehold, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tx = await txService.getTransaction(req.params.id as string, req.householdId!);
    res.json({ data: tx });
  } catch (err) { next(err); }
});

router.patch(
  '/:id',
  requireHousehold,
  requirePermission('canAddTransactions'),
  validate(updateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tx = await txService.updateTransaction(req.params.id as string, req.householdId!, req.body);
      res.json({ data: tx });
    } catch (err) { next(err); }
  },
);

router.delete('/:id', requireHousehold, requirePermission('canAddTransactions'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await txService.deleteTransaction(req.params.id as string, req.householdId!);
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
