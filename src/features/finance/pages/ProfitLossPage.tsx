import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useRevenue } from "../context/RevenueContext";
import { useExpense } from "../context/ExpenseContext";
import { useFinance } from "../context/FinanceContext";
import { ProfitLossChart } from "../components";
import { 
  Download, 
  Filter, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  TrendingUp, 
  TrendingDown,
  BarChart,
  DollarSign,
  Percent,
  Calendar,
  FileText
} from "lucide-react";
import ErrorBoundary from "@/components/ErrorBoundary";

const ProfitLossPageContent: React.FC = () => {
  const { totalRevenue, revenueByCategory, loading: revenueLoading } = useRevenue();
  const { totalExpenses, expensesByCategory, loading: expenseLoading } = useExpense();
  const { settings } = useFinance();
  
  const [dateRange, setDateRange] = useState({ from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), to: new Date() });
  const [selectedView, setSelectedView] = useState("monthly");
  const [selectedTab, setSelectedTab] = useState("overview");

  const loading = revenueLoading || expenseLoading;
  const profit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
  const breakEvenPoint = totalExpenses > 0 ? totalExpenses : 0;
  const breakEvenPercentage = totalRevenue > 0 ? (breakEvenPoint / totalRevenue) * 100 : 0;

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Get top revenue and expense categories
  const topRevenueCategories = revenueByCategory ? Object.entries(revenueByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, amount]) => ({
      id: category,
      name: category,
      amount,
      percentage: (amount / totalRevenue) * 100
    })) : [];

  const topExpenseCategories = expensesByCategory ? Object.entries(expensesByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, amount]) => ({
      id: category,
      name: category,
      amount,
      percentage: (amount / totalExpenses) * 100
    })) : [];

  return (
    <>
      <Helmet>
        <title>Profit & Loss | Finance | POS System</title>
      </Helmet>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Profit & Loss</h1>
          <p className="text-muted-foreground">
            Analyze your business profitability and financial performance
          </p>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              className="w-full sm:w-auto"
            />
            <Select value={selectedView} onValueChange={setSelectedView}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Generate Report</span>
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Net Profit
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
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
                  For selected period
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Profit Margin
              </CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "Loading..." : `${profitMargin.toFixed(1)}%`}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {profitMargin > 20 ? (
                  <ArrowUpIcon className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span>
                  {profitMargin > 20 ? "Healthy margin" : "Below target"}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Break-Even Point
              </CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "Loading..." : formatCurrency(breakEvenPoint)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span>
                  {totalRevenue > breakEvenPoint 
                    ? "Break-even achieved" 
                    : `${(breakEvenPercentage).toFixed(1)}% of revenue needed`}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Revenue to Expense Ratio
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading || totalExpenses === 0 
                  ? "Loading..." 
                  : (totalRevenue / totalExpenses).toFixed(2)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {totalRevenue / totalExpenses > 1.5 ? (
                  <ArrowUpIcon className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span>
                  {totalRevenue / totalExpenses > 1.5 
                    ? "Strong performance" 
                    : "Needs improvement"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="breakdown">Category Breakdown</TabsTrigger>
            <TabsTrigger value="breakeven">Break-Even Analysis</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Profit & Loss Overview</CardTitle>
                <CardDescription>
                  {selectedView.charAt(0).toUpperCase() + selectedView.slice(1)} profit and loss for the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfitLossChart 
                  title="" 
                  description="" 
                  period={selectedView}
                  height={400}
                />
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Summary</CardTitle>
                  <CardDescription>
                    Total revenue: {loading ? "Loading..." : formatCurrency(totalRevenue)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <p>Loading revenue data...</p>
                    ) : (
                      topRevenueCategories.map(category => (
                        <div key={category.id} className="flex items-center">
                          <div className="w-1/3 font-medium truncate">
                            {category.name}
                          </div>
                          <div className="w-full">
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div
                                  className="bg-green-500 h-2.5 rounded-full"
                                  style={{ width: `${category.percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">
                                {category.percentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {formatCurrency(category.amount)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Expense Summary</CardTitle>
                  <CardDescription>
                    Total expenses: {loading ? "Loading..." : formatCurrency(totalExpenses)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <p>Loading expense data...</p>
                    ) : (
                      topExpenseCategories.map(category => (
                        <div key={category.id} className="flex items-center">
                          <div className="w-1/3 font-medium truncate">
                            {category.name}
                          </div>
                          <div className="w-full">
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div
                                  className="bg-red-500 h-2.5 rounded-full"
                                  style={{ width: `${category.percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">
                                {category.percentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {formatCurrency(category.amount)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Category Breakdown Tab */}
          <TabsContent value="breakdown">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Revenue vs Expense by Category</CardTitle>
                  <CardDescription>
                    Comparison of revenue and expenses across categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] flex items-center justify-center bg-muted rounded-md">
                    <span className="text-muted-foreground">Category comparison chart will be displayed here</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Most Profitable Categories</CardTitle>
                  <CardDescription>
                    Categories with highest profit margin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <p>Loading category data...</p>
                    ) : (
                      <div className="space-y-4">
                        {/* This would be populated with actual data */}
                        <div className="flex items-center">
                          <div className="w-1/3 font-medium">Electronics</div>
                          <div className="w-full">
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div
                                  className="bg-primary h-2.5 rounded-full"
                                  style={{ width: "85%" }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">42.5%</span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Profit margin
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-1/3 font-medium">Services</div>
                          <div className="w-full">
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div
                                  className="bg-primary h-2.5 rounded-full"
                                  style={{ width: "70%" }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">35.0%</span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Profit margin
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-1/3 font-medium">Accessories</div>
                          <div className="w-full">
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div
                                  className="bg-primary h-2.5 rounded-full"
                                  style={{ width: "60%" }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">30.0%</span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Profit margin
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Least Profitable Categories</CardTitle>
                  <CardDescription>
                    Categories with lowest profit margin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <p>Loading category data...</p>
                    ) : (
                      <div className="space-y-4">
                        {/* This would be populated with actual data */}
                        <div className="flex items-center">
                          <div className="w-1/3 font-medium">Hardware</div>
                          <div className="w-full">
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div
                                  className="bg-red-500 h-2.5 rounded-full"
                                  style={{ width: "20%" }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">10.0%</span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Profit margin
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-1/3 font-medium">Books</div>
                          <div className="w-full">
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div
                                  className="bg-red-500 h-2.5 rounded-full"
                                  style={{ width: "30%" }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">15.0%</span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Profit margin
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-1/3 font-medium">Groceries</div>
                          <div className="w-full">
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div
                                  className="bg-red-500 h-2.5 rounded-full"
                                  style={{ width: "40%" }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">20.0%</span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Profit margin
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Break-Even Analysis Tab */}
          <TabsContent value="breakeven">
            <Card>
              <CardHeader>
                <CardTitle>Break-Even Analysis</CardTitle>
                <CardDescription>
                  Understand when your business becomes profitable
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <div className="h-[300px] flex items-center justify-center bg-muted rounded-md">
                      <span className="text-muted-foreground">Break-even chart will be displayed here</span>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Break-Even Summary</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fixed Costs:</span>
                          <span className="font-medium">{formatCurrency(totalExpenses * 0.6)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Variable Costs:</span>
                          <span className="font-medium">{formatCurrency(totalExpenses * 0.4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Costs:</span>
                          <span className="font-medium">{formatCurrency(totalExpenses)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Current Revenue:</span>
                          <span className="font-medium">{formatCurrency(totalRevenue)}</span>
                        </div>
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between font-medium">
                            <span>Break-Even Point:</span>
                            <span>{formatCurrency(breakEvenPoint)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Status:</span>
                            <span className={totalRevenue >= breakEvenPoint ? "text-green-500" : "text-red-500"}>
                              {totalRevenue >= breakEvenPoint 
                                ? `${formatCurrency(totalRevenue - breakEvenPoint)} above break-even` 
                                : `${formatCurrency(breakEvenPoint - totalRevenue)} below break-even`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Break-Even Projection</h3>
                      <p className="text-muted-foreground mb-4">
                        Based on current trends, you are projected to maintain profitability for the next quarter.
                      </p>
                      <Button>View Detailed Projection</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Discount Impact Analysis</CardTitle>
                <CardDescription>
                  Understand how discounts and promotions affect your profitability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10">
                  <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Discount Tracking</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-4">
                    Connect your discount and promotion data to analyze their impact on your profit margins.
                  </p>
                  <Button>Connect Discount Data</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Trends Tab */}
          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Profit Trends</CardTitle>
                <CardDescription>
                  Long-term profit trends and projections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center bg-muted rounded-md">
                  <span className="text-muted-foreground">Profit trends chart will be displayed here</span>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid gap-4 md:grid-cols-3 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Seasonal Analysis</CardTitle>
                  <CardDescription>
                    Profit patterns by season
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center bg-muted rounded-md">
                    <span className="text-muted-foreground">Seasonal chart</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Year-over-Year</CardTitle>
                  <CardDescription>
                    Compare with previous years
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center bg-muted rounded-md">
                    <span className="text-muted-foreground">YoY comparison chart</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Future Projection</CardTitle>
                  <CardDescription>
                    Estimated future profit
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center bg-muted rounded-md">
                    <span className="text-muted-foreground">Projection chart</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export const ProfitLossPage: React.FC = () => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error("Profit & Loss page error:", error, errorInfo);
  };

  return (
    <ErrorBoundary onError={handleError}>
      <ProfitLossPageContent />
    </ErrorBoundary>
  );
}; 