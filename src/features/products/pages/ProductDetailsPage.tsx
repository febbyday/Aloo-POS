// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
// 👋 Attention, frontend developers! Listen up! From this moment on, I shall follow these sacred frontend development standards as if my code quality depended on it. No shortcuts, no excuses! 😤

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { 
  Activity,
  AlertCircle,
  AlertTriangle,
  AlignLeft,
  ArrowRight,
  BarChart2,
  BarChart,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  ClipboardList,
  DollarSign,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  Hash,
  History,
  LineChart,
  Link,
  MapPin,
  MoreHorizontal,
  Package,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ShoppingCart,
  Store,
  Tag,
  Truck,
  User,
  X,
  Tags,
  Check,
  Cpu,
  Shirt,
  Coffee,
  Utensils,
  Scissors,
  Dumbbell,
  Gamepad2,
  BookOpen,
  Briefcase,
  Heart,
  FolderTree,
  FolderOpen,
  Folder
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn, formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import type { Product } from '../types';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Image as Img } from "@/components/ui/image";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PriceDetailsTable, ProductPriceHistoryTable, PricingOverview } from '../components/pricing';
import { PriceHistoryChart } from '../components/PriceHistoryChart';
import { 
  SalesStatsCharts,
  ProductStatsOverview
} from '../components/stats';

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
    { locationId: "loc-1", name: "Main Store", type: "store", stock: 25, minStock: 5, maxStock: 50 },
    { locationId: "loc-2", name: "Warehouse", type: "warehouse", stock: 20, minStock: 10, maxStock: 100 }
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
    { locationId: "main", stock: 0, minStock: 0, maxStock: 100 }
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

