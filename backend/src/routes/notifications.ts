import { Router, Request, Response, NextFunction } from 'express';
import * as notifService from '../services/notifications.js';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notifications = await notifService.listNotifications(req.userId!);
    res.json({ data: notifications });
  } catch (err) { next(err); }
});

router.patch('/:id/read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notifService.markRead(req.params.id as string, req.userId!);
    res.json({ data: { success: true } });
  } catch (err) { next(err); }
});

router.patch('/read-all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notifService.markAllRead(req.userId!);
    res.json({ data: { success: true } });
  } catch (err) { next(err); }
});

export default router;
