// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
// 👋 Attention, frontend developers! Listen up! From this moment on, I shall follow these sacred frontend development standards as if my code quality depended on it. No shortcuts, no excuses! 😤

import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  FileText,
  Package,
  DollarSign,
  BarChart,
  BarChart2,
  History
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { ProductImage } from '../components/ProductImage';
import { ProductHeader } from '../components/ProductHeader';
import { TemporaryProductAlert } from '../components/TemporaryProductAlert';
import {
  ProductDetailsTab,
  ProductInventoryTab,
  ProductPricingTab,
  ProductSalesHistoryTab,
  ProductAnalyticsTab,
  ProductHistoryTab
} from '../components/tabs';
import {
  StockTransferDialog,
  ReorderDialog,
  CategoryDialog,
  StockAdjustmentDialog,
  InventorySettingsDialog
} from '../components/dialogs';
import { QuickActionsPanel } from "../components/QuickActionsPanel";
import type { Product } from '../types';

// Mock data - replace with actual API call
const mockProduct: Product = {
  id: "prod-123456",
  name: "Premium Bluetooth Headphones",
  sku: "BT-HDPHN-001",
  barcode: "9876543210123",
  description: "High-quality wireless headphones with noise cancellation and 20-hour battery life.",
  shortDescription: "Premium wireless headphones with noise cancellation",
  productType: "single",
  brand: "AudioTech",
  category: "Electronics",
  supplier: {
    id: "sup-789",
    name: "AudioTech Supplies",
    contact: "contact@auditech.com",
    leadTime: "3-5 days",
    lastOrder: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
  },
  retailPrice: 129.99,
  costPrice: 79.99,
  salePrice: 99.99,
  stock: 45,
  minStock: 10,
  maxStock: 100,
  status: "active",
  images: ["/images/products/headphones-1.jpg", "/images/products/headphones-2.jpg"],
  gallery: ["/images/products/headphones-1.jpg", "/images/products/headphones-2.jpg", "/images/products/headphones-3.jpg"],
  tags: ["wireless", "audio", "bluetooth", "headphones"],
  attributes: [],
  variations: [],
  variants: [],
  locations: [
    { id: "loc-1", locationId: "loc-1", name: "Main Store", type: "store", stock: 25, minStock: 5, maxStock: 50 },
    { id: "loc-2", locationId: "loc-2", name: "Warehouse", type: "warehouse", stock: 20, minStock: 10, maxStock: 100 }
  ],
  nextRestock: new Date('2024-03-15').toISOString(),
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-02-20').toISOString(),
  isTemporary: false,
  lastRestock: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
  reorderPoint: 15,
  reorderQuantity: 30,
  lastCounted: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
  lastReceived: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
  lastSold: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
};

