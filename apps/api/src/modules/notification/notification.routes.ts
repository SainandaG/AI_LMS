import { Router, IRouter } from 'express';
import { UserRole } from '@ai-lms/shared';

import { notificationController } from './notification.controller';
import { authenticate, requireRole } from '@/shared/middleware/auth.middleware';

export const notificationRouter: IRouter = Router();

notificationRouter.use(authenticate);

notificationRouter.get('/announcements', (req, res) => notificationController.getAnnouncements(req, res));

notificationRouter.post(
  '/announcements',
  requireRole(UserRole.SUPER_ADMIN, UserRole.PRINCIPAL, UserRole.MANAGEMENT),
  (req, res) => notificationController.createAnnouncement(req, res),
);

notificationRouter.get('/', (req, res) => notificationController.getUserNotifications(req, res));
notificationRouter.patch('/:id/read', (req, res) => notificationController.markAsRead(req, res));
