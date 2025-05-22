import React from "react";
import { Helmet } from "react-helmet-async";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRevenue } from "../context/RevenueContext";
import { useExpense } from "../context/ExpenseContext";
import { useFinance } from "../context/FinanceContext";
import { RevenueChart, ProfitLossChart, ExpenseTable } from "../components";
import { ArrowDownIcon, ArrowUpIcon, DollarSign, TrendingUp, FileText, BarChart, RefreshCw } from "lucide-react";
import { ErrorBoundary } from '@/components/unified-error-boundary';

// Main component content
const FinanceDashboardContent: React.FC = () => {
  const { totalRevenue, revenueByPaymentMethod, loading: revenueLoading } = useRevenue();
  const { totalExpenses, upcomingRecurringExpenses, loading: expenseLoading } = useExpense();
  const { settings } = useFinance();

  const loading = revenueLoading || expenseLoading;
  const profit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <>
      <Helmet>
        <title>Finance Dashboard | POS System</title>
      </Helmet>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Finance Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your business financial performance
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "Loading..." : formatCurrency(totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Expenses
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "Loading..." : formatCurrency(totalExpenses)}
              </div>
              <p className="text-xs text-muted-foreground">
                +12.5% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Net Profit
              </CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "Loading..." : formatCurrency(profit)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {profit > 0 ? (
                  <ArrowUpIcon className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span>
                  {profitMargin.toFixed(1)}% profit margin
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Expenses
              </CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "Loading..." : upcomingRecurringExpenses.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Recurring expenses due in 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="profit">Profit & Loss</TabsTrigger>
          </TabsList>
          <TabsContent value="revenue" className="space-y-4">
            <RevenueChart 
              title="Revenue Trends" 
              description="Daily revenue for the last 14 days" 
              period="daily"
              height={350}
            />
          </TabsContent>
          <TabsContent value="expenses" className="space-y-4">
            <ExpenseTable 
              title="Recent Expenses" 
              description="Your most recent business expenses" 
            />
          </TabsContent>
          <TabsContent value="profit" className="space-y-4">
            <ProfitLossChart 
              title="Profit & Loss Overview" 
              description="Monthly profit and loss for the last 12 months" 
              period="monthly"
              height={350}
            />
          </TabsContent>
        </Tabs>

        {/* Payment Methods Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Payment Method</CardTitle>
            <CardDescription>
              Breakdown of revenue by payment method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p>Loading payment method data...</p>
              ) : (
                Object.entries(revenueByPaymentMethod).map(([method, amount]) => {
                  const percentage = (amount / totalRevenue) * 100;
                  const paymentMethod = settings.paymentMethods.find(m => m.id === method);
                  
                  return (
                    <div key={method} className="flex items-center">
                      <div className="w-1/3 font-medium">
                        {paymentMethod?.name || method}
                      </div>
                      <div className="w-full">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-muted rounded-full h-2.5">
                            <div
                              className="bg-primary h-2.5 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {formatCurrency(amount)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

// Wrapped component with error boundary
export const FinanceDashboardPage: React.FC = () => {
  // Custom error handler that could send errors to a logging service
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // In a real app, you might send this to an error tracking service
    console.error("Dashboard error:", error, errorInfo);
  };

  return (
    <ErrorBoundary onError={handleError}>
      <FinanceDashboardContent />
    </ErrorBoundary>
  );
};
