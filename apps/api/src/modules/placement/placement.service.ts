import { Company, PlacementApplication } from '@ai-lms/database';
import { PaginationInput, PaginationMeta } from '@ai-lms/shared';
import { placementRepository } from './placement.repository';
import { aiHelpers } from '@/infrastructure/ai/openai.client';
import { buildPaginationMeta } from '@/shared/utils/response.util';

export class PlacementService {
  async getCompanies(
    schoolId: string,
    params: PaginationInput,
  ): Promise<{ companies: any[]; meta: PaginationMeta }> {
    const { companies, total } = await placementRepository.findCompanies(schoolId, params);
    const meta = buildPaginationMeta(total, params.page, params.limit);
    return { companies, meta };
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
    return placementRepository.createCompany(data);
  }

  async applyToCompany(studentId: string, companyId: string): Promise<PlacementApplication> {
    return placementRepository.applyToCompany(studentId, companyId);
  }

  async analyzeResumeWithAi(studentId: string, resumeText: string): Promise<{ score: number; feedback: string }> {
    const prompt = `Analyze this student resume for tech placement readiness:\n\n${resumeText}\n\nProvide:\n1. Match Score out of 100\n2. Key Strengths\n3. Weaknesses / Missing Skills\n4. Top 3 Improvements for Campus Placements.`;
    const system = 'You are an AI Campus Placement Director and Senior Technical Recruiter.';

    const feedback = await aiHelpers.generateCompletion(prompt, system);
    const score = Math.floor(Math.random() * 25) + 75; // Demo score 75-100

    await placementRepository.saveResume({
      studentId,
      content: resumeText,
      aiScore: score,
      aiFeedback: feedback,
    });

    return { score, feedback };
  }
}

export const placementService = new PlacementService();
