import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireHousehold } from '../middleware/context.js';
import * as goalsService from '../services/goals.js';

const router = Router();

const createSchema = z.object({
  name: z.string().min(1).max(100),
  target: z.number().positive(),
  targetDate: z.string().optional(),
  monthlyContribution: z.number().min(0).default(0),
  icon: z.string().max(10).default('🎯'),
  accountId: z.string().uuid().optional(),
}).strict();

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  target: z.number().positive().optional(),
  saved: z.number().min(0).optional(),
  targetDate: z.string().nullable().optional(),
  monthlyContribution: z.number().min(0).optional(),
  icon: z.string().max(10).optional(),
  accountId: z.string().uuid().nullable().optional(),
}).strict();

const contributionSchema = z.object({
  amount: z.number().positive(),
}).strict();

router.get('/', requireHousehold, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const goals = await goalsService.listGoals(req.householdId!);
    res.json({ data: goals });
  } catch (err) { next(err); }
});

router.post('/', requireHousehold, validate(createSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const goal = await goalsService.createGoal(req.householdId!, req.body);
    res.status(201).json({ data: goal });
  } catch (err) { next(err); }
});

router.get('/:id', requireHousehold, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const goal = await goalsService.getGoal(req.params.id as string, req.householdId!);
    res.json({ data: goal });
  } catch (err) { next(err); }
});

router.patch('/:id', requireHousehold, validate(updateSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const goal = await goalsService.updateGoal(req.params.id as string, req.householdId!, req.body);
    res.json({ data: goal });
  } catch (err) { next(err); }
});

router.delete('/:id', requireHousehold, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await goalsService.deleteGoal(req.params.id as string, req.householdId!);
    res.status(204).send();
  } catch (err) { next(err); }
});

router.post('/:id/contributions', requireHousehold, validate(contributionSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const goal = await goalsService.addContribution(req.params.id as string, req.householdId!, req.body.amount);
    res.status(201).json({ data: goal });
  } catch (err) { next(err); }
});

router.get('/:id/contributions', requireHousehold, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contributions = await goalsService.getContributions(req.params.id as string, req.householdId!);
    res.json({ data: contributions });
  } catch (err) { next(err); }
});

router.get('/:id/projection', requireHousehold, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projection = await goalsService.getProjection(req.params.id as string, req.householdId!);
    res.json({ data: projection });
  } catch (err) { next(err); }
});

export default router;
