import { Router, IRouter } from 'express';
import { UserRole } from '@ai-lms/shared';

import { teacherController } from './teacher.controller';
import { authenticate, requireRole, requireSchool } from '@/shared/middleware/auth.middleware';

export const teacherRouter: IRouter = Router();

teacherRouter.use(authenticate);
teacherRouter.use(requireSchool);

teacherRouter.get('/', (req, res) => teacherController.getTeachers(req, res));
teacherRouter.get('/:id', (req, res) => teacherController.getTeacherById(req, res));

teacherRouter.post('/', requireRole(UserRole.SUPER_ADMIN, UserRole.PRINCIPAL, UserRole.MANAGEMENT), (req, res) =>
  teacherController.onboardTeacher(req, res),
);
