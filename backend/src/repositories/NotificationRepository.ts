import { PrismaClient, Notification, NotificationType, NotificationPriority } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Interface for creating a notification
export interface CreateNotificationDto {
  title: string;
  message: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  link?: string;
  metadata?: Record<string, any>;
  userId: string;
  createdById?: string;
  expiresAt?: Date;
}

// Interface for updating a notification
export interface UpdateNotificationDto {
  isRead?: boolean;
  isArchived?: boolean;
  readAt?: Date | null;
}

// Interface for querying notifications
export interface NotificationQueryParams {
  userId: string;
  isRead?: boolean;
  isArchived?: boolean;
  type?: NotificationType;
  priority?: NotificationPriority;
  limit?: number;
  offset?: number;
}

/**
 * Repository for managing notifications
 */
export class NotificationRepository {
  /**
   * Create a new notification
   * @param data Notification data
   * @returns Created notification
   */
  static async create(data: CreateNotificationDto): Promise<Notification> {
    try {
      const notification = await prisma.notification.create({
        data: {
          title: data.title,
          message: data.message,
          type: data.type || 'SYSTEM',
          priority: data.priority || 'LOW',
          link: data.link,
          metadata: data.metadata ? data.metadata : undefined,
          userId: data.userId,
          createdById: data.createdById,
          expiresAt: data.expiresAt
        }
      });
      
      logger.info(`Notification created: ${notification.id}`);
      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Get a notification by ID
   * @param id Notification ID
   * @returns Notification or null if not found
   */
  static async findById(id: string): Promise<Notification | null> {
    try {
      return await prisma.notification.findUnique({
        where: { id }
      });
    } catch (error) {
      logger.error(`Error finding notification with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get notifications for a user
   * @param params Query parameters
   * @returns Array of notifications
   */
  static async findByUser(params: NotificationQueryParams): Promise<Notification[]> {
    try {
      const { userId, isRead, isArchived, type, priority, limit = 50, offset = 0 } = params;
      
      const where: any = { userId };
      
      if (isRead !== undefined) {
        where.isRead = isRead;
      }
      
      if (isArchived !== undefined) {
        where.isArchived = isArchived;
      }
      
      if (type) {
        where.type = type;
      }
      
      if (priority) {
        where.priority = priority;
      }
      
      return await prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });
    } catch (error) {
      logger.error(`Error finding notifications for user ${params.userId}:`, error);
      throw error;
    }
  }

  /**
   * Count unread notifications for a user
   * @param userId User ID
   * @returns Count of unread notifications
   */
  static async countUnread(userId: string): Promise<number> {
    try {
      return await prisma.notification.count({
        where: {
          userId,
          isRead: false,
          isArchived: false
        }
      });
    } catch (error) {
      logger.error(`Error counting unread notifications for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update a notification
   * @param id Notification ID
   * @param data Update data
   * @returns Updated notification
   */
  static async update(id: string, data: UpdateNotificationDto): Promise<Notification> {
    try {
      return await prisma.notification.update({
        where: { id },
        data
      });
    } catch (error) {
      logger.error(`Error updating notification ${id}:`, error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   * @param id Notification ID
   * @returns Updated notification
   */
  static async markAsRead(id: string): Promise<Notification> {
    try {
      return await prisma.notification.update({
        where: { id },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });
    } catch (error) {
      logger.error(`Error marking notification ${id} as read:`, error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   * @param userId User ID
   * @returns Count of updated notifications
   */
  static async markAllAsRead(userId: string): Promise<number> {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });
      
      return result.count;
    } catch (error) {
      logger.error(`Error marking all notifications as read for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Archive a notification
   * @param id Notification ID
   * @returns Updated notification
   */
  static async archive(id: string): Promise<Notification> {
    try {
      return await prisma.notification.update({
        where: { id },
        data: {
          isArchived: true
        }
      });
    } catch (error) {
      logger.error(`Error archiving notification ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a notification
   * @param id Notification ID
   * @returns Deleted notification
   */
  static async delete(id: string): Promise<Notification> {
    try {
      return await prisma.notification.delete({
        where: { id }
      });
    } catch (error) {
      logger.error(`Error deleting notification ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete expired notifications
   * @returns Count of deleted notifications
   */
  static async deleteExpired(): Promise<number> {
    try {
      const now = new Date();
      const result = await prisma.notification.deleteMany({
        where: {
          expiresAt: {
            lt: now
          }
        }
      });
      
      return result.count;
    } catch (error) {
      logger.error('Error deleting expired notifications:', error);
      throw error;
    }
  }

  /**
   * Delete all notifications for a user
   * @param userId User ID
   * @returns Count of deleted notifications
   */
  static async deleteAllForUser(userId: string): Promise<number> {
    try {
      const result = await prisma.notification.deleteMany({
        where: { userId }
      });
      
      return result.count;
    } catch (error) {
      logger.error(`Error deleting all notifications for user ${userId}:`, error);
      throw error;
    }
  }
}

export default NotificationRepository;
