import { Router, IRouter } from 'express';
import { UserRole } from '@ai-lms/shared';

import { schoolController } from './school.controller';
import { authenticate, requireRole } from '@/shared/middleware/auth.middleware';

export const schoolRouter: IRouter = Router();

// Protect all school routes
schoolRouter.use(authenticate);

// Super Admin / Principal / Management endpoints
schoolRouter.get('/', requireRole(UserRole.SUPER_ADMIN, UserRole.PRINCIPAL, UserRole.MANAGEMENT), (req, res) =>
  schoolController.getAllSchools(req, res),
);

schoolRouter.post('/', requireRole(UserRole.SUPER_ADMIN), (req, res) =>
  schoolController.createSchool(req, res),
);

schoolRouter.get('/:id', (req, res) => schoolController.getSchoolById(req, res));

schoolRouter.patch('/:id', requireRole(UserRole.SUPER_ADMIN, UserRole.PRINCIPAL), (req, res) =>
  schoolController.updateSchool(req, res),
);

schoolRouter.delete('/:id', requireRole(UserRole.SUPER_ADMIN), (req, res) =>
  schoolController.deleteSchool(req, res),
);

// Academic Years
schoolRouter.get('/:schoolId/academic-years', (req, res) =>
  schoolController.getAcademicYears(req, res),
);

schoolRouter.post('/academic-years', requireRole(UserRole.SUPER_ADMIN, UserRole.PRINCIPAL), (req, res) =>
  schoolController.createAcademicYear(req, res),
);

// Departments
schoolRouter.get('/:schoolId/departments', (req, res) =>
  schoolController.getDepartments(req, res),
);

schoolRouter.post('/departments', requireRole(UserRole.SUPER_ADMIN, UserRole.PRINCIPAL), (req, res) =>
  schoolController.createDepartment(req, res),
);

// Classes
schoolRouter.get('/:schoolId/classes', (req, res) =>
  schoolController.getClasses(req, res),
);

schoolRouter.post('/classes', requireRole(UserRole.SUPER_ADMIN, UserRole.PRINCIPAL), (req, res) =>
  schoolController.createClass(req, res),
);
