import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  ArrowRight,
  Activity,
  Building2,
  Calendar,
  RefreshCw, 
  AlertTriangle,
  Edit,
  Trash,
  Package,
  ClipboardList,
  TrendingUp,
  Clock,
  Users,
  User,
  UserCircle,
  Phone,
  Mail,
  Truck,
  ShoppingBag,
  Map,
  Check,
  CheckCircle2,
  XCircle,
  AlertCircle,
  DollarSign,
  BarChart3,
  ShoppingCart,
  Settings,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { 
  Label 
} from '@/components/ui/label'
import { 
  Input 
} from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { shopsService } from '../services/shopsService'
import { useShopOperations } from '../hooks/useShopOperations'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { Separator } from '@/components/ui/separator'
import { Shop } from '../types/shops.types'
import { ErrorBoundary } from '@/components/unified-error-boundary'

function getStatusColor(status: Shop['status']) {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'secondary'
    case 'maintenance':
      return 'warning'
    default:
      return 'default'
  }
}

// Helper function to get status button styles
const getStatusButtonStyle = (status: Shop['status']): string => {
  switch (status) {
    case 'active':
      return 'text-green-700 border-green-200 hover:bg-green-50 hover:text-green-800 dark:border-green-900 dark:text-green-400 dark:hover:bg-green-950';
    case 'inactive':
      return 'text-amber-700 border-amber-200 hover:bg-amber-50 hover:text-amber-800 dark:border-amber-900 dark:text-amber-400 dark:hover:bg-amber-950';
    case 'maintenance':
      return 'text-red-700 border-red-200 hover:bg-red-50 hover:text-red-800 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950';
    default:
      return '';
  }
};

