import { Request, Response } from 'express';
import { analyticsService } from './analytics.service';
import { sendSuccess } from '@/shared/utils/response.util';

export class AnalyticsController {
  async getDashboardAnalytics(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const data = await analyticsService.getDashboardAnalytics(schoolId);
    sendSuccess(res, data, 'Analytics metrics calculated successfully');
  }
}

export const analyticsController = new AnalyticsController();
