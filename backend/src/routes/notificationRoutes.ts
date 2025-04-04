import express from 'express';
import { z } from 'zod';
import { authenticateJWT } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import notificationService from '../services/notificationService';
import { logger } from '../utils/logger';

const router = express.Router();

// Schema for creating a notification
const createNotificationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  type: z.enum(['SYSTEM', 'INVENTORY', 'SALES', 'USER', 'TASK', 'SECURITY', 'PAYMENT', 'OTHER']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  link: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  userId: z.string().uuid('Invalid user ID'),
  expiresAt: z.string().datetime().optional()
});

// Schema for updating a notification
const updateNotificationSchema = z.object({
  isRead: z.boolean().optional(),
  isArchived: z.boolean().optional()
});

// Get all notifications for the authenticated user
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { 
      isRead, 
      isArchived, 
      type, 
      priority, 
      limit = '50', 
      offset = '0' 
    } = req.query;
    
    const notifications = await notificationService.getUserNotifications({
      userId,
      isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
      isArchived: isArchived === 'true' ? true : isArchived === 'false' ? false : undefined,
      type: type as any,
      priority: priority as any,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
    
    res.json(notifications);
  } catch (error) {
    logger.error('Error getting notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get unread notification count for the authenticated user
router.get('/unread/count', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const count = await notificationService.countUnreadNotifications(userId);
    
    res.json({ count });
  } catch (error) {
    logger.error('Error getting unread notification count:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get a specific notification
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user?.id;
    const notificationId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const notification = await notificationService.getNotificationById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Ensure the user can only access their own notifications
    if (notification.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    res.json(notification);
  } catch (error) {
    logger.error(`Error getting notification ${req.params.id}:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new notification (admin only)
router.post(
  '/',
  authenticateJWT,
  validateRequest(createNotificationSchema),
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      
      if (!userId || !['ADMIN', 'MANAGER'].includes(userRole)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      const notificationData = req.body;
      
      // Set the creator ID to the authenticated user
      notificationData.createdById = userId;
      
      // Parse expiresAt if provided
      if (notificationData.expiresAt) {
        notificationData.expiresAt = new Date(notificationData.expiresAt);
      }
      
      const notification = await notificationService.createNotification(notificationData);
      
      res.status(201).json(notification);
    } catch (error) {
      logger.error('Error creating notification:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// Create notifications for multiple users (admin only)
router.post('/bulk', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    if (!userId || !['ADMIN', 'MANAGER'].includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const { userIds, ...notificationData } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'userIds must be a non-empty array' });
    }
    
    // Set the creator ID to the authenticated user
    notificationData.createdById = userId;
    
    // Parse expiresAt if provided
    if (notificationData.expiresAt) {
      notificationData.expiresAt = new Date(notificationData.expiresAt);
    }
    
    const notifications = await notificationService.createNotificationForUsers(
      userIds,
      notificationData
    );
    
    res.status(201).json({
      count: notifications.length,
      notifications
    });
  } catch (error) {
    logger.error('Error creating bulk notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a notification
router.patch(
  '/:id',
  authenticateJWT,
  validateRequest(updateNotificationSchema),
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const notificationId = req.params.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Get the notification to check ownership
      const notification = await notificationService.getNotificationById(notificationId);
      
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      
      // Ensure the user can only update their own notifications
      if (notification.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      const updatedNotification = await notificationService.updateNotification(
        notificationId,
        req.body
      );
      
      res.json(updatedNotification);
    } catch (error) {
      logger.error(`Error updating notification ${req.params.id}:`, error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// Mark a notification as read
router.post('/:id/read', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user?.id;
    const notificationId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Get the notification to check ownership
    const notification = await notificationService.getNotificationById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Ensure the user can only mark their own notifications as read
    if (notification.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const updatedNotification = await notificationService.markAsRead(notificationId);
    
    res.json(updatedNotification);
  } catch (error) {
    logger.error(`Error marking notification ${req.params.id} as read:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark all notifications as read
router.post('/read/all', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const count = await notificationService.markAllAsRead(userId);
    
    res.json({ count });
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Archive a notification
router.post('/:id/archive', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user?.id;
    const notificationId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Get the notification to check ownership
    const notification = await notificationService.getNotificationById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Ensure the user can only archive their own notifications
    if (notification.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const updatedNotification = await notificationService.archiveNotification(notificationId);
    
    res.json(updatedNotification);
  } catch (error) {
    logger.error(`Error archiving notification ${req.params.id}:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a notification
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const notificationId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Get the notification to check ownership
    const notification = await notificationService.getNotificationById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Ensure the user can only delete their own notifications or is an admin
    if (notification.userId !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    await notificationService.deleteNotification(notificationId);
    
    res.status(204).end();
  } catch (error) {
    logger.error(`Error deleting notification ${req.params.id}:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
