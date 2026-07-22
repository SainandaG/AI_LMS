import { Announcement, Notification, NotificationType, UserRole } from '@ai-lms/database';
import { notificationRepository } from './notification.repository';
import { logger } from '@/shared/utils/logger';

export class NotificationService {
  async getAnnouncements(schoolId: string): Promise<Announcement[]> {
    return notificationRepository.getAnnouncements(schoolId);
  }

  async createAnnouncement(data: {
    schoolId: string;
    title: string;
    content: string;
    targetRoles: UserRole[];
    createdBy: string;
  }): Promise<Announcement> {
    const ann = await notificationRepository.createAnnouncement(data);
    logger.info({ announcementId: ann.id, title: ann.title }, 'Announcement broadcasted');
    return ann;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return notificationRepository.getUserNotifications(userId);
  }

  async sendNotification(data: {
    userId: string;
    title: string;
    body: string;
    type?: NotificationType;
  }): Promise<Notification> {
    return notificationRepository.createNotification(data);
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    return notificationRepository.markAsRead(notificationId);
  }
}

export const notificationService = new NotificationService();
