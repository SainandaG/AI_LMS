import { Request, Response } from 'express';
import { PaginationSchema } from '@ai-lms/shared';
import { Gender } from '@ai-lms/database';
import { z } from 'zod';

import { studentService } from './student.service';
import { sendSuccess, sendCreated } from '@/shared/utils/response.util';

export class StudentController {
  async getStudents(req: Request, res: Response): Promise<void> {
    const params = PaginationSchema.parse(req.query);
    const schoolId = req.user?.schoolId ?? undefined;

    const { students, meta } = await studentService.getStudents(schoolId, params);
    sendSuccess(res, students, 'Students directory retrieved', 200, meta);
  }

  async getStudentById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const student = await studentService.getStudentById(id!);
    sendSuccess(res, student, 'Student profile retrieved');
  }

  async admitStudent(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      email: z.string().email(),
      firstName: z.string().min(2),
      lastName: z.string().min(2),
      password: z.string().min(8).optional(),
      gender: z.nativeEnum(Gender).optional(),
      phone: z.string().optional(),
      rollNumber: z.string().min(2),
      admissionDate: z.string(),
      classId: z.string().uuid().optional(),
      academicYearId: z.string().uuid().optional(),
      bloodGroup: z.string().optional(),
      address: z.string().optional(),
      emergencyPhone: z.string().optional(),
    });

    const body = schema.parse(req.body);
    const schoolId = req.user?.schoolId ?? undefined;

    const student = await studentService.admitStudent({
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      rollNumber: body.rollNumber,
      admissionDate: body.admissionDate,
      ...(schoolId ? { schoolId } : {}),
      ...(body.password ? { password: body.password } : {}),
      ...(body.gender ? { gender: body.gender } : {}),
      ...(body.phone ? { phone: body.phone } : {}),
      ...(body.classId ? { classId: body.classId } : {}),
      ...(body.academicYearId ? { academicYearId: body.academicYearId } : {}),
      ...(body.bloodGroup ? { bloodGroup: body.bloodGroup } : {}),
      ...(body.address ? { address: body.address } : {}),
      ...(body.emergencyPhone ? { emergencyPhone: body.emergencyPhone } : {}),
    });

    sendCreated(res, student, 'Student admitted successfully');
  }

  async approveStudent(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const student = await studentService.approveStudent(id!);
    sendSuccess(res, student, 'Student account approved and activated successfully');
  }
}

export const studentController = new StudentController();
