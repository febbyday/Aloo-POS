import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRevenue } from "../context/RevenueContext";
import { useExpense } from "../context/ExpenseContext";
import { useFinance } from "../context/FinanceContext";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  ReferenceLine
} from "recharts";
import { Loader2 } from "lucide-react";

interface ProfitLossChartProps {
  title?: string;
  description?: string;
  period?: "daily" | "weekly" | "monthly";
  height?: number;
  showLegend?: boolean;
}

export const ProfitLossChart: React.FC<ProfitLossChartProps> = ({
  title = "Profit & Loss Overview",
  description = "Track your business performance over time",
  period = "monthly",
  height = 350,
  showLegend = true,
}) => {
  const { dailyRevenue, loading: revenueLoading } = useRevenue();
  const { expenses, loading: expensesLoading } = useExpense();
  const { settings } = useFinance();

  const loading = revenueLoading || expensesLoading;

  // Format currency based on settings
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-md p-2">
          <p className="font-medium">{label}</p>
          <p className="text-green-500">
            Revenue: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-red-500">
            Expenses: {formatCurrency(payload[1].value)}
          </p>
          <p className="text-primary font-semibold">
            Profit: {formatCurrency(payload[2].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Prepare chart data based on period
  const getChartData = () => {
    if (period === "daily") {
      // Last 14 days
      return prepareDailyData(14);
    } else if (period === "weekly") {
      // Last 12 weeks
      return prepareWeeklyData();
    } else {
      // Last 12 months
      return prepareMonthlyData();
    }
  };

  // Prepare daily data
  const prepareDailyData = (days: number) => {
    const data: { date: string; revenue: number; expenses: number; profit: number }[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // Get revenue for this day
      const dayRevenue = dailyRevenue.find(rev => rev.date === dateString)?.amount || 0;
      
      // Get expenses for this day
      const dayExpenses = expenses
        .filter(exp => {
          const expDate = new Date(exp.date);
          return expDate.toISOString().split('T')[0] === dateString;
        })
        .reduce((sum, exp) => sum + exp.amount, 0);
      
      // Calculate profit
      const profit = dayRevenue - dayExpenses;
      
      data.push({
        date: new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayRevenue,
        expenses: dayExpenses,
        profit,
      });
    }
    
    return data;
  };

  // Prepare weekly data
  const prepareWeeklyData = () => {
    const data: { date: string; revenue: number; expenses: number; profit: number }[] = [];
    const weeks: Record<string, { revenue: number; expenses: number }> = {};
    
    // Process revenue data
    dailyRevenue.forEach(day => {
      const date = new Date(day.date);
      const weekNumber = Math.floor(date.getDate() / 7) + 1;
      const weekKey = `Week ${weekNumber}, ${date.toLocaleString('default', { month: 'short' })}`;
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = { revenue: 0, expenses: 0 };
      }
      
      weeks[weekKey].revenue += day.amount;
    });
    
    // Process expense data
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const weekNumber = Math.floor(date.getDate() / 7) + 1;
      const weekKey = `Week ${weekNumber}, ${date.toLocaleString('default', { month: 'short' })}`;
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = { revenue: 0, expenses: 0 };
      }
      
      weeks[weekKey].expenses += expense.amount;
    });
    
    // Convert to array and calculate profit
    Object.entries(weeks).forEach(([week, { revenue, expenses }]) => {
      data.push({
        date: week,
        revenue,
        expenses,
        profit: revenue - expenses,
      });
    });
    
    // Sort by date (assuming week numbers are chronological)
    return data.sort((a, b) => {
      const aWeek = parseInt(a.date.split(' ')[1]);
      const bWeek = parseInt(b.date.split(' ')[1]);
      return aWeek - bWeek;
    });
  };

  // Prepare monthly data
  const prepareMonthlyData = () => {
    const data: { date: string; revenue: number; expenses: number; profit: number }[] = [];
    const months: Record<string, { revenue: number; expenses: number }> = {};
    
    // Process revenue data
    dailyRevenue.forEach(day => {
      const date = new Date(day.date);
      const monthKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!months[monthKey]) {
        months[monthKey] = { revenue: 0, expenses: 0 };
      }
      
      months[monthKey].revenue += day.amount;
    });
    
    // Process expense data
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!months[monthKey]) {
        months[monthKey] = { revenue: 0, expenses: 0 };
      }
      
      months[monthKey].expenses += expense.amount;
    });
    
    // Convert to array and calculate profit
    Object.entries(months).forEach(([month, { revenue, expenses }]) => {
      data.push({
        date: month,
        revenue,
        expenses,
        profit: revenue - expenses,
      });
    });
    
    // Sort by date
    return data.sort((a, b) => {
      const aDate = new Date(a.date);
      const bDate = new Date(b.date);
      return aDate.getTime() - bDate.getTime();
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center" style={{ height }}>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const chartData = getChartData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
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
            {showLegend && <Legend />}
            <ReferenceLine y={0} stroke="hsl(var(--muted))" />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              name="Revenue" 
              stroke="hsl(var(--success))" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              name="Expenses" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="profit" 
              name="Profit" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
