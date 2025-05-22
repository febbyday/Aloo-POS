/**
 * BatchNotificationProvider
 * 
 * This provider manages notifications with optimized batch requests during initialization.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useProviderBatchInit } from '@/lib/hooks/useProviderBatchInit';
import { RequestPriority } from '@/lib/api/initialization-batch-manager';
import { logger } from '@/lib/logging/logger';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { performanceMonitor } from '@/lib/performance/performance-monitor';
import { useToast } from '@/lib/toast';

// Define notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'SYSTEM' | 'INVENTORY' | 'SALES' | 'USER' | 'TASK' | 'SECURITY' | 'PAYMENT' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isRead: boolean;
  isArchived: boolean;
  link?: string;
  createdAt: string;
  readAt?: string;
}

interface BatchNotificationContextType {
  /**
   * List of notifications
   */
  notifications: Notification[];
  
  /**
   * Number of unread notifications
   */
  unreadCount: number;
  
  /**
   * Whether notifications are loading
   */
  loading: boolean;
  
  /**
   * Error that occurred during loading
   */
  error: Error | null;
  
  /**
   * Fetch notifications
   */
  fetchNotifications: () => Promise<void>;
  
  /**
   * Fetch unread notification count
   */
  fetchUnreadCount: () => Promise<void>;
  
  /**
   * Mark a notification as read
   */
  markAsRead: (id: string) => Promise<void>;
  
  /**
   * Mark all notifications as read
   */
  markAllAsRead: () => Promise<void>;
  
  /**
   * Archive a notification
   */
  archiveNotification: (id: string) => Promise<void>;
  
  /**
   * Delete a notification
   */
  deleteNotification: (id: string) => Promise<void>;
}

// Create context
const BatchNotificationContext = createContext<BatchNotificationContextType | undefined>(undefined);

// Provider props
interface BatchNotificationProviderProps {
  children: React.ReactNode;
}

/**
 * BatchNotificationProvider Component
 * 
 * Provides notification data with optimized batch requests during initialization.
 */