import { PageHeader } from "@/components/page-header";
import { QuickActionsPanel } from "../components/QuickActionsPanel";
import { ProductImageGallery } from '../components/ProductImageGallery';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

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

  const handlePrintLabel = () => {
    withLoading('print', async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Printing Label", 
        description: `Preparing to print label for ${product.name}.`
      });
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
  
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    product.category ? [product.category] : []
  );
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);

  // Stock transfer dialog state
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [sourceLocationId, setSourceLocationId] = useState('');
  const [destinationLocationId, setDestinationLocationId] = useState('');
  const [transferQuantity, setTransferQuantity] = useState(1);

  // Reorder dialog state
  const [reorderDialogOpen, setReorderDialogOpen] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(product.reorderQuantity || 10);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

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
  
  const handleSaveCategories = () => {
    withLoading('categorize', async () => {
      // In a real app, you would save the categories to the backend
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Categories Updated",
        description: `Updated categories for ${product.name}`
      });
      
      setCategoryDialogOpen(false);
    });
  };

  const handleEditProduct = () => {
    withLoading('edit', async () => {
      navigate(`/products/${product.id}/edit`);
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
      toast({
        title: "Exporting Report",
        description: `Preparing product report for ${product.name}`
      });
      // Implement report export logic
    });
  };

  // Handle completing a temporary product
  const handleCompleteProduct = () => {
    withLoading('complete', async () => {
      navigate(`/products/edit/${productId}`);
    });
  };

  // Function to determine stock status
  const getStockStatus = () => {
    const totalStock = product.locations && Array.isArray(product.locations) 
      ? product.locations.reduce((sum, loc) => sum + (loc.stock || 0), 0)
      : product.stock || 0;
      
    if (totalStock <= 0) return 'Out of Stock';
    if (totalStock <= (product.minStock || 0)) return 'Low Stock';
    return 'In Stock';
  };

  // Inventory management functions
  const handleEditInventorySettings = () => {
    // In a real app, this would open a dialog to edit inventory settings
    toast({
      title: "Edit Inventory Settings",
      description: "This would open a dialog to edit inventory settings"
    });
  };

  const handleAdjustStock = (locationId: string) => {
    // In a real app, this would open a dialog to adjust stock
    toast({
      title: "Adjust Stock",
      description: `This would open a dialog to adjust stock for location ${locationId}`
    });
  };

  // Add a function to handle adding a new category
  const handleAddNewCategory = () => {
    if (!newCategoryName.trim()) return;
    
    // Check if the category already exists
    const categoryExists = productCategories.some(
      c => c.name.toLowerCase() === newCategoryName.trim().toLowerCase()
    );
    
    if (categoryExists) {
      toast({
        title: "Category already exists",
        description: "Please use a different name for the new category",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, you would add the category to the backend
    // For now, we'll just add it to the selected categories
    setSelectedCategories(prev => [...prev, newCategoryName.trim()]);
    setNewCategoryName('');
    setIsAddingNewCategory(false);
    
    toast({
      title: "Category Added",
      description: `Added "${newCategoryName.trim()}" to selected categories`
    });
  };

  return (
    <div className="w-full pb-6 space-y-2">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              className="gap-2"
              onClick={() => navigate(-1)}
            >
              <ArrowRight className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">{product.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={handleViewAnalytics}>
                    <BarChart2 className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View sales, revenue and performance analytics</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={handleStockTransfer}>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Transfer
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Transfer stock between locations</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={handleReorder}>
                    <Truck className="h-4 w-4 mr-2" />
                    Reorder
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Create purchase order for restock</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={handleCategorize}>
                    <Tag className="h-4 w-4 mr-2" />
                    Categorize
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Manage product categories and tags</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={handleEditProduct}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Product
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit product details</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 px-3 py-2 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="product-status"
                        checked={product.status === 'active'} 
                        onCheckedChange={(checked: boolean) => {
                          // Here you would typically update the product status
                          toast({
                            title: `Product ${checked ? 'activated' : 'deactivated'}`,
                            description: `${product.name} is now ${checked ? 'active' : 'inactive'}`
                          });
                        }} 
                        disabled={product.isTemporary}
                      />
                      <Label htmlFor="product-status" className="text-sm font-medium">
                        {product.isTemporary 
                          ? 'Temporary' 
                          : product.status === 'active' 
                            ? 'Active' 
                            : 'Inactive'}
                      </Label>
                    </div>
                    {product.isTemporary && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Temporary
                      </Badge>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>Toggle product active status</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {/* Temporary Product Banner */}
        {product.isTemporary && (
          <Alert className="mb-4 border-yellow-300 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Temporary Product</AlertTitle>
            <AlertDescription className="text-yellow-700">
              This is a temporary product with minimal information. Complete the product details to make it fully functional.
            </AlertDescription>
            <Button 
              variant="outline" 
              className="mt-2 border-yellow-300 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-900" 
              onClick={handleCompleteProduct}
            >
              <Clock className="h-4 w-4 mr-2" />
              Complete Product Details
            </Button>
          </Alert>
        )}
        
        <div className="flex items-center gap-2 justify-end">
        </div>
      </div>
      
      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Product Image Gallery */}
          <Card>
            <CardContent className="pt-6">
              <ProductImageGallery images={product.images || (product.imageUrl ? [product.imageUrl] : [])} />
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
                  <TabsContent value="details" className="space-y-6">
                    {/* Product Overview */}
                    <div className="bg-card rounded-lg border shadow-sm p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-primary" />
                          Product Overview
                        </h3>
                      </div>
                      
                          <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium">SKU</h3>
                          <p className="text-sm text-muted-foreground">{product.sku}</p>
                              </div>
                        <div>
                          <h3 className="text-sm font-medium">Barcode</h3>
                          <p className="text-sm text-muted-foreground">
                            {product.barcode || (product.isTemporary ? 
                              <span className="italic text-gray-400">Not specified</span> : 
                              "N/A")}
                          </p>
                            </div>
                        <div>
                          <h3 className="text-sm font-medium">Category</h3>
                          <p className="text-sm text-muted-foreground">
                            {product.category || (product.isTemporary ? 
                              <span className="italic text-gray-400">Not specified</span> : 
                              "Uncategorized")}
                          </p>
                              </div>
                        <div>
                          <h3 className="text-sm font-medium">Brand</h3>
                          <p className="text-sm text-muted-foreground">
                            {product.brand || (product.isTemporary ? 
                              <span className="italic text-gray-400">Not specified</span> : 
                              "No brand")}
                          </p>
                            </div>
                          <div>
                          <h3 className="text-sm font-medium">Supplier</h3>
                          <p className="text-sm text-muted-foreground">
                            {product.supplier?.name || (product.isTemporary ? 
                              <span className="italic text-gray-400">Not specified</span> : 
                              "No supplier")}
                          </p>
                            </div>
                          <div>
                          <h3 className="text-sm font-medium">Created</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(product.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="text-sm font-medium flex items-center">
                          <AlignLeft className="h-4 w-4 mr-2 text-primary" />
                          Short Description
                        </h3>
                        <div className="mt-2 p-4 bg-muted/50 rounded-md">
                          <p className="text-sm">
                            {product.shortDescription || (product.description ? 
                              product.description.substring(0, 100) + (product.description.length > 100 ? "..." : "") : 
                              "No short description available.")}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h3 className="text-sm font-medium flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-primary" />
                          Description
                        </h3>
                        <div className="mt-2 p-4 bg-muted/50 rounded-md">
                          <p className="text-sm">
                            {product.description || "No description provided for this product."}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Card */}
                    <div className="bg-card rounded-lg border shadow-sm p-6">
                      <div className="flex items-center mb-4">
                        <Tag className="h-5 w-5 mr-2 text-primary" />
                        <h3 className="text-lg font-semibold">Pricing</h3>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div>
                          <h3 className="text-sm font-medium">Retail Price</h3>
                          <p className="text-lg font-bold">${product.retailPrice.toFixed(2)}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">Cost Price</h3>
                          <p className="text-lg font-medium">
                            {product.costPrice ? 
                              `$${product.costPrice.toFixed(2)}` : 
                              (product.isTemporary ? 
                                <span className="italic text-gray-400">Not set</span> : 
                                "$0.00")}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">Sale Price</h3>
                          <p className="text-lg font-medium">
                            {product.salePrice ? 
                              <span className="text-green-600">${product.salePrice.toFixed(2)}</span> : 
                              (product.isTemporary ? 
                                <span className="italic text-gray-400">Not set</span> : 
                                "No sale")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Supplier Information */}
                    {product.supplier && product.supplier.name && (
                      <div className="mt-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium flex items-center">
                            <Building className="h-4 w-4 mr-2 text-primary" />
                            Supplier
                          </h3>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => navigate(`/suppliers/${product.supplier?.id}`)}
                            disabled={!product.supplier?.id}
                          >
                            View Supplier
                          </Button>
                        </div>
                        <div className="flex items-center gap-3 mt-2 p-3 bg-muted/30 rounded-md">
                          <Avatar>
                            <AvatarImage src={`/assets/suppliers/${product.supplier?.id}.png`} alt={product.supplier?.name} />
                            <AvatarFallback>{product.supplier?.name?.substring(0, 2).toUpperCase() || 'NA'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{product.supplier?.name}</p>
                            <p className="text-sm text-muted-foreground">{product.supplier?.contact || 'No contact info'}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div className="space-y-1">
                            <h3 className="text-sm font-medium flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-primary" />
                              Lead Time
                            </h3>
                            <p className="font-medium">{product.supplier?.leadTime || 'N/A'} days</p>
                            </div>
                          <div className="space-y-1">
                            <h3 className="text-sm font-medium flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-primary" />
                              Last Order
                            </h3>
                            <p className="font-medium">{product.supplier?.lastOrder ? new Date(product.supplier.lastOrder).toLocaleDateString() : 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="inventory" className="space-y-6">
                    {product.isTemporary ? (
                      <Alert className="mb-4 border-yellow-300 bg-yellow-50">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertTitle className="text-yellow-800">Temporary Product</AlertTitle>
                        <AlertDescription className="text-yellow-700">
                          Inventory tracking is not set up for this temporary product. 
                          Complete the product details to enable full inventory management.
                        </AlertDescription>
                        <Button 
                          variant="outline" 
                          className="mt-2 border-yellow-300 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-900" 
                          onClick={handleCompleteProduct}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Complete Product Details
                        </Button>
                      </Alert>
                    ) : (
                    <div className="grid grid-cols-1 gap-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Inventory Settings */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold flex items-center">
                              <Settings className="h-4 w-4 mr-2 text-primary" />
                              Inventory Settings
                            </h4>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={handleEditInventorySettings}
                              className="text-xs"
                            >
                              <Edit className="h-3.5 w-3.5 mr-1" />
                              Edit Settings
                            </Button>
                          </div>
                          <Card className="overflow-hidden">
                            <CardContent className="p-0">
                              <div className="grid grid-cols-2 divide-x divide-y">
                                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
                                  <div className="flex flex-col items-center justify-center text-center h-full">
                                    <span className="text-sm text-muted-foreground">Min Stock</span>
                                    <div className="flex items-center mt-1">
                                      <Shield className="h-4 w-4 mr-1.5 text-blue-500" />
                                      <p className="text-2xl font-semibold">{product.minStock || '0'}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Safety threshold</p>
                                  </div>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20">
                                  <div className="flex flex-col items-center justify-center text-center h-full">
                                    <span className="text-sm text-muted-foreground">Reorder Point</span>
                                    <div className="flex items-center mt-1">
                                      <AlertTriangle className="h-4 w-4 mr-1.5 text-amber-500" />
                                      <p className="text-2xl font-semibold">{product.reorderPoint || '0'}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Order trigger level</p>
                                  </div>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
                                  <div className="flex flex-col items-center justify-center text-center h-full">
                                    <span className="text-sm text-muted-foreground">Reorder Quantity</span>
                                    <div className="flex items-center mt-1">
                                      <ShoppingCart className="h-4 w-4 mr-1.5 text-green-500" />
                                      <p className="text-2xl font-semibold">{product.reorderQuantity || '0'}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Default order amount</p>
                                  </div>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
                                  <div className="flex flex-col items-center justify-center text-center h-full">
                                    <span className="text-sm text-muted-foreground">Total Stock</span>
                                    <div className="flex items-center mt-1">
                                      <Package className="h-4 w-4 mr-1.5 text-purple-500" />
                                      <p className="text-2xl font-semibold">{
                                          product.locations && Array.isArray(product.locations) 
                                            ? product.locations.reduce((sum, loc) => sum + (loc.stock || 0), 0)
                                            : product.stock || 0
                                      }</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Units across all locations</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        
                        {/* Inventory Status */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold flex items-center">
                              <Activity className="h-4 w-4 mr-2 text-primary" />
                              Inventory Status
                            </h4>
                            <Badge variant={
                              getStockStatus() === 'Out of Stock' 
                                ? 'destructive' 
                                : getStockStatus() === 'Low Stock' 
                                ? 'outline'
                                : 'default'
                            } className={
                              getStockStatus() === 'Out of Stock' 
                                ? 'bg-red-100 text-red-800 hover:bg-red-100' 
                                : getStockStatus() === 'Low Stock' 
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                                : 'bg-green-100 text-green-800 hover:bg-green-100'
                            }>
                              {getStockStatus()}
                            </Badge>
                          </div>
                          <Card>
                            <CardContent className="p-0">
                              <div className="divide-y">
                                <div className="p-4 border-b">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mr-3">
                                        <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                      </div>
                                      <div>
                                        <p className="font-medium">Last Counted</p>
                                        <p className="text-sm text-muted-foreground">Physical inventory check</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold">{product.lastCounted 
                                        ? new Date(product.lastCounted).toLocaleDateString() 
                                        : 'Never'}</p>
                                      {product.lastCounted && (
                                        <p className="text-xs text-muted-foreground">
                                          {new Date(product.lastCounted).toLocaleTimeString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="p-4 border-b">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mr-3">
                                        <Truck className="h-4 w-4 text-green-600 dark:text-green-400" />
                                      </div>
                                      <div>
                                        <p className="font-medium">Last Received</p>
                                        <p className="text-sm text-muted-foreground">Inventory restocked</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold">{product.lastReceived 
                                        ? new Date(product.lastReceived).toLocaleDateString() 
                                        : 'Never'}</p>
                                      {product.lastReceived && (
                                        <p className="text-xs text-muted-foreground">
                                          {new Date(product.lastReceived).toLocaleTimeString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="p-4 border-b">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full mr-3">
                                        <ShoppingCart className="h-4 w-4 text-red-600 dark:text-red-400" />
                                      </div>
                                      <div>
                                        <p className="font-medium">Last Sold</p>
                                        <p className="text-sm text-muted-foreground">Most recent sale</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold">{product.lastSold 
                                        ? new Date(product.lastSold).toLocaleDateString() 
                                        : 'Never'}</p>
                                      {product.lastSold && (
                                        <p className="text-xs text-muted-foreground">
                                          {new Date(product.lastSold).toLocaleTimeString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      {/* Stock Locations */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-primary" />
                            Stock Locations
                          </h4>
                          <Button variant="outline" size="sm" onClick={handleStockTransfer}>
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Transfer Stock
                          </Button>
                        </div>
                        <Card>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[180px]">
                                  <div className="flex items-center">
                                    <Store className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                    Location
                                  </div>
                                </TableHead>
                                <TableHead>
                                  <div className="flex items-center">
                                    <Package className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                    Current Stock
                                  </div>
                                </TableHead>
                                <TableHead>
                                  <div className="flex items-center">
                                    <Shield className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                    Min Stock
                                  </div>
                                </TableHead>
                                <TableHead>
                                  <div className="flex items-center">
                                    <Activity className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                    Status
                                  </div>
                                </TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {product.locations && Array.isArray(product.locations) ? (
                                product.locations.map((location) => (
                                  <TableRow key={location.id}>
                                    <TableCell className="font-medium">{location.name}</TableCell>
                                    <TableCell>{location.stock || 0}</TableCell>
                                    <TableCell>{location.minStock || 0}</TableCell>
                                    <TableCell>
                                      {(location.stock || 0) <= 0 ? (
                                        <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">Out of Stock</Badge>
                                      ) : (location.stock || 0) <= (location.minStock || 0) ? (
                                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Low Stock</Badge>
                                      ) : (
                                        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">In Stock</Badge>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button variant="ghost" size="icon" onClick={() => handleAdjustStock(location.id)}>
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                                    No location data available
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </Card>
                      </div>

                      {/* Stock Order History */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold flex items-center">
                            <ClipboardList className="h-4 w-4 mr-2 text-primary" />
                            Stock Order History
                          </h4>
                          <Button variant="outline" size="sm" onClick={handleReorder}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create New Order
                          </Button>
                        </div>
                        <Card>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>
                                  <div className="flex items-center">
                                    <Hash className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                    Order #
                                  </div>
                                </TableHead>
                                <TableHead>
                                  <div className="flex items-center">
                                    <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                    Date
                                  </div>
                                </TableHead>
                                <TableHead>
                                  <div className="flex items-center">
                                    <Building className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                    Supplier
                                  </div>
                                </TableHead>
                                <TableHead>
                                  <div className="flex items-center">
                                    <Package className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                    Quantity
                                  </div>
                                </TableHead>
                                <TableHead>
                                  <div className="flex items-center">
                                    <CheckCircle className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                    Status
                                  </div>
                                </TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {/* Mock data for order history - would be replaced with actual data */}
                              {[
                                { 
                                  id: 'PO-2025-0042', 
                                  date: '2025-03-01', 
                                  supplier: 'Tech Supplies Inc.', 
                                  quantity: 25, 
                                  status: 'Delivered' 
                                },
                                { 
                                  id: 'PO-2025-0036', 
                                  date: '2025-02-15', 
                                  supplier: 'Tech Supplies Inc.', 
                                  quantity: 15, 
                                  status: 'Delivered' 
                                },
                                { 
                                  id: 'PO-2025-0021', 
                                  date: '2025-01-20', 
                                  supplier: 'Global Electronics', 
                                  quantity: 30, 
                                  status: 'Delivered' 
                                },
                                { 
                                  id: 'PO-2024-0198', 
                                  date: '2024-12-05', 
                                  supplier: 'Tech Supplies Inc.', 
                                  quantity: 20, 
                                  status: 'Delivered' 
                                }
                              ].map((order) => (
                                <TableRow key={order.id}>
                                  <TableCell className="font-medium">{order.id}</TableCell>
                                  <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                                  <TableCell>{order.supplier}</TableCell>
                                  <TableCell>{order.quantity}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className={
                                      order.status === 'Delivered' 
                                        ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                                        : order.status === 'In Transit' 
                                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                                        : order.status === 'Processing'
                                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                                    }>
                                      {order.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => navigate(`/inventory/purchase-orders/${order.id}`)}>
                                          <Eye className="h-4 w-4 mr-2" />
                                          View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => window.open(`/inventory/purchase-orders/${order.id}/invoice`, '_blank')}>
                                          <FileText className="h-4 w-4 mr-2" />
                                          View Invoice
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleReorder()}>
                                          <RefreshCw className="h-4 w-4 mr-2" />
                                          Reorder
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Card>
                      </div>

                      {/* Stock Movement History */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold flex items-center">
                            <History className="h-4 w-4 mr-2 text-primary" />
                            Stock Movement History
                          </h4>
                          <Button variant="outline" size="sm" onClick={() => {}}>
                            <FileText className="h-4 w-4 mr-2" />
                            Export Report
                          </Button>
                        </div>
                        <Card>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>
                                  <div className="flex items-center">
                                    <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                    Date
                                  </div>
                                </TableHead>
                                <TableHead>
                                  <div className="flex items-center">
                                    <Activity className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                    Type
                                  </div>
                                </TableHead>
                                <TableHead>
                                  <div className="flex items-center">
                                    <Store className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                    Location
                                  </div>
                                </TableHead>
                                <TableHead>
                                  <div className="flex items-center">
                                    <Package className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                    Quantity
                                  </div>
                                </TableHead>
                                <TableHead>
                                  <div className="flex items-center">
                                    <User className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                    User
                                  </div>
                                </TableHead>
                                <TableHead className="text-right">
                                  <div className="flex items-center justify-end">
                                    <FileText className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                    Notes
                                  </div>
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {/* Mock data for stock movements - would be replaced with actual data */}
                              {[
                                { 
                                  id: 1, 
                                  date: '2025-03-10', 
                                  type: 'Transfer', 
                                  from: 'Warehouse', 
                                  to: 'Store Front', 
                                  quantity: 5,
                                  user: 'John Doe',
                                  notes: 'Regular stock rotation'
                                },
                                { 
                                  id: 2, 
                                  date: '2025-03-05', 
                                  type: 'Adjustment', 
                                  from: 'Warehouse', 
                                  to: 'Warehouse', 
                                  quantity: -2,
                                  user: 'Jane Smith',
                                  notes: 'Damaged inventory'
                                },
                                { 
                                  id: 3, 
                                  date: '2025-03-01', 
                                  type: 'Received', 
                                  from: 'Supplier', 
                                  to: 'Warehouse', 
                                  quantity: 25,
                                  user: 'John Doe',
                                  notes: 'PO #12345'
                                },
                                { 
                                  id: 4, 
                                  date: '2025-02-20', 
                                  type: 'Sale', 
                                  from: 'Store Front', 
                                  to: 'Customer', 
                                  quantity: -3,
                                  user: 'System',
                                  notes: 'Order #7890'
                                }
                              ].map((movement) => (
                                <TableRow key={movement.id}>
                                  <TableCell>{new Date(movement.date).toLocaleDateString()}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center">
                                      {movement.type === 'Transfer' && <ArrowRight className="h-4 w-4 mr-2 text-blue-500" />}
                                      {movement.type === 'Adjustment' && <Edit className="h-4 w-4 mr-2 text-amber-500" />}
                                      {movement.type === 'Received' && <Truck className="h-4 w-4 mr-2 text-green-500" />}
                                      {movement.type === 'Sale' && <ShoppingCart className="h-4 w-4 mr-2 text-purple-500" />}
                                      {movement.type}
                                    </div>
                                  </TableCell>
                                  <TableCell>{movement.from}</TableCell>
                                  <TableCell>{movement.to}</TableCell>
                                  <TableCell className={
                                    movement.quantity > 0 
                                      ? 'text-green-600 font-medium' 
                                      : 'text-red-600 font-medium'
                                  }>
                                    {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}
                                  </TableCell>
                                  <TableCell>{movement.user}</TableCell>
                                  <TableCell className="text-right">{movement.notes}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Card>
                      </div>
                    </div>
                    )}
                  </TabsContent>

                  {/* New Pricing Tab Content */}
                  <TabsContent value="pricing" className="space-y-6">
                    {product.isTemporary ? (
                      <Alert className="mb-4 border-yellow-300 bg-yellow-50">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertTitle className="text-yellow-800">Temporary Product</AlertTitle>
                        <AlertDescription className="text-yellow-700">
                          Limited pricing information is available for this temporary product.
                          Complete the product details to enable full pricing features.
                        </AlertDescription>
                        <Button 
                          variant="outline" 
                          className="mt-2 border-yellow-300 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-900" 
                          onClick={handleCompleteProduct}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Complete Product Details
                        </Button>
                      </Alert>
                    ) : (
                      <div className="space-y-6">
                        {/* Price Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-muted-foreground">Retail Price</p>
                                  <div className="text-2xl font-bold">${product.retailPrice.toFixed(2)}</div>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Tag className="h-6 w-6 text-primary" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-muted-foreground">Cost Price</p>
                                  <div className="text-2xl font-bold">${product.costPrice.toFixed(2)}</div>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                                  <DollarSign className="h-6 w-6 text-destructive" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-muted-foreground">Profit Margin</p>
                                  <div className="text-2xl font-bold">
                                    {product.costPrice ? 
                                      `${(((product.retailPrice - product.costPrice) / product.retailPrice) * 100).toFixed(1)}%` : 
                                      "N/A"}
                                  </div>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                                  <LineChart className="h-6 w-6 text-green-500" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Pricing Actions */}
                        <div className="flex justify-end">
                          <Button 
                            onClick={handleManagePrice}
                            className="flex items-center gap-2"
                          >
                            <DollarSign className="h-4 w-4" />
                            Manage Prices
                          </Button>
                        </div>

                        {/* Use the new PricingOverview component */}
                        <PricingOverview product={product} />

                        {/* Additional pricing information can be added here if needed */}
                    </div>
                    )}
                  </TabsContent>

                  <TabsContent value="sales-history" className="space-y-6">
                    {product.isTemporary ? (
                      <Alert className="mb-4 border-yellow-300 bg-yellow-50">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertTitle className="text-yellow-800">Temporary Product</AlertTitle>
                        <AlertDescription className="text-yellow-700">
                          No sales history is available for this temporary product.
                          Complete the product details to enable sales tracking.
                        </AlertDescription>
                        <Button 
                          variant="outline" 
                          className="mt-2 border-yellow-300 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-900" 
                          onClick={handleCompleteProduct}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Complete Product Details
                        </Button>
                      </Alert>
                    ) : (
                      <div className="space-y-6">
                        {/* Sales Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-2xl font-bold">247</div>
                              <p className="text-sm text-muted-foreground">Total Units Sold</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-2xl font-bold">
                                $24,453.00
                              </div>
                              <p className="text-sm text-muted-foreground">Total Revenue</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-2xl font-bold">Mar 2, 2025</div>
                              <p className="text-sm text-muted-foreground">Last Sale Date</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-2xl font-bold">+12.4%</div>
                              <p className="text-sm text-muted-foreground">Monthly Growth</p>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Recent Sales */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Recent Sales</h3>
                            <Button variant="outline" size="sm" onClick={() => navigate(`/products/${productId}/sales`)}>
                              <Search className="h-4 w-4 mr-2" />
                              View All Sales
                            </Button>
                          </div>
                          <Card>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>
                                    <div className="flex items-center">
                                      <Hash className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                      Order #
                                    </div>
                                  </TableHead>
                                  <TableHead>
                                    <div className="flex items-center">
                                      <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                      Date
                                    </div>
                                  </TableHead>
                                  <TableHead>
                                    <div className="flex items-center">
                                      <User className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                      Customer
                                    </div>
                                  </TableHead>
                                  <TableHead>
                                    <div className="flex items-center">
                                      <Package className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                      Quantity
                                    </div>
                                  </TableHead>
                                  <TableHead>
                                    <div className="flex items-center">
                                      <DollarSign className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                      Total
                                    </div>
                                  </TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {/* Mock data for recent sales - would be replaced with actual data */}
                                {[
                                  { 
                                    id: 'ORD-7890', 
                                    date: '2025-03-02', 
                                    customer: 'John Smith', 
                                    quantity: 3,
                                    total: 299.97
                                  },
                                  { 
                                    id: 'ORD-7845', 
                                    date: '2025-02-28', 
                                    customer: 'Sarah Johnson', 
                                    quantity: 1,
                                    total: 99.99
                                  },
                                  { 
                                    id: 'ORD-7823', 
                                    date: '2025-02-25', 
                                    customer: 'Michael Brown', 
                                    quantity: 2,
                                    total: 199.98
                                  },
                                  { 
                                    id: 'ORD-7801', 
                                    date: '2025-02-20', 
                                    customer: 'Emily Davis', 
                                    quantity: 5,
                                    total: 499.95
                                  },
                                  { 
                                    id: 'ORD-7789', 
                                    date: '2025-02-15', 
                                    customer: 'Robert Wilson', 
                                    quantity: 1,
                                    total: 99.99
                                  }
                                ].map((sale) => (
                                  <TableRow key={sale.id}>
                                    <TableCell className="font-medium">{sale.id}</TableCell>
                                    <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{sale.customer}</TableCell>
                                    <TableCell>{sale.quantity}</TableCell>
                                    <TableCell>${sale.total.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                      <Button variant="ghost" size="icon" onClick={() => navigate(`/orders/${sale.id}`)}>
                                        <ExternalLink className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Card>
                        </div>

                        {/* Sales Trend Chart */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <BarChart className="h-5 w-5 mr-2 text-primary" />
                              Sales Trend
                            </CardTitle>
                            <CardDescription>
                              Monthly sales performance for the past 6 months
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="h-80">
                            {/* This would be the actual chart component */}
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                              [Sales Trend Chart Visualization]
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="analytics" className="space-y-6">
                    {/* Performance Overview */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">Performance Overview</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{analyticsData.totalSales}</div>
                            <p className="text-sm text-muted-foreground">Total Units Sold</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">
                              ${analyticsData.totalRevenue.toFixed(2)}
                            </div>
                            <p className="text-sm text-muted-foreground">Total Revenue</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">
                              ${analyticsData.totalProfit.toFixed(2)}
                            </div>
                            <p className="text-sm text-muted-foreground">Total Profit</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Comprehensive Product Statistics */}
                    {product && <ProductStatsOverview product={product} />}

                    {/* Product History */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">Product History</h4>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="bg-muted w-10 h-10 rounded-full flex items-center justify-center">
                                <Edit className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">Product Updated</p>
                                <p className="text-sm text-muted-foreground">Price changed from $89.99 to $99.99</p>
                                <p className="text-xs text-muted-foreground">
                                  {product.updatedAt ? new Date(product.updatedAt).toLocaleString() : 'N/A'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="bg-muted w-10 h-10 rounded-full flex items-center justify-center">
                                <Truck className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">Stock Received</p>
                                <p className="text-sm text-muted-foreground">30 units added to inventory</p>
                                <p className="text-xs text-muted-foreground">
                                  {product.lastRestock ? new Date(product.lastRestock).toLocaleString() : 'N/A'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="bg-muted w-10 h-10 rounded-full flex items-center justify-center">
                                <Tag className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">Category Changed</p>
                                <p className="text-sm text-muted-foreground">Category updated to "Electronics"</p>
                                <p className="text-xs text-muted-foreground">
                                  {product.createdAt ? new Date(product.createdAt).toLocaleString() : 'N/A'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="bg-muted w-10 h-10 rounded-full flex items-center justify-center">
                                <Package className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">Product Created</p>
                                <p className="text-sm text-muted-foreground">Initial setup with SKU {product.sku}</p>
                                <p className="text-xs text-muted-foreground">
                                  {product.createdAt ? new Date(product.createdAt).toLocaleString() : 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-6">
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => navigate(`/products/${productId}/history`)}
                            >
                              <History className="h-4 w-4 mr-2" />
                              View Full History
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="space-y-6">
                    {product.isTemporary ? (
                      <Alert className="mb-4 border-yellow-300 bg-yellow-50">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertTitle className="text-yellow-800">Temporary Product</AlertTitle>
                        <AlertDescription className="text-yellow-700">
                          No history is available for this temporary product.
                          Complete the product details to enable history tracking.
                        </AlertDescription>
                        <Button 
                          variant="outline" 
                          className="mt-2 border-yellow-300 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-900" 
                          onClick={handleCompleteProduct}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Complete Product Details
                        </Button>
                      </Alert>
                    ) : (
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Recent Activity</h4>
                          <div className="border rounded-md">
                            <div className="p-4 border-b">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Badge variant="outline" className="mr-2">Update</Badge>
                                  <span className="font-medium">Product Updated</span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {product.updatedAt ? new Date(product.updatedAt).toLocaleString() : 'N/A'}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-2">
                                Price updated from ${product.retailPrice ? (product.retailPrice * 0.9).toFixed(2) : '0.00'} to ${product.retailPrice ? product.retailPrice.toFixed(2) : '0.00'}
                              </p>
                            </div>
                            
                            <div className="p-4 border-b">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Badge variant="outline" className="mr-2">Restock</Badge>
                                  <span className="font-medium">Inventory Restocked</span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {product.lastRestock ? new Date(product.lastRestock).toLocaleString() : 'N/A'}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-2">Added 25 units to inventory</p>
                            </div>
                            
                            <div className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Badge variant="outline" className="mr-2">Create</Badge>
                                  <span className="font-medium">Product Created</span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {product.createdAt ? new Date(product.createdAt).toLocaleString() : 'N/A'}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-2">
                                Initial setup with SKU {product.sku || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="font-semibold">Price History</h4>
                          <div className="h-64 w-full bg-gray-50 rounded-md border flex items-center justify-center">
                            <div className="text-center p-4">
                              <LineChart className="h-8 w-8 mx-auto text-gray-400" />
                              <p className="mt-2 text-sm text-muted-foreground">Price history chart will be displayed here</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Stock Transfer Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer Stock</DialogTitle>
            <DialogDescription>
              Transfer stock from one location to another
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sourceLocation">Source Location</Label>
                <Select value={sourceLocationId} onValueChange={setSourceLocationId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source location" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.locations && Array.isArray(product.locations) ? (
                      product.locations
                        .filter(location => location.stock > 0)
                        .map((location) => (
                          <SelectItem key={location.locationId} value={location.locationId}>
                            {location.name} ({location.stock} in stock)
                          </SelectItem>
                        ))
                    ) : (
                      <SelectItem value="">No locations available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="destinationLocation">Destination Location</Label>
                <Select value={destinationLocationId} onValueChange={setDestinationLocationId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination location" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.locations && Array.isArray(product.locations) ? (
                      product.locations
                        .filter(location => location.locationId !== sourceLocationId)
                        .map((location) => (
                          <SelectItem key={location.locationId} value={location.locationId}>
                            {location.name}
                          </SelectItem>
                        ))
                    ) : (
                      <SelectItem value="">No locations available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transferQuantity">Transfer Quantity</Label>
                <Input 
                  id="transferQuantity" 
                  type="number" 
                  min={1}
                  max={sourceLocationId && product.locations ? 
                    product.locations.find(loc => loc.locationId === sourceLocationId)?.stock || 1 : 1
                  }
                  value={transferQuantity} 
                  onChange={(e) => setTransferQuantity(parseInt(e.target.value) || 1)} 
                />
              </div>

              <div className="pt-2">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Product Information</AlertTitle>
                  <AlertDescription className="text-sm">
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>Product:</div>
                      <div className="font-medium">{product.name}</div>
                      <div>SKU:</div>
                      <div className="font-medium">{product.sku}</div>
                      <div>Total Stock:</div>
                      <div className="font-medium">
                        {product.locations && Array.isArray(product.locations) 
                          ? product.locations.reduce((sum, loc) => sum + (loc.stock || 0), 0)
                          : product.stock || 0}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                withLoading('transfer', async () => {
                  // In a real app, you would call an API to perform the transfer
                  await new Promise(resolve => setTimeout(resolve, 800));
                  
                  toast({
                    title: "Stock Transfer Completed",
                    description: `Transferred ${transferQuantity} units of ${product.name} from ${
                      product.locations?.find(loc => loc.locationId === sourceLocationId)?.name
                    } to ${
                      product.locations?.find(loc => loc.locationId === destinationLocationId)?.name
                    }`
                  });
                  
                  setTransferDialogOpen(false);
                });
              }}
              disabled={!sourceLocationId || !destinationLocationId || transferQuantity < 1}
            >
              Transfer Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Tags className="h-5 w-5 text-primary" />
              Categorize Product
            </DialogTitle>
            <DialogDescription>
              Assign categories to help organize and find this product more easily
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {/* Search and selected categories */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search categories..." 
                  className="flex-1"
                  value={categorySearchTerm}
                  onChange={(e) => setCategorySearchTerm(e.target.value)}
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-1"
                  onClick={() => setIsAddingNewCategory(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  New
                </Button>
              </div>
              
              {isAddingNewCategory && (
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    placeholder="Enter new category name..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <Button 
                    size="sm" 
                    onClick={handleAddNewCategory}
                    disabled={!newCategoryName.trim()}
                  >
                    Add
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setIsAddingNewCategory(false);
                      setNewCategoryName('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map((categoryName) => {
                  const category = productCategories.find(c => c.name === categoryName);
                  return (
                    <Badge 
                      key={categoryName} 
                      variant="secondary"
                      className="flex items-center gap-1 py-1 px-3"
                    >
                      {categoryName}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 hover:bg-transparent"
                        onClick={() => {
                          setSelectedCategories(prev => prev.filter(c => c !== categoryName));
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
                {selectedCategories.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No categories selected</p>
                )}
              </div>
              
              {/* Quick selection options */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-xs"
                    onClick={() => {
                      const allCategoryNames = productCategories.map(c => c.name);
                      setSelectedCategories(allCategoryNames);
                    }}
                  >
                    Select All
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-xs"
                    onClick={() => setSelectedCategories([])}
                  >
                    Clear All
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  {productCategories.length} categories available
                </div>
              </div>
            </div>
            
            {/* Categories grid */}
            <ScrollArea className="h-[300px] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {productCategories
                  .filter(category => 
                    categorySearchTerm === '' || 
                    category.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
                    category.description.toLowerCase().includes(categorySearchTerm.toLowerCase())
                  )
                  .map((category) => {
                    const isSelected = selectedCategories.includes(category.name);
                    // Map the icon string to the actual imported Lucide icon component
                    let IconComponent;
                    switch (category.icon) {
                      case "Cpu": IconComponent = Cpu; break;
                      case "Shirt": IconComponent = Shirt; break;
                      case "Coffee": IconComponent = Coffee; break;
                      case "Utensils": IconComponent = Utensils; break;
                      case "Scissors": IconComponent = Scissors; break;
                      case "Dumbbell": IconComponent = Dumbbell; break;
                      case "Gamepad2": IconComponent = Gamepad2; break;
                      case "BookOpen": IconComponent = BookOpen; break;
                      case "Briefcase": IconComponent = Briefcase; break;
                      case "Heart": IconComponent = Heart; break;
                      default: IconComponent = Tag;
                    }
                    
                    return (
                      <Card 
                        key={category.id}
                        className={cn(
                          "cursor-pointer transition-all hover:border-primary",
                          isSelected ? "border-primary bg-primary/5" : ""
                        )}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedCategories(prev => prev.filter(c => c !== category.name));
                        } else {
                            setSelectedCategories(prev => [...prev, category.name]);
                          }
                        }}
                      >
                        <CardContent className="p-3 flex items-start gap-3">
                          <div className={cn(
                            "flex items-center justify-center h-8 w-8 rounded-md",
                            isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                          )}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{category.name}</h3>
                              <Checkbox 
                                checked={isSelected}
                                className="pointer-events-none"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {category.description}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                
                {/* Empty state when no categories match the search */}
                {productCategories.filter(category => 
                  categorySearchTerm === '' || 
                  category.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
                  category.description.toLowerCase().includes(categorySearchTerm.toLowerCase())
                ).length === 0 && (
                  <div className="col-span-2 flex flex-col items-center justify-center py-8 text-center">
                    <div className="bg-muted rounded-full p-3 mb-3">
                      <Search className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium mb-1">No categories found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      No categories match your search term "{categorySearchTerm}"
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-1"
                      onClick={() => {
                        setIsAddingNewCategory(true);
                        setNewCategoryName(categorySearchTerm);
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Create "{categorySearchTerm}"
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Category hierarchy visualization */}
            <div className="mt-4 border rounded-md p-3">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <FolderTree className="h-4 w-4 text-muted-foreground" />
                Category Hierarchy
              </h3>
              <div className="text-xs text-muted-foreground">
                {selectedCategories.length > 0 ? (
                  <div className="space-y-1">
                    {/* Main category */}
                    <div className="flex items-center gap-1">
                      <FolderOpen className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium">{selectedCategories[0]}</span>
                      {selectedCategories.length > 1 && (
                        <Badge variant="outline" className="text-[10px] h-4 px-1 ml-1">
                          Primary
                        </Badge>
                      )}
                    </div>
                    
                    {/* Subcategories */}
                    {selectedCategories.slice(1).map((category, index) => (
                      <div key={category} className="flex items-center gap-1 ml-4">
                        <ArrowRight className="h-3 w-3" />
                        <Folder className="h-3.5 w-3.5" />
                        <span>{category}</span>
                        {index === 0 && selectedCategories.length > 2 && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1 ml-1">
                            Secondary
                          </Badge>
                        )}
                  </div>
                ))}
              </div>
                ) : (
                  <p className="italic">No categories selected. Product will be uncategorized.</p>
                )}
            </div>
          </div>
          </div>
          
          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'} selected
            </div>
            <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              Cancel
            </Button>
              <Button 
                onClick={handleSaveCategories}
                disabled={selectedCategories.length === 0}
                className="gap-2"
              >
                <Check className="h-4 w-4" />
              Save Categories
            </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reorder Dialog */}
      <Dialog open={reorderDialogOpen} onOpenChange={setReorderDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reorder Product</DialogTitle>
            <DialogDescription>
              Create a purchase order for restocking
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderQuantity">Order Quantity</Label>
                <Input 
                  id="orderQuantity" 
                  type="number" 
                  min={1}
                  value={orderQuantity} 
                  onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 1)} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedDeliveryDate">Expected Delivery Date</Label>
                <Input 
                  id="expectedDeliveryDate" 
                  type="date" 
                  value={expectedDeliveryDate} 
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderNotes">Order Notes</Label>
                <Textarea 
                  id="orderNotes" 
                  value={orderNotes} 
                  onChange={(e) => setOrderNotes(e.target.value)} 
                />
              </div>

              <div className="pt-2">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Product Information</AlertTitle>
                  <AlertDescription className="text-sm">
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>Product:</div>
                      <div className="font-medium">{product.name}</div>
                      <div>SKU:</div>
                      <div className="font-medium">{product.sku}</div>
                      <div>Total Stock:</div>
                      <div className="font-medium">
                        {product.locations && Array.isArray(product.locations) 
                          ? product.locations.reduce((sum, loc) => sum + (loc.stock || 0), 0)
                          : product.stock || 0}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReorderDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                withLoading('reorder', async () => {
                  // In a real app, you would call an API to create the purchase order
                  await new Promise(resolve => setTimeout(resolve, 800));
                  
                  toast({
                    title: "Purchase Order Created",
                    description: `Created purchase order for ${orderQuantity} units of ${product.name}`
                  });
                  
                  setReorderDialogOpen(false);
                });
              }}
              disabled={orderQuantity < 1}
            >
              Create Purchase Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
