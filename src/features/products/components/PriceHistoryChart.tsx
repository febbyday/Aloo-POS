// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Minus, History } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  ReferenceLine,
  Area,
  AreaChart
} from "recharts";
import type { Product } from '../types';
import { formatCurrency } from '@/lib/utils';

// Mock price history data - in a real app this would come from an API
interface PricePoint {
  date: string;
  retailPrice: number;
  salePrice: number | null;
  costPrice: number;
}

interface PriceHistoryChartProps {
  product: Product;
}

/**
 * Component that displays a price history chart for a product
 * Shows retail price, sale price, and cost price over time
 */
export function PriceHistoryChart({ product }: PriceHistoryChartProps) {
  // In a real application, this would fetch data from an API
  const priceHistory = useMemo(() => {
    const today = new Date();
    const mockHistory: PricePoint[] = [];
    
    // Generate mock price history for the last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      
      // Create some variation in the prices
      const variation = 0.95 + (Math.random() * 0.2); // Between 0.95 and 1.15
      const baseRetailPrice = product.retailPrice || 0;
      
      mockHistory.push({
        date: date.toISOString().split('T')[0],
        retailPrice: Math.round(baseRetailPrice * variation * 100) / 100,
        salePrice: i % 2 === 0 ? Math.round(baseRetailPrice * 0.85 * 100) / 100 : null,
        costPrice: Math.round((baseRetailPrice * 0.6 * variation) * 100) / 100
      });
    }
    
    // Add current prices
    mockHistory.push({
      date: today.toISOString().split('T')[0],
      retailPrice: product.retailPrice || 0,
      salePrice: product.salePrice || null,
      costPrice: product.costPrice || 0
    });
    
    return mockHistory;
  }, [product]);

  // Calculate price trends
  const priceTrend = useMemo(() => {
    if (priceHistory.length < 2) return { direction: 'stable', percentage: 0 };
    
    const firstPrice = priceHistory[0].retailPrice;
    const currentPrice = priceHistory[priceHistory.length - 1].retailPrice;
    const difference = currentPrice - firstPrice;
    const percentage = Math.round((difference / firstPrice) * 100);
    
    return {
      direction: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'stable',
      percentage: Math.abs(percentage)
    };
  }, [priceHistory]);

  // Format data for Recharts
  const chartData = useMemo(() => {
    return priceHistory.map(point => {
      // Format date for display
      const date = new Date(point.date);
      const formattedDate = date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
      
      return {
        date: formattedDate,
        retailPrice: point.retailPrice,
        salePrice: point.salePrice,
        costPrice: point.costPrice,
        // Calculate margin for visualization
        margin: point.retailPrice - point.costPrice
      };
    });
  }, [priceHistory]);

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-md p-3">
          <p className="font-medium mb-1">{label}</p>
          <div className="space-y-1">
            <p className="text-primary text-sm flex justify-between">
              <span>Retail Price:</span> 
              <span className="font-medium ml-4">{formatCurrency(payload[0].value)}</span>
            </p>
            {payload[1]?.value && (
              <p className="text-green-600 text-sm flex justify-between">
                <span>Sale Price:</span> 
                <span className="font-medium ml-4">{formatCurrency(payload[1].value)}</span>
              </p>
            )}
            <p className="text-destructive text-sm flex justify-between">
              <span>Cost Price:</span> 
              <span className="font-medium ml-4">{formatCurrency(payload[2].value)}</span>
            </p>
            <p className="text-muted-foreground text-sm flex justify-between border-t pt-1 mt-1">
              <span>Margin:</span> 
              <span className="font-medium ml-4">{formatCurrency(payload[0].value - payload[2].value)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center">
            <History className="h-5 w-5 mr-2 text-primary" />
            Price History
          </CardTitle>
          <Badge 
            variant={priceTrend.direction === 'up' ? 'destructive' : priceTrend.direction === 'down' ? 'success' : 'outline'}
            className="flex items-center gap-1"
          >
            {priceTrend.direction === 'up' && <ArrowUp className="h-3 w-3" />}
            {priceTrend.direction === 'down' && <ArrowDown className="h-3 w-3" />}
            {priceTrend.direction === 'stable' && <Minus className="h-3 w-3" />}
            {priceTrend.percentage}% {priceTrend.direction === 'up' ? 'increase' : priceTrend.direction === 'down' ? 'decrease' : 'change'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }} 
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--muted))' }}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value)}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--muted))' }}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Retail Price Line */}
            <Area 
              type="monotone" 
              dataKey="retailPrice" 
              name="Retail Price" 
              stroke="hsl(var(--primary))" 
              fill="hsl(var(--primary))"
              fillOpacity={0.1}
              strokeWidth={2}
              activeDot={{ r: 6 }}
            />
            
            {/* Sale Price Line (if exists) */}
            <Area 
              type="monotone" 
              dataKey="salePrice" 
              name="Sale Price" 
              stroke="hsl(var(--success))" 
              fill="hsl(var(--success))"
              fillOpacity={0.1}
              strokeWidth={2}
              activeDot={{ r: 6 }}
              connectNulls
            />
            
            {/* Cost Price Line */}
            <Line 
              type="monotone" 
              dataKey="costPrice" 
              name="Cost Price" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            
            {/* Reference line for current retail price */}
            <ReferenceLine 
              y={product.retailPrice} 
              stroke="hsl(var(--primary))" 
              strokeDasharray="3 3"
              label={{ 
                value: "Current Price", 
                position: "insideTopRight",
                fill: "hsl(var(--primary))",
                fontSize: 12
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs mt-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-primary rounded-sm" />
            <span>Retail Price</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-success rounded-sm" />
            <span>Sale Price</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-destructive rounded-sm" />
            <span>Cost Price</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
