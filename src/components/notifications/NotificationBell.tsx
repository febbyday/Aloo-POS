import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotifications, Notification } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  // Get only unread and not archived notifications
  const activeNotifications = (notifications || []).filter(
    (notification) => !notification.isArchived && !notification.isRead
  ).slice(0, 5); // Show only the 5 most recent

  // Get recent read notifications
  const recentReadNotifications = (notifications || []).filter(
    (notification) => !notification.isArchived && notification.isRead
  ).slice(0, 3); // Show only the 3 most recent read

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Navigate to the link if provided
    if (notification.link) {
      navigate(notification.link);
    }

    // Close the popover
    setOpen(false);
  };

  const handleViewAll = () => {
    navigate('/notifications');
    setOpen(false);
  };

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllAsRead();
  };

  // Function to get icon color based on priority
  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'URGENT':
        return 'text-red-500';
      case 'HIGH':
        return 'text-orange-500';
      case 'MEDIUM':
        return 'text-yellow-500';
      default:
        return 'text-blue-500';
    }
  };

  // Function to get badge text based on type
  const getTypeText = (type: Notification['type']) => {
    switch (type) {
      case 'SYSTEM':
        return 'System';
      case 'INVENTORY':
        return 'Inventory';
      case 'SALES':
        return 'Sales';
      case 'USER':
        return 'User';
      case 'TASK':
        return 'Task';
      case 'SECURITY':
        return 'Security';
      case 'PAYMENT':
        return 'Payment';
      default:
        return 'Other';
    }
  };

  // Function to get badge variant based on type
  const getTypeVariant = (type: Notification['type']): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case 'SYSTEM':
        return 'default';
      case 'INVENTORY':
        return 'secondary';
      case 'SALES':
        return 'default';
      case 'USER':
        return 'secondary';
      case 'TASK':
        return 'outline';
      case 'SECURITY':
        return 'destructive';
      case 'PAYMENT':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center"
              variant="destructive"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 pb-2">
          <h4 className="font-medium text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[calc(80vh-8rem)] max-h-80">
          {activeNotifications.length === 0 && recentReadNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div>
              {activeNotifications.length > 0 && (
                <div>
                  <p className="px-4 py-2 text-xs font-medium text-muted-foreground">New</p>
                  {activeNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex flex-col p-4 cursor-pointer hover:bg-muted"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-2">
                        <div className={cn("w-2 h-2 mt-1.5 rounded-full", getPriorityColor(notification.priority))} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <Badge variant={getTypeVariant(notification.type)} className="text-[10px] px-1 py-0">
                              {getTypeText(notification.type)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <h5 className="font-medium text-sm mt-1">{notification.title}</h5>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {recentReadNotifications.length > 0 && (
                <div>
                  <p className="px-4 py-2 text-xs font-medium text-muted-foreground">Recent</p>
                  {recentReadNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex flex-col p-4 cursor-pointer hover:bg-muted opacity-70"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <Badge variant={getTypeVariant(notification.type)} className="text-[10px] px-1 py-0">
                              {getTypeText(notification.type)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <h5 className="font-medium text-sm mt-1">{notification.title}</h5>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
        <Separator />
        <div className="p-2">
          <Button variant="ghost" size="sm" className="w-full justify-center" onClick={handleViewAll}>
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationBell;
