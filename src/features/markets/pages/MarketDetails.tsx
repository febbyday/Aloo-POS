import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  Edit,
  MapPin,
  Package,
  User,
  BarChart,
  AlertCircle,
  ChevronLeft,
  Settings,
  ArrowUpRight,
  PanelRight
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/layout/PageHeader';

import { useMarketContext } from '../context/MarketContext';
import { MARKET_STATUS } from '../types';
import {
  MARKETS_FULL_ROUTES,
  getMarketEditRoute,
  getMarketStockRoute,
  getMarketStaffRoute,
  getMarketPerformanceRoute
} from '@/routes/marketRoutes';

const StatusBadgeMap = {
  [MARKET_STATUS.PLANNING]: { variant: 'outline', label: 'Planning' },
  [MARKET_STATUS.PREPARING]: { variant: 'secondary', label: 'Preparing' },
  [MARKET_STATUS.ACTIVE]: { variant: 'success', label: 'Active' },
  [MARKET_STATUS.CLOSED]: { variant: 'default', label: 'Closed' },
  [MARKET_STATUS.CANCELLED]: { variant: 'destructive', label: 'Cancelled' },
};

const MarketDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  const {
    selectedMarket,
    stockAllocations,
    staffAssignments,
    isLoading,
    error,
    fetchMarketById,
    fetchStockAllocations,
    fetchStaffAssignments
  } = useMarketContext();
  
  // Load market details and related data
  useEffect(() => {
    if (id) {
      fetchMarketById(id);
    }
  }, [id, fetchMarketById]);
  
  // Load stock allocations when market is loaded or tab changes
  useEffect(() => {
    if (id && selectedMarket && activeTab === 'stock') {
      fetchStockAllocations(id);
    }
  }, [id, selectedMarket, activeTab, fetchStockAllocations]);
  
  // Load staff assignments when market is loaded or tab changes
  useEffect(() => {
    if (id && selectedMarket && activeTab === 'staff') {
      fetchStaffAssignments(id);
    }
  }, [id, selectedMarket, activeTab, fetchStaffAssignments]);
  
  // Handle error state
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Market Details"
          description="View comprehensive market information"
          breadcrumbs={[
            { label: 'Dashboard', href: '/' },
            { label: 'Markets', href: MARKETS_FULL_ROUTES.ROOT },
            { label: 'Market Details', href: '#' },
          ]}
        />
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error.message || 'Failed to load market details. Please try again later.'}
          </AlertDescription>
        </Alert>
        
        <Button variant="outline" onClick={() => navigate(MARKETS_FULL_ROUTES.LIST)}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Markets
        </Button>
      </div>
    );
  }
  
  // Handle loading state
  if (isLoading || !selectedMarket) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-[60%]" />
        
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-[40%]" />
            <Skeleton className="h-4 w-[60%]" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Format dates for display
  const startDate = format(new Date(selectedMarket.startDate), 'MMM d, yyyy');
  const endDate = format(new Date(selectedMarket.endDate), 'MMM d, yyyy');
  
  // Helper to render status badge
  const renderStatusBadge = (status: MARKET_STATUS) => {
    const config = StatusBadgeMap[status];
    return (
      <Badge variant={config.variant as any}>{config.label}</Badge>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={selectedMarket.name}
        description="Market details and management"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Markets', href: MARKETS_FULL_ROUTES.ROOT },
          { label: 'All Markets', href: MARKETS_FULL_ROUTES.LIST },
          { label: selectedMarket.name, href: `${MARKETS_FULL_ROUTES.ROOT}/${id}` },
        ]}
      />
      
      <div className="grid gap-6 md:grid-cols-7">
        {/* Left Side - Market Overview */}
        <div className="md:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedMarket.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {selectedMarket.location}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {renderStatusBadge(selectedMarket.status)}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(getMarketEditRoute(id as string))}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 w-full mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="stock">Stock</TabsTrigger>
                  <TabsTrigger value="staff">Staff</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>
                
                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">Start Date</div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        {startDate}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">End Date</div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        {endDate}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">Status</div>
                      <div>{renderStatusBadge(selectedMarket.status)}</div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">Progress</div>
                      <div className="flex items-center">
                        <div className="w-full h-2 rounded-full bg-secondary mr-2">
                          <div 
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${selectedMarket.progress}%` }}
                          />
                        </div>
                        <span className="text-sm">{selectedMarket.progress}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Market Details</h3>
                    <p>
                      {selectedMarket.name} will take place at {selectedMarket.location} from {startDate} to {endDate}.
                      Current status is {StatusBadgeMap[selectedMarket.status].label.toLowerCase()}, with {selectedMarket.progress}% preparation completed.
                    </p>
                  </div>
                </TabsContent>
                
                {/* Stock Tab */}
                <TabsContent value="stock" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Stock Allocation</h3>
                    <Button onClick={() => navigate(getMarketStockRoute(id as string))}>
                      <Package className="h-4 w-4 mr-2" />
                      Manage Stock
                    </Button>
                  </div>
                  
                  {stockAllocations.length === 0 ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>No stock allocated</AlertTitle>
                      <AlertDescription>
                        No stock has been allocated to this market yet.
                        Click the "Manage Stock" button to allocate stock.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      {stockAllocations.map((allocation) => (
                        <Card key={allocation.id}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">Product ID: {allocation.productId}</CardTitle>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="text-sm">
                                <span className="font-medium">Allocated:</span> {allocation.allocated}
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">Total:</span> {allocation.total}
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">Sold:</span> {allocation.sold || 0}
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">Damaged:</span> {allocation.damaged || 0}
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="pt-0 text-xs text-muted-foreground">
                            Last updated: {allocation.lastUpdated ? format(new Date(allocation.lastUpdated), 'MMM d, yyyy') : 'N/A'}
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                {/* Staff Tab */}
                <TabsContent value="staff" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Staff Assignments</h3>
                    <Button onClick={() => navigate(getMarketStaffRoute(id as string))}>
                      <User className="h-4 w-4 mr-2" />
                      Manage Staff
                    </Button>
                  </div>
                  
                  {staffAssignments.length === 0 ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>No staff assigned</AlertTitle>
                      <AlertDescription>
                        No staff has been assigned to this market yet.
                        Click the "Manage Staff" button to assign staff.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      {staffAssignments.map((assignment) => (
                        <Card key={assignment.id}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">Staff ID: {assignment.staffId}</CardTitle>
                            <CardDescription>Role: {assignment.role}</CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="text-sm">
                                <Clock className="h-4 w-4 inline mr-1" />
                                <span className="font-medium">Start:</span> {format(new Date(assignment.shiftStart), 'MMM d, HH:mm')}
                              </div>
                              <div className="text-sm">
                                <Clock className="h-4 w-4 inline mr-1" />
                                <span className="font-medium">End:</span> {format(new Date(assignment.shiftEnd), 'MMM d, HH:mm')}
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="pt-0 flex justify-between items-center">
                            <div className="text-xs text-muted-foreground">
                              Assigned: {format(new Date(assignment.assignedAt), 'MMM d, yyyy')}
                            </div>
                            <Badge variant={assignment.confirmed ? 'success' : 'outline'}>
                              {assignment.confirmed ? 'Confirmed' : 'Pending'}
                            </Badge>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                {/* Performance Tab */}
                <TabsContent value="performance" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Performance Metrics</h3>
                    <Button onClick={() => navigate(getMarketPerformanceRoute(id as string))}>
                      <BarChart className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                  
                  <Alert>
                    <BarChart className="h-4 w-4" />
                    <AlertTitle>Performance data</AlertTitle>
                    <AlertDescription>
                      {selectedMarket.status === MARKET_STATUS.ACTIVE || selectedMarket.status === MARKET_STATUS.CLOSED ? (
                        "View detailed performance metrics by clicking 'View Details'"
                      ) : (
                        "Performance metrics will be available once the market is active"
                      )}
                    </AlertDescription>
                  </Alert>
                  
                  {selectedMarket.status === MARKET_STATUS.ACTIVE && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Current Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center text-xl font-semibold text-muted-foreground">
                          Data is being collected
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Side - Quick Actions */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate(getMarketEditRoute(id as string))}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Market
              </Button>
              
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate(getMarketStockRoute(id as string))}>
                <Package className="mr-2 h-4 w-4" />
                Manage Stock
              </Button>
              
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate(getMarketStaffRoute(id as string))}>
                <User className="mr-2 h-4 w-4" />
                Manage Staff
              </Button>
              
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate(getMarketPerformanceRoute(id as string))}>
                <BarChart className="mr-2 h-4 w-4" />
                View Performance
              </Button>
              
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate(`${MARKETS_FULL_ROUTES.ROOT}/settings`)}>
                <Settings className="mr-2 h-4 w-4" />
                Market Settings
              </Button>
              
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate(`${MARKETS_FULL_ROUTES.ROOT}/connection`)}>
                <ArrowUpRight className="mr-2 h-4 w-4" />
                External Connections
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Market Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-primary" />
                <div className="text-sm">Created: {selectedMarket.createdAt ? format(new Date(selectedMarket.createdAt), 'MMM d, yyyy') : 'N/A'}</div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-primary" />
                <div className="text-sm">Starts: {startDate}</div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-primary" />
                <div className="text-sm">Ends: {endDate}</div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-primary" />
                <div className="text-sm">Last Updated: {selectedMarket.updatedAt ? format(new Date(selectedMarket.updatedAt), 'MMM d, yyyy') : 'N/A'}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Market Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Stock Items:</span>
                <span className="font-medium">{stockAllocations.length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Staff Assigned:</span>
                <span className="font-medium">{staffAssignments.length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Duration:</span>
                <span className="font-medium">
                  {Math.ceil((new Date(selectedMarket.endDate).getTime() - new Date(selectedMarket.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Progress:</span>
                <span className="font-medium">{selectedMarket.progress}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MarketDetails; 