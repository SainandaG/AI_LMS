import { School, AcademicYear, Department, Class } from '@ai-lms/database';
import { CreateSchoolInput, UpdateSchoolInput } from '@ai-lms/shared';
import { schoolRepository } from './school.repository';
import { ConflictError, NotFoundError } from '@/shared/errors/app-errors';
import { logger } from '@/shared/utils/logger';

export class SchoolService {
  async getAllSchools(): Promise<School[]> {
    return schoolRepository.findAllSchools();
  }

  async getSchoolById(id: string): Promise<School> {
    const school = await schoolRepository.findSchoolById(id);
    if (!school) throw new NotFoundError('School not found');
    return school;
  }

  async createSchool(input: CreateSchoolInput): Promise<School> {
    const existing = await schoolRepository.findSchoolByCode(input.code);
    if (existing) {
      throw new ConflictError(`School with code '${input.code}' already exists`);
    }

    const school = await schoolRepository.createSchool(input);
    logger.info({ schoolId: school.id, code: school.code }, 'New school registered');
    return school;
  }

  async updateSchool(id: string, input: UpdateSchoolInput): Promise<School> {
    await this.getSchoolById(id); // Ensure exists
    return schoolRepository.updateSchool(id, input);
  }

  async deleteSchool(id: string): Promise<School> {
    await this.getSchoolById(id); // Ensure exists
    return schoolRepository.softDeleteSchool(id);
  }

  // Academic Year
  async createAcademicYear(data: {
    schoolId: string;
    name: string;
    startDate: string;
    endDate: string;
    isCurrent?: boolean;
  }): Promise<AcademicYear> {
    await this.getSchoolById(data.schoolId);
    return schoolRepository.createAcademicYear({
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    });
  }

  async getAcademicYears(schoolId: string): Promise<AcademicYear[]> {
    return schoolRepository.getAcademicYearsBySchool(schoolId);
  }

  // Department
  async createDepartment(data: { schoolId: string; name: string; code: string }): Promise<Department> {
    await this.getSchoolById(data.schoolId);
    return schoolRepository.createDepartment(data);
  }

  async getDepartments(schoolId: string): Promise<Department[]> {
    return schoolRepository.getDepartmentsBySchool(schoolId);
  }

  // Class
  async createClass(data: {
    schoolId: string;
    name: string;
    grade: number;
    section: string;
    capacity?: number;
    roomNumber?: string;
  }): Promise<Class> {
    await this.getSchoolById(data.schoolId);
    return schoolRepository.createClass(data);
  }

  async getClasses(schoolId: string): Promise<Class[]> {
    return schoolRepository.getClassesBySchool(schoolId);
  }
}

export const schoolService = new SchoolService();
