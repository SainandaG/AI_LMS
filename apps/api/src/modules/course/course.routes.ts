import { Router, IRouter } from 'express';
import { UserRole } from '@ai-lms/shared';

import { courseController } from './course.controller';
import { authenticate, requireRole, requireSchool } from '@/shared/middleware/auth.middleware';

export const courseRouter: IRouter = Router();

courseRouter.use(authenticate);
courseRouter.use(requireSchool);

courseRouter.get('/', (req, res) => courseController.getCourses(req, res));
courseRouter.get('/:id', (req, res) => courseController.getCourseById(req, res));

courseRouter.post('/', requireRole(UserRole.SUPER_ADMIN, UserRole.PRINCIPAL, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER), (req, res) =>
  courseController.createCourse(req, res),
);

courseRouter.post('/lessons', requireRole(UserRole.SUPER_ADMIN, UserRole.PRINCIPAL, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER), (req, res) =>
  courseController.createLesson(req, res),
);

courseRouter.post('/assignments', requireRole(UserRole.SUPER_ADMIN, UserRole.PRINCIPAL, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER), (req, res) =>
  courseController.createAssignment(req, res),
);

courseRouter.post('/submissions', requireRole(UserRole.STUDENT), (req, res) =>
  courseController.submitAssignment(req, res),
);

// AI Endpoints
courseRouter.post('/ai/lesson-plan', (req, res) => courseController.generateAiLessonPlan(req, res));
courseRouter.post('/ai/questions', (req, res) => courseController.generateAiAssignmentQuestions(req, res));
