import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  ComposedChart,
  Area
} from "recharts";
import { TruckIcon, Clock, DollarSign, BarChart3 } from 'lucide-react';
import type { Product } from '../../types';

interface SupplierStatsChartsProps {
  product: Product;
}

/**
 * Component that displays supplier statistics charts for a product
 * Shows supplier performance, lead times, and price trends
 */
export function SupplierStatsCharts({ product }: SupplierStatsChartsProps) {
  // Generate mock supplier history data
  const supplierHistory = useMemo(() => {
    const data = [];
    const today = new Date();
    const days = 365; // 1 year of data
    
    // Create a list of mock suppliers
    const suppliers = [
      { id: 1, name: 'Primary Supplier', reliability: 0.95, costFactor: 1.0 },
      { id: 2, name: 'Secondary Supplier', reliability: 0.85, costFactor: 0.9 },
      { id: 3, name: 'Tertiary Supplier', reliability: 0.75, costFactor: 0.8 }
    ];
    
    // Generate order data points
    for (let i = days; i >= 0; i -= 15) { // Orders roughly every 15 days
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Randomly select a supplier for this order
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
      
      // Create some random but realistic supplier data
      const quantity = Math.floor(Math.random() * 30) + 10;
      const basePrice = (product.costPrice || 10) * supplier.costFactor;
      const pricePerUnit = basePrice * (0.9 + Math.random() * 0.2); // Fluctuate by ±10%
      
      // Calculate lead time (days to deliver)
      const leadTime = Math.floor(Math.random() * 10) + 3; // 3-12 days
      
      // Calculate if there were any quality issues
      const qualityIssues = Math.random() > supplier.reliability;
      const qualityScore = qualityIssues 
        ? Math.floor(Math.random() * 30) + 60 // 60-89 if issues
        : Math.floor(Math.random() * 10) + 90; // 90-99 if no issues
      
      data.push({
        date: date.toISOString().split('T')[0],
        formattedDate: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        supplier: supplier.name,
        supplierId: supplier.id,
        quantity,
        pricePerUnit,
        totalCost: quantity * pricePerUnit,
        leadTime,
        qualityScore,
        qualityIssues,
        onTime: Math.random() > 0.2, // 80% on-time delivery rate
      });
    }
    
    return data;
  }, [product]);

  // Supplier performance data
  const supplierPerformanceData = useMemo(() => {
    const suppliers: Record<string, { 
      name: string, 
      orders: number, 
      avgLeadTime: number, 
      avgQualityScore: number,
      onTimeDelivery: number,
      totalOrdered: number,
      avgPrice: number
    }> = {};
    
    supplierHistory.forEach(order => {
      if (!suppliers[order.supplier]) {
        suppliers[order.supplier] = { 
          name: order.supplier, 
          orders: 0, 
          avgLeadTime: 0, 
          avgQualityScore: 0,
          onTimeDelivery: 0,
          totalOrdered: 0,
          avgPrice: 0
        };
      }
      
      const supplier = suppliers[order.supplier];
      supplier.orders += 1;
      supplier.avgLeadTime += order.leadTime;
      supplier.avgQualityScore += order.qualityScore;
      supplier.onTimeDelivery += order.onTime ? 1 : 0;
      supplier.totalOrdered += order.quantity;
      supplier.avgPrice += order.pricePerUnit;
    });
    
    // Calculate averages
    return Object.values(suppliers).map(supplier => ({
      name: supplier.name,
      orders: supplier.orders,
      avgLeadTime: supplier.orders > 0 ? (supplier.avgLeadTime / supplier.orders).toFixed(1) : 0,
      avgQualityScore: supplier.orders > 0 ? (supplier.avgQualityScore / supplier.orders).toFixed(1) : 0,
      onTimeRate: supplier.orders > 0 ? ((supplier.onTimeDelivery / supplier.orders) * 100).toFixed(0) : 0,
      totalOrdered: supplier.totalOrdered,
      avgPrice: supplier.orders > 0 ? (supplier.avgPrice / supplier.orders).toFixed(2) : 0
    }));
  }, [supplierHistory]);

  // Price trend data (by month)
  const priceTrendData = useMemo(() => {
    const months: Record<string, { 
      month: string, 
      avgPrice: number, 
      totalQuantity: number,
      orders: number
    }> = {};
    
    supplierHistory.forEach(order => {
      const date = new Date(order.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
      
      if (!months[monthKey]) {
        months[monthKey] = { 
          month: monthName, 
          avgPrice: 0, 
          totalQuantity: 0,
          orders: 0
        };
      }
      
      months[monthKey].avgPrice += order.pricePerUnit;
      months[monthKey].totalQuantity += order.quantity;
      months[monthKey].orders += 1;
    });
    
    // Calculate averages and sort by date
    return Object.entries(months)
      .map(([key, data]) => ({
        monthKey: key,
        month: data.month,
        avgPrice: data.orders > 0 ? data.avgPrice / data.orders : 0,
        totalQuantity: data.totalQuantity
      }))
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  }, [supplierHistory]);

  // Lead time vs quality data for scatter plot
  const leadTimeQualityData = useMemo(() => {
    return supplierHistory.map(order => ({
      supplier: order.supplier,
      leadTime: order.leadTime,
      qualityScore: order.qualityScore,
      quantity: order.quantity,
      date: order.formattedDate
    }));
  }, [supplierHistory]);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-md p-3">
          <p className="font-medium mb-1">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <p 
                key={`item-${index}`}
                className="text-sm flex justify-between"
                style={{ color: entry.color }}
              >
                <span>{entry.name}:</span> 
                <span className="font-medium ml-4">
                  {entry.name.includes('Price') 
                    ? `$${Number(entry.value).toFixed(2)}` 
                    : entry.name.includes('Rate') || entry.name.includes('Score')
                    ? `${Number(entry.value).toFixed(0)}%`
                    : entry.value}
                </span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Scatter plot tooltip
  const ScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-md shadow-md p-3">
          <p className="font-medium mb-1">{data.supplier}</p>
          <div className="space-y-1 text-sm">
            <p>Lead Time: {data.leadTime} days</p>
            <p>Quality Score: {data.qualityScore}%</p>
            <p>Order Quantity: {data.quantity} units</p>
            <p>Date: {data.date}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Supplier Performance Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-primary" />
            Supplier Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={supplierPerformanceData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--muted))' }}
              />
              <YAxis 
                yAxisId="left"
                orientation="left"
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--muted))' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => `${value} days`}
                domain={[0, 'auto']}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--muted))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                yAxisId="left"
                dataKey="onTimeRate" 
                name="On-Time Delivery Rate" 
                fill="hsl(var(--success))" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                yAxisId="left"
                dataKey="avgQualityScore" 
                name="Quality Score" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                yAxisId="right"
                dataKey="avgLeadTime" 
                name="Avg. Lead Time (days)" 
                fill="hsl(var(--warning))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Price Trends and Order Volume */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-primary" />
            Price Trends & Order Volume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={priceTrendData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--muted))' }}
              />
              <YAxis 
                yAxisId="left"
                orientation="left"
                tickFormatter={(value) => `$${value}`}
                domain={['auto', 'auto']}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--muted))' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                domain={[0, 'auto']}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--muted))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="avgPrice" 
                name="Avg. Price per Unit" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="totalQuantity"
                name="Order Quantity"
                fill="hsl(var(--muted-foreground))"
                stroke="hsl(var(--muted-foreground))"
                fillOpacity={0.3}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Lead Time vs Quality Scatter Plot */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary" />
            Lead Time vs. Quality Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                type="number"
                dataKey="leadTime" 
                name="Lead Time"
                label={{ value: 'Lead Time (days)', position: 'insideBottom', offset: -5 }}
                domain={[0, 'auto']}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--muted))' }}
              />
              <YAxis 
                type="number"
                dataKey="qualityScore" 
                name="Quality Score"
                label={{ value: 'Quality Score (%)', angle: -90, position: 'insideLeft' }}
                domain={[50, 100]}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--muted))' }}
              />
              <ZAxis 
                type="number"
                dataKey="quantity" 
                range={[50, 400]}
                name="Order Quantity"
              />
              <Tooltip content={<ScatterTooltip />} />
              <Legend />
              {supplierPerformanceData.map((supplier, index) => (
                <Scatter 
                  key={supplier.name}
                  name={supplier.name} 
                  data={leadTimeQualityData.filter(d => d.supplier === supplier.name)} 
                  fill={
                    index === 0 
                      ? 'hsl(var(--primary))' 
                      : index === 1 
                      ? 'hsl(var(--success))' 
                      : 'hsl(var(--warning))'
                  }
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default SupplierStatsCharts; 