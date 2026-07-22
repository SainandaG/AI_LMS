import { prisma, Teacher, UserRole, AccountStatus, Gender } from '@ai-lms/database';
import { PaginationInput } from '@ai-lms/shared';

export class TeacherRepository {
  async findTeachers(
    schoolId: string | undefined,
    params: PaginationInput,
  ): Promise<{ teachers: any[]; total: number }> {
    const skip = (params.page - 1) * params.limit;

    const where: any = {
      user: {
        ...(schoolId ? { schoolId } : {}),
        deletedAt: null,
        ...(params.search
          ? {
              OR: [
                { firstName: { contains: params.search, mode: 'insensitive' } },
                { lastName: { contains: params.search, mode: 'insensitive' } },
                { email: { contains: params.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
    };

    const [teachers, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        skip,
        take: params.limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
              phone: true,
              gender: true,
              role: true,
              status: true,
              schoolId: true,
              school: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  address: true,
                },
              },
            },
          },
          department: true,
          subjects: {
            include: {
              subject: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.teacher.count({ where }),
    ]);

    return { teachers, total };
  }

  async transferTeacherBranch(teacherId: string, targetSchoolId: string): Promise<any> {
    const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
    if (!teacher) throw new Error('Teacher record not found');

    return prisma.user.update({
      where: { id: teacher.userId },
      data: { schoolId: targetSchoolId },
    });
  }

  async findTeacherById(id: string): Promise<any | null> {
    return prisma.teacher.findUnique({
      where: { id },
      include: {
        user: true,
        department: true,
        subjects: {
          include: { subject: true },
        },
        lessons: true,
        assignments: true,
      },
    });
  }

  async findTeacherByEmployeeId(employeeId: string): Promise<Teacher | null> {
    return prisma.teacher.findUnique({
      where: { employeeId },
    });
  }

  async createTeacherWithUser(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    employeeId: string;
    departmentId?: string;
    qualification?: string;
    experience?: number;
    joinDate: Date;
    gender?: Gender;
    phone?: string;
    schoolId: string;
  }): Promise<Teacher> {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          status: AccountStatus.ACTIVE,
          isEmailVerified: true,
          schoolId: data.schoolId,
          ...(data.gender ? { gender: data.gender } : {}),
          ...(data.phone ? { phone: data.phone } : {}),
        },
      });

      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          employeeId: data.employeeId,
          joinDate: data.joinDate,
          ...(data.departmentId ? { departmentId: data.departmentId } : {}),
          ...(data.qualification ? { qualification: data.qualification } : {}),
          ...(data.experience !== undefined ? { experience: data.experience } : {}),
        },
      });

      return teacher;
    });
  }
}

export const teacherRepository = new TeacherRepository();
