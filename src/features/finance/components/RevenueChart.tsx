// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRevenue } from "../context/RevenueContext";
import { useFinance } from "../context/FinanceContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Loader2 } from "lucide-react";

interface RevenueChartProps {
  title?: string;
  description?: string;
  period?: "daily" | "weekly" | "monthly";
  height?: number;
  showLegend?: boolean;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  title = "Revenue Overview",
  description = "Revenue trends over time",
  period = "daily",
  height = 300,
  showLegend = true,
}) => {
  const { dailyRevenue, loading, error } = useRevenue();
  const { settings } = useFinance();

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
          <p className="text-primary">
            Revenue: {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Prepare chart data based on period
  const getChartData = () => {
    if (period === "daily") {
      // Use the last 14 days for daily view
      return dailyRevenue.slice(-14);
    } else if (period === "weekly") {
      // Aggregate data by week
      const weeklyData: { date: string; amount: number }[] = [];
      const weeks: Record<string, number> = {};
      
      dailyRevenue.forEach((day) => {
        const date = new Date(day.date);
        const weekNumber = Math.floor(date.getDate() / 7) + 1;
        const weekKey = `Week ${weekNumber}, ${date.toLocaleString('default', { month: 'short' })}`;
        
        weeks[weekKey] = (weeks[weekKey] || 0) + day.amount;
      });
      
      Object.entries(weeks).forEach(([week, amount]) => {
        weeklyData.push({ date: week, amount });
      });
      
      return weeklyData;
    } else {
      // Aggregate data by month
      const monthlyData: { date: string; amount: number }[] = [];
      const months: Record<string, number> = {};
      
      dailyRevenue.forEach((day) => {
        const date = new Date(day.date);
        const monthKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        
        months[monthKey] = (months[monthKey] || 0) + day.amount;
      });
      
      Object.entries(months).forEach(([month, amount]) => {
        monthlyData.push({ date: month, amount });
      });
      
      return monthlyData;
    }
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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center text-destructive" style={{ height }}>
          Error loading revenue data
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
          <BarChart
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
            <Bar 
              dataKey="amount" 
              name="Revenue" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
