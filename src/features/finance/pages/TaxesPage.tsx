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
import { Switch } from "@/components/ui/switch";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DataTable } from "@/components/ui/data-table";
import { useFinance } from "../context/FinanceContext";
import { useTax } from "../context/TaxContext";
import { TaxCalculator } from "../components";
import {
  Download,
  Filter,
  Plus,
  Search,
  Percent,
  FileText,
  Settings,
  Calendar,
  RefreshCw,
  Globe,
  Building,
  CheckCircle
} from "lucide-react";
import { ErrorBoundary } from '@/components/unified-error-boundary';

const TaxesPageContent: React.FC = () => {
  const { settings } = useFinance();
  const {
    taxRates,
    taxCategories,
    taxReports,
    collectedTaxes,
    loading
  } = useTax();

  const [dateRange, setDateRange] = useState({ from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), to: new Date() });
  const [selectedTaxType, setSelectedTaxType] = useState("all");

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Calculate total tax collected
  const totalTaxCollected = collectedTaxes ? Object.values(collectedTaxes).reduce((sum, amount) => sum + amount, 0) : 0;

  // Table columns for tax rates
  const taxRateColumns = [
    {
      accessorKey: "name",
      header: "Tax Name",
    },
    {
      accessorKey: "rate",
      header: "Rate",
      cell: ({ row }: any) => {
        return `${row.original.rate}%`;
      },
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "region",
      header: "Region",
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }: any) => {
        return row.original.active ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Active
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Inactive
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Table columns for tax reports
  const taxReportColumns = [
    {
      accessorKey: "period",
      header: "Period",
    },
    {
      accessorKey: "taxType",
      header: "Tax Type",
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
            status === 'filed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        );
      },
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }: any) => {
        return new Date(row.original.dueDate).toLocaleDateString();
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

  return (
    <>
      <Helmet>
        <title>Taxes & Compliance | Finance | POS System</title>
      </Helmet>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Taxes & Compliance</h1>
          <p className="text-muted-foreground">
            Manage tax settings, generate reports, and ensure compliance
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
            <Select value={selectedTaxType} onValueChange={setSelectedTaxType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tax Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Taxes</SelectItem>
                <SelectItem value="sales">Sales Tax</SelectItem>
                <SelectItem value="vat">VAT</SelectItem>
                <SelectItem value="gst">GST</SelectItem>
                <SelectItem value="income">Income Tax</SelectItem>
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
              <span className="hidden sm:inline">New Tax Rate</span>
            </Button>
          </div>
        </div>

        {/* Tax Summary */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Tax Collected
              </CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "Loading..." : formatCurrency(totalTaxCollected)}
              </div>
              <p className="text-xs text-muted-foreground">
                For selected period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Tax Rates
              </CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "Loading..." : taxRates.filter(tax => tax.active).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Across {taxCategories.length} categories
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Reports
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "Loading..." : taxReports.filter(report =>
                  report.status === 'pending' &&
                  new Date(report.dueDate) > new Date()
                ).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Due in the next 30 days
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Compliance Status
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                Compliant
              </div>
              <p className="text-xs text-muted-foreground">
                All filings up to date
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="rates">
          <TabsList className="mb-4">
            <TabsTrigger value="rates">Tax Rates</TabsTrigger>
            <TabsTrigger value="reports">Tax Reports</TabsTrigger>
            <TabsTrigger value="calculator">Tax Calculator</TabsTrigger>
            <TabsTrigger value="settings">Fiscalization</TabsTrigger>
          </TabsList>

          {/* Tax Rates Tab */}
          <TabsContent value="rates">
            <Card>
              <CardHeader>
                <CardTitle>Tax Rates Configuration</CardTitle>
                <CardDescription>
                  Manage tax rates for different regions and product categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search tax rates..." className="pl-8" />
                  </div>
                </div>
                {loading ? (
                  <p>Loading tax rates...</p>
                ) : (
                  <DataTable
                    columns={taxRateColumns}
                    data={taxRates.filter(tax =>
                      selectedTaxType === 'all' || tax.category.toLowerCase() === selectedTaxType
                    )}
                  />
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Import Rates</Button>
                <Button>Add New Tax Rate</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Tax Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Tax Reports</CardTitle>
                <CardDescription>
                  Generate and view tax reports for filing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search reports..." className="pl-8" />
                  </div>
                </div>
                {loading ? (
                  <p>Loading tax reports...</p>
                ) : (
                  <DataTable
                    columns={taxReportColumns}
                    data={taxReports.filter(report =>
                      selectedTaxType === 'all' || report.taxType.toLowerCase() === selectedTaxType
                    )}
                  />
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Export All</Button>
                <Button>Generate New Report</Button>
              </CardFooter>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Report Templates</CardTitle>
                  <CardDescription>
                    Standard tax report templates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Sales Tax Summary</h3>
                        <p className="text-sm text-muted-foreground">Monthly summary of collected sales tax</p>
                      </div>
                      <Button variant="outline" size="sm">Use</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">VAT Return</h3>
                        <p className="text-sm text-muted-foreground">Quarterly VAT return form</p>
                      </div>
                      <Button variant="outline" size="sm">Use</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Annual Tax Summary</h3>
                        <p className="text-sm text-muted-foreground">Year-end tax collection summary</p>
                      </div>
                      <Button variant="outline" size="sm">Use</Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Manage Templates</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Filing Calendar</CardTitle>
                  <CardDescription>
                    Upcoming tax filing deadlines
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <p>Loading calendar...</p>
                    ) : (
                      taxReports
                        .filter(report => report.status === 'pending')
                        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                        .slice(0, 3)
                        .map((report, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{report.taxType} - {report.period}</h3>
                              <p className="text-sm text-muted-foreground">
                                Due: {new Date(report.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                            <Button size="sm">Prepare</Button>
                          </div>
                        ))
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">View Full Calendar</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          {/* Tax Calculator Tab */}
          <TabsContent value="calculator">
            <Card>
              <CardHeader>
                <CardTitle>Tax Calculator</CardTitle>
                <CardDescription>
                  Calculate taxes for different scenarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaxCalculator />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fiscalization Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Fiscalization Settings</CardTitle>
                <CardDescription>
                  Configure fiscal receipt and reporting requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="fiscalization">Enable Fiscalization</Label>
                          <Switch id="fiscalization" checked={true} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Enable fiscal receipt generation and reporting
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="fiscalRegion">Fiscal Region</Label>
                        <Select defaultValue="us">
                          <SelectTrigger id="fiscalRegion">
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="us">United States</SelectItem>
                            <SelectItem value="eu">European Union</SelectItem>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                            <SelectItem value="ca">Canada</SelectItem>
                            <SelectItem value="au">Australia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="fiscalId">Tax ID / VAT Number</Label>
                        <Input id="fiscalId" placeholder="Enter your tax ID" defaultValue="US123456789" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="digitalSignature">Digital Signature</Label>
                          <Switch id="digitalSignature" checked={true} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Digitally sign fiscal receipts
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="reportingFrequency">Reporting Frequency</Label>
                        <Select defaultValue="monthly">
                          <SelectTrigger id="reportingFrequency">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="fiscalDevice">Fiscal Device</Label>
                        <Select defaultValue="integrated">
                          <SelectTrigger id="fiscalDevice">
                            <SelectValue placeholder="Select device type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="integrated">Integrated</SelectItem>
                            <SelectItem value="external">External Fiscal Printer</SelectItem>
                            <SelectItem value="cloud">Cloud Fiscal Service</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Fiscal Authority Connection</h3>
                    <div className="flex items-center gap-4 p-4 bg-muted rounded-md">
                      <Globe className="h-8 w-8 text-primary" />
                      <div>
                        <h4 className="font-medium">Connected to Tax Authority API</h4>
                        <p className="text-sm text-muted-foreground">
                          Your system is properly connected to the tax authority reporting API.
                          Last sync: Today at 09:15 AM
                        </p>
                      </div>
                      <Button variant="outline" className="ml-auto">Test Connection</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline">Reset</Button>
                <Button>Save Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export const TaxesPage: React.FC = () => {
  // Custom error handler that could send errors to a logging service
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // In a real app, this would send to an error tracking service
    console.error("Taxes page error:", error, errorInfo);
  };

  return (
    <ErrorBoundary onError={handleError}>
      <TaxesPageContent />
    </ErrorBoundary>
  );
};