import { Router, IRouter } from 'express';
import { UserRole } from '@ai-lms/shared';

import { attendanceController } from './attendance.controller';
import { authenticate, requireRole } from '@/shared/middleware/auth.middleware';

export const attendanceRouter: IRouter = Router();

attendanceRouter.use(authenticate);

attendanceRouter.post(
  '/mark',
  requireRole(UserRole.SUPER_ADMIN, UserRole.PRINCIPAL, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER),
  (req, res) => attendanceController.markBulkAttendance(req, res),
);

attendanceRouter.get('/class', (req, res) => attendanceController.getClassAttendance(req, res));
attendanceRouter.get('/student/:studentId', (req, res) => attendanceController.getStudentAttendance(req, res));
