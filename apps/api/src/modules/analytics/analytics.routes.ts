import { Router, IRouter } from 'express';
import { analyticsController } from './analytics.controller';
import { authenticate } from '@/shared/middleware/auth.middleware';

export const analyticsRouter: IRouter = Router();

analyticsRouter.use(authenticate);

analyticsRouter.get('/dashboard', (req, res) => analyticsController.getDashboardAnalytics(req, res));
