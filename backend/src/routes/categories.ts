import { Router, Request, Response, NextFunction } from 'express';
import { requireHousehold } from '../middleware/context.js';
import { findCategories, findAccountsByHousehold } from '../repositories/categories.js';
import type { CategoryDTO, AccountDTO } from '../types/api.js';

const router = Router();

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
    }));
    res.json({ data });
  } catch (err) { next(err); }
});

export default router;
