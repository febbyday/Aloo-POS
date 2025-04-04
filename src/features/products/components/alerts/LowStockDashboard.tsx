import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination } from '@/components/ui/pagination';
import { 
  AlertTriangle, 
  AlertCircle, 
  Search, 
  Filter, 
  RefreshCw, 
  FileDown, 
  Printer, 
  ShoppingCart,
  BarChart3
} from 'lucide-react';
import { StockAlert } from './AlertNotificationCenter';
import { useToast } from '@/components/ui/use-toast';

interface LowStockDashboardProps {
  alerts: StockAlert[];
  loading: boolean;
  totalCount: number;
  criticalCount: number;
  warningCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSearch: (query: string) => void;
  onFilter: (filter: { status?: string; category?: string; location?: string }) => void;
  onRefresh: () => void;
  onExport: (format: 'csv' | 'pdf' | 'excel') => void;
  onPrint: () => void;
  onCreatePurchaseOrder: (productIds: string[]) => void;
  onViewProduct: (productId: string) => void;
  categories: { id: string; name: string }[];
  locations: { id: string; name: string }[];
}

export const LowStockDashboard: React.FC<LowStockDashboardProps> = ({
  alerts,
  loading,
  totalCount,
  criticalCount,
  warningCount,
  currentPage,
  totalPages,
  onPageChange,
  onSearch,
  onFilter,
  onRefresh,
  onExport,
  onPrint,
  onCreatePurchaseOrder,
  onViewProduct,
  categories,
  locations,
}) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset selected alerts when alerts change
  useEffect(() => {
    setSelectedAlerts(new Set());
  }, [alerts]);

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleFilter = () => {
    onFilter({
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      location: selectedLocation !== 'all' ? selectedLocation : undefined,
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = alerts.map(alert => alert.id);
      setSelectedAlerts(new Set(allIds));
    } else {
      setSelectedAlerts(new Set());
    }
  };

  const handleSelectAlert = (alertId: string) => {
    const newSelected = new Set(selectedAlerts);
    if (newSelected.has(alertId)) {
      newSelected.delete(alertId);
    } else {
      newSelected.add(alertId);
    }
    setSelectedAlerts(newSelected);
  };

  const handleCreatePurchaseOrder = async () => {
    if (selectedAlerts.size === 0) {
      toast({
        title: "No Products Selected",
        description: "Please select at least one product to create a purchase order.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      const selectedProductIds = Array.from(selectedAlerts).map(
        alertId => alerts.find(a => a.id === alertId)?.productId
      ).filter(Boolean) as string[];
      
      await onCreatePurchaseOrder(selectedProductIds);
      
      toast({
        title: "Purchase Order Created",
        description: `Successfully created purchase order for ${selectedProductIds.length} products.`,
      });
      
      setSelectedAlerts(new Set());
    } catch (error) {
      console.error('Failed to create purchase order:', error);
      toast({
        title: "Failed to Create Purchase Order",
        description: "An error occurred while creating the purchase order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Low Stock Dashboard</CardTitle>
            <CardDescription>
              Monitor and manage products with low inventory levels
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => onExport('csv')}>
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={onPrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Alerts</p>
                <h3 className="text-2xl font-bold">{totalCount}</h3>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical</p>
                <h3 className="text-2xl font-bold text-red-500">{criticalCount}</h3>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Warning</p>
                <h3 className="text-2xl font-bold text-amber-500">{warningCount}</h3>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-500" />
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 flex items-center space-x-2">
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Button variant="secondary" onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="secondary" onClick={handleFilter}>
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>

        {/* Alerts Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={selectedAlerts.size === alerts.length && alerts.length > 0}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span className="ml-2">Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : alerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No low stock alerts found.
                  </TableCell>
                </TableRow>
              ) : (
                alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedAlerts.has(alert.id)}
                        onCheckedChange={() => handleSelectAlert(alert.id)}
                        aria-label={`Select ${alert.productName}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{alert.productName}</TableCell>
                    <TableCell>{alert.productSku}</TableCell>
                    <TableCell>{alert.currentStock}</TableCell>
                    <TableCell>{alert.threshold}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={alert.status === 'critical' ? 'destructive' : 'warning'}
                        className="capitalize"
                      >
                        {alert.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{alert.locationName || 'All Locations'}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onViewProduct(alert.productId)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 py-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div>
          <Badge variant="outline">
            {selectedAlerts.size} selected
          </Badge>
        </div>
        <Button 
          onClick={handleCreatePurchaseOrder} 
          disabled={selectedAlerts.size === 0 || isProcessing}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isProcessing ? 'Processing...' : 'Create Purchase Order'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LowStockDashboard;
