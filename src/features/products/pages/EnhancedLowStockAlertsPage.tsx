import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/lib/toast';
import {
  AlertTriangle,
  Settings,
  Bell,
  BarChart3,
  RefreshCw,
  FileDown,
  Printer
} from 'lucide-react';
import {
  LowStockDashboard,
  AlertNotificationCenter,
  StockAlert,
  AlertNotificationManager,
  StockTrendAnalyzer
} from '../components/alerts';
import { useStockAlerts } from '../hooks/useStockAlerts';

// Mock data for notification settings
const mockNotificationSettings = {
  enableNotifications: true,
  channels: [
    {
      id: 'email',
      type: 'email',
      name: 'Email Notifications',
      enabled: true,
      recipients: ['admin@example.com']
    },
    {
      id: 'sms',
      type: 'sms',
      name: 'SMS Notifications',
      enabled: false
    },
    {
      id: 'push',
      type: 'push',
      name: 'Push Notifications',
      enabled: true
    },
    {
      id: 'slack',
      type: 'slack',
      name: 'Slack',
      enabled: false,
      webhookUrl: ''
    }
  ],
  digestEnabled: true,
  digestFrequency: 'daily' as const,
  digestTime: '09:00',
  criticalAlertChannels: ['email', 'push'],
  warningAlertChannels: ['email'],
  templates: {
    critical: 'critical-template',
    warning: 'warning-template',
    digest: 'digest-template'
  }
};

// Mock data for notification templates
const mockTemplates = [
  {
    id: 'critical-template',
    name: 'Critical Stock Alert',
    subject: 'CRITICAL: Low Stock Alert for {{productName}}',
    body: 'The stock level for {{productName}} (SKU: {{productSku}}) has reached a critical level of {{currentStock}} units, which is below the threshold of {{threshold}} units.\n\nPlease take immediate action to restock this product.',
    variables: ['productName', 'productSku', 'currentStock', 'threshold', 'location', 'date']
  },
  {
    id: 'warning-template',
    name: 'Warning Stock Alert',
    subject: 'WARNING: Low Stock Alert for {{productName}}',
    body: 'The stock level for {{productName}} (SKU: {{productSku}}) is running low with {{currentStock}} units remaining, which is below the warning threshold of {{threshold}} units.\n\nPlease consider restocking this product soon.',
    variables: ['productName', 'productSku', 'currentStock', 'threshold', 'location', 'date']
  },
  {
    id: 'digest-template',
    name: 'Stock Alert Digest',
    subject: 'Daily Stock Alert Digest - {{date}}',
    body: 'Here is your daily summary of low stock items:\n\nCritical Items: {{criticalCount}}\nWarning Items: {{warningCount}}\n\nPlease review the attached report for details.',
    variables: ['date', 'criticalCount', 'warningCount', 'totalCount']
  }
];

// Mock data for product stock trend
const mockProductStockTrend = {
  productId: 'prod-1',
  productName: 'Sample Product',
  productSku: 'SKU001',
  currentStock: 8,
  warningThreshold: 15,
  criticalThreshold: 5,
  stockHistory: Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const stock = Math.max(0, 30 - i + Math.floor(Math.random() * 5));
    const sales = Math.floor(Math.random() * 3);
    const received = i % 7 === 0 ? 10 : 0;
    return {
      date: date.toISOString(),
      stock,
      sales,
      received,
      transferred: 0,
      adjusted: 0
    };
  }),
  projectedDaysUntilStockout: 12,
  averageDailyUsage: 0.8,
  restockRecommendation: 20,
  lastRestockDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
};

// Mock categories and locations
const mockCategories = [
  { id: 'cat1', name: 'Electronics' },
  { id: 'cat2', name: 'Clothing' },
  { id: 'cat3', name: 'Food' },
  { id: 'cat4', name: 'Accessories' }
];

const mockLocations = [
  { id: 'loc1', name: 'Main Store' },
  { id: 'loc2', name: 'Warehouse' },
  { id: 'loc3', name: 'Online Store' }
];

export function EnhancedLowStockAlertsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    status?: string;
    category?: string;
    location?: string;
  }>({});

  // Use the stock alerts hook
  const {
    alerts,
    loading,
    error,
    totalCount,
    criticalCount,
    warningCount,
    fetchAlerts,
    createRestockOrder
  } = useStockAlerts();

  // Convert alerts to the StockAlert format
  const formattedAlerts: StockAlert[] = alerts.map(alert => ({
    id: alert.id,
    productId: alert.id,
    productName: alert.name,
    productSku: alert.sku,
    currentStock: alert.currentStock,
    threshold: alert.minThreshold,
    status: alert.status as 'critical' | 'warning',
    createdAt: alert.lastRestocked,
    isRead: false,
    locationName: 'Main Store'
  }));

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  useEffect(() => {
    // Fetch alerts when page, search, or filters change
    fetchAlerts({
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery,
      status: filters.status as 'critical' | 'warning' | undefined,
      category: filters.category
    });
  }, [currentPage, itemsPerPage, searchQuery, filters, fetchAlerts]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilter = (newFilters: { status?: string; category?: string; location?: string }) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchAlerts({
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery,
      status: filters.status as 'critical' | 'warning' | undefined,
      category: filters.category
    });

    toast({
      title: "Data Refreshed",
      description: "The stock alerts have been refreshed.",
    });
  };

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    toast({
      title: `Export as ${format.toUpperCase()}`,
      description: `The stock alerts have been exported as ${format.toUpperCase()}.`,
    });
  };

  const handlePrint = () => {
    toast({
      title: "Print",
      description: "The stock alerts have been sent to the printer.",
    });
  };

  const handleCreatePurchaseOrder = async (productIds: string[]) => {
    try {
      await createRestockOrder(productIds);
      return true;
    } catch (error) {
      console.error('Failed to create purchase order:', error);
      throw error;
    }
  };

  const handleViewProduct = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  const handleMarkAsRead = async (alertId: string) => {
    // In a real app, you would call an API to mark the alert as read
    toast({
      title: "Alert Marked as Read",
      description: "The alert has been marked as read.",
    });
    return Promise.resolve();
  };

  const handleMarkAllAsRead = async () => {
    // In a real app, you would call an API to mark all alerts as read
    toast({
      title: "All Alerts Marked as Read",
      description: "All alerts have been marked as read.",
    });
    return Promise.resolve();
  };

  const handleDismiss = async (alertId: string) => {
    // In a real app, you would call an API to dismiss the alert
    toast({
      title: "Alert Dismissed",
      description: "The alert has been dismissed.",
    });
    return Promise.resolve();
  };

  const handleSaveNotificationSettings = async (settings: any) => {
    // In a real app, you would call an API to save the settings
    toast({
      title: "Settings Saved",
      description: "Notification settings have been saved successfully.",
    });
    return Promise.resolve();
  };

  const handleTestNotification = async (channelId: string, templateId: string) => {
    // In a real app, you would call an API to send a test notification
    toast({
      title: "Test Notification Sent",
      description: `A test notification has been sent to the ${channelId} channel.`,
    });
    return Promise.resolve();
  };

  const handleTimeRangeChange = (range: '7d' | '30d' | '90d' | '1y') => {
    // In a real app, you would fetch new data for the selected time range
    toast({
      title: "Time Range Changed",
      description: `The time range has been changed to ${range}.`,
    });
  };

  const handleViewStockHistory = (productId: string) => {
    navigate(`/products/${productId}/stock-history`);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Low Stock Alerts"
        description="Monitor and manage products with low inventory levels"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        }
      />

      {showSettings ? (
        <AlertNotificationManager
          settings={mockNotificationSettings}
          templates={mockTemplates}
          onSave={handleSaveNotificationSettings}
          onTestNotification={handleTestNotification}
        />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="trends">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Stock Trends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <LowStockDashboard
              alerts={formattedAlerts}
              loading={loading}
              totalCount={totalCount}
              criticalCount={criticalCount}
              warningCount={warningCount}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onSearch={handleSearch}
              onFilter={handleFilter}
              onRefresh={handleRefresh}
              onExport={handleExport}
              onPrint={handlePrint}
              onCreatePurchaseOrder={handleCreatePurchaseOrder}
              onViewProduct={handleViewProduct}
              categories={mockCategories}
              locations={mockLocations}
            />
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <div className="flex justify-center">
              <AlertNotificationCenter
                alerts={formattedAlerts}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onDismiss={handleDismiss}
                onOpenSettings={() => setShowSettings(true)}
                onViewProduct={handleViewProduct}
                onCreatePurchaseOrder={handleCreatePurchaseOrder}
              />
            </div>
          </TabsContent>

          <TabsContent value="trends" className="mt-6">
            <StockTrendAnalyzer
              product={mockProductStockTrend}
              onExport={handleExport}
              onTimeRangeChange={handleTimeRangeChange}
              onViewStockHistory={handleViewStockHistory}
              onCreatePurchaseOrder={(productId, quantity) =>
                handleCreatePurchaseOrder([productId]).then(() => true)
              }
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default EnhancedLowStockAlertsPage;
