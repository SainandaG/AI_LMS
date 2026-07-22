import { Router, IRouter } from 'express';
import { UserRole } from '@ai-lms/shared';

import { accountsController } from './accounts.controller';
import { authenticate, requireRole } from '@/shared/middleware/auth.middleware';

export const accountsRouter: IRouter = Router();

accountsRouter.use(authenticate);

accountsRouter.get('/fee-structures', (req, res) => accountsController.getFeeStructures(req, res));
accountsRouter.post(
  '/fee-structures',
  requireRole(UserRole.SUPER_ADMIN, UserRole.PRINCIPAL, UserRole.ACCOUNTS),
  (req, res) => accountsController.createFeeStructure(req, res),
);

accountsRouter.get('/invoices', (req, res) => accountsController.getInvoices(req, res));
accountsRouter.post(
  '/invoices',
  requireRole(UserRole.SUPER_ADMIN, UserRole.PRINCIPAL, UserRole.ACCOUNTS),
  (req, res) => accountsController.createInvoice(req, res),
);

accountsRouter.post('/payments', requireRole(UserRole.SUPER_ADMIN, UserRole.ACCOUNTS, UserRole.STUDENT, UserRole.PARENT), (req, res) =>
  accountsController.recordPayment(req, res),
);

accountsRouter.post('/ai/reminder', (req, res) => accountsController.generateAiFeeReminder(req, res));
