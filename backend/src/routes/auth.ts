import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import * as profilesService from '../services/profiles.js';

const router = Router();

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  avatarEmoji: z.string().max(10).optional(),
  language: z.enum(['en', 'ar']).optional(),
  timezone: z.string().max(50).optional(),
  firstDayOfMonth: z.number().int().min(1).max(28).optional(),
}).strict();

router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await profilesService.getProfile(req.userId!);
    res.json({ data: profile });
  } catch (err) { next(err); }
});

router.patch('/me', validate(updateProfileSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await profilesService.updateProfile(req.userId!, req.body);
    res.json({ data: profile });
  } catch (err) { next(err); }
});

export default router;