// Mock temporary product
const mockTemporaryProduct: Product = {
  id: "temp-789012",
  name: "New Wireless Earbuds",
  sku: "TEMP-123456",
  barcode: "",
  description: "",
  shortDescription: "",
  productType: "single",
  brand: "",
  category: "",
  supplier: {
    id: "",
    name: "",
    contact: "",
    leadTime: "",
    lastOrder: ""
  },
  retailPrice: 59.99,
  costPrice: 0,
  salePrice: 0,
  stock: 0,
  minStock: 0,
  maxStock: 100,
  status: "draft",
  images: [],
  gallery: [],
  tags: [],
  attributes: [],
  variations: [],
  variants: [],
  locations: [
    { id: "main", locationId: "main", stock: 0, minStock: 0, maxStock: 100 }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isTemporary: true,
  lastRestock: "",
  reorderPoint: 0,
  reorderQuantity: 0
};

// Mock analytics data - would be fetched from API in real implementation
const analyticsData = {
  totalSales: 1247,
  totalRevenue: 124589.99,
  totalProfit: 49835.96,
  salesTrend: [
    { month: 'Jan', sales: 78, revenue: 7799.22, profit: 3119.69 },
    { month: 'Feb', sales: 92, revenue: 9199.08, profit: 3679.63 },
    { month: 'Mar', sales: 103, revenue: 10299.97, profit: 4119.99 },
    { month: 'Apr', sales: 121, revenue: 12099.79, profit: 4839.92 },
    { month: 'May', sales: 134, revenue: 13399.66, profit: 5359.86 },
    { month: 'Jun', sales: 162, revenue: 16199.38, profit: 6479.75 },
    { month: 'Jul', sales: 176, revenue: 17599.24, profit: 7039.70 },
    { month: 'Aug', sales: 151, revenue: 15099.49, profit: 6039.80 },
    { month: 'Sep', sales: 129, revenue: 12899.71, profit: 5159.88 },
    { month: 'Oct', sales: 101, revenue: 10099.99, profit: 4040.00 }
  ]
};

// Available product categories with additional metadata
const productCategories = [
  { id: "electronics", name: "Electronics", icon: "Cpu", description: "Electronic devices and components" },
  { id: "clothing", name: "Clothing", icon: "Shirt", description: "Apparel and wearable items" },
  { id: "food-beverages", name: "Food & Beverages", icon: "Coffee", description: "Consumable food and drink products" },
  { id: "home-kitchen", name: "Home & Kitchen", icon: "Utensils", description: "Household and kitchen items" },
  { id: "beauty-personal-care", name: "Beauty & Personal Care", icon: "Scissors", description: "Beauty products and personal care items" },
  { id: "sports-outdoors", name: "Sports & Outdoors", icon: "Dumbbell", description: "Sports equipment and outdoor gear" },
  { id: "toys-games", name: "Toys & Games", icon: "Gamepad2", description: "Toys, games, and entertainment items" },
  { id: "books-media", name: "Books & Media", icon: "BookOpen", description: "Books, music, movies, and other media" },
  { id: "office-supplies", name: "Office Supplies", icon: "Briefcase", description: "Office equipment and supplies" },
  { id: "health-wellness", name: "Health & Wellness", icon: "Heart", description: "Health products and wellness items" }
];

export function ProductDetailsPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('90d');

  // Get the 'temp' query parameter to determine if we should show a temporary product
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isTemp = searchParams.get('temp') === 'true';

  // In a real app, fetch product data based on productId
  const product = isTemp ? mockTemporaryProduct : mockProduct;

  // Dialog states
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [reorderDialogOpen, setReorderDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [stockAdjustmentDialogOpen, setStockAdjustmentDialogOpen] = useState(false);
  const [inventorySettingsDialogOpen, setInventorySettingsDialogOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState('');

  // Helper to handle loading states
  const withLoading = async (key: string, action: () => Promise<void> | void) => {
    try {
      setLoading(prev => ({ ...prev, [key]: true }));
      await action();
    } catch (error) {
      console.error(`Error in ${key} action:`, error);
      toast({
        title: "Action Failed",
        description: `There was an error performing this action. Please try again.`
      });
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // Event handlers
  const handlePrintLabel = () => {
    withLoading('print', async () => {
      // Simulate preparing the label
      await new Promise(resolve => setTimeout(resolve, 800));

      toast({
        title: "Preparing Label",
        description: `Generating label for ${product.name}...`
      });

      // Simulate sending to printer
      await new Promise(resolve => setTimeout(resolve, 1200));

      toast({
        title: "Label Sent to Printer",
        description: `Label for ${product.name} (SKU: ${product.sku}) has been sent to the default printer.`,
        variant: "success"
      });

      // In a real app, this would use the browser's print API or a dedicated label printing service
      // window.print() or API call to a label printing service
    });
  };

  const handleCreatePurchaseOrder = () => {
    withLoading('purchaseOrder', async () => {
      navigate(`/products/${productId}/reorder`);
    });
  };

  const handleViewHistory = () => {
    withLoading('history', async () => {
      navigate(`/products/${productId}/history`);
    });
  };

  const handleManagePrice = () => {
    withLoading('price', async () => {
      navigate(`/products/${productId}/pricing`);
    });
  };

  const handleCategorize = () => {
    setCategoryDialogOpen(true);
  };

  const handleSaveCategories = (categories: string[]) => {
    withLoading('categorize', async () => {
      // In a real app, you would save the categories to the backend
      await new Promise(resolve => setTimeout(resolve, 800));

      toast({
        title: "Categories Updated",
        description: `Updated categories for ${product.name}`
      });
    });
  };

  const handleEditProduct = () => {
    withLoading('edit', async () => {
      // Check if the product is temporary and use the appropriate route
      if (product.isTemporary) {
        navigate(`/products/edit/${product.id}`);
      } else {
        navigate(`/products/${product.id}/edit`);
      }

      // Log for debugging
      console.log(`Navigating to edit product: ${product.id}`);

      // Show toast for feedback
      toast({
        title: "Edit Product",
        description: `Opening editor for ${product.name}`
      });
    });
  };

  const handleViewAnalytics = () => {
    withLoading('analytics', async () => {
      navigate(`/products/${productId}/analytics`, {
        state: {
          productData: {
            id: productId,
            name: product.name,
            sku: product.sku,
            // Include essential product data for analytics context
            salesData: analyticsData.salesTrend,
            revenueData: analyticsData.salesTrend,
            profitData: analyticsData.salesTrend
          }
        }
      });
    });
  };

  const handleStockTransfer = () => {
    setTransferDialogOpen(true);
  };

  const handleReorder = () => {
    setReorderDialogOpen(true);
  };

  const handleExportReport = () => {
    withLoading('export', async () => {
      // Simulate preparing the report
      toast({
        title: "Preparing Report",
        description: `Generating product report for ${product.name}...`
      });

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In a real app, this would generate a file and trigger a download
      // For now, we'll just simulate the download with a toast

      const fileName = `${product.sku.toLowerCase()}_report_${new Date().toISOString().split('T')[0]}.pdf`;

      toast({
        title: "Report Ready",
        description: `Report '${fileName}' has been generated and downloaded.`,
        variant: "success"
      });

      // In a real app, this would be:
      // const blob = new Blob([reportData], { type: 'application/pdf' });
      // const url = URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = fileName;
      // a.click();
    });
  };

  // Handle completing a temporary product
  const handleCompleteProduct = () => {
    withLoading('complete', async () => {
      navigate(`/products/edit/${productId}`);
    });
  };

  // Inventory management functions
  const handleEditInventorySettings = () => {
    setInventorySettingsDialogOpen(true);
  };

  const handleAdjustStock = (locationId: string) => {
    setSelectedLocationId(locationId);
    setStockAdjustmentDialogOpen(true);
  };

  const handleSaveInventorySettings = (settings: {
    minStock: number;
    reorderPoint: number;
    reorderQuantity: number;
  }) => {
    withLoading('saveSettings', async () => {
      // In a real app, you would call an API to update the settings
      await new Promise(resolve => setTimeout(resolve, 800));

      toast({
        title: "Settings Updated",
        description: `Updated inventory settings for ${product.name}`
      });
    });
  };

  const handleAdjustStockSubmit = (locationId: string, adjustmentType: 'add' | 'remove' | 'set', quantity: number, reason: string) => {
    withLoading('adjustStock', async () => {
      // In a real app, you would call an API to adjust the stock
      await new Promise(resolve => setTimeout(resolve, 800));

      const actionText = adjustmentType === 'add' ? 'Added' : adjustmentType === 'remove' ? 'Removed' : 'Set';
      const locationName = product.locations?.find(loc => loc.id === locationId || loc.locationId === locationId)?.name || locationId;

      toast({
        title: "Stock Adjusted",
        description: `${actionText} ${quantity} units ${adjustmentType === 'set' ? 'to' : adjustmentType === 'add' ? 'to' : 'from'} ${locationName}`
      });
    });
  };

  const handleTransferStock = (sourceLocationId: string, destinationLocationId: string, quantity: number) => {
    withLoading('transfer', async () => {
      // In a real app, you would call an API to transfer stock
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Stock Transferred",
        description: `Transferred ${quantity} units from ${sourceLocationId} to ${destinationLocationId}`
      });
    });
  };

  const handleReorderStock = (quantity: number, expectedDeliveryDate: string, notes: string) => {
    withLoading('reorder', async () => {
      // In a real app, you would call an API to create a purchase order
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Purchase Order Created",
        description: `Created order for ${quantity} units of ${product.name}`
      });
    });
  };

  const handleNavigateToSupplier = (supplierId: string) => {
    navigate(`/suppliers/${supplierId}`);
  };

  return (
    <div className="w-full pb-6 space-y-2">
      {/* Header */}
      <ProductHeader
        product={product}
        onBack={() => navigate(-1)}
        onViewAnalytics={handleViewAnalytics}
        onStockTransfer={handleStockTransfer}
        onReorder={handleReorder}
        onCategorize={handleCategorize}
        onEditProduct={handleEditProduct}
      />

      {/* Temporary Product Banner */}
      {product.isTemporary && (
        <TemporaryProductAlert onComplete={handleCompleteProduct} />
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Product Image */}
          <Card>
            <CardContent className="pt-6">
              <ProductImage image={product.images?.[0] || product.imageUrl} />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent className="pt-6">
              <QuickActionsPanel
                product={product}
                onEdit={handleEditProduct}
                onPrintLabel={handlePrintLabel}
                onCreatePurchaseOrder={handleReorder}
                onManagePrice={handleManagePrice}
                onCategorize={handleCategorize}
                onViewHistory={() => navigate(`/products/${productId}/history`)}
                onExportReport={handleExportReport}
                onTransfer={handleStockTransfer}
              />
            </CardContent>
          </Card>
        </div>

        {/* Main content area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Main content tabs */}
          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="w-full grid grid-cols-6">
                  <TabsTrigger value="details" className="flex items-center justify-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="inventory" className="flex items-center justify-center">
                    <Package className="h-4 w-4 mr-2" />
                    Inventory
                  </TabsTrigger>
                  <TabsTrigger value="pricing" className="flex items-center justify-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Pricing
                  </TabsTrigger>
                  <TabsTrigger value="sales-history" className="flex items-center justify-center">
                    <BarChart className="h-4 w-4 mr-2" />
                    Sales History
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex items-center justify-center">
                    <BarChart2 className="h-4 w-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center justify-center">
                    <History className="h-4 w-4 mr-2" />
                    History
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6 space-y-6">
                  {/* Details Tab */}
                  <TabsContent value="details">
                    <ProductDetailsTab
                      product={product}
                      onCompleteProduct={handleCompleteProduct}
                      onNavigateToSupplier={handleNavigateToSupplier}
                    />
                  </TabsContent>

                  {/* Inventory Tab */}
                  <TabsContent value="inventory">
                    <ProductInventoryTab
                      product={product}
                      onCompleteProduct={handleCompleteProduct}
                      onEditInventorySettings={handleEditInventorySettings}
                      onAdjustStock={handleAdjustStock}
                      onStockTransfer={handleStockTransfer}
                      onReorder={handleReorder}
                    />
                  </TabsContent>

                  {/* Pricing Tab */}
                  <TabsContent value="pricing">
                    <ProductPricingTab
                      product={product}
                      onManagePrice={handleManagePrice}
                    />
                  </TabsContent>

                  {/* Sales History Tab */}
                  <TabsContent value="sales-history">
                    <ProductSalesHistoryTab
                      product={product}
                      timeRange={timeRange}
                      onTimeRangeChange={setTimeRange}
                      analyticsData={analyticsData}
                    />
                  </TabsContent>

                  {/* Analytics Tab */}
                  <TabsContent value="analytics">
                    <ProductAnalyticsTab
                      product={product}
                      timeRange={timeRange}
                      onTimeRangeChange={setTimeRange}
                      analyticsData={analyticsData}
                    />
                  </TabsContent>

                  {/* History Tab */}
                  <TabsContent value="history">
                    <ProductHistoryTab product={product} />
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <StockTransferDialog
        product={product}
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
        onTransfer={handleTransferStock}
      />

      <ReorderDialog
        product={product}
        open={reorderDialogOpen}
        onOpenChange={setReorderDialogOpen}
        onReorder={handleReorderStock}
      />

      <CategoryDialog
        product={product}
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onSave={handleSaveCategories}
        productCategories={productCategories}
      />

      <StockAdjustmentDialog
        product={product}
        locationId={selectedLocationId}
        open={stockAdjustmentDialogOpen}
        onOpenChange={setStockAdjustmentDialogOpen}
        onAdjustStock={handleAdjustStockSubmit}
      />

      <InventorySettingsDialog
        product={product}
        open={inventorySettingsDialogOpen}
        onOpenChange={setInventorySettingsDialogOpen}
        onSaveSettings={handleSaveInventorySettings}
      />
    </div>
  );
}
