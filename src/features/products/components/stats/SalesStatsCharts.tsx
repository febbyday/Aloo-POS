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
  ComposedChart,
  Area
} from "recharts";
import { BarChart2, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';
import type { Product } from '../../types';

interface SalesStatsChartsProps {
  productId: string;
  timeRange?: '7d' | '30d' | '90d' | '1y' | 'all';
}

/**
 * Component that displays sales statistics charts for a product
 * Shows sales volume, revenue, and trends over time
 */
export function SalesStatsCharts({ productId, timeRange = '90d' }: SalesStatsChartsProps) {
  // Mock product data for demonstration
  const product = {
    id: productId,
    price: 99.99,
    costPrice: 49.99,
    retailPrice: 99.99
  };
  // Generate mock sales data based on time range
  const salesData = useMemo(() => {
    const data = [];
    const today = new Date();

    // Determine number of days based on timeRange
    let days = 90;
    switch (timeRange) {
      case '7d': days = 7; break;
      case '30d': days = 30; break;
      case '90d': days = 90; break;
      case '1y': days = 365; break;
      case 'all': days = 730; break; // 2 years
    }

    // Generate daily data points
    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Create some random but realistic sales data
      const quantity = Math.floor(Math.random() * 10) + 1;
      const price = product.price || 19.99;
      const cost = product.costPrice || 9.99;
      const revenue = quantity * price;
      const profit = revenue - (quantity * cost);

      data.push({
        date: date.toISOString().split('T')[0],
        formattedDate: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        quantity,
        revenue,
        profit
      });
    }

    return data;
  }, [product, timeRange]);

  // Generate monthly aggregated data
  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string, quantity: number, revenue: number, profit: number }> = {};

    salesData.forEach(day => {
      const date = new Date(day.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString(undefined, { month: 'short' });

      if (!months[monthKey]) {
        months[monthKey] = { month: monthName, quantity: 0, revenue: 0, profit: 0 };
      }

      months[monthKey].quantity += day.quantity;
      months[monthKey].revenue += day.revenue;
      months[monthKey].profit += day.profit;
    });

    return Object.values(months);
  }, [salesData]);

  // Calculate total stats
  const totalStats = useMemo(() => {
    return salesData.reduce((acc, day) => {
      acc.quantity += day.quantity;
      acc.revenue += day.revenue;
      acc.profit += day.profit;
      return acc;
    }, { quantity: 0, revenue: 0, profit: 0 });
  }, [salesData]);

  // Distribution data for pie chart
  const distributionData = useMemo(() => {
    // Mock data for sales channels
    return [
      { name: 'In-Store', value: Math.round(totalStats.quantity * 0.6) },
      { name: 'Online', value: Math.round(totalStats.quantity * 0.3) },
      { name: 'Phone', value: Math.round(totalStats.quantity * 0.1) }
    ];
  }, [totalStats]);

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
                  {entry.name.includes('Revenue') || entry.name.includes('Profit')
                    ? formatCurrency(entry.value)
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

  return (
    <div className="space-y-6">
      {/* Sales Overview Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center">
            <BarChart2 className="h-5 w-5 mr-2 text-primary" />
            Sales Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={timeRange === '365' ? monthlyData : salesData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey={timeRange === '365' ? "month" : "formattedDate"}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--muted))' }}
              />
              <YAxis
                yAxisId="left"
                tickFormatter={(value) => `${value}`}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--muted))' }}
                label={{ value: 'Units', angle: -90, position: 'insideLeft', fontSize: 12 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--muted))' }}
                label={{ value: 'Revenue', angle: 90, position: 'insideRight', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="quantity"
                name="Units Sold"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="profit"
                name="Profit"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sales Trends Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              Sales Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={timeRange === '365' ? monthlyData : salesData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey={timeRange === '365' ? "month" : "formattedDate"}
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
                <Area
                  type="monotone"
                  dataKey="quantity"
                  name="Units Sold"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales Distribution Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-primary" />
              Sales Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} units`, 'Quantity']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2 text-primary" />
            Revenue Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={timeRange === '365' ? monthlyData : salesData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey={timeRange === '365' ? "month" : "formattedDate"}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--muted))' }}
              />
              <YAxis
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--muted))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="revenue"
                name="Revenue"
                stackId="a"
                fill="hsl(var(--success))"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="profit"
                name="Profit"
                stackId="a"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default SalesStatsCharts;