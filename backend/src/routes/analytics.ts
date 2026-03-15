import { Router, Request, Response, NextFunction } from 'express';
import { requireHousehold } from '../middleware/context.js';
import * as analyticsService from '../services/analytics.js';

const router = Router();

router.get('/overview', requireHousehold, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const overview = await analyticsService.getOverview(req.householdId!, req.userId!);
    res.json({ data: overview });
  } catch (err) { next(err); }
});

router.get('/spending-by-category', requireHousehold, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.getSpendingByCategory(req.householdId!, req.userId!);
    res.json({ data });
  } catch (err) { next(err); }
});

router.get('/income-vs-expenses', requireHousehold, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const months = parseInt(req.query.months as string) || 5;
    const data = await analyticsService.getIncomeVsExpenses(req.householdId!, months);
    res.json({ data });
  } catch (err) { next(err); }
});

export default router;
