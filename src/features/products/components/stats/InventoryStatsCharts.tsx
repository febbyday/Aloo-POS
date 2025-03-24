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
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { Package, AlertTriangle, Truck, Activity } from 'lucide-react';
import type { Product } from '../../types';

interface InventoryStatsChartsProps {
  product: Product;
}

/**
 * Component that displays inventory statistics charts for a product
 * Shows stock levels, movements, and trends over time
 */
export function InventoryStatsCharts({ product }: InventoryStatsChartsProps) {
  // Generate mock inventory history data
  const inventoryHistory = useMemo(() => {
    const data = [];
    const today = new Date();
    const days = 90; // 3 months of data
    
    let currentStock = product.stock || 0;
    
    // Generate daily data points
    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Create some random but realistic inventory movements
      const received = i % 15 === 0 ? Math.floor(Math.random() * 20) + 10 : 0; // Restock every 15 days
      const sold = Math.floor(Math.random() * 5); // Random daily sales
      const adjusted = i % 30 === 0 ? Math.floor(Math.random() * 3) - 1 : 0; // Occasional inventory adjustments
      
      // Update current stock
      currentStock = currentStock + received - sold + adjusted;
      if (currentStock < 0) currentStock = 0;
      
      data.push({
        date: date.toISOString().split('T')[0],
        formattedDate: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        stock: currentStock,
        received,
        sold,
        adjusted
      });
    }
    
    return data;
  }, [product]);

  // Generate monthly aggregated data
  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string, stock: number, received: number, sold: number, adjusted: number }> = {};
    
    inventoryHistory.forEach(day => {
      const date = new Date(day.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString(undefined, { month: 'short' });
      
      if (!months[monthKey]) {
        months[monthKey] = { 
          month: monthName, 
          stock: 0, // We'll use the last day's stock for the month
          received: 0, 
          sold: 0, 
          adjusted: 0 
        };
      }
      
      // Update with the latest stock value
      months[monthKey].stock = day.stock;
      months[monthKey].received += day.received;
      months[monthKey].sold += day.sold;
      months[monthKey].adjusted += day.adjusted;
    });
    
    return Object.values(months);
  }, [inventoryHistory]);

  // Location stock data for radar chart
  const locationStockData = useMemo(() => {
    if (!product.locations || !Array.isArray(product.locations)) {
      return [
        { location: 'Main Store', stock: product.stock || 0, capacity: product.maxStock || 100 }
      ];
    }
    
    return product.locations.map(location => ({
      location: location.name || 'Unknown',
      stock: location.stock || 0,
      capacity: location.maxStock || 100,
      minStock: location.minStock || 0
    }));
  }, [product]);

  // Stock status data for pie chart
  const stockStatusData = useMemo(() => {
    const totalStock = product.locations && Array.isArray(product.locations) 
      ? product.locations.reduce((sum, loc) => sum + (loc.stock || 0), 0)
      : product.stock || 0;
    
    const minStock = product.minStock || 0;
    const maxStock = product.maxStock || 100;
    
    // Calculate optimal stock level (between min and max)
    const optimalStock = Math.max(0, totalStock - minStock);
    const lowStock = Math.min(totalStock, minStock);
    const excessStock = Math.max(0, totalStock - maxStock);
    
    return [
      { name: 'Low Stock', value: lowStock },
      { name: 'Optimal Stock', value: optimalStock },
      { name: 'Excess Stock', value: excessStock }
    ].filter(item => item.value > 0);
  }, [product]);

  // Colors for charts
  const COLORS = ['#FF8042', '#00C49F', '#0088FE', '#FFBB28'];

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
                <span className="font-medium ml-4">{entry.value} units</span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Stock Level History Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center">
            <Package className="h-5 w-5 mr-2 text-primary" />
            Stock Level History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={inventoryHistory.filter((_, index) => index % 7 === 0)} // Show weekly data points
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--muted))' }}
              />
              <YAxis 
                tickFormatter={(value) => `${value}`}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--muted))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="stock" 
                name="Stock Level" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              {product.minStock && (
                <Line 
                  type="monotone" 
                  dataKey={() => product.minStock} 
                  name="Min Stock" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              )}
              {product.maxStock && (
                <Line 
                  type="monotone" 
                  dataKey={() => product.maxStock} 
                  name="Max Stock" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Inventory Movement Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stock by Location Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center">
              <Activity className="h-5 w-5 mr-2 text-primary" />
              Stock by Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={locationStockData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="location" />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                <Radar
                  name="Current Stock"
                  dataKey="stock"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Min Stock"
                  dataKey="minStock"
                  stroke="hsl(var(--destructive))"
                  fill="hsl(var(--destructive))"
                  fillOpacity={0.3}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stock Status Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
              Stock Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stockStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {stockStatusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.name === 'Low Stock' 
                          ? 'hsl(var(--destructive))' 
                          : entry.name === 'Optimal Stock' 
                          ? 'hsl(var(--success))' 
                          : 'hsl(var(--warning))'
                      } 
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} units`, 'Quantity']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Movements Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center">
            <Truck className="h-5 w-5 mr-2 text-primary" />
            Inventory Movements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={monthlyData}
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
                tickFormatter={(value) => `${value}`}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--muted))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="received" 
                name="Received" 
                fill="hsl(var(--success))" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="sold" 
                name="Sold" 
                fill="hsl(var(--destructive))" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="adjusted" 
                name="Adjusted" 
                fill="hsl(var(--warning))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default InventoryStatsCharts; 