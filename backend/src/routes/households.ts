import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireHousehold, requirePermission } from '../middleware/context.js';
import * as householdsService from '../services/households.js';

const router = Router();

const createHouseholdSchema = z.object({ name: z.string().min(1).max(100) }).strict();

const updatePermissionsSchema = z.object({
  viewOnly: z.boolean().optional(),
  canAddTransactions: z.boolean().optional(),
  canEditBudgets: z.boolean().optional(),
  canManageMembers: z.boolean().optional(),
}).strict();

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['organizer', 'member']).default('member'),
}).strict();

router.post('/', validate(createHouseholdSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const household = await householdsService.createHousehold(req.body.name, req.userId!);
    res.status(201).json({ data: household });
  } catch (err) { next(err); }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const households = await householdsService.getHouseholds(req.userId!);
    res.json({ data: households });
  } catch (err) { next(err); }
});

router.get('/:id/members', requireHousehold, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const members = await householdsService.getMembers(req.params.id as string);
    res.json({ data: members });
  } catch (err) { next(err); }
});

router.patch(
  '/:id/members/:memberId',
  requireHousehold,
  requirePermission('canManageMembers'),
  validate(updatePermissionsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await householdsService.updateMemberPermissions(req.params.id as string, req.params.memberId as string, req.body);
      res.json({ data: { success: true } });
    } catch (err) { next(err); }
  },
);

router.delete(
  '/:id/members/:memberId',
  requireHousehold,
  requirePermission('canManageMembers'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await householdsService.removeMember(req.params.id as string, req.params.memberId as string);
      res.status(204).send();
    } catch (err) { next(err); }
  },
);

router.post(
  '/:id/invites',
  requireHousehold,
  requirePermission('canManageMembers'),
  validate(inviteSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invite = await householdsService.createInvite(req.params.id as string, req.userId!, req.body.email, req.body.role);
      res.status(201).json({ data: invite });
    } catch (err) { next(err); }
  },
);

export default router;
