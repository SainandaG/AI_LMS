import { Request, Response } from 'express';
import { PaginationSchema } from '@ai-lms/shared';
import { z } from 'zod';

import { placementService } from './placement.service';
import { sendSuccess, sendCreated } from '@/shared/utils/response.util';

export class PlacementController {
  async getCompanies(req: Request, res: Response): Promise<void> {
    const params = PaginationSchema.parse(req.query);
    const schoolId = req.user!.schoolId!;

    const { companies, meta } = await placementService.getCompanies(schoolId, params);
    sendSuccess(res, companies, 'Companies directory retrieved', 200, meta);
  }

  async createCompany(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      name: z.string().min(2),
      industry: z.string().min(2),
      requiredSkills: z.array(z.string()),
      minCgpa: z.number().min(0).max(10).optional(),
      website: z.string().optional(),
      description: z.string().optional(),
    });

    const body = schema.parse(req.body);
    const schoolId = req.user!.schoolId!;

    const company = await placementService.createCompany({
      name: body.name,
      industry: body.industry,
      requiredSkills: body.requiredSkills,
      schoolId,
      ...(body.minCgpa !== undefined ? { minCgpa: body.minCgpa } : {}),
      ...(body.website ? { website: body.website } : {}),
      ...(body.description ? { description: body.description } : {}),
    });

    sendCreated(res, company, 'Placement drive company listed');
  }

  async applyToCompany(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      companyId: z.string().uuid(),
    });

    const { companyId } = schema.parse(req.body);
    const studentId = req.user!.sub;

    const app = await placementService.applyToCompany(studentId, companyId);
    sendCreated(res, app, 'Applied to recruitment drive successfully');
  }

  async analyzeResumeWithAi(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      resumeText: z.string().min(20),
    });

    const { resumeText } = schema.parse(req.body);
    const studentId = req.user!.sub;

    const result = await placementService.analyzeResumeWithAi(studentId, resumeText);
    sendSuccess(res, result, 'AI Resume Analysis completed');
  }
}

export const placementController = new PlacementController();
