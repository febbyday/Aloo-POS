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
  Treemap,
  AreaChart,
  Area
} from "recharts";
import { DollarSign, TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import type { Product } from '../../types';

interface FinancialStatsChartsProps {
  product: Product;
  timeRange?: '7d' | '30d' | '90d' | '1y' | 'all';
}

/**
 * Component that displays financial statistics charts for a product
 * Shows revenue, profit margins, and financial performance over time
 */
export function FinancialStatsCharts({ product, timeRange = '90d' }: FinancialStatsChartsProps) {
  // Generate mock financial data
  const financialData = useMemo(() => {
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
    
    // Base values
    const basePrice = product.price || 20;
    const baseCost = product.costPrice || 10;
    const baseMargin = basePrice - baseCost;
    const baseMarginPercent = (baseMargin / basePrice) * 100;
    
    // Generate daily data points
    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Create some random but realistic financial data
      // Sales volume varies by day of week (weekends higher)
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const seasonalFactor = 1 + 0.3 * Math.sin(2 * Math.PI * (date.getMonth() / 12)); // Seasonal variation
      
      // Base quantity with some randomness, weekend boost, and seasonal factors
      const quantity = Math.max(1, Math.floor(
        (5 + Math.random() * 10) * 
        (isWeekend ? 1.5 : 1) * 
        seasonalFactor
      ));
      
      // Price fluctuates slightly over time
      const priceFactor = 0.95 + (0.1 * Math.sin(i / 30)) + (Math.random() * 0.05);
      const price = basePrice * priceFactor;
      
      // Cost fluctuates less than price
      const costFactor = 0.97 + (0.06 * Math.sin(i / 45)) + (Math.random() * 0.03);
      const cost = baseCost * costFactor;
      
      // Calculate financial metrics
      const revenue = price * quantity;
      const totalCost = cost * quantity;
      const profit = revenue - totalCost;
      const margin = price - cost;
      const marginPercent = (margin / price) * 100;
      
      // Add taxes and other costs
      const taxes = revenue * 0.1; // 10% tax
      const overhead = revenue * 0.05; // 5% overhead
      const netProfit = profit - taxes - overhead;
      const netMarginPercent = (netProfit / revenue) * 100;
      
      data.push({
        date: date.toISOString().split('T')[0],
        formattedDate: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        price,
        cost,
        quantity,
        revenue,
        totalCost,
        profit,
        margin,
        marginPercent,
        taxes,
        overhead,
        netProfit,
        netMarginPercent,
        month: date.toLocaleDateString(undefined, { month: 'short' }),
        year: date.getFullYear()
      });
    }
    
    return data;
  }, [product, timeRange]);

  // Monthly aggregated data
  const monthlyData = useMemo(() => {
    const months: Record<string, { 
      month: string, 
      revenue: number, 
      profit: number, 
      netProfit: number,
      quantity: number,
      avgMarginPercent: number,
      avgNetMarginPercent: number,
      dataPoints: number
    }> = {};
    
    financialData.forEach(day => {
      const date = new Date(day.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
      
      if (!months[monthKey]) {
        months[monthKey] = { 
          month: monthName, 
          revenue: 0, 
          profit: 0, 
          netProfit: 0,
          quantity: 0,
          avgMarginPercent: 0,
          avgNetMarginPercent: 0,
          dataPoints: 0
        };
      }
      
      months[monthKey].revenue += day.revenue;
      months[monthKey].profit += day.profit;
      months[monthKey].netProfit += day.netProfit;
      months[monthKey].quantity += day.quantity;
      months[monthKey].avgMarginPercent += day.marginPercent;
      months[monthKey].avgNetMarginPercent += day.netMarginPercent;
      months[monthKey].dataPoints += 1;
    });
    
    // Calculate averages and sort by date
    return Object.entries(months)
      .map(([key, data]) => ({
        monthKey: key,
        month: data.month,
        revenue: data.revenue,
        profit: data.profit,
        netProfit: data.netProfit,
        quantity: data.quantity,
        avgMarginPercent: data.dataPoints > 0 ? data.avgMarginPercent / data.dataPoints : 0,
        avgNetMarginPercent: data.dataPoints > 0 ? data.avgNetMarginPercent / data.dataPoints : 0
      }))
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  }, [financialData]);

  // Profit breakdown data for pie chart
  const profitBreakdownData = useMemo(() => {
    // Sum up all financial data
    const totalRevenue = financialData.reduce((sum, day) => sum + day.revenue, 0);
    const totalCost = financialData.reduce((sum, day) => sum + day.totalCost, 0);
    const totalTaxes = financialData.reduce((sum, day) => sum + day.taxes, 0);
    const totalOverhead = financialData.reduce((sum, day) => sum + day.overhead, 0);
    const totalNetProfit = financialData.reduce((sum, day) => sum + day.netProfit, 0);
    
    return [
      { name: 'Cost of Goods', value: totalCost, percentage: (totalCost / totalRevenue) * 100 },
      { name: 'Taxes', value: totalTaxes, percentage: (totalTaxes / totalRevenue) * 100 },
      { name: 'Overhead', value: totalOverhead, percentage: (totalOverhead / totalRevenue) * 100 },
      { name: 'Net Profit', value: totalNetProfit, percentage: (totalNetProfit / totalRevenue) * 100 }
    ];
  }, [financialData]);

  // Revenue vs Margin data for treemap
  const revenueMarginData = useMemo(() => {
    // Group by month for treemap
    const months: Record<string, { 
      name: string, 
      revenue: number, 
      margin: number
    }> = {};
    
    financialData.forEach(day => {
      const date = new Date(day.date);
      const monthKey = date.toLocaleDateString(undefined, { month: 'long' });
      
      if (!months[monthKey]) {
        months[monthKey] = { 
          name: monthKey, 
          revenue: 0, 
          margin: 0
        };
      }
      
      months[monthKey].revenue += day.revenue;
      months[monthKey].margin += day.profit;
    });
    
    return Object.values(months).map(month => ({
      name: month.name,
      size: month.revenue,
      value: month.margin / month.revenue * 100 // Margin percentage
    }));
  }, [financialData]);

  // Colors for charts
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
                  {entry.name.includes('Margin') || entry.name.includes('Percent')
                    ? `${Number(entry.value).toFixed(1)}%`
                    : entry.name.includes('Revenue') || entry.name.includes('Profit') || entry.name.includes('Cost')
                    ? `$${Number(entry.value).toFixed(2)}`
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

  // Pie chart custom label
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      {/* Revenue and Profit Trends */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Revenue & Profit Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
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
                yAxisId="left"
                orientation="left"
                tickFormatter={(value) => `$${value}`}
                domain={[0, 'auto']}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--muted))' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => `${value}%`}
                domain={[0, 'auto']}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--muted))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="revenue" 
                name="Revenue" 
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="netProfit" 
                name="Net Profit" 
                stroke="hsl(var(--success))" 
                fill="hsl(var(--success))"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="avgNetMarginPercent" 
                name="Net Margin %" 
                stroke="hsl(var(--warning))" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Financial Metrics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profit Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center">
              <PieChartIcon className="h-5 w-5 mr-2 text-primary" />
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={profitBreakdownData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {profitBreakdownData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => {
                    return [`$${Number(value).toFixed(2)} (${props.payload.percentage.toFixed(1)}%)`, name];
                  }} 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Margin Analysis */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-primary" />
              Margin Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
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
                  tickFormatter={(value) => `${value}%`}
                  domain={[0, 'auto']}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--muted))' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="avgMarginPercent" 
                  name="Gross Margin %" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="avgNetMarginPercent" 
                  name="Net Margin %" 
                  fill="hsl(var(--success))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Month Treemap */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-primary" />
            Revenue by Month (Size) & Margin % (Color)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <Treemap
              data={revenueMarginData}
              dataKey="size"
              aspectRatio={4 / 3}
              stroke="hsl(var(--background))"
              fill="hsl(var(--primary))"
              content={({ root, depth, x, y, width, height, index, payload, colors, rank, name }) => {
                const value = payload.value;
                // Color based on margin percentage
                const color = value < 30 
                  ? 'hsl(var(--destructive))' 
                  : value < 40 
                  ? 'hsl(var(--warning))' 
                  : value < 50 
                  ? 'hsl(var(--success))' 
                  : 'hsl(var(--primary))';
                
                return (
                  <g>
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      style={{
                        fill: color,
                        stroke: 'hsl(var(--background))',
                        strokeWidth: 2 / (depth + 1e-10),
                        strokeOpacity: 1 / (depth + 1e-10),
                      }}
                    />
                    {width > 50 && height > 30 && (
                      <>
                        <text
                          x={x + width / 2}
                          y={y + height / 2 - 7}
                          textAnchor="middle"
                          fill="hsl(var(--background))"
                          fontSize={14}
                          fontWeight="bold"
                        >
                          {name}
                        </text>
                        <text
                          x={x + width / 2}
                          y={y + height / 2 + 7}
                          textAnchor="middle"
                          fill="hsl(var(--background))"
                          fontSize={12}
                        >
                          {`${value.toFixed(1)}%`}
                        </text>
                      </>
                    )}
                  </g>
                );
              }}
            />
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default FinancialStatsCharts; 