import { prisma, Announcement, Notification, NotificationType, UserRole } from '@ai-lms/database';

export class NotificationRepository {
  async getAnnouncements(schoolId: string): Promise<Announcement[]> {
    return prisma.announcement.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAnnouncement(data: {
    schoolId: string;
    title: string;
    content: string;
    targetRoles: UserRole[];
    createdBy: string;
  }): Promise<Announcement> {
    return prisma.announcement.create({
      data: {
        schoolId: data.schoolId,
        title: data.title,
        content: data.content,
        targetRoles: data.targetRoles,
        createdBy: data.createdBy,
      },
    });
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async createNotification(data: {
    userId: string;
    title: string;
    body: string;
    type?: NotificationType;
  }): Promise<Notification> {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        body: data.body,
        type: data.type ?? NotificationType.GENERAL,
      },
    });
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }
}

export const notificationRepository = new NotificationRepository();