export function BatchNotificationProvider({ children }: BatchNotificationProviderProps) {
  // State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  
  // Get auth context
  const { isAuthenticated } = useAuth();
  
  // Get toast
  const toast = useToast();
  
  // Use provider batch initialization
  const {
    batchGet,
    batchPost,
    isInitializing,
    isInitialized,
    error,
    initialize
  } = useProviderBatchInit({
    providerName: 'notification',
    autoInit: true,
    defaultPriority: RequestPriority.MEDIUM,
    dependencies: [isAuthenticated],
    onInitComplete: () => {
      logger.info('Notification provider initialized successfully');
    },
    onInitError: (error) => {
      logger.error('Error initializing notification provider', { error });
    }
  });
  
  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    
    performanceMonitor.markStart('notification:fetchNotifications');
    try {
      // Use batch request to fetch notifications
      const notificationsData = await batchGet<Notification[]>('notifications/LIST', undefined, RequestPriority.MEDIUM);
      
      if (notificationsData && Array.isArray(notificationsData)) {
        setNotifications(notificationsData);
      } else {
        // Use empty array as fallback
        setNotifications([]);
        
        // Only show toast in production
        if (import.meta.env.PROD) {
          toast.info('Notice', 'Using mock notification data');
        }
      }
    } catch (err) {
      logger.error('Error fetching notifications', { error: err });
      setNotifications([]);
      toast.error('Error', 'Failed to load notifications');
    } finally {
      performanceMonitor.markEnd('notification:fetchNotifications');
    }
  }, [isAuthenticated, batchGet, toast]);
  
  // Fetch unread notification count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    
    performanceMonitor.markStart('notification:fetchUnreadCount');
    try {
      // Use batch request to fetch unread count
      const response = await batchGet<{ count: number }>('notifications/UNREAD_COUNT', undefined, RequestPriority.HIGH);
      
      if (response && typeof response.count === 'number') {
        setUnreadCount(response.count);
      } else {
        // Use 0 as fallback
        setUnreadCount(0);
      }
    } catch (err) {
      logger.error('Error fetching unread notification count', { error: err });
      setUnreadCount(0);
    } finally {
      performanceMonitor.markEnd('notification:fetchUnreadCount');
    }
  }, [isAuthenticated, batchGet]);
  
  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    if (!isAuthenticated) return;
    
    performanceMonitor.markStart(`notification:markAsRead:${id}`);
    try {
      // Use batch request to mark notification as read
      await batchPost(`notifications/READ/${id}`, undefined, RequestPriority.LOW);
      
      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      logger.error('Error marking notification as read', { error: err, notificationId: id });
      toast.error('Error', 'Failed to mark notification as read');
    } finally {
      performanceMonitor.markEnd(`notification:markAsRead:${id}`);
    }
  }, [isAuthenticated, batchPost, toast]);
  
  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated) return;
    
    performanceMonitor.markStart('notification:markAllAsRead');
    try {
      // Use batch request to mark all notifications as read
      await batchPost('notifications/READ_ALL', undefined, RequestPriority.LOW);
      
      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({
          ...notification,
          isRead: true,
          readAt: notification.readAt || new Date().toISOString()
        }))
      );
      
      // Update unread count
      setUnreadCount(0);
      
      toast.success('Success', 'All notifications marked as read');
    } catch (err) {
      logger.error('Error marking all notifications as read', { error: err });
      toast.error('Error', 'Failed to mark all notifications as read');
    } finally {
      performanceMonitor.markEnd('notification:markAllAsRead');
    }
  }, [isAuthenticated, batchPost, toast]);
  
  // Archive notification
  const archiveNotification = useCallback(async (id: string) => {
    if (!isAuthenticated) return;
    
    performanceMonitor.markStart(`notification:archiveNotification:${id}`);
    try {
      // Use batch request to archive notification
      await batchPost(`notifications/ARCHIVE/${id}`, undefined, RequestPriority.LOW);
      
      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, isArchived: true }
            : notification
        )
      );
      
      // If the notification was unread, update the unread count
      const notification = notifications.find(n => n.id === id);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success('Success', 'Notification archived');
    } catch (err) {
      logger.error('Error archiving notification', { error: err, notificationId: id });
      toast.error('Error', 'Failed to archive notification');
    } finally {
      performanceMonitor.markEnd(`notification:archiveNotification:${id}`);
    }
  }, [isAuthenticated, batchPost, notifications, toast]);
  
  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    if (!isAuthenticated) return;
    
    performanceMonitor.markStart(`notification:deleteNotification:${id}`);
    try {
      // Use batch request to delete notification
      await batchPost(`notifications/DELETE/${id}`, undefined, RequestPriority.LOW);
      
      // Update local state
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      
      // If the notification was unread, update the unread count
      const notification = notifications.find(n => n.id === id);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success('Success', 'Notification deleted');
    } catch (err) {
      logger.error('Error deleting notification', { error: err, notificationId: id });
      toast.error('Error', 'Failed to delete notification');
    } finally {
      performanceMonitor.markEnd(`notification:deleteNotification:${id}`);
    }
  }, [isAuthenticated, batchPost, notifications, toast]);
  
  // Initialize data when authenticated
  useEffect(() => {
    if (isAuthenticated && !isInitialized && !isInitializing) {
      logger.info('Initializing notification provider');
      
      // Add requests to the batch
      fetchNotifications();
      fetchUnreadCount();
      
      // Execute the batch
      initialize();
    }
  }, [isAuthenticated, isInitialized, isInitializing, fetchNotifications, fetchUnreadCount, initialize]);
  
  // Set up polling for unread count
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 60000); // Poll every minute
    
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUnreadCount]);
  
  // Context value
  const contextValue: BatchNotificationContextType = {
    notifications,
    unreadCount,
    loading: isInitializing,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification
  };
  
  return (
    <BatchNotificationContext.Provider value={contextValue}>
      {children}
    </BatchNotificationContext.Provider>
  );
}

/**
 * Hook to use the batch notification context
 */
export function useBatchNotifications(): BatchNotificationContextType {
  const context = useContext(BatchNotificationContext);
  
  if (!context) {
    throw new Error('useBatchNotifications must be used within a BatchNotificationProvider');
  }
  
  return context;
}

export default BatchNotificationContext;
