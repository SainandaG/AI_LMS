import { Request, Response } from 'express';
import { UserRole } from '@ai-lms/database';
import { z } from 'zod';

import { notificationService } from './notification.service';
import { sendSuccess, sendCreated } from '@/shared/utils/response.util';

export class NotificationController {
  async getAnnouncements(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const anns = await notificationService.getAnnouncements(schoolId);
    sendSuccess(res, anns, 'Announcements retrieved');
  }

  async createAnnouncement(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      title: z.string().min(2),
      content: z.string().min(5),
      targetRoles: z.array(z.nativeEnum(UserRole)).default([UserRole.STUDENT]),
    });

    const body = schema.parse(req.body);
    const schoolId = req.user!.schoolId!;
    const createdBy = req.user!.sub;

    const ann = await notificationService.createAnnouncement({
      title: body.title,
      content: body.content,
      targetRoles: body.targetRoles,
      schoolId,
      createdBy,
    });

    sendCreated(res, ann, 'Announcement published successfully');
  }

  async getUserNotifications(req: Request, res: Response): Promise<void> {
    const userId = req.user!.sub;
    const notes = await notificationService.getUserNotifications(userId);
    sendSuccess(res, notes, 'User notifications retrieved');
  }

  async markAsRead(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const note = await notificationService.markAsRead(id!);
    sendSuccess(res, note, 'Notification marked as read');
  }
}

export const notificationController = new NotificationController();
