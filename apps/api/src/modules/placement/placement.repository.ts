import { prisma, Company, PlacementApplication, Resume, PlacementStatus } from '@ai-lms/database';
import { PaginationInput } from '@ai-lms/shared';

export class PlacementRepository {
  async findCompanies(schoolId: string, params: PaginationInput): Promise<{ companies: any[]; total: number }> {
    const skip = (params.page - 1) * params.limit;

    const where: any = {
      schoolId,
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: 'insensitive' } },
              { industry: { contains: params.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: params.limit,
        include: {
          placementApplications: true,
          interviews: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.company.count({ where }),
    ]);

    return { companies, total };
  }

  async createCompany(data: {
    schoolId: string;
    name: string;
    industry: string;
    requiredSkills: string[];
    minCgpa?: number;
    website?: string;
    description?: string;
  }): Promise<Company> {
    return prisma.company.create({
      data: {
        schoolId: data.schoolId,
        name: data.name,
        industry: data.industry,
        requiredSkills: data.requiredSkills,
        ...(data.minCgpa !== undefined ? { minCgpa: data.minCgpa } : {}),
        ...(data.website ? { website: data.website } : {}),
        ...(data.description ? { description: data.description } : {}),
      },
    });
  }

  async applyToCompany(studentId: string, companyId: string): Promise<PlacementApplication> {
    return prisma.placementApplication.create({
      data: {
        studentId,
        companyId,
        status: PlacementStatus.APPLIED,
      },
    });
  }

  async saveResume(data: {
    studentId: string;
    content: string;
    aiScore?: number;
    aiFeedback?: string;
  }): Promise<Resume> {
    return prisma.resume.upsert({
      where: { studentId: data.studentId },
      update: {
        content: data.content,
        ...(data.aiScore !== undefined ? { aiScore: data.aiScore } : {}),
        ...(data.aiFeedback ? { aiFeedback: data.aiFeedback } : {}),
      },
      create: {
        studentId: data.studentId,
        content: data.content,
        ...(data.aiScore !== undefined ? { aiScore: data.aiScore } : {}),
        ...(data.aiFeedback ? { aiFeedback: data.aiFeedback } : {}),
      },
    });
  }
}

export const placementRepository = new PlacementRepository();
