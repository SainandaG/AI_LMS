import { Router, IRouter } from 'express';
import { UserRole } from '@ai-lms/shared';

import { studentController } from './student.controller';
import { authenticate, requireRole, requireSchool } from '@/shared/middleware/auth.middleware';

export const studentRouter: IRouter = Router();

studentRouter.use(authenticate);
studentRouter.use(requireSchool);

studentRouter.get('/', requireRole(UserRole.SUPER_ADMIN, UserRole.PRINCIPAL, UserRole.MANAGEMENT, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER), (req, res) =>
  studentController.getStudents(req, res),
);

studentRouter.get('/:id', (req, res) => studentController.getStudentById(req, res));

studentRouter.post('/', requireRole(UserRole.SUPER_ADMIN, UserRole.PRINCIPAL, UserRole.MANAGEMENT), (req, res) =>
  studentController.admitStudent(req, res),
);

studentRouter.patch(
  '/:id/approve',
  requireRole(UserRole.SUPER_ADMIN, UserRole.PRINCIPAL, UserRole.MANAGEMENT, UserRole.CLASS_TEACHER),
  (req, res) => studentController.approveStudent(req, res),
);
