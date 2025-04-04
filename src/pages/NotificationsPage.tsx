import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Archive,
  CheckCircle,
  ChevronLeft,
  Trash2,
  Filter,
  Bell,
  AlertTriangle,
  ShoppingCart,
  User,
  CheckSquare,
  Shield,
  CreditCard,
  HelpCircle
} from 'lucide-react';
import { useNotifications, Notification } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function NotificationsPage() {
  const {
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification
  } = useNotifications();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);

  useEffect(() => {
    // Refresh notifications when the page loads
    fetchNotifications();
  }, [fetchNotifications]);

  // Filter notifications based on active tab and selected type
  const filteredNotifications = (notifications || []).filter(notification => {
    if (activeTab === 'unread' && notification.isRead) return false;
    if (activeTab === 'archived' && !notification.isArchived) return false;
    if (activeTab === 'all' && notification.isArchived) return false;
    if (selectedType && notification.type !== selectedType) return false;
    return true;
  });

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Navigate to the link if provided
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    markAsRead(id);
  };

  const handleArchive = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    archiveNotification(id);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotificationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (notificationToDelete) {
      deleteNotification(notificationToDelete);
      setNotificationToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  // Function to get icon based on notification type
  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'SYSTEM':
        return <Bell className="h-5 w-5" />;
      case 'INVENTORY':
        return <ShoppingCart className="h-5 w-5" />;
      case 'SALES':
        return <CreditCard className="h-5 w-5" />;
      case 'USER':
        return <User className="h-5 w-5" />;
      case 'TASK':
        return <CheckSquare className="h-5 w-5" />;
      case 'SECURITY':
        return <Shield className="h-5 w-5" />;
      case 'PAYMENT':
        return <CreditCard className="h-5 w-5" />;
      default:
        return <HelpCircle className="h-5 w-5" />;
    }
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
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedType(null)}>
                All Types
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType('SYSTEM')}>
                System
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType('INVENTORY')}>
                Inventory
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType('SALES')}>
                Sales
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType('USER')}>
                User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType('TASK')}>
                Task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType('SECURITY')}>
                Security
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType('PAYMENT')}>
                Payment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {activeTab === 'unread' && (
            <Button variant="outline" size="sm" onClick={() => markAllAsRead()}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <NotificationList
            notifications={filteredNotifications}
            loading={loading}
            onNotificationClick={handleNotificationClick}
            onMarkAsRead={handleMarkAsRead}
            onArchive={handleArchive}
            onDelete={handleDelete}
            getTypeIcon={getTypeIcon}
            getPriorityColor={getPriorityColor}
            getTypeText={getTypeText}
            getTypeVariant={getTypeVariant}
          />
        </TabsContent>

        <TabsContent value="unread" className="mt-0">
          <NotificationList
            notifications={filteredNotifications}
            loading={loading}
            onNotificationClick={handleNotificationClick}
            onMarkAsRead={handleMarkAsRead}
            onArchive={handleArchive}
            onDelete={handleDelete}
            getTypeIcon={getTypeIcon}
            getPriorityColor={getPriorityColor}
            getTypeText={getTypeText}
            getTypeVariant={getTypeVariant}
          />
        </TabsContent>

        <TabsContent value="archived" className="mt-0">
          <NotificationList
            notifications={filteredNotifications}
            loading={loading}
            onNotificationClick={handleNotificationClick}
            onMarkAsRead={handleMarkAsRead}
            onArchive={handleArchive}
            onDelete={handleDelete}
            getTypeIcon={getTypeIcon}
            getPriorityColor={getPriorityColor}
            getTypeText={getTypeText}
            getTypeVariant={getTypeVariant}
          />
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the notification. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface NotificationListProps {
  notifications: Notification[];
  loading: boolean;
  onNotificationClick: (notification: Notification) => void;
  onMarkAsRead: (e: React.MouseEvent, id: string) => void;
  onArchive: (e: React.MouseEvent, id: string) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  getTypeIcon: (type: Notification['type']) => React.ReactNode;
  getPriorityColor: (priority: Notification['priority']) => string;
  getTypeText: (type: Notification['type']) => string;
  getTypeVariant: (type: Notification['type']) => "default" | "secondary" | "destructive" | "outline";
}

function NotificationList({
  notifications,
  loading,
  onNotificationClick,
  onMarkAsRead,
  onArchive,
  onDelete,
  getTypeIcon,
  getPriorityColor,
  getTypeText,
  getTypeVariant
}: NotificationListProps) {
  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Bell className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No notifications</h3>
          <p className="text-sm text-muted-foreground">
            You don't have any notifications at the moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={cn(
              "cursor-pointer transition-colors hover:bg-muted/50",
              !notification.isRead && "border-l-4 border-primary"
            )}
            onClick={() => onNotificationClick(notification)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={cn("p-2 rounded-full bg-muted", getPriorityColor(notification.priority))}>
                  {getTypeIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <Badge variant={getTypeVariant(notification.type)}>
                      {getTypeText(notification.type)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium mt-1">{notification.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                  {notification.readAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Read {formatDistanceToNow(new Date(notification.readAt), { addSuffix: true })}
                    </p>
                  )}
                  <div className="flex items-center justify-end mt-2 gap-2">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => onMarkAsRead(e, notification.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as read
                      </Button>
                    )}
                    {!notification.isArchived && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => onArchive(e, notification.id)}
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => onDelete(e, notification.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}

export default NotificationsPage;
