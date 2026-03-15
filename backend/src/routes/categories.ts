import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { requireHousehold } from '../middleware/context.js';
import { validate } from '../middleware/validate.js';
import { findCategories, findAccountsByHousehold, createAccount, updateAccount, deleteAccount } from '../repositories/categories.js';
import type { CategoryDTO, AccountDTO } from '../types/api.js';

const router = Router();

const createAccountSchema = z.object({
  nameEn: z.string().min(1).max(100),
  nameAr: z.string().min(1).max(100),
  balance: z.number().min(0).default(0),
}).strict();

const updateAccountSchema = z.object({
  nameEn: z.string().min(1).max(100),
  nameAr: z.string().min(1).max(100),
  balance: z.number().min(0).optional(),
}).strict();

router.get('/categories', requireHousehold, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await findCategories(req.householdId);
    const data: CategoryDTO[] = rows.map((r) => ({
      id: r.id,
      nameEn: r.name_en,
      nameAr: r.name_ar,
      icon: r.icon,
      color: r.color,
      isSystem: r.is_system,
    }));
    res.json({ data });
  } catch (err) { next(err); }
});

router.get('/accounts', requireHousehold, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await findAccountsByHousehold(req.householdId!);
    const data: AccountDTO[] = rows.map((r) => ({
      id: r.id,
      nameEn: r.name_en,
      nameAr: r.name_ar,
      balance: parseFloat(r.balance),
    }));
    res.json({ data });
  } catch (err) { next(err); }
});

router.post('/accounts', requireHousehold, validate(createAccountSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const row = await createAccount(req.householdId!, req.body.nameEn, req.body.nameAr, req.body.balance);
    res.status(201).json({ data: { id: row.id, nameEn: row.name_en, nameAr: row.name_ar, balance: parseFloat(row.balance) } });
  } catch (err) { next(err); }
});

router.patch('/accounts/:id', requireHousehold, validate(updateAccountSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const row = await updateAccount(req.params.id as string, req.householdId!, req.body.nameEn, req.body.nameAr, req.body.balance);
    if (!row) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Account not found' } });
      return;
    }
    res.json({ data: { id: row.id, nameEn: row.name_en, nameAr: row.name_ar, balance: parseFloat(row.balance) } });
  } catch (err) { next(err); }
});

router.delete('/accounts/:id', requireHousehold, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await deleteAccount(req.params.id as string, req.householdId!);
    if (!deleted) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Account not found' } });
      return;
    }
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
