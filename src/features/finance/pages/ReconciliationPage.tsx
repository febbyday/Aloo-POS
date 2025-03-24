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
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DataTable } from "@/components/ui/data-table";
import { useFinance } from "../context/FinanceContext";
import { ReconciliationForm } from "../components";
import { 
  Download, 
  Filter, 
  Plus, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  DollarSign,
  CreditCard,
  Building,
  Calendar
} from "lucide-react";

export const ReconciliationPage: React.FC = () => {
  const { settings } = useFinance();
  const [dateRange, setDateRange] = useState({ from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() });
  const [selectedStore, setSelectedStore] = useState("all");
  const [selectedTab, setSelectedTab] = useState("cash");

  // Mock data for demonstration
  const stores = [
    { id: "store1", name: "Main Store" },
    { id: "store2", name: "Downtown Branch" },
    { id: "store3", name: "Mall Kiosk" },
  ];

  const cashReconciliations = [
    { 
      id: "rec1", 
      date: "2023-06-01", 
      store: "Main Store", 
      openingBalance: 500, 
      closingBalance: 1250, 
      expectedBalance: 1275, 
      difference: -25, 
      status: "discrepancy",
      cashier: "John Doe"
    },
    { 
      id: "rec2", 
      date: "2023-06-02", 
      store: "Main Store", 
      openingBalance: 500, 
      closingBalance: 1500, 
      expectedBalance: 1500, 
      difference: 0, 
      status: "balanced",
      cashier: "Jane Smith"
    },
    { 
      id: "rec3", 
      date: "2023-06-01", 
      store: "Downtown Branch", 
      openingBalance: 300, 
      closingBalance: 950, 
      expectedBalance: 975, 
      difference: -25, 
      status: "discrepancy",
      cashier: "Mike Johnson"
    },
    { 
      id: "rec4", 
      date: "2023-06-02", 
      store: "Downtown Branch", 
      openingBalance: 300, 
      closingBalance: 1100, 
      expectedBalance: 1100, 
      difference: 0, 
      status: "balanced",
      cashier: "Sarah Williams"
    },
  ];

  const bankReconciliations = [
    {
      id: "bank1",
      date: "2023-06-01",
      account: "Main Checking Account",
      bankBalance: 15250.75,
      bookBalance: 15000.50,
      difference: 250.25,
      status: "pending",
      items: 12
    },
    {
      id: "bank2",
      date: "2023-05-01",
      account: "Main Checking Account",
      bankBalance: 12500.25,
      bookBalance: 12500.25,
      difference: 0,
      status: "reconciled",
      items: 18
    },
    {
      id: "bank3",
      date: "2023-06-01",
      account: "Savings Account",
      bankBalance: 25000.00,
      bookBalance: 25000.00,
      difference: 0,
      status: "reconciled",
      items: 3
    },
  ];

  const settlementRecords = [
    {
      id: "settle1",
      date: "2023-06-01",
      store: "Main Store",
      totalSales: 2500.75,
      cardSales: 1750.50,
      cashSales: 750.25,
      otherSales: 0,
      status: "settled"
    },
    {
      id: "settle2",
      date: "2023-06-01",
      store: "Downtown Branch",
      totalSales: 1800.25,
      cardSales: 1450.75,
      cashSales: 349.50,
      otherSales: 0,
      status: "pending"
    },
    {
      id: "settle3",
      date: "2023-06-02",
      store: "Mall Kiosk",
      totalSales: 950.00,
      cardSales: 875.50,
      cashSales: 74.50,
      otherSales: 0,
      status: "settled"
    },
  ];

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Table columns for cash reconciliation
  const cashColumns = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }: any) => {
        return new Date(row.original.date).toLocaleDateString();
      },
    },
    {
      accessorKey: "store",
      header: "Store",
    },
    {
      accessorKey: "cashier",
      header: "Cashier",
    },
    {
      accessorKey: "openingBalance",
      header: "Opening",
      cell: ({ row }: any) => {
        return formatCurrency(row.original.openingBalance);
      },
    },
    {
      accessorKey: "closingBalance",
      header: "Closing",
      cell: ({ row }: any) => {
        return formatCurrency(row.original.closingBalance);
      },
    },
    {
      accessorKey: "expectedBalance",
      header: "Expected",
      cell: ({ row }: any) => {
        return formatCurrency(row.original.expectedBalance);
      },
    },
    {
      accessorKey: "difference",
      header: "Difference",
      cell: ({ row }: any) => {
        const diff = row.original.difference;
        return (
          <span className={diff === 0 ? "text-green-500" : "text-red-500"}>
            {formatCurrency(diff)}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.original.status;
        return (
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status === 'balanced' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            status === 'discrepancy' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
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
              <Search className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Table columns for bank reconciliation
  const bankColumns = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }: any) => {
        return new Date(row.original.date).toLocaleDateString();
      },
    },
    {
      accessorKey: "account",
      header: "Account",
    },
    {
      accessorKey: "bankBalance",
      header: "Bank Balance",
      cell: ({ row }: any) => {
        return formatCurrency(row.original.bankBalance);
      },
    },
    {
      accessorKey: "bookBalance",
      header: "Book Balance",
      cell: ({ row }: any) => {
        return formatCurrency(row.original.bookBalance);
      },
    },
    {
      accessorKey: "difference",
      header: "Difference",
      cell: ({ row }: any) => {
        const diff = row.original.difference;
        return (
          <span className={diff === 0 ? "text-green-500" : "text-yellow-500"}>
            {formatCurrency(diff)}
          </span>
        );
      },
    },
    {
      accessorKey: "items",
      header: "Items",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.original.status;
        return (
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status === 'reconciled' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
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
              <Search className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Table columns for settlement
  const settlementColumns = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }: any) => {
        return new Date(row.original.date).toLocaleDateString();
      },
    },
    {
      accessorKey: "store",
      header: "Store",
    },
    {
      accessorKey: "totalSales",
      header: "Total Sales",
      cell: ({ row }: any) => {
        return formatCurrency(row.original.totalSales);
      },
    },
    {
      accessorKey: "cardSales",
      header: "Card Sales",
      cell: ({ row }: any) => {
        return formatCurrency(row.original.cardSales);
      },
    },
    {
      accessorKey: "cashSales",
      header: "Cash Sales",
      cell: ({ row }: any) => {
        return formatCurrency(row.original.cashSales);
      },
    },
    {
      accessorKey: "otherSales",
      header: "Other Sales",
      cell: ({ row }: any) => {
        return formatCurrency(row.original.otherSales);
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.original.status;
        return (
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status === 'settled' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
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
              <Search className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Filter data based on selected store
  const filteredCashReconciliations = cashReconciliations.filter(
    rec => selectedStore === "all" || rec.store === stores.find(s => s.id === selectedStore)?.name
  );

  const filteredSettlements = settlementRecords.filter(
    rec => selectedStore === "all" || rec.store === stores.find(s => s.id === selectedStore)?.name
  );

  return (
    <>
      <Helmet>
        <title>Payment Reconciliation | Finance | POS System</title>
      </Helmet>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Payment Reconciliation</h1>
          <p className="text-muted-foreground">
            Reconcile cash, bank accounts, and multi-store settlements
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
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select Store" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                {stores.map(store => (
                  <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                ))}
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
              <span className="hidden sm:inline">New Reconciliation</span>
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cash Reconciliations
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredCashReconciliations.length}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span className="text-green-500 mr-1">{filteredCashReconciliations.filter(r => r.status === 'balanced').length}</span> balanced,
                <span className="text-red-500 mx-1">{filteredCashReconciliations.filter(r => r.status === 'discrepancy').length}</span> with discrepancies
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Bank Reconciliations
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bankReconciliations.length}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span className="text-green-500 mr-1">{bankReconciliations.filter(r => r.status === 'reconciled').length}</span> reconciled,
                <span className="text-yellow-500 mx-1">{bankReconciliations.filter(r => r.status === 'pending').length}</span> pending
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Store Settlements
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredSettlements.length}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span className="text-green-500 mr-1">{filteredSettlements.filter(r => r.status === 'settled').length}</span> settled,
                <span className="text-yellow-500 mx-1">{filteredSettlements.filter(r => r.status === 'pending').length}</span> pending
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Next Scheduled
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Today
              </div>
              <p className="text-xs text-muted-foreground">
                Daily cash reconciliation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="cash">Cash Reconciliation</TabsTrigger>
            <TabsTrigger value="bank">Bank Reconciliation</TabsTrigger>
            <TabsTrigger value="settlement">Store Settlement</TabsTrigger>
          </TabsList>
          
          {/* Cash Reconciliation Tab */}
          <TabsContent value="cash">
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Cash Drawer Reconciliations</CardTitle>
                  <CardDescription>
                    Daily cash drawer balancing records
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search reconciliations..." className="pl-8" />
                    </div>
                  </div>
                  <DataTable 
                    columns={cashColumns} 
                    data={filteredCashReconciliations} 
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">View All</Button>
                  <Button>New Cash Reconciliation</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>New Cash Reconciliation</CardTitle>
                  <CardDescription>
                    Record a new cash drawer count
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ReconciliationForm />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Bank Reconciliation Tab */}
          <TabsContent value="bank">
            <Card>
              <CardHeader>
                <CardTitle>Bank Account Reconciliations</CardTitle>
                <CardDescription>
                  Match bank statements with your accounting records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search bank reconciliations..." className="pl-8" />
                  </div>
                </div>
                <DataTable 
                  columns={bankColumns} 
                  data={bankReconciliations} 
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Import Bank Statement</Button>
                <Button>Start New Reconciliation</Button>
              </CardFooter>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Unreconciled Transactions</CardTitle>
                  <CardDescription>
                    Transactions that need to be matched
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-10">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Active Reconciliation</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-4">
                      Start a new bank reconciliation to see unmatched transactions.
                    </p>
                    <Button>Start Reconciliation</Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Reconciliation History</CardTitle>
                  <CardDescription>
                    Previous reconciliation records
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bankReconciliations.map((rec, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{rec.account}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(rec.date).toLocaleDateString()} - {rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(rec.bankBalance)}</div>
                          <p className="text-sm text-muted-foreground">
                            {rec.items} items
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">View All History</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          {/* Store Settlement Tab */}
          <TabsContent value="settlement">
            <Card>
              <CardHeader>
                <CardTitle>Multi-Store Settlements</CardTitle>
                <CardDescription>
                  Manage settlements across all store locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search settlements..." className="pl-8" />
                  </div>
                </div>
                <DataTable 
                  columns={settlementColumns} 
                  data={filteredSettlements} 
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Generate Report</Button>
                <Button>Process Settlement</Button>
              </CardFooter>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Settlement Dashboard</CardTitle>
                <CardDescription>
                  Overview of all store settlements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted rounded-md">
                  <span className="text-muted-foreground">Settlement dashboard chart will be displayed here</span>
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{formatCurrency(
                      settlementRecords.reduce((sum, rec) => sum + rec.totalSales, 0)
                    )}</div>
                    <p className="text-sm text-muted-foreground">Total Sales</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{formatCurrency(
                      settlementRecords.reduce((sum, rec) => sum + rec.cardSales, 0)
                    )}</div>
                    <p className="text-sm text-muted-foreground">Card Sales</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{formatCurrency(
                      settlementRecords.reduce((sum, rec) => sum + rec.cashSales, 0)
                    )}</div>
                    <p className="text-sm text-muted-foreground">Cash Sales</p>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}; 