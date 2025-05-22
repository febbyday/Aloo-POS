import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertTriangle, AlertCircle, Bell, BellOff, CheckCircle, Clock, Settings } from 'lucide-react';
import { ToastService } from '@/lib/toast';

export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  currentStock: number;
  threshold: number;
  status: 'critical' | 'warning';
  createdAt: string;
  isRead: boolean;
  locationId?: string;
  locationName?: string;
}

interface AlertNotificationCenterProps {
  alerts: StockAlert[];
  onMarkAsRead: (alertId: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  onDismiss: (alertId: string) => Promise<void>;
  onOpenSettings: () => void;
  onViewProduct: (productId: string) => void;
  onCreatePurchaseOrder: (productIds: string[]) => void;
}

export const AlertNotificationCenter: React.FC<AlertNotificationCenterProps> = ({
  alerts,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  onOpenSettings,
  onViewProduct,
  onCreatePurchaseOrder,
}) => {
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const criticalAlerts = alerts.filter(alert => alert.status === 'critical');
  const warningAlerts = alerts.filter(alert => alert.status === 'warning');
  const unreadAlerts = alerts.filter(alert => !alert.isRead);

  const handleToggleSelect = (alertId: string) => {
    const newSelected = new Set(selectedAlerts);
    if (newSelected.has(alertId)) {
      newSelected.delete(alertId);
    } else {
      newSelected.add(alertId);
    }
    setSelectedAlerts(newSelected);
  };

  const handleSelectAll = (alertsToSelect: StockAlert[]) => {
    const newSelected = new Set(selectedAlerts);
    alertsToSelect.forEach(alert => newSelected.add(alert.id));
    setSelectedAlerts(newSelected);
  };

  const handleDeselectAll = () => {
    setSelectedAlerts(new Set());
  };

  const handleCreatePurchaseOrder = async () => {
    if (selectedAlerts.size === 0) {
      ToastService.error(
        "No Products Selected",
        "Please select at least one product to create a purchase order."
      );
      return;
    }

    try {
      setIsProcessing(true);
      const selectedProductIds = Array.from(selectedAlerts).map(
        alertId => alerts.find(a => a.id === alertId)?.productId
      ).filter(Boolean) as string[];

      await onCreatePurchaseOrder(selectedProductIds);

      ToastService.success(
        "Purchase Order Created",
        `Successfully created purchase order for ${selectedProductIds.length} products.`
      );

      setSelectedAlerts(new Set());
    } catch (error) {
      console.error('Failed to create purchase order:', error);
      ToastService.error(
        "Failed to Create Purchase Order",
        "An error occurred while creating the purchase order. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleNotifications = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    ToastService.info(
      enabled ? "Notifications Enabled" : "Notifications Disabled",
      enabled
        ? "You will now receive stock alert notifications."
        : "Stock alert notifications have been disabled."
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderAlertItem = (alert: StockAlert) => {
    const isSelected = selectedAlerts.has(alert.id);

    return (
      <div
        key={alert.id}
        className={`p-4 border-l-4 ${
          alert.status === 'critical'
            ? 'border-l-red-500'
            : 'border-l-amber-500'
        } ${
          isSelected ? 'bg-muted/50' : ''
        } ${
          alert.isRead ? 'opacity-70' : ''
        } mb-2 rounded-md hover:bg-muted/30 transition-colors`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-2">
            <div className="mt-0.5">
              {alert.status === 'critical'
                ? <AlertTriangle className="h-5 w-5 text-red-500" />
                : <AlertCircle className="h-5 w-5 text-amber-500" />
              }
            </div>
            <div>
              <div className="font-medium">{alert.productName}</div>
              <div className="text-sm text-muted-foreground">SKU: {alert.productSku}</div>
              <div className="text-sm mt-1">
                Current stock: <span className="font-medium">{alert.currentStock}</span> units
                {alert.locationName && (
                  <span className="ml-2">at {alert.locationName}</span>
                )}
              </div>
              <div className="text-sm text-muted-foreground mt-1 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatDate(alert.createdAt)}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleToggleSelect(alert.id)}
              className="h-4 w-4 rounded border-gray-300"
            />
          </div>
        </div>
        <div className="flex items-center justify-end mt-2 space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewProduct(alert.productId)}
          >
            View Product
          </Button>
          {!alert.isRead && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkAsRead(alert.id)}
            >
              Mark as Read
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDismiss(alert.id)}
          >
            Dismiss
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Stock Alerts
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={notificationsEnabled ? "default" : "outline"}>
              {unreadAlerts.length} Unread
            </Badge>
            <Button variant="ghost" size="icon" onClick={onOpenSettings}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Alerts for low stock and critical inventory levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={handleToggleNotifications}
            />
            <Label htmlFor="notifications">
              {notificationsEnabled ? "Notifications enabled" : "Notifications disabled"}
            </Label>
          </div>
          {unreadAlerts.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All ({alerts.length})
            </TabsTrigger>
            <TabsTrigger value="critical">
              Critical ({criticalAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="warning">
              Warning ({warningAlerts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {alerts.length > 0 ? (
              <ScrollArea className="h-[400px] pr-4 mt-2">
                <div className="space-y-2">
                  {alerts.map(renderAlertItem)}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BellOff className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No stock alerts at this time</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="critical">
            {criticalAlerts.length > 0 ? (
              <ScrollArea className="h-[400px] pr-4 mt-2">
                <div className="space-y-2">
                  {criticalAlerts.map(renderAlertItem)}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-muted-foreground">No critical alerts at this time</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="warning">
            {warningAlerts.length > 0 ? (
              <ScrollArea className="h-[400px] pr-4 mt-2">
                <div className="space-y-2">
                  {warningAlerts.map(renderAlertItem)}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-muted-foreground">No warning alerts at this time</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="flex items-center space-x-2">
          {selectedAlerts.size > 0 ? (
            <Button variant="ghost" size="sm" onClick={handleDeselectAll}>
              Deselect All
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => handleSelectAll(alerts)}>
              Select All
            </Button>
          )}
          <Badge variant="outline">
            {selectedAlerts.size} selected
          </Badge>
        </div>
        <Button
          onClick={handleCreatePurchaseOrder}
          disabled={selectedAlerts.size === 0 || isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Create Purchase Order'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AlertNotificationCenter;
