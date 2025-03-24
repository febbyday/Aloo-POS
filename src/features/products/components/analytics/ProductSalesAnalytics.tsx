
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, LineChart, PieChart, GroupedBarChart } from '@/components/ui/charts';
import { 
  Calendar, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users 
} from 'lucide-react';
import { useToastManager } from '@/components/ui/toast-manager';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../types';

interface ProductSalesAnalyticsProps {
  product: Product;
  onClose: () => void;
}

// Mock data generator for sales analytics
const generateMockData = (product: Product, days: number = 30) => {
  const today = new Date();
  const salesData = [];
  const revenueData = [];
  const profitData = [];
  
  // Generate daily data
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (days - i - 1));
    
    // Random sales with some trend and weekend pattern
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseSales = isWeekend ? 15 : 10;
    const randomFactor = Math.random() * 0.5 + 0.75; // 0.75 to 1.25
    const sales = Math.round(baseSales * randomFactor * (1 + i/100)); // Slight upward trend
    
    // Calculate revenue and profit
    const revenue = sales * product.retailPrice;
    const profit = sales * (product.retailPrice - product.costPrice);
    
    salesData.push({
      date: date.toISOString().split('T')[0],
      value: sales
    });
    
    revenueData.push({
      date: date.toISOString().split('T')[0],
      value: revenue
    });
    
    profitData.push({
      date: date.toISOString().split('T')[0],
      value: profit
    });
  }
  
  // Customer segments
  const customerSegments = [
    { name: 'Retail', value: 45 },
    { name: 'Wholesale', value: 30 },
    { name: 'Online', value: 25 }
  ];
  
  // Sales by location
  const salesByLocation = [
    { name: 'Main Store', value: 40 },
    { name: 'Branch Store', value: 35 },
    { name: 'Online Shop', value: 25 }
  ];
  
  return {
    salesData,
    revenueData,
    profitData,
    customerSegments,
    salesByLocation,
    totalSales: salesData.reduce((sum, item) => sum + item.value, 0),
    totalRevenue: revenueData.reduce((sum, item) => sum + item.value, 0),
    totalProfit: profitData.reduce((sum, item) => sum + item.value, 0)
  };
};

