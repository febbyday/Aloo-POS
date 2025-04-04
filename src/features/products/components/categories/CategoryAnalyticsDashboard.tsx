import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon, 
  Calendar, 
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  RefreshCw
} from 'lucide-react';

// Types for analytics data
interface CategoryAnalytics {
  categoryId: string;
  categoryName: string;
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  averageRating: number;
  salesTrend: 'up' | 'down' | 'stable';
  salesGrowth: number;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  salesByPeriod: Array<{
    date: string;
    sales: number;
    revenue: number;
  }>;
  salesBySubcategory?: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  customerSegmentation: Array<{
    segment: string;
    count: number;
    percentage: number;
  }>;
  inventoryStatus: {
    inStock: number;
    lowStock: number;
    outOfStock: number;
  };
}

interface CategoryAnalyticsDashboardProps {
  categoryId: string;
  timeRange: 'day' | 'week' | 'month' | 'year';
  onTimeRangeChange: (range: 'day' | 'week' | 'month' | 'year') => void;
  onRefresh: () => void;
  onExport: (format: 'csv' | 'pdf' | 'excel') => void;
  isLoading?: boolean;
  data?: CategoryAnalytics;
}

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const CategoryAnalyticsDashboard: React.FC<CategoryAnalyticsDashboardProps> = ({
  categoryId,
  timeRange,
  onTimeRangeChange,
  onRefresh,
  onExport,
  isLoading = false,
  data
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  if (isLoading || !data) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">Loading analytics data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };
  
  // Get trend indicator
  const getTrendIndicator = () => {
    if (data.salesTrend === 'up') {
      return { 
        icon: <TrendingUp className="h-5 w-5 text-green-500" />, 
        text: `${data.salesGrowth.toFixed(1)}% increase`, 
        color: "text-green-500" 
      };
    } else if (data.salesTrend === 'down') {
      return { 
        icon: <TrendingDown className="h-5 w-5 text-red-500" />, 
        text: `${Math.abs(data.salesGrowth).toFixed(1)}% decrease`, 
        color: "text-red-500" 
      };
    } else {
      return { 
        icon: <TrendingDown className="h-5 w-5 text-yellow-500" />, 
        text: "No change", 
        color: "text-yellow-500" 
      };
    }
  };
  
  const trendIndicator = getTrendIndicator();
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-xl">{data.categoryName} Analytics</CardTitle>
            <CardDescription>
              Performance metrics and insights for this category
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={(value) => onTimeRangeChange(value as any)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => onExport('csv')}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3 rounded-none border-b">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="sales">
              <LineChartIcon className="h-4 w-4 mr-2" />
              Sales Trends
            </TabsTrigger>
            <TabsTrigger value="products">
              <PieChartIcon className="h-4 w-4 mr-2" />
              Products & Inventory
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <h3 className="text-2xl font-bold">${data.totalRevenue.toLocaleString()}</h3>
                    <div className={`flex items-center mt-1 ${trendIndicator.color}`}>
                      {trendIndicator.icon}
                      <span className="text-xs ml-1">{trendIndicator.text}</span>
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                    <h3 className="text-2xl font-bold">{data.totalSales.toLocaleString()}</h3>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Products</p>
                    <h3 className="text-2xl font-bold">{data.totalProducts}</h3>
                  </div>
                  <Package className="h-8 w-8 text-muted-foreground" />
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg. Rating</p>
                    <h3 className="text-2xl font-bold">{data.averageRating.toFixed(1)}</h3>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Sales Trend</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={data.salesByPeriod}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={formatDate}
                          minTickGap={30}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`}
                          formatter={(value) => [`$${value}`, 'Revenue']}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                          name="Revenue"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="sales" 
                          stroke="#82ca9d" 
                          name="Orders"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Customer Segments</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.customerSegmentation}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="segment"
                        >
                          {data.customerSegmentation.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name, props) => [`${value} customers`, props.payload.segment]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="sales" className="p-6">
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Revenue Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.salesByPeriod}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={formatDate}
                          minTickGap={30}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`}
                          formatter={(value) => [`$${value}`, 'Revenue']}
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {data.salesBySubcategory && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Sales by Subcategory</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={data.salesBySubcategory}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={150}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip 
                            formatter={(value) => [`$${value}`, 'Revenue']}
                          />
                          <Legend />
                          <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                          <Bar dataKey="sales" fill="#82ca9d" name="Orders" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="products" className="p-6">
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Top Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.topProducts}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          width={150}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip 
                          formatter={(value, name) => [
                            name === 'revenue' ? `$${value}` : value,
                            name === 'revenue' ? 'Revenue' : 'Units Sold'
                          ]}
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                        <Bar dataKey="sales" fill="#82ca9d" name="Units Sold" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Inventory Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'In Stock', value: data.inventoryStatus.inStock },
                            { name: 'Low Stock', value: data.inventoryStatus.lowStock },
                            { name: 'Out of Stock', value: data.inventoryStatus.outOfStock },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#4caf50" /> {/* In Stock - Green */}
                          <Cell fill="#ff9800" /> {/* Low Stock - Orange */}
                          <Cell fill="#f44336" /> {/* Out of Stock - Red */}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value} products`, '']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">In Stock</p>
                      <p className="text-lg font-medium">{data.inventoryStatus.inStock}</p>
                      <Badge className="bg-green-500 mt-1">
                        {Math.round((data.inventoryStatus.inStock / data.totalProducts) * 100)}%
                      </Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Low Stock</p>
                      <p className="text-lg font-medium">{data.inventoryStatus.lowStock}</p>
                      <Badge className="bg-orange-500 mt-1">
                        {Math.round((data.inventoryStatus.lowStock / data.totalProducts) * 100)}%
                      </Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Out of Stock</p>
                      <p className="text-lg font-medium">{data.inventoryStatus.outOfStock}</p>
                      <Badge className="bg-red-500 mt-1">
                        {Math.round((data.inventoryStatus.outOfStock / data.totalProducts) * 100)}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t p-4">
        <div className="text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 inline-block mr-1" />
          Data last updated: {new Date().toLocaleString()}
        </div>
      </CardFooter>
    </Card>
  );
};

export default CategoryAnalyticsDashboard;
