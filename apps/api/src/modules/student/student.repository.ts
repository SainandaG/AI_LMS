import { prisma, Student, UserRole, AccountStatus, Gender } from '@ai-lms/database';
import { PaginationInput } from '@ai-lms/shared';

export class StudentRepository {
  async findStudents(
    schoolId: string,
    params: PaginationInput,
  ): Promise<{ students: any[]; total: number }> {
    const skip = (params.page - 1) * params.limit;

    const where: any = {
      user: {
        schoolId,
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

    const [students, total] = await Promise.all([
      prisma.student.findMany({
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
              status: true,
            },
          },
          enrollments: {
            where: { isActive: true },
            include: {
              class: true,
              academicYear: true,
            },
          },
          parents: {
            include: {
              parent: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                      email: true,
                      phone: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.student.count({ where }),
    ]);

    return { students, total };
  }

  async findStudentById(id: string): Promise<any | null> {
    return prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
        enrollments: {
          include: {
            class: true,
            academicYear: true,
          },
        },
        parents: {
          include: {
            parent: {
              include: { user: true },
            },
          },
        },
        attendances: { take: 30, orderBy: { date: 'desc' } },
        results: { include: { exam: true } },
      },
    });
  }

  async findStudentByRollNumber(rollNumber: string): Promise<Student | null> {
    return prisma.student.findUnique({
      where: { rollNumber },
    });
  }

  async createStudentWithUser(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    gender?: Gender;
    phone?: string;
    rollNumber: string;
    admissionDate: Date;
    schoolId: string;
    classId?: string;
    academicYearId?: string;
    bloodGroup?: string;
    address?: string;
    emergencyPhone?: string;
  }): Promise<Student> {
    return prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          role: UserRole.STUDENT,
          status: AccountStatus.ACTIVE,
          isEmailVerified: true,
          schoolId: data.schoolId,
          ...(data.gender ? { gender: data.gender } : {}),
          ...(data.phone ? { phone: data.phone } : {}),
        },
      });

      // 2. Create Student profile
      const student = await tx.student.create({
        data: {
          userId: user.id,
          rollNumber: data.rollNumber,
          admissionDate: data.admissionDate,
          ...(data.bloodGroup ? { bloodGroup: data.bloodGroup } : {}),
          ...(data.address ? { address: data.address } : {}),
          ...(data.emergencyPhone ? { emergencyPhone: data.emergencyPhone } : {}),
        },
      });

      // 3. Optional Class Enrollment
      if (data.classId && data.academicYearId) {
        await tx.enrollment.create({
          data: {
            studentId: student.id,
            classId: data.classId,
            academicYearId: data.academicYearId,
            isActive: true,
          },
        });
      }

      return student;
    });
  }

  async approveStudentUser(studentId: string): Promise<any> {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    });
    if (!student) return null;

    await prisma.user.update({
      where: { id: student.userId },
      data: {
        status: AccountStatus.ACTIVE,
        isEmailVerified: true,
      },
    });

    return prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    });
  }
}

export const studentRepository = new StudentRepository();
