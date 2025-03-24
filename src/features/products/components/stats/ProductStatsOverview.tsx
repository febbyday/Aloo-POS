import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  Package, 
  TruckIcon, 
  DollarSign, 
  Calendar
} from 'lucide-react';
import { 
  SalesStatsCharts, 
  InventoryStatsCharts, 
  SupplierStatsCharts, 
  FinancialStatsCharts 
} from './index';
import type { Product } from '../../types';

interface ProductStatsOverviewProps {
  product: Product;
}

type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all';

/**
 * Component that organizes all product statistics charts into a tabbed interface
 * Allows users to switch between different types of statistics and time ranges
 */
export function ProductStatsOverview({ product }: ProductStatsOverviewProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('90d');

  // Handle time range change
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value as TimeRange);
  };

  return (
    <div className="space-y-4">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Product Statistics</h2>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics Tabs */}
      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Sales</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Inventory</span>
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <TruckIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Suppliers</span>
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Financial</span>
          </TabsTrigger>
        </TabsList>

        {/* Sales Statistics */}
        <TabsContent value="sales" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Sales Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <SalesStatsCharts product={product} timeRange={timeRange} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Statistics */}
        <TabsContent value="inventory" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Inventory Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <InventoryStatsCharts product={product} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Supplier Statistics */}
        <TabsContent value="suppliers" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Supplier Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <SupplierStatsCharts product={product} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Statistics */}
        <TabsContent value="financial" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Financial Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <FinancialStatsCharts product={product} timeRange={timeRange} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProductStatsOverview; 