/**
 * Notification Service
 * 
 * Handles creating and managing notifications in the system.
 */

import { Notification, NotificationType, NotificationPriority } from '@prisma/client';
import { EventEmitter } from 'events';
import NotificationRepository, { CreateNotificationDto, NotificationQueryParams, UpdateNotificationDto } from '../repositories/NotificationRepository';
import { logger } from '../utils/logger';

// Notification events
export enum NotificationEvent {
  CREATED = 'notification:created',
  UPDATED = 'notification:updated',
  READ = 'notification:read',
  ARCHIVED = 'notification:archived',
  DELETED = 'notification:deleted'
}

/**
 * Notification Service class
 */
export class NotificationService extends EventEmitter {
  private static instance: NotificationService;
  private initialized: boolean = false;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    super();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize the notification service
   */
  public initialize(): void {
    if (this.initialized) {
      logger.info('Notification service already initialized');
      return;
    }

    // Set up any initialization logic here
    this.setupCleanupJob();
    
    this.initialized = true;
    logger.info('Notification service initialized');
  }

  /**
   * Create a new notification
   * @param data Notification data
   * @returns Created notification
   */
  public async createNotification(data: CreateNotificationDto): Promise<Notification> {
    try {
      const notification = await NotificationRepository.create(data);
      
      // Emit event for real-time updates
      this.emit(NotificationEvent.CREATED, notification);
      
      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Create a system notification
   * @param userId User ID to send notification to
   * @param title Notification title
   * @param message Notification message
   * @param priority Notification priority
   * @param link Optional link to navigate to
   * @returns Created notification
   */
  public async createSystemNotification(
    userId: string,
    title: string,
    message: string,
    priority: NotificationPriority = 'LOW',
    link?: string
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      title,
      message,
      type: 'SYSTEM',
      priority,
      link
    });
  }

  /**
   * Create a notification for multiple users
   * @param userIds Array of user IDs
   * @param data Notification data (without userId)
   * @returns Array of created notifications
   */
  public async createNotificationForUsers(
    userIds: string[],
    data: Omit<CreateNotificationDto, 'userId'>
  ): Promise<Notification[]> {
    const notifications: Notification[] = [];
    
    for (const userId of userIds) {
      try {
        const notification = await this.createNotification({
          ...data,
          userId
        });
        
        notifications.push(notification);
      } catch (error) {
        logger.error(`Error creating notification for user ${userId}:`, error);
        // Continue with other users even if one fails
      }
    }
    
    return notifications;
  }

  /**
   * Get a notification by ID
   * @param id Notification ID
   * @returns Notification or null if not found
   */
  public async getNotificationById(id: string): Promise<Notification | null> {
    return NotificationRepository.findById(id);
  }

  /**
   * Get notifications for a user
   * @param params Query parameters
   * @returns Array of notifications
   */
  public async getUserNotifications(params: NotificationQueryParams): Promise<Notification[]> {
    return NotificationRepository.findByUser(params);
  }

  /**
   * Count unread notifications for a user
   * @param userId User ID
   * @returns Count of unread notifications
   */
  public async countUnreadNotifications(userId: string): Promise<number> {
    return NotificationRepository.countUnread(userId);
  }

  /**
   * Update a notification
   * @param id Notification ID
   * @param data Update data
   * @returns Updated notification
   */
  public async updateNotification(id: string, data: UpdateNotificationDto): Promise<Notification> {
    const notification = await NotificationRepository.update(id, data);
    
    // Emit event for real-time updates
    this.emit(NotificationEvent.UPDATED, notification);
    
    return notification;
  }

  /**
   * Mark a notification as read
   * @param id Notification ID
   * @returns Updated notification
   */
  public async markAsRead(id: string): Promise<Notification> {
    const notification = await NotificationRepository.markAsRead(id);
    
    // Emit event for real-time updates
    this.emit(NotificationEvent.READ, notification);
    
    return notification;
  }

  /**
   * Mark all notifications as read for a user
   * @param userId User ID
   * @returns Count of updated notifications
   */
  public async markAllAsRead(userId: string): Promise<number> {
    const count = await NotificationRepository.markAllAsRead(userId);
    
    // Emit event for real-time updates
    this.emit(NotificationEvent.READ, { userId, count });
    
    return count;
  }

  /**
   * Archive a notification
   * @param id Notification ID
   * @returns Updated notification
   */
  public async archiveNotification(id: string): Promise<Notification> {
    const notification = await NotificationRepository.archive(id);
    
    // Emit event for real-time updates
    this.emit(NotificationEvent.ARCHIVED, notification);
    
    return notification;
  }

  /**
   * Delete a notification
   * @param id Notification ID
   * @returns Deleted notification
   */
  public async deleteNotification(id: string): Promise<Notification> {
    const notification = await NotificationRepository.delete(id);
    
    // Emit event for real-time updates
    this.emit(NotificationEvent.DELETED, notification);
    
    return notification;
  }

  /**
   * Delete expired notifications
   * @returns Count of deleted notifications
   */
  public async deleteExpiredNotifications(): Promise<number> {
    return NotificationRepository.deleteExpired();
  }

  /**
   * Set up a job to clean up expired notifications
   */
  private setupCleanupJob(): void {
    // Run cleanup job once a day
    setInterval(async () => {
      try {
        const count = await this.deleteExpiredNotifications();
        if (count > 0) {
          logger.info(`Deleted ${count} expired notifications`);
        }
      } catch (error) {
        logger.error('Error cleaning up expired notifications:', error);
      }
    }, 24 * 60 * 60 * 1000); // 24 hours
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

export default notificationService;
