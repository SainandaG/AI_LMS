import bcrypt from 'bcryptjs';
import { Student, Gender } from '@ai-lms/database';
import { PaginationInput, PaginationMeta } from '@ai-lms/shared';
import { studentRepository } from './student.repository';
import { authRepository } from '@/modules/auth/auth.repository';
import { env } from '@/config/env';
import { ConflictError, NotFoundError } from '@/shared/errors/app-errors';
import { buildPaginationMeta } from '@/shared/utils/response.util';
import { logger } from '@/shared/utils/logger';

export class StudentService {
  async getStudents(
    schoolId: string | undefined,
    params: PaginationInput,
  ): Promise<{ students: any[]; meta: PaginationMeta }> {
    const { students, total } = await studentRepository.findStudents(schoolId, params);
    const meta = buildPaginationMeta(total, params.page, params.limit);
    return { students, meta };
  }

  async getStudentById(id: string): Promise<any> {
    const student = await studentRepository.findStudentById(id);
    if (!student) throw new NotFoundError('Student profile not found');
    return student;
  }

  async admitStudent(data: {
    email: string;
    firstName: string;
    lastName: string;
    password?: string;
    gender?: Gender;
    phone?: string;
    rollNumber: string;
    admissionDate: string;
    schoolId?: string;
    classId?: string;
    academicYearId?: string;
    bloodGroup?: string;
    address?: string;
    emergencyPhone?: string;
  }): Promise<Student> {
    // Check email uniqueness
    const existingUser = await authRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('A user with this email address already exists');
    }

    // Check roll number uniqueness
    const existingRoll = await studentRepository.findStudentByRollNumber(data.rollNumber);
    if (existingRoll) {
      throw new ConflictError(`Roll number '${data.rollNumber}' is already assigned`);
    }

    const defaultPass = data.password ?? 'Student@123';
    const passwordHash = await bcrypt.hash(defaultPass, env.BCRYPT_ROUNDS);

    const student = await studentRepository.createStudentWithUser({
      ...data,
      passwordHash,
      admissionDate: new Date(data.admissionDate),
    });

    logger.info({ studentId: student.id, rollNumber: student.rollNumber }, 'Student admitted successfully');
    return student;
  }

  async approveStudent(id: string): Promise<any> {
    const student = await studentRepository.findStudentById(id);
    if (!student) throw new NotFoundError('Student profile not found');

    const updated = await studentRepository.approveStudentUser(id);
    logger.info({ studentId: id }, 'Student account approved and activated');
    return updated;
  }
}

export const studentService = new StudentService();