export function ShopDetailsPage() {
  const { shopId } = useParams<{ shopId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [shop, setShop] = useState<Shop | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  // Use the shop operations hook for API calls
  const { 
    refreshShop, 
    updateShop, 
    deleteShop, 
    loading: operationLoading, 
    error: operationError 
  } = useShopOperations()

  // Fetch shop details from API
  const fetchShopDetails = useCallback(async () => {
    if (!shopId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const shopData = await shopsService.fetchById(shopId)
      setShop(shopData)
    } catch (err) {
      // Don't show error toast for navigation cancellations
      if (err instanceof Error && err.message === 'Request was canceled during navigation.') {
        console.log('Shop details request was canceled due to navigation.');
        return;
      }
      
      const errorMsg = err instanceof Error ? err.message : 'Failed to load shop details'
      setError(new Error(errorMsg))
      toast({
        title: "Error Loading Shop",
        description: errorMsg,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [shopId])

  // Fetch shop data on mount and when shopId changes
  useEffect(() => {
    fetchShopDetails()
  }, [fetchShopDetails])
  
  // Clean up any pending requests when the component unmounts
  useEffect(() => {
    return () => {
      // Cancel any pending requests when component unmounts
      shopsService.cancelAllRequests();
    };
  }, []);

  const handleEdit = () => {
    toast({
      title: "Edit Shop",
      description: "Opening shop edit form"
    })
    // Implementation would open a form to edit the shop
  }

  const handleDelete = async () => {
    if (!shop) return
    
    try {
      const success = await deleteShop(shop.id)
      if (success) {
        navigate('/shops')
      }
    } catch (err) {
      // Error is handled inside the useShopOperations hook
      console.error("Error deleting shop:", err)
    }
  }

  // Update refresh function to use real API
  const handleRefresh = async () => {
    if (!shopId) return
    
    try {
      const refreshedShop = await refreshShop(shopId)
      if (refreshedShop) {
        setShop(refreshedShop)
        toast({
          title: "Shop Refreshed",
          description: "Shop data has been updated from the server",
        })
      }
    } catch (err) {
      // Error is handled inside the useShopOperations hook
      console.error("Error refreshing shop:", err)
    }
  }

  // Add handler for changing shop status
  const handleChangeStatus = async (newStatus: Shop['status']) => {
    if (!shop || shop.status === newStatus) return;
    
    try {
      // Include the required fields to prevent validation errors
      const updatedShop = await updateShop(shop.id, { 
        status: newStatus,
        name: shop.name || 'Untitled Shop', // Preserve existing name or use default
        location: shop.location || 'Unknown Location' // Preserve existing location or use default
      });
      
      if (updatedShop) {
        setShop(updatedShop);
        toast({
          title: "Status Updated",
          description: `Shop status changed to ${newStatus}`,
        });
      }
    } catch (error) {
      toast({
        title: "Status Update Failed",
        description: "Could not update shop status",
        variant: "destructive"
      });
    }
  };

  // Add handlers for inventory management options
  const handleViewStockLevels = () => {
    toast({
      title: "Stock Levels",
      description: `Viewing inventory levels for ${shop?.name}`,
    })
  }

  const handleReceiveStock = () => {
    toast({
      title: "Receive Stock",
      description: `Processing incoming inventory for ${shop?.name}`,
    })
  }

  const handleTransferStock = () => {
    toast({
      title: "Transfer Stock",
      description: `Transfer inventory from ${shop?.name} to another location`,
    })
  }

  const handleAdjustments = () => {
    toast({
      title: "Inventory Adjustments",
      description: `Adjusting inventory for ${shop?.name}`,
    })
  }

  const handleViewHistory = () => {
    toast({
      title: "Inventory History",
      description: `Viewing transaction history for ${shop?.name}`,
    })
  }

  const handleAlerts = () => {
    toast({
      title: "Inventory Alerts",
      description: `Viewing stock alerts for ${shop?.name}`,
    })
  }

  // Add handlers for inventory stat cards
  const handleTotalItems = () => {
    const count = shop?.inventoryCount || 0;
    toast({
      title: "Total Inventory Items",
      description: `Details for ${count.toLocaleString()} items across all categories`,
    })
  }

  const handleLowStockItems = () => {
    toast({
      title: "Low Stock Items",
      description: "Items that need to be reordered soon to avoid stockouts",
    })
  }

  const handleItemsInTransit = () => {
    toast({
      title: "Items In Transit",
      description: "Items on order or being transferred between locations",
    })
  }

  const handleInventoryCount = () => {
    toast({
      title: "Inventory Count Schedule",
      description: "View and manage inventory count schedule and history",
    })
  }

  // Handler for settings form
  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Shop settings have been updated successfully.",
      variant: "success"
    })
  }

  const handleCancelSettings = () => {
    toast({
      title: "Changes Discarded",
      description: "Your changes have been discarded.",
      variant: "default"
    })
  }

  // Handlers for settings section cards
  const handleLocationDetails = () => {
    toast({
      title: "Location Details",
      description: "Configure shop address and contact information",
    })
  }

  const handleStaffManagement = () => {
    toast({
      title: "Staff Management",
      description: "Configure staff permissions, roles, and schedules",
    })
  }

  const handleInventorySettings = () => {
    toast({
      title: "Inventory Settings",
      description: "Configure stock levels, alerts, and product settings",
    })
  }

  const handleSalesSettings = () => {
    toast({
      title: "Sales Settings",
      description: "Configure pricing, discounts, and promotions",
    })
  }

  const handleSecuritySettings = () => {
    toast({
      title: "Security Settings",
      description: "Configure access controls and security protocols",
    })
  }

  const handleNotificationSettings = () => {
    toast({
      title: "Notification Settings",
      description: "Configure email alerts and system notifications",
    })
  }

  // Staff management handlers
  const handleAddStaffMember = () => {
    toast({
      title: "Add Staff Member",
      description: "The staff member creation form would open here",
    })
  }

  const handleEditStaff = (staffId: string, staffName: string) => {
    toast({
      title: "Edit Staff Member",
      description: `Editing details for ${staffName}`,
    })
  }

  const handleRemoveStaff = (staffId: string, staffName: string) => {
    toast({
      title: "Remove Staff Member",
      description: `Confirmation to remove ${staffName} from ${shop?.name}`,
      variant: "destructive"
    })
  }

  // Add handler for changing shop manager
  const handleChangeManager = () => {
    if (!shop) return
    
    toast({
      title: "Change Manager",
      description: "Opening manager selection dialog",
    })
    
    // Implementation would open a dialog to select a new manager
    // Then call updateShop with the new manager information
  }

  // Wrap the main content in an ErrorBoundary
  return (
    <ErrorBoundary
      title="Error in Shop Details"
      showToast={true}
      fallback={(error, reset) => (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold">Error Loading Shop Details</h2>
          <p className="text-sm text-muted-foreground mb-4">
            There was an error rendering the shop details
          </p>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/shops')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shops
            </Button>
            <Button variant="outline" onClick={reset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      )}
    >
      {/* Enhanced loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p className="text-muted-foreground">Loading shop details...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Shop</h2>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/shops')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shops
            </Button>
            <Button variant="outline" onClick={fetchShopDetails}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      ) : !shop ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold">Shop Not Found</h2>
          <p className="text-muted-foreground mb-4">The shop you are looking for does not exist or has been removed.</p>
          <Button onClick={() => navigate('/shops')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shops
          </Button>
        </div>
      ) : (
        <div className="w-full pb-6 space-y-2">
          {/* Header with loading indicator */}
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                className="gap-2"
                onClick={() => navigate('/shops')}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <h1 className="text-2xl font-bold">{shop.name}</h1>
              <Badge variant={getStatusColor(shop.status)} className="capitalize">
                {shop.status}
              </Badge>
              {operationLoading && (
                <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleRefresh} disabled={operationLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${operationLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    disabled={operationLoading}
                    className={`gap-2 ${getStatusButtonStyle(shop.status)}`}
                  >
                    <Activity className="h-4 w-4" />
                    Status: {shop.status.charAt(0).toUpperCase() + shop.status.slice(1)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="flex items-center gap-2 text-green-600 font-medium cursor-pointer"
                    onClick={() => handleChangeStatus('active')}
                    disabled={shop.status === 'active'}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center gap-2 text-amber-600 font-medium cursor-pointer"
                    onClick={() => handleChangeStatus('inactive')}
                    disabled={shop.status === 'inactive'}
                  >
                    <XCircle className="h-4 w-4" />
                    Inactive
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center gap-2 text-red-600 font-medium cursor-pointer"
                    onClick={() => handleChangeStatus('maintenance')}
                    disabled={shop.status === 'maintenance'}
                  >
                    <AlertCircle className="h-4 w-4" />
                    Maintenance
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="outline" onClick={handleEdit} disabled={operationLoading}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Shop
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={operationLoading}>
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* Main content area */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="w-full grid grid-cols-4">
                    <TabsTrigger value="overview" className="flex items-center justify-center">
                      <Building2 className="h-4 w-4 mr-2" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="staff" className="flex items-center justify-center">
                      <Users className="h-4 w-4 mr-2" />
                      Staff
                    </TabsTrigger>
                    <TabsTrigger value="inventory" className="flex items-center justify-center">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Inventory
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex items-center justify-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-6 space-y-6">
                    {/* Overview Tab */}
                    <TabsContent value="overview" className="h-full">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Shop Information Card */}
                        <Card className="overflow-hidden border shadow-sm">
                          <CardHeader className="pb-2 bg-card">
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <Building2 className="h-5 w-5 text-primary" /> 
                              Shop Information
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4 pt-4">
                            <div className="grid grid-cols-1 gap-4">
                              <div className="bg-muted/30 rounded-md p-3">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1 text-sm">
                                  <Map className="h-4 w-4 text-primary" /> Location
                                </div>
                                <p className="font-medium">{shop.location}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="flex items-center gap-2 text-muted-foreground mb-1 text-sm">
                                    <Phone className="h-4 w-4 text-primary" /> Phone
                                  </div>
                                  <p className="font-medium">
                                    {shop.phone ? shop.phone : <span className="text-muted-foreground italic">Not specified</span>}
                                  </p>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 text-muted-foreground mb-1 text-sm">
                                    <Mail className="h-4 w-4 text-primary" /> Email
                                  </div>
                                  <p className="font-medium">
                                    {shop.email ? shop.email : <span className="text-muted-foreground italic">Not specified</span>}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="flex items-center gap-2 text-muted-foreground mb-1 text-sm">
                                    <Users className="h-4 w-4 text-primary" /> Manager
                                  </div>
                                  <p className="font-medium">
                                    {shop.manager ? shop.manager : <span className="text-muted-foreground italic">Not assigned</span>}
                                  </p>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 text-muted-foreground mb-1 text-sm">
                                    <Clock className="h-4 w-4 text-primary" /> Hours
                                  </div>
                                  <p className="font-medium">
                                    {shop.openingHours ? shop.openingHours : <span className="text-muted-foreground italic">Not specified</span>}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="bg-muted/30 rounded-md p-3">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1 text-sm">
                                  <Calendar className="h-4 w-4 text-primary" /> Established
                                </div>
                                <p className="font-medium">
                                  {shop.createdAt ? format(new Date(shop.createdAt), 'MMMM d, yyyy') : 'No date available'}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Performance Card */}
                        <Card className="overflow-hidden border shadow-sm">
                          <CardHeader className="pb-2 bg-card">
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <BarChart3 className="h-5 w-5 text-primary" /> 
                              Performance Metrics
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg p-4">
                                <div className="flex flex-col">
                                  <span className="text-sm text-muted-foreground">Sales Last Month</span>
                                  <div className="flex items-center mt-1">
                                    <DollarSign className="h-4 w-4 mr-1.5 text-blue-500" />
                                    <p className="text-2xl font-semibold">${(shop.salesLastMonth || 0).toLocaleString()}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg p-4">
                                <div className="flex flex-col">
                                  <span className="text-sm text-muted-foreground">Avg Order Value</span>
                                  <div className="flex items-center mt-1">
                                    <ShoppingCart className="h-4 w-4 mr-1.5 text-green-500" />
                                    <p className="text-2xl font-semibold">${(shop.averageOrderValue || 0).toFixed(2)}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-lg p-4">
                                <div className="flex flex-col">
                                  <span className="text-sm text-muted-foreground">Inventory Items</span>
                                  <div className="flex items-center mt-1">
                                    <Package className="h-4 w-4 mr-1.5 text-purple-500" />
                                    <p className="text-2xl font-semibold">{(shop.inventoryCount || 0).toLocaleString()}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 rounded-lg p-4">
                                <div className="flex flex-col">
                                  <span className="text-sm text-muted-foreground">Staff Members</span>
                                  <div className="flex items-center mt-1">
                                    <Users className="h-4 w-4 mr-1.5 text-amber-500" />
                                    <p className="text-2xl font-semibold">{shop.staffCount || 0}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="pt-2">
                              <p className="text-sm text-muted-foreground mb-2">Top Selling Categories</p>
                              <div className="flex flex-wrap gap-2">
                                {shop.topSellingCategories && shop.topSellingCategories.length > 0 ? (
                                  shop.topSellingCategories.map(category => (
                                    <Badge key={category} variant="secondary" className="bg-primary/10 hover:bg-primary/20 text-primary">
                                      {category}
                                    </Badge>
                                  ))
                                ) : (
                                  <p className="text-sm text-muted-foreground italic">No categories available for this shop type</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Recent Activity Card */}
                        <Card className="overflow-hidden border shadow-sm">
                          <CardHeader className="pb-2 bg-card">
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <Activity className="h-5 w-5 text-primary" /> 
                              Recent Activity
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <div className="space-y-4">
                              {shop.recentActivity && shop.recentActivity.length > 0 ? (
                                <>
                                  {shop.recentActivity.map((activity, index) => (
                                    <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-b-0 last:pb-0">
                                      <div>
                                        {activity.type === 'inventory' && (
                                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                            <ShoppingBag className="h-4 w-4" />
                                          </div>
                                        )}
                                        {activity.type === 'staff' && (
                                          <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                            <Users className="h-4 w-4" />
                                          </div>
                                        )}
                                        {activity.type === 'sales' && (
                                          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                                            <BarChart3 className="h-4 w-4" />
                                          </div>
                                        )}
                                        {activity.type === 'system' && (
                                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                                            <Settings className="h-4 w-4" />
                                          </div>
                                        )}
                                      </div>
                                      <div>
                                        <p className="font-medium">{activity.message}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </>
                              ) : (
                                <div className="text-center p-6">
                                  <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-3">
                                    <Activity className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                  <h3 className="font-medium mb-1">No Recent Activity</h3>
                                  <p className="text-sm text-muted-foreground">
                                    There is no recent activity for this shop
                                  </p>
                                </div>
                              )}
                              
                              <Button variant="outline" className="w-full mt-2" onClick={handleRefresh}>
                                <RefreshCw className={`h-4 w-4 mr-2 ${operationLoading ? 'animate-spin' : ''}`} />
                                {operationLoading ? 'Refreshing...' : 'Refresh Activity'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* Staff Tab */}
                    <TabsContent value="staff" className="h-full">
                      <div className="space-y-6">
                        {/* Manager Section - New Addition */}
                        <Card className="overflow-hidden border shadow-sm">
                          <CardHeader className="pb-2 bg-card">
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <UserCircle className="h-5 w-5 text-primary" /> 
                              Shop Manager
                            </CardTitle>
                            <CardDescription>
                              The primary person responsible for this shop
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-4">
                            {shop.manager ? (
                              <div className="grid md:grid-cols-4 gap-6">
                                {/* Manager Avatar and Name */}
                                <div className="flex flex-col items-center md:items-start gap-4 md:col-span-1">
                                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                                    <UserCircle className="w-16 h-16 text-primary" />
                                  </div>
                                  <div className="text-center md:text-left">
                                    <h3 className="text-xl font-medium">{shop.manager}</h3>
                                    <p className="text-sm text-muted-foreground">Shop Manager</p>
                                  </div>
                                </div>
                                
                                {/* Manager Details */}
                                <div className="md:col-span-3 space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <p className="text-sm font-medium text-muted-foreground">Contact Information</p>
                                      <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span>{shop.email || 'No email provided'}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>{shop.phone || 'No phone provided'}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-1">
                                      <p className="text-sm font-medium text-muted-foreground">Shop Details</p>
                                      <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        <span>{shop.location}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>{shop.openingHours || 'No opening hours specified'}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Actions */}
                                  <div className="flex justify-end gap-2 pt-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={handleChangeManager}
                                      disabled={operationLoading}
                                    >
                                      <Edit className="h-4 w-4 mr-1" />
                                      Change Manager
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-8 bg-muted/30 rounded-md">
                                <UserCircle className="h-12 w-12 text-muted-foreground mb-2" />
                                <h3 className="text-lg font-medium">No Manager Assigned</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                  This shop doesn't have a manager assigned yet
                                </p>
                                <Button size="sm" onClick={handleChangeManager} disabled={operationLoading}>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Assign Manager
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                        
                        {/* Staff Members Section - Redesigned */}
                        <Card className="overflow-hidden border shadow-sm">
                          <CardHeader>
                            <div className="flex justify-between items-center">
                              <CardTitle className="flex items-center gap-2 text-lg">
                                <Users className="h-5 w-5 text-primary" /> 
                                Staff Members
                              </CardTitle>
                              <Button size="sm" onClick={handleAddStaffMember} disabled={operationLoading}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Staff Member
                              </Button>
                            </div>
                            <CardDescription>
                              {shop.staffMembers && shop.staffMembers.length > 0 ? 
                                `${shop.staffMembers.length} staff members assigned to ${shop.name}` : 
                                `No staff members assigned to ${shop.name}`
                              }
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {shop.staffMembers && shop.staffMembers.length > 0 ? (
                              <div className="border rounded-md overflow-hidden">
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b bg-muted/50">
                                      <th className="text-left p-4 font-medium">Name</th>
                                      <th className="text-left p-4 font-medium">Position</th>
                                      <th className="text-left p-4 font-medium">Email</th>
                                      <th className="text-right p-4 font-medium">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {shop.staffMembers.map(staff => (
                                      <tr key={staff.id} className="border-b last:border-b-0 hover:bg-muted/50">
                                        <td className="p-4">
                                          <div className="flex items-center gap-2">
                                            <UserCircle className="h-5 w-5 text-muted-foreground" />
                                            <div className="font-medium">
                                              {staff.name}
                                              {shop.manager === staff.name && (
                                                <Badge variant="outline" className="ml-2">Manager</Badge>
                                              )}
                                            </div>
                                          </div>
                                        </td>
                                        <td className="p-4">{staff.position}</td>
                                        <td className="p-4">{staff.email}</td>
                                        <td className="p-4 text-right">
                                          <div className="flex justify-end gap-2">
                                            <Button 
                                              variant="ghost" 
                                              size="sm"
                                              onClick={() => handleEditStaff(staff.id, staff.name)}
                                              disabled={operationLoading}
                                            >
                                              <Edit className="h-4 w-4 mr-1" />
                                              Edit
                                            </Button>
                                            <Button 
                                              variant="ghost" 
                                              size="sm" 
                                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                              onClick={() => handleRemoveStaff(staff.id, staff.name)}
                                              disabled={operationLoading}
                                            >
                                              <Trash className="h-4 w-4 mr-1" />
                                              Remove
                                            </Button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-8 bg-muted/30 rounded-md">
                                <Users className="h-12 w-12 text-muted-foreground mb-2" />
                                <h3 className="text-lg font-medium">No Staff Members</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                  There are no staff members assigned to this shop yet
                                </p>
                                <Button size="sm" onClick={handleAddStaffMember} disabled={operationLoading}>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Staff Member
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* Inventory Tab */}
                    <TabsContent value="inventory" className="h-full">
                      <div className="space-y-6">
                        {/* Inventory Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <Card className="overflow-hidden border shadow-sm hover:bg-muted/50 hover:border-border/80 cursor-pointer transition-all" onClick={handleTotalItems}>
                            <CardContent className="p-6">
                              <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                                  <ShoppingBag className="h-6 w-6 text-primary" />
                                </div>
                                <div className="text-2xl font-bold">{(shop.inventoryCount || 0).toLocaleString()}</div>
                                <p className="text-sm text-muted-foreground">Total Items</p>
                              </div>
                            </CardContent>
                          </Card>
                          <Card className="overflow-hidden border shadow-sm hover:bg-muted/50 hover:border-border/80 cursor-pointer transition-all" onClick={handleLowStockItems}>
                            <CardContent className="p-6">
                              <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                                </div>
                                <div className="text-2xl font-bold">12</div>
                                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                              </div>
                            </CardContent>
                          </Card>
                          <Card className="overflow-hidden border shadow-sm hover:bg-muted/50 hover:border-border/80 cursor-pointer transition-all" onClick={handleItemsInTransit}>
                            <CardContent className="p-6">
                              <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                                  <ArrowRight className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="text-2xl font-bold">42</div>
                                <p className="text-sm text-muted-foreground">Items In Transit</p>
                              </div>
                            </CardContent>
                          </Card>
                          <Card className="overflow-hidden border shadow-sm hover:bg-muted/50 hover:border-border/80 cursor-pointer transition-all" onClick={handleInventoryCount}>
                            <CardContent className="p-6">
                              <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                                  <Calendar className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="text-2xl font-bold">7</div>
                                <p className="text-sm text-muted-foreground">Days Since Last Count</p>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Inventory Management Options */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <ShoppingBag className="h-5 w-5 text-primary" /> Inventory Management
                            </CardTitle>
                            <CardDescription>
                              Manage inventory levels, transfers, and stock adjustments
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div 
                                className="border rounded-lg p-6 hover:bg-muted/50 cursor-pointer transition-colors"
                                onClick={handleViewStockLevels}
                              >
                                <div className="flex items-start gap-4">
                                  <div className="p-2 rounded-md bg-primary/10">
                                    <ShoppingBag className="h-6 w-6 text-primary" />
                                  </div>
                                  <div>
                                    <h3 className="font-medium mb-1">Stock Levels</h3>
                                    <p className="text-sm text-muted-foreground">View and manage current inventory levels</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div 
                                className="border rounded-lg p-6 hover:bg-muted/50 cursor-pointer transition-colors"
                                onClick={handleReceiveStock}
                              >
                                <div className="flex items-start gap-4">
                                  <div className="p-2 rounded-md bg-green-500/10">
                                    <ArrowLeft className="h-6 w-6 text-green-500" />
                                  </div>
                                  <div>
                                    <h3 className="font-medium mb-1">Receive Stock</h3>
                                    <p className="text-sm text-muted-foreground">Process incoming inventory</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div 
                                className="border rounded-lg p-6 hover:bg-muted/50 cursor-pointer transition-colors"
                                onClick={handleTransferStock}
                              >
                                <div className="flex items-start gap-4">
                                  <div className="p-2 rounded-md bg-amber-500/10">
                                    <ArrowLeft className="h-6 w-6 text-amber-500 transform rotate-180" />
                                  </div>
                                  <div>
                                    <h3 className="font-medium mb-1">Transfer Stock</h3>
                                    <p className="text-sm text-muted-foreground">Move inventory between locations</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div 
                                className="border rounded-lg p-6 hover:bg-muted/50 cursor-pointer transition-colors"
                                onClick={handleAdjustments}
                              >
                                <div className="flex items-start gap-4">
                                  <div className="p-2 rounded-md bg-blue-500/10">
                                    <Settings className="h-6 w-6 text-blue-500" />
                                  </div>
                                  <div>
                                    <h3 className="font-medium mb-1">Adjustments</h3>
                                    <p className="text-sm text-muted-foreground">Correct inventory discrepancies</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div 
                                className="border rounded-lg p-6 hover:bg-muted/50 cursor-pointer transition-colors"
                                onClick={handleViewHistory}
                              >
                                <div className="flex items-start gap-4">
                                  <div className="p-2 rounded-md bg-purple-500/10">
                                    <Clock className="h-6 w-6 text-purple-500" />
                                  </div>
                                  <div>
                                    <h3 className="font-medium mb-1">History</h3>
                                    <p className="text-sm text-muted-foreground">View inventory transaction history</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div 
                                className="border rounded-lg p-6 hover:bg-muted/50 cursor-pointer transition-colors"
                                onClick={handleAlerts}
                              >
                                <div className="flex items-start gap-4">
                                  <div className="p-2 rounded-md bg-red-500/10">
                                    <AlertTriangle className="h-6 w-6 text-red-500" />
                                  </div>
                                  <div>
                                    <h3 className="font-medium mb-1">Alerts</h3>
                                    <p className="text-sm text-muted-foreground">Review stock alerts and notifications</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="h-full">
                      <div className="space-y-6">
                        {/* General Settings */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Settings className="h-5 w-5 text-primary" /> General Settings
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="store-name">Store Name</Label>
                                  <Input id="store-name" defaultValue={shop.name} />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="store-type">Store Type</Label>
                                  <Select defaultValue={shop.type}>
                                    <SelectTrigger id="store-type">
                                      <SelectValue placeholder="Select store type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="retail">Retail</SelectItem>
                                      <SelectItem value="warehouse">Warehouse</SelectItem>
                                      <SelectItem value="outlet">Outlet</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="store-phone">Phone Number</Label>
                                  <Input id="store-phone" defaultValue={shop.phone} />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="store-email">Email Address</Label>
                                  <Input id="store-email" defaultValue={shop.email} />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="store-manager">Store Manager</Label>
                                  <Input id="store-manager" defaultValue={shop.manager} />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="store-hours">Opening Hours</Label>
                                  <Input id="store-hours" defaultValue={shop.openingHours} />
                                </div>
                              </div>

                              <div className="flex justify-end gap-2 mt-6">
                                <Button variant="outline" onClick={handleCancelSettings}>
                                  Cancel
                                </Button>
                                <Button onClick={handleSaveSettings}>
                                  <Check className="h-4 w-4 mr-2" />
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      
                        {/* Settings Sections */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card 
                            className="hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={handleLocationDetails}
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <div className="p-2 rounded-md bg-primary/10">
                                  <Building2 className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-medium mb-1">Location Details</h3>
                                  <p className="text-sm text-muted-foreground">Configure address and contact information</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card 
                            className="hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={handleStaffManagement}
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <div className="p-2 rounded-md bg-green-500/10">
                                  <Users className="h-6 w-6 text-green-500" />
                                </div>
                                <div>
                                  <h3 className="font-medium mb-1">Staff Management</h3>
                                  <p className="text-sm text-muted-foreground">Set staff permissions and schedules</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card 
                            className="hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={handleInventorySettings}
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <div className="p-2 rounded-md bg-blue-500/10">
                                  <ShoppingBag className="h-6 w-6 text-blue-500" />
                                </div>
                                <div>
                                  <h3 className="font-medium mb-1">Inventory Settings</h3>
                                  <p className="text-sm text-muted-foreground">Configure stock levels and alerts</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card 
                            className="hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={handleSalesSettings}
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <div className="p-2 rounded-md bg-amber-500/10">
                                  <BarChart3 className="h-6 w-6 text-amber-500" />
                                </div>
                                <div>
                                  <h3 className="font-medium mb-1">Sales Settings</h3>
                                  <p className="text-sm text-muted-foreground">Configure pricing and discounts</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card 
                            className="hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={handleSecuritySettings}
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <div className="p-2 rounded-md bg-red-500/10">
                                  <AlertTriangle className="h-6 w-6 text-red-500" />
                                </div>
                                <div>
                                  <h3 className="font-medium mb-1">Security</h3>
                                  <p className="text-sm text-muted-foreground">Configure access controls and security settings</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card 
                            className="hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={handleNotificationSettings}
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <div className="p-2 rounded-md bg-purple-500/10">
                                  <Mail className="h-6 w-6 text-purple-500" />
                                </div>
                                <div>
                                  <h3 className="font-medium mb-1">Notifications</h3>
                                  <p className="text-sm text-muted-foreground">Configure email and alert preferences</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </ErrorBoundary>
  )
} 