import bcrypt from 'bcryptjs';
import { Teacher, UserRole, Gender } from '@ai-lms/database';
import { PaginationInput, PaginationMeta } from '@ai-lms/shared';
import { teacherRepository } from './teacher.repository';
import { authRepository } from '@/modules/auth/auth.repository';
import { env } from '@/config/env';
import { ConflictError, NotFoundError } from '@/shared/errors/app-errors';
import { buildPaginationMeta } from '@/shared/utils/response.util';
import { logger } from '@/shared/utils/logger';

export class TeacherService {
  async getTeachers(
    schoolId: string | undefined,
    params: PaginationInput,
  ): Promise<{ teachers: any[]; meta: PaginationMeta }> {
    const { teachers, total } = await teacherRepository.findTeachers(schoolId, params);
    const meta = buildPaginationMeta(total, params.page, params.limit);
    return { teachers, meta };
  }

  async transferTeacherBranch(teacherId: string, targetSchoolId: string): Promise<any> {
    await this.getTeacherById(teacherId);
    return teacherRepository.transferTeacherBranch(teacherId, targetSchoolId);
  }

  async getTeacherById(id: string): Promise<any> {
    const teacher = await teacherRepository.findTeacherById(id);
    if (!teacher) throw new NotFoundError('Faculty member not found');
    return teacher;
  }

  async onboardTeacher(data: {
    email: string;
    firstName: string;
    lastName: string;
    password?: string;
    role?: UserRole;
    employeeId: string;
    departmentId?: string;
    qualification?: string;
    experience?: number;
    joinDate: string;
    gender?: Gender;
    phone?: string;
    schoolId: string;
  }): Promise<Teacher> {
    const existingUser = await authRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('A user with this email address already exists');
    }

    const existingEmp = await teacherRepository.findTeacherByEmployeeId(data.employeeId);
    if (existingEmp) {
      throw new ConflictError(`Employee ID '${data.employeeId}' is already assigned`);
    }

    const defaultPass = data.password ?? 'Teacher@123';
    const passwordHash = await bcrypt.hash(defaultPass, env.BCRYPT_ROUNDS);

    const teacher = await teacherRepository.createTeacherWithUser({
      ...data,
      role: data.role ?? UserRole.SUBJECT_TEACHER,
      passwordHash,
      joinDate: new Date(data.joinDate),
    });

    logger.info({ teacherId: teacher.id, employeeId: teacher.employeeId }, 'Teacher onboarded successfully');
    return teacher;
  }
}

export const teacherService = new TeacherService();
