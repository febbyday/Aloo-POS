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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DataTable } from "@/components/ui/data-table";
import { useRevenue } from "../context/RevenueContext";
import { useFinance } from "../context/FinanceContext";
import { RevenueChart, PaymentMethodSelector } from "../components";
import { Download, Filter, Plus, Printer, Search } from "lucide-react";

export const RevenueTrackingPage: React.FC = () => {
  const { 
    salesData, 
    revenueByPaymentMethod, 
    revenueByTimeOfDay,
    totalRevenue, 
    loading 
  } = useRevenue();
  
  const { settings } = useFinance();
  const [dateRange, setDateRange] = useState({ from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() });
  const [selectedView, setSelectedView] = useState("daily");

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Table columns for sales data
  const columns = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }: any) => {
        return new Date(row.original.date).toLocaleDateString();
      },
    },
    {
      accessorKey: "invoiceNumber",
      header: "Invoice #",
    },
    {
      accessorKey: "customer",
      header: "Customer",
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment Method",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }: any) => {
        return formatCurrency(row.original.amount);
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.original.status;
        return (
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Helmet>
        <title>Sales & Revenue | Finance | POS System</title>
      </Helmet>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Sales & Revenue</h1>
          <p className="text-muted-foreground">
            Track and analyze your sales and revenue data
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
              <span className="hidden sm:inline">New Invoice</span>
            </Button>
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "Loading..." : formatCurrency(totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                For selected period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Average Sale Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading || !salesData || salesData.length === 0
                  ? "Loading..."
                  : formatCurrency(totalRevenue / salesData.length)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {!salesData ? "0" : salesData.length} transactions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Peak Revenue Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading
                  ? "Loading..."
                  : Object.entries(revenueByTimeOfDay).reduce(
                      (max, [time, amount]) =>
                        amount > (max[1] || 0) ? [time, amount] : max,
                      ["", 0]
                    )[0]}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Highest sales volume
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>
              {selectedView.charAt(0).toUpperCase() + selectedView.slice(1)} revenue for the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart 
              title="" 
              description="" 
              period={selectedView}
              height={350}
            />
          </CardContent>
        </Card>

        {/* Payment Methods and Sales Table */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Revenue breakdown by payment method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p>Loading payment method data...</p>
                ) : (
                  <PaymentMethodSelector 
                    paymentMethods={Object.entries(revenueByPaymentMethod).map(([id, amount]) => ({
                      id,
                      name: settings.paymentMethods.find(m => m.id === id)?.name || id,
                      amount,
                      percentage: (amount / totalRevenue) * 100
                    }))}
                    readOnly={true}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>
                Your most recent sales transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search transactions..." className="pl-8" />
                </div>
              </div>
              {loading ? (
                <p>Loading sales data...</p>
              ) : !salesData ? (
                <p>No sales data available</p>
              ) : (
                <DataTable columns={columns} data={salesData.slice(0, 5)} />
              )}
              <div className="mt-4 flex justify-center">
                <Button variant="outline">View All Transactions</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Generation Section */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Management</CardTitle>
            <CardDescription>
              Generate and manage invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="generate">
              <TabsList className="mb-4">
                <TabsTrigger value="generate">Generate Invoice</TabsTrigger>
                <TabsTrigger value="templates">Invoice Templates</TabsTrigger>
              </TabsList>
              <TabsContent value="generate">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="customer">Customer</Label>
                      <Select>
                        <SelectTrigger id="customer">
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New Customer</SelectItem>
                          {/* Customer list would be populated here */}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="invoiceNumber">Invoice Number</Label>
                      <Input id="invoiceNumber" placeholder="INV-0001" />
                    </div>
                    <div>
                      <Label htmlFor="invoiceDate">Invoice Date</Label>
                      <Input id="invoiceDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                  </div>
                  <div className="space-y-4">
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
                    <div>
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input id="dueDate" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Input id="notes" placeholder="Additional notes..." />
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="outline">Preview</Button>
                  <Button>Generate Invoice</Button>
                </div>
              </TabsContent>
              <TabsContent value="templates">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="cursor-pointer hover:border-primary">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Standard Invoice</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-[3/4] bg-muted rounded-md flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">Preview</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:border-primary">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Detailed Invoice</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-[3/4] bg-muted rounded-md flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">Preview</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:border-primary">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Simple Receipt</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-[3/4] bg-muted rounded-md flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">Preview</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button variant="outline">Manage Templates</Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
}; 