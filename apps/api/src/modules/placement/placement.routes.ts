import { Router, IRouter } from 'express';
import { UserRole } from '@ai-lms/shared';

import { placementController } from './placement.controller';
import { authenticate, requireRole } from '@/shared/middleware/auth.middleware';

export const placementRouter: IRouter = Router();

placementRouter.use(authenticate);

placementRouter.get('/companies', (req, res) => placementController.getCompanies(req, res));

placementRouter.post(
  '/companies',
  requireRole(UserRole.SUPER_ADMIN, UserRole.PRINCIPAL, UserRole.PLACEMENT_OFFICER),
  (req, res) => placementController.createCompany(req, res),
);

placementRouter.post('/apply', requireRole(UserRole.STUDENT), (req, res) =>
  placementController.applyToCompany(req, res),
);

placementRouter.post('/ai/analyze-resume', (req, res) =>
  placementController.analyzeResumeWithAi(req, res),
);
