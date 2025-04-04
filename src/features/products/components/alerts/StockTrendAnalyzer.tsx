import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  Download,
  ArrowRight,
  Clock
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface StockHistoryPoint {
  date: string;
  stock: number;
  sales?: number;
  received?: number;
  transferred?: number;
  adjusted?: number;
}

interface ProductStockTrend {
  productId: string;
  productName: string;
  productSku: string;
  currentStock: number;
  warningThreshold: number;
  criticalThreshold: number;
  stockHistory: StockHistoryPoint[];
  projectedDaysUntilStockout: number;
  averageDailyUsage: number;
  restockRecommendation: number;
  lastRestockDate?: string;
}

interface StockTrendAnalyzerProps {
  product: ProductStockTrend;
  onExport: (format: 'csv' | 'pdf' | 'image') => void;
  onTimeRangeChange: (range: '7d' | '30d' | '90d' | '1y') => void;
  onViewStockHistory: (productId: string) => void;
  onCreatePurchaseOrder: (productId: string, quantity: number) => void;
}

export const StockTrendAnalyzer: React.FC<StockTrendAnalyzerProps> = ({
  product,
  onExport,
  onTimeRangeChange,
  onViewStockHistory,
  onCreatePurchaseOrder,
}) => {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTimeRangeChange = (value: string) => {
    const range = value as '7d' | '30d' | '90d' | '1y';
    setTimeRange(range);
    onTimeRangeChange(range);
  };

  const handleCreatePurchaseOrder = async () => {
    try {
      setIsProcessing(true);
      await onCreatePurchaseOrder(product.productId, product.restockRecommendation);
      toast({
        title: "Purchase Order Created",
        description: `Successfully created purchase order for ${product.productName}.`,
      });
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const getTrendIndicator = () => {
    if (product.stockHistory.length < 2) return null;
    
    const firstStock = product.stockHistory[0].stock;
    const lastStock = product.stockHistory[product.stockHistory.length - 1].stock;
    const stockChange = lastStock - firstStock;
    
    if (stockChange < 0) {
      return { 
        icon: <TrendingDown className="h-5 w-5 text-red-500" />, 
        text: "Decreasing", 
        color: "text-red-500" 
      };
    } else if (stockChange > 0) {
      return { 
        icon: <TrendingUp className="h-5 w-5 text-green-500" />, 
        text: "Increasing", 
        color: "text-green-500" 
      };
    } else {
      return { 
        icon: <ArrowRight className="h-5 w-5 text-yellow-500" />, 
        text: "Stable", 
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
            <CardTitle className="text-xl">{product.productName} Stock Trend</CardTitle>
            <CardDescription>
              SKU: {product.productSku} | Current Stock: {product.currentStock} units
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => onExport('csv')}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stock Trend</p>
                <div className="flex items-center mt-1">
                  {trendIndicator && (
                    <>
                      {trendIndicator.icon}
                      <span className={`ml-1 font-bold ${trendIndicator.color}`}>
                        {trendIndicator.text}
                      </span>
                    </>
                  )}
                </div>
              </div>
              {product.currentStock <= product.criticalThreshold && (
                <Badge variant="destructive">Critical</Badge>
              )}
              {product.currentStock > product.criticalThreshold && 
                product.currentStock <= product.warningThreshold && (
                <Badge variant="warning">Warning</Badge>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-muted-foreground">Avg. Daily Usage</p>
              <p className="text-2xl font-bold">{product.averageDailyUsage.toFixed(1)} units</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Days Until Stockout</p>
                <p className="text-2xl font-bold">
                  {product.projectedDaysUntilStockout < 0 
                    ? 'Stocked Out' 
                    : `${Math.round(product.projectedDaysUntilStockout)} days`}
                </p>
              </div>
              {product.projectedDaysUntilStockout <= 7 && (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="stock">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stock">Stock History</TabsTrigger>
            <TabsTrigger value="movement">Stock Movement</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stock" className="pt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={product.stockHistory}
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
                    formatter={(value) => [`${value} units`, 'Stock']}
                  />
                  <Legend />
                  <ReferenceLine 
                    y={product.warningThreshold} 
                    stroke="#ff9800" 
                    strokeDasharray="3 3" 
                    label={{ value: 'Warning', position: 'insideTopRight' }} 
                  />
                  <ReferenceLine 
                    y={product.criticalThreshold} 
                    stroke="#f44336" 
                    strokeDasharray="3 3" 
                    label={{ value: 'Critical', position: 'insideBottomRight' }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="stock" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                    name="Stock Level"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="movement" className="pt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={product.stockHistory}
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
                  />
                  <Legend />
                  <Bar dataKey="sales" fill="#f44336" name="Sales" />
                  <Bar dataKey="received" fill="#4caf50" name="Received" />
                  <Bar dataKey="transferred" fill="#2196f3" name="Transferred" />
                  <Bar dataKey="adjusted" fill="#ff9800" name="Adjusted" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 border rounded-md bg-muted/30">
          <h4 className="font-medium mb-2 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
            Stock Insights
          </h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <Clock className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
              <span>
                At the current usage rate of <strong>{product.averageDailyUsage.toFixed(1)} units/day</strong>, 
                stock will be depleted in approximately <strong>{Math.round(product.projectedDaysUntilStockout)} days</strong>.
              </span>
            </li>
            <li className="flex items-start">
              <Calendar className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
              <span>
                Last restock was on <strong>{product.lastRestockDate ? new Date(product.lastRestockDate).toLocaleDateString() : 'N/A'}</strong>.
              </span>
            </li>
            <li className="flex items-start">
              <TrendingUp className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
              <span>
                Recommended restock quantity: <strong>{product.restockRecommendation} units</strong>.
              </span>
            </li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button 
          variant="outline" 
          onClick={() => onViewStockHistory(product.productId)}
        >
          View Full History
        </Button>
        <Button 
          onClick={handleCreatePurchaseOrder} 
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : `Reorder ${product.restockRecommendation} Units`}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StockTrendAnalyzer;
