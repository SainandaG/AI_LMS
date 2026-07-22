import { prisma, School, AcademicYear, Department, Class } from '@ai-lms/database';
import { CreateSchoolInput, UpdateSchoolInput } from '@ai-lms/shared';

export class SchoolRepository {
  // ─── School CRUD ──────────────────────────────────────────────────────────

  async findAllSchools(): Promise<School[]> {
    return prisma.school.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findSchoolById(id: string): Promise<School | null> {
    return prisma.school.findFirst({
      where: { id, deletedAt: null },
      include: {
        academicYears: { orderBy: { startDate: 'desc' } },
        departments: true,
        classes: { orderBy: [{ grade: 'asc' }, { section: 'asc' }] },
      },
    });
  }

  async findSchoolByCode(code: string): Promise<School | null> {
    return prisma.school.findFirst({
      where: { code, deletedAt: null },
    });
  }

  async createSchool(data: CreateSchoolInput): Promise<School> {
    return prisma.school.create({
      data: {
        name: data.name,
        code: data.code,
        address: data.address,
        phone: data.phone,
        email: data.email,
        ...(data.website ? { website: data.website } : {}),
      },
    });
  }

  async updateSchool(id: string, data: UpdateSchoolInput): Promise<School> {
    return prisma.school.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.code ? { code: data.code } : {}),
        ...(data.address ? { address: data.address } : {}),
        ...(data.phone ? { phone: data.phone } : {}),
        ...(data.email ? { email: data.email } : {}),
        ...(data.website !== undefined ? { website: data.website } : {}),
      },
    });
  }

  async softDeleteSchool(id: string): Promise<School> {
    return prisma.school.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  // ─── Academic Years ───────────────────────────────────────────────────────

  async createAcademicYear(data: {
    schoolId: string;
    name: string;
    startDate: Date;
    endDate: Date;
    isCurrent?: boolean;
  }): Promise<AcademicYear> {
    if (data.isCurrent) {
      // Unset previous current year
      await prisma.academicYear.updateMany({
        where: { schoolId: data.schoolId, isCurrent: true },
        data: { isCurrent: false },
      });
    }

    return prisma.academicYear.create({
      data: {
        schoolId: data.schoolId,
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        isCurrent: data.isCurrent ?? false,
      },
    });
  }

  async getAcademicYearsBySchool(schoolId: string): Promise<AcademicYear[]> {
    return prisma.academicYear.findMany({
      where: { schoolId },
      include: { terms: true },
      orderBy: { startDate: 'desc' },
    });
  }

  // ─── Departments ──────────────────────────────────────────────────────────

  async createDepartment(data: { schoolId: string; name: string; code: string }): Promise<Department> {
    return prisma.department.create({
      data: {
        schoolId: data.schoolId,
        name: data.name,
        code: data.code,
      },
    });
  }

  async getDepartmentsBySchool(schoolId: string): Promise<Department[]> {
    return prisma.department.findMany({
      where: { schoolId },
      include: { teachers: true, subjects: true },
    });
  }

  // ─── Classes & Sections ───────────────────────────────────────────────────

  async createClass(data: {
    schoolId: string;
    name: string;
    grade: number;
    section: string;
    capacity?: number;
    roomNumber?: string;
  }): Promise<Class> {
    return prisma.class.create({
      data: {
        schoolId: data.schoolId,
        name: data.name,
        grade: data.grade,
        section: data.section,
        capacity: data.capacity ?? 40,
        ...(data.roomNumber ? { roomNumber: data.roomNumber } : {}),
      },
    });
  }

  async getClassesBySchool(schoolId: string): Promise<Class[]> {
    return prisma.class.findMany({
      where: { schoolId },
      orderBy: [{ grade: 'asc' }, { section: 'asc' }],
    });
  }
}

export const schoolRepository = new SchoolRepository();
