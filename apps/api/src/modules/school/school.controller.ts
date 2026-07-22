import { Request, Response } from 'express';
import { CreateSchoolSchema, UpdateSchoolSchema } from '@ai-lms/shared';
import { z } from 'zod';

import { schoolService } from './school.service';
import { sendSuccess, sendCreated } from '@/shared/utils/response.util';

export class SchoolController {
  async getAllSchools(_req: Request, res: Response): Promise<void> {
    const schools = await schoolService.getAllSchools();
    sendSuccess(res, schools, 'Schools retrieved successfully');
  }

  async getSchoolById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const school = await schoolService.getSchoolById(id!);
    sendSuccess(res, school, 'School details retrieved');
  }

  async createSchool(req: Request, res: Response): Promise<void> {
    const input = CreateSchoolSchema.parse(req.body);
    const school = await schoolService.createSchool(input);
    sendCreated(res, school, 'School registered successfully');
  }

  async updateSchool(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const input = UpdateSchoolSchema.parse(req.body);
    const school = await schoolService.updateSchool(id!, input);
    sendSuccess(res, school, 'School details updated');
  }

  async deleteSchool(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await schoolService.deleteSchool(id!);
    sendSuccess(res, null, 'School deactivated successfully');
  }

  // Academic Year
  async createAcademicYear(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      schoolId: z.string().uuid(),
      name: z.string().min(2),
      startDate: z.string(),
      endDate: z.string(),
      isCurrent: z.boolean().optional(),
    });
    const input = schema.parse(req.body);
    const ay = await schoolService.createAcademicYear({
      schoolId: input.schoolId,
      name: input.name,
      startDate: input.startDate,
      endDate: input.endDate,
      ...(input.isCurrent !== undefined ? { isCurrent: input.isCurrent } : {}),
    });
    sendCreated(res, ay, 'Academic year created');
  }

  async getAcademicYears(req: Request, res: Response): Promise<void> {
    const { schoolId } = req.params;
    const ays = await schoolService.getAcademicYears(schoolId!);
    sendSuccess(res, ays, 'Academic years retrieved');
  }

  // Department
  async createDepartment(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      schoolId: z.string().uuid(),
      name: z.string().min(2),
      code: z.string().min(2),
    });
    const input = schema.parse(req.body);
    const dept = await schoolService.createDepartment({
      schoolId: input.schoolId,
      name: input.name,
      code: input.code,
    });
    sendCreated(res, dept, 'Department created');
  }

  async getDepartments(req: Request, res: Response): Promise<void> {
    const { schoolId } = req.params;
    const depts = await schoolService.getDepartments(schoolId!);
    sendSuccess(res, depts, 'Departments retrieved');
  }

  // Class
  async createClass(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      schoolId: z.string().uuid(),
      name: z.string().min(2),
      grade: z.number().int().min(1).max(12),
      section: z.string().min(1),
      capacity: z.number().optional(),
      roomNumber: z.string().optional(),
    });
    const input = schema.parse(req.body);
    const cls = await schoolService.createClass({
      schoolId: input.schoolId,
      name: input.name,
      grade: input.grade,
      section: input.section,
      ...(input.capacity !== undefined ? { capacity: input.capacity } : {}),
      ...(input.roomNumber !== undefined ? { roomNumber: input.roomNumber } : {}),
    });
    sendCreated(res, cls, 'Class created');
  }

  async getClasses(req: Request, res: Response): Promise<void> {
    const { schoolId } = req.params;
    const classes = await schoolService.getClasses(schoolId!);
    sendSuccess(res, classes, 'Classes retrieved');
  }
}

export const schoolController = new SchoolController();
