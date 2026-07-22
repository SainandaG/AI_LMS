import { Request, Response } from 'express';
import { PaginationSchema } from '@ai-lms/shared';
import { UserRole, Gender } from '@ai-lms/database';
import { z } from 'zod';

import { teacherService } from './teacher.service';
import { sendSuccess, sendCreated } from '@/shared/utils/response.util';

export class TeacherController {
  async getTeachers(req: Request, res: Response): Promise<void> {
    const params = PaginationSchema.parse(req.query);
    const schoolId = req.user!.schoolId!;

    const { teachers, meta } = await teacherService.getTeachers(schoolId, params);
    sendSuccess(res, teachers, 'Faculty directory retrieved', 200, meta);
  }

  async getTeacherById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const teacher = await teacherService.getTeacherById(id!);
    sendSuccess(res, teacher, 'Faculty details retrieved');
  }

  async onboardTeacher(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      email: z.string().email(),
      firstName: z.string().min(2),
      lastName: z.string().min(2),
      password: z.string().min(8).optional(),
      role: z.enum([UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER]).optional(),
      employeeId: z.string().min(2),
      departmentId: z.string().uuid().optional(),
      qualification: z.string().optional(),
      experience: z.number().int().min(0).optional(),
      joinDate: z.string(),
      gender: z.nativeEnum(Gender).optional(),
      phone: z.string().optional(),
    });

    const body = schema.parse(req.body);
    const schoolId = req.user!.schoolId!;

    const teacher = await teacherService.onboardTeacher({
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      employeeId: body.employeeId,
      joinDate: body.joinDate,
      schoolId,
      ...(body.password ? { password: body.password } : {}),
      ...(body.role ? { role: body.role } : {}),
      ...(body.departmentId ? { departmentId: body.departmentId } : {}),
      ...(body.qualification ? { qualification: body.qualification } : {}),
      ...(body.experience !== undefined ? { experience: body.experience } : {}),
      ...(body.gender ? { gender: body.gender } : {}),
      ...(body.phone ? { phone: body.phone } : {}),
    });

    sendCreated(res, teacher, 'Faculty member onboarded successfully');
  }
}

export const teacherController = new TeacherController();
