import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DataTable } from "@/components/ui/data-table";
import { useExpense } from "../context/ExpenseContext";
import { useFinance } from "../context/FinanceContext";
import { ExpenseTable } from "../components";
import {
  Download,
  Filter,
  Plus,
  Search,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart,
  FileText,
  RefreshCw
} from "lucide-react";
import { ErrorBoundary } from '@/components/unified-error-boundary';

const ExpenseManagementPageContent: React.FC = () => {
  const {
    expenses,
    expenseCategories,
    totalExpenses,
    expensesByCategory,
    upcomingRecurringExpenses,
    loading
  } = useExpense();

  const { settings } = useFinance();
  const [dateRange, setDateRange] = useState({ from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() });
  const [selectedView, setSelectedView] = useState("monthly");
  const [showRecurring, setShowRecurring] = useState(false);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Table columns for expense data
  const columns = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }: any) => {
        return new Date(row.original.date).toLocaleDateString();
      },
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }: any) => {
        const category = expenseCategories.find(c => c.id === row.original.category);
        return category ? category.name : row.original.category;
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }: any) => {
        return formatCurrency(row.original.amount);
      },
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment Method",
    },
    {
      accessorKey: "recurring",
      header: "Recurring",
      cell: ({ row }: any) => {
        return row.original.recurring ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {row.original.frequency}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Get top expense categories
  const topCategories = Object.entries(expensesByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, amount]) => {
      const categoryObj = expenseCategories.find(c => c.id === category);
      return {
        id: category,
        name: categoryObj ? categoryObj.name : category,
        amount,
        percentage: (amount / totalExpenses) * 100
      };
    });

  return (
    <>
      <Helmet>
        <title>Expense Management | Finance | POS System</title>
      </Helmet>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Expense Management</h1>
          <p className="text-muted-foreground">
            Track, categorize, and analyze your business expenses
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
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Expense</span>
            </Button>
          </div>
        </div>

        {/* Expense Summary */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Expenses
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "Loading..." : formatCurrency(totalExpenses)}
              </div>
              <p className="text-xs text-muted-foreground">
                For selected period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Monthly
              </CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "Loading..." : formatCurrency(totalExpenses /
                  (selectedView === "monthly" ? 1 :
                   selectedView === "quarterly" ? 3 :
                   selectedView === "yearly" ? 12 : 1))}
              </div>
              <p className="text-xs text-muted-foreground">
                Based on current view
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Largest Category
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading || topCategories.length === 0
                  ? "Loading..."
                  : topCategories[0].name}
              </div>
              <p className="text-xs text-muted-foreground">
                {loading || topCategories.length === 0
                  ? ""
                  : `${formatCurrency(topCategories[0].amount)} (${topCategories[0].percentage.toFixed(1)}%)`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Expenses
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "Loading..." : upcomingRecurringExpenses.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Due in next 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Expense Table and Categories */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Expense Transactions</CardTitle>
                <CardDescription>
                  All expenses for the selected period
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="showRecurring"
                  checked={showRecurring}
                  onCheckedChange={(checked) => setShowRecurring(!!checked)}
                />
                <Label htmlFor="showRecurring" className="text-sm">Show recurring only</Label>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search expenses..." className="pl-8" />
                </div>
              </div>
              {loading ? (
                <p>Loading expense data...</p>
              ) : (
                <DataTable
                  columns={columns}
                  data={showRecurring
                    ? expenses.filter(e => e.recurring)
                    : expenses
                  }
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Expense Categories</CardTitle>
              <CardDescription>
                Where your money is going
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p>Loading category data...</p>
                ) : (
                  topCategories.map(category => (
                    <div key={category.id} className="flex items-center">
                      <div className="w-1/3 font-medium truncate">
                        {category.name}
                      </div>
                      <div className="w-full">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-muted rounded-full h-2.5">
                            <div
                              className="bg-primary h-2.5 rounded-full"
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
            <CardFooter>
              <Button variant="outline" className="w-full">View All Categories</Button>
            </CardFooter>
          </Card>
        </div>

        {/* Recurring Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Recurring Expenses</CardTitle>
            <CardDescription>
              Manage your recurring business expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming">
              <TabsList className="mb-4">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="all">All Recurring</TabsTrigger>
                <TabsTrigger value="add">Add New</TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming">
                {loading ? (
                  <p>Loading upcoming expenses...</p>
                ) : upcomingRecurringExpenses.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No upcoming recurring expenses</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingRecurringExpenses.map((expense, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <CardTitle className="text-base">{expense.description}</CardTitle>
                            <span className="text-base font-bold">{formatCurrency(expense.amount)}</span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Next payment:</span>{" "}
                              {new Date(expense.nextDate).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Frequency:</span>{" "}
                              {expense.frequency}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Category:</span>{" "}
                              {expenseCategories.find(c => c.id === expense.category)?.name || expense.category}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Payment method:</span>{" "}
                              {expense.paymentMethod}
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">Skip</Button>
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button size="sm">Pay Now</Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="all">
                <DataTable
                  columns={columns}
                  data={expenses.filter(e => e.recurring)}
                />
              </TabsContent>
              <TabsContent value="add">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input id="description" placeholder="Rent, Utilities, etc." />
                    </div>
                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input id="amount" type="number" placeholder="0.00" className="pl-8" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {expenseCategories && expenseCategories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select>
                        <SelectTrigger id="frequency">
                          <SelectValue placeholder="Select frequency" />
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
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input id="startDate" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <Select>
                        <SelectTrigger id="paymentMethod">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          {settings.paymentMethods.map(method => (
                            <SelectItem key={method.id} value={method.id}>
                              {method.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save Recurring Expense</Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Supplier Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Supplier Payments</CardTitle>
            <CardDescription>
              Track and manage payments to your suppliers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-10">
              <RefreshCw className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Supplier Integration</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                Connect with your supplier management system to automatically track and manage supplier payments.
              </p>
              <Button>Connect Suppliers</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export const ExpenseManagementPage: React.FC = () => {
  // Custom error handler that could send errors to a logging service
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // In a real app, this would send to an error tracking service
    console.error("Expense management page error:", error, errorInfo);
  };

  return (
    <ErrorBoundary onError={handleError}>
      <ExpenseManagementPageContent />
    </ErrorBoundary>
  );
};