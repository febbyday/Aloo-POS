import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

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

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  archiveNotification: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();
  const isAuthenticated = auth.isAuthenticated;
  // Get token from localStorage
  const token = localStorage.getItem('token') || localStorage.getItem('auth_token') || '';
  const { toast } = useToast();

  // Configure axios with auth token
  const getApi = () => {
    return axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : ''
      }
    });
  };

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      // Add a fallback for development - if the API call fails, use mock data
      try {
        const response = await getApi().get('/notifications');
        setNotifications(response.data || []);
      } catch (apiErr) {
        console.warn('API call failed, using mock data:', apiErr);
        // Use empty array as fallback in development
        setNotifications([]);
        // Only show toast in production
        if (import.meta.env.PROD) {
          toast({
            title: 'Notice',
            description: 'Using mock notification data',
            variant: 'default'
          });
        }
      }
    } catch (err) {
      console.error('Error in notification handling:', err);
      setError('Failed to handle notifications');
      setNotifications([]);
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, toast]);

  // Fetch unread notification count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      try {
        const response = await getApi().get('/notifications/unread/count');
        setUnreadCount(response.data?.count || 0);
      } catch (apiErr) {
        console.warn('API call for unread count failed, using 0:', apiErr);
        // Use 0 as fallback
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error in unread count handling:', err);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    if (!isAuthenticated) return;

    try {
      await getApi().post(`/notifications/${id}/read`);

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
      console.error(`Error marking notification ${id} as read:`, err);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive'
      });
    }
  }, [isAuthenticated, toast]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      await getApi().post('/notifications/read/all');

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

      toast({
        title: 'Success',
        description: 'All notifications marked as read'
      });
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive'
      });
    }
  }, [isAuthenticated, toast]);

  // Archive notification
  const archiveNotification = useCallback(async (id: string) => {
    if (!isAuthenticated) return;

    try {
      await getApi().post(`/notifications/${id}/archive`);

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

      toast({
        title: 'Success',
        description: 'Notification archived'
      });
    } catch (err) {
      console.error(`Error archiving notification ${id}:`, err);
      toast({
        title: 'Error',
        description: 'Failed to archive notification',
        variant: 'destructive'
      });
    }
  }, [isAuthenticated, notifications, toast]);

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    if (!isAuthenticated) return;

    try {
      await getApi().delete(`/notifications/${id}`);

      // Update local state
      setNotifications(prev => prev.filter(notification => notification.id !== id));

      // If the notification was unread, update the unread count
      const notification = notifications.find(n => n.id === id);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      toast({
        title: 'Success',
        description: 'Notification deleted'
      });
    } catch (err) {
      console.error(`Error deleting notification ${id}:`, err);
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive'
      });
    }
  }, [isAuthenticated, notifications, toast]);

  // Initial fetch of notifications and unread count
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

  // Set up polling for unread count
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 60000); // Poll every minute

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUnreadCount]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
