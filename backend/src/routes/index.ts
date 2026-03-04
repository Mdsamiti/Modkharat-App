import { Router } from 'express';
import authRoutes from './auth.js';
import householdsRoutes from './households.js';
import transactionsRoutes from './transactions.js';
import budgetsRoutes from './budgets.js';
import goalsRoutes from './goals.js';
import notificationsRoutes from './notifications.js';
import analyticsRoutes from './analytics.js';
import categoriesRoutes from './categories.js';
import settingsRoutes from './settings.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/households', householdsRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/budgets', budgetsRoutes);
router.use('/goals', goalsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/settings', settingsRoutes);
router.use('/', categoriesRoutes);

export default router;