export function ProductSalesAnalytics({ product, onClose }: ProductSalesAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90' | '365'>('30');
  const [analyticsData, setAnalyticsData] = useState(() => generateMockData(product, 30));
  const showToast = useToastManager();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Update data when time range changes
    setAnalyticsData(generateMockData(product, parseInt(timeRange)));
  }, [timeRange, product]);
  
  const handleExport = (format: 'pdf' | 'csv' | 'excel') => {
    showToast.info(
      "Exporting Data", 
      `Preparing to export analytics data as ${format.toUpperCase()}`
    );
    
    // In a real implementation, this would call an API to generate the export
    setTimeout(() => {
      showToast.success(
        "Export Complete", 
        `Analytics data has been exported as ${format.toUpperCase()}`
      );
    }, 1500);
  };
  
  const handleViewDetailedAnalytics = () => {
    navigate(`/analytics/products/${product.id}/detailed`);
  };
  
  // Calculate trend percentages
  const calculateTrend = (data: any[]) => {
    if (data.length < 2) return 0;
    
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.value, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.value, 0) / secondHalf.length;
    
    if (firstHalfAvg === 0) return 0;
    return ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
  };
  
  const salesTrend = calculateTrend(analyticsData.salesData);
  const revenueTrend = calculateTrend(analyticsData.revenueData);
  const profitTrend = calculateTrend(analyticsData.profitData);
  
  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle id="analytics-title">Sales Analytics: {product.name}</CardTitle>
            <CardDescription>
              SKU: {product.sku} | Category: {product.category}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="365">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6" aria-labelledby="analytics-title">
        {/* Key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                  <h3 className="text-2xl font-bold">{analyticsData.totalSales} units</h3>
                </div>
                <div className={`flex items-center ${salesTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {salesTrend >= 0 ? (
                    <TrendingUp className="h-5 w-5 mr-1" />
                  ) : (
                    <TrendingDown className="h-5 w-5 mr-1" />
                  )}
                  <span className="font-medium">{Math.abs(salesTrend).toFixed(1)}%</span>
                </div>
              </div>
              <div className="mt-4 h-10">
                <BarChart 
                  data={analyticsData.salesData.slice(-7)} 
                  xField="date" 
                  yField="value" 
                  height={40} 
                  showXAxis={false}
                  showYAxis={false}
                  color={salesTrend >= 0 ? '#10b981' : '#ef4444'}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <h3 className="text-2xl font-bold">${analyticsData.totalRevenue.toFixed(2)}</h3>
                </div>
                <div className={`flex items-center ${revenueTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {revenueTrend >= 0 ? (
                    <TrendingUp className="h-5 w-5 mr-1" />
                  ) : (
                    <TrendingDown className="h-5 w-5 mr-1" />
                  )}
                  <span className="font-medium">{Math.abs(revenueTrend).toFixed(1)}%</span>
                </div>
              </div>
              <div className="mt-4 h-10">
                <LineChart 
                  data={analyticsData.revenueData.slice(-7)} 
                  xField="date" 
                  yField="value" 
                  height={40} 
                  showXAxis={false}
                  showYAxis={false}
                  color={revenueTrend >= 0 ? '#10b981' : '#ef4444'}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Profit</p>
                  <h3 className="text-2xl font-bold">${analyticsData.totalProfit.toFixed(2)}</h3>
                </div>
                <div className={`flex items-center ${profitTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {profitTrend >= 0 ? (
                    <TrendingUp className="h-5 w-5 mr-1" />
                  ) : (
                    <TrendingDown className="h-5 w-5 mr-1" />
                  )}
                  <span className="font-medium">{Math.abs(profitTrend).toFixed(1)}%</span>
                </div>
              </div>
              <div className="mt-4 h-10">
                <LineChart 
                  data={analyticsData.profitData.slice(-7)} 
                  xField="date" 
                  yField="value" 
                  height={40} 
                  showXAxis={false}
                  showYAxis={false}
                  color={profitTrend >= 0 ? '#10b981' : '#ef4444'}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs for different analytics views */}
        <Tabs defaultValue="sales">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sales">Sales Trends</TabsTrigger>
            <TabsTrigger value="segments">Customer Segments</TabsTrigger>
            <TabsTrigger value="locations">Sales by Location</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sales" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Sales Trend Analysis</CardTitle>
                <CardDescription>
                  Compare sales, revenue, and profit metrics over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {/* Convert the data format for GroupedBarChart */}
                <GroupedBarChart
                  data={{
                    categories: analyticsData.salesData.map(item => {
                      // Format date to show only month or shorter format
                      const date = new Date(item.date);
                      return date.toLocaleDateString(undefined, { month: 'short' });
                    }),
                    series: [
                      {
                        name: 'Units Sold',
                        values: analyticsData.salesData.map(item => item.value),
                        color: '#4b72b0' // Blue
                      },
                      {
                        name: 'Revenue',
                        values: analyticsData.revenueData.map(item => item.value / 100), // Scale down for visualization
                        color: '#54a24b' // Green
                      },
                      {
                        name: 'Profit',
                        values: analyticsData.profitData.map(item => item.value / 50), // Scale down for visualization
                        color: '#eeca3b' // Yellow/Gold
                      }
                    ]
                  }}
                  height={300}
                  darkMode={false}
                  title="Monthly Performance"
                  subtitle="Units sold, revenue ($100s), and profit ($50s)"
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="segments" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
                <CardDescription>
                  Sales distribution across customer types
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="flex items-center justify-center h-full">
                  <PieChart 
                    data={analyticsData.customerSegments} 
                    nameField="name" 
                    valueField="value" 
                    height={300}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="locations" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Sales by Location</CardTitle>
                <CardDescription>
                  Distribution of sales across different store locations
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <BarChart 
                  data={analyticsData.salesByLocation} 
                  xField="name" 
                  yField="value" 
                  height={300}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onClose}>Close</Button>
        <Button onClick={handleViewDetailedAnalytics}>View Detailed Analytics</Button>
      </CardFooter>
    </Card>
  );
}

// Add default export for the component
export default ProductSalesAnalytics;