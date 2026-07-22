import { Router, IRouter } from 'express';
import { UserRole } from '@ai-lms/shared';

import { examController } from './exam.controller';
import { authenticate, requireRole } from '@/shared/middleware/auth.middleware';

export const examRouter: IRouter = Router();

examRouter.use(authenticate);

examRouter.get('/', (req, res) => examController.getExams(req, res));
examRouter.get('/:id', (req, res) => examController.getExamById(req, res));

examRouter.post(
  '/',
  requireRole(UserRole.SUPER_ADMIN, UserRole.PRINCIPAL, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER),
  (req, res) => examController.createExam(req, res),
);

examRouter.post(
  '/results',
  requireRole(UserRole.SUPER_ADMIN, UserRole.PRINCIPAL, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER),
  (req, res) => examController.recordResult(req, res),
);

examRouter.post('/explain-answer', (req, res) => examController.explainAnswerWithAi(req, res));
