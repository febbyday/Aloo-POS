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
import { useRevenue } from "../context/RevenueContext";
import { useExpense } from "../context/ExpenseContext";
import { FinancialReportGenerator } from "../components";
import { 
  Download, 
  Filter, 
  Search, 
  FileText, 
  BarChart, 
  PieChart,
  LineChart,
  Calendar,
  Clock,
  Mail,
  Printer,
  Share2,
  FileDown
} from "lucide-react";

export const FinanceReportsPage: React.FC = () => {
  const { settings } = useFinance();
  const { totalRevenue, loading: revenueLoading } = useRevenue();
  const { totalExpenses, loading: expenseLoading } = useExpense();
  
  const [dateRange, setDateRange] = useState({ from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), to: new Date() });
  const [selectedReportType, setSelectedReportType] = useState("profit-loss");
  const [selectedFormat, setSelectedFormat] = useState("pdf");

  const loading = revenueLoading || expenseLoading;

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Mock data for saved reports
  const savedReports = [
    {
      id: "rep1",
      name: "Q2 2023 Financial Summary",
      type: "profit-loss",
      dateCreated: "2023-07-01",
      createdBy: "Admin",
      format: "pdf",
      size: "1.2 MB"
    },
    {
      id: "rep2",
      name: "June 2023 Sales Tax Report",
      type: "tax",
      dateCreated: "2023-07-02",
      createdBy: "Admin",
      format: "excel",
      size: "845 KB"
    },
    {
      id: "rep3",
      name: "H1 2023 Expense Analysis",
      type: "expense",
      dateCreated: "2023-07-05",
      createdBy: "Finance Manager",
      format: "pdf",
      size: "2.1 MB"
    },
    {
      id: "rep4",
      name: "Q2 2023 Cash Flow Statement",
      type: "cash-flow",
      dateCreated: "2023-07-10",
      createdBy: "Admin",
      format: "pdf",
      size: "1.5 MB"
    },
  ];

  // Mock data for scheduled reports
  const scheduledReports = [
    {
      id: "sched1",
      name: "Monthly Profit & Loss",
      type: "profit-loss",
      frequency: "Monthly",
      nextRun: "2023-08-01",
      recipients: ["finance@example.com"],
      format: "pdf"
    },
    {
      id: "sched2",
      name: "Weekly Sales Summary",
      type: "sales",
      frequency: "Weekly",
      nextRun: "2023-07-17",
      recipients: ["management@example.com", "sales@example.com"],
      format: "excel"
    },
    {
      id: "sched3",
      name: "Quarterly Tax Report",
      type: "tax",
      frequency: "Quarterly",
      nextRun: "2023-10-01",
      recipients: ["finance@example.com", "accounting@example.com"],
      format: "pdf"
    },
  ];

  // Table columns for saved reports
  const savedReportsColumns = [
    {
      accessorKey: "name",
      header: "Report Name",
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }: any) => {
        const type = row.original.type;
        const typeMap: Record<string, string> = {
          'profit-loss': 'Profit & Loss',
          'tax': 'Tax Report',
          'expense': 'Expense Report',
          'cash-flow': 'Cash Flow',
          'sales': 'Sales Report',
          'balance': 'Balance Sheet'
        };
        return typeMap[type] || type;
      },
    },
    {
      accessorKey: "dateCreated",
      header: "Date Created",
      cell: ({ row }: any) => {
        return new Date(row.original.dateCreated).toLocaleDateString();
      },
    },
    {
      accessorKey: "createdBy",
      header: "Created By",
    },
    {
      accessorKey: "format",
      header: "Format",
      cell: ({ row }: any) => {
        const format = row.original.format;
        return format.toUpperCase();
      },
    },
    {
      accessorKey: "size",
      header: "Size",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" title="Download">
              <FileDown className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" title="Print">
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" title="Share">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Table columns for scheduled reports
  const scheduledReportsColumns = [
    {
      accessorKey: "name",
      header: "Report Name",
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }: any) => {
        const type = row.original.type;
        const typeMap: Record<string, string> = {
          'profit-loss': 'Profit & Loss',
          'tax': 'Tax Report',
          'expense': 'Expense Report',
          'cash-flow': 'Cash Flow',
          'sales': 'Sales Report',
          'balance': 'Balance Sheet'
        };
        return typeMap[type] || type;
      },
    },
    {
      accessorKey: "frequency",
      header: "Frequency",
    },
    {
      accessorKey: "nextRun",
      header: "Next Run",
      cell: ({ row }: any) => {
        return new Date(row.original.nextRun).toLocaleDateString();
      },
    },
    {
      accessorKey: "recipients",
      header: "Recipients",
      cell: ({ row }: any) => {
        const recipients = row.original.recipients;
        return recipients.length > 1 
          ? `${recipients[0]} +${recipients.length - 1} more` 
          : recipients[0];
      },
    },
    {
      accessorKey: "format",
      header: "Format",
      cell: ({ row }: any) => {
        const format = row.original.format;
        return format.toUpperCase();
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" title="Edit">
              <FileText className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" title="Run Now">
              <Clock className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Report type options
  const reportTypes = [
    { id: "profit-loss", name: "Profit & Loss Statement", icon: BarChart },
    { id: "balance", name: "Balance Sheet", icon: PieChart },
    { id: "cash-flow", name: "Cash Flow Statement", icon: LineChart },
    { id: "tax", name: "Tax Summary", icon: FileText },
    { id: "expense", name: "Expense Report", icon: FileText },
    { id: "sales", name: "Sales Report", icon: BarChart },
  ];

  // Get selected report type object
  const selectedReportTypeObj = reportTypes.find(type => type.id === selectedReportType);

  return (
    <>
      <Helmet>
        <title>Financial Reports | Finance | POS System</title>
      </Helmet>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
          <p className="text-muted-foreground">
            Generate, schedule, and manage financial reports
          </p>
        </div>

        {/* Tabs for different report sections */}
        <Tabs defaultValue="generate">
          <TabsList className="mb-4">
            <TabsTrigger value="generate">Generate Reports</TabsTrigger>
            <TabsTrigger value="saved">Saved Reports</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          </TabsList>
          
          {/* Generate Reports Tab */}
          <TabsContent value="generate">
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Report Options</CardTitle>
                  <CardDescription>
                    Configure your report parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="reportType">Report Type</Label>
                    <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                      <SelectTrigger id="reportType">
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        {reportTypes.map(type => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              <span>{type.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Date Range</Label>
                    <DateRangePicker
                      value={dateRange}
                      onChange={setDateRange}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="format">Export Format</Label>
                    <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                      <SelectTrigger id="format">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="comparison">Comparison Period</Label>
                    <Select defaultValue="none">
                      <SelectTrigger id="comparison">
                        <SelectValue placeholder="Select comparison" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="previous-period">Previous Period</SelectItem>
                        <SelectItem value="previous-year">Previous Year</SelectItem>
                        <SelectItem value="custom">Custom Period</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="grouping">Group By</Label>
                    <Select defaultValue="month">
                      <SelectTrigger id="grouping">
                        <SelectValue placeholder="Select grouping" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                        <SelectItem value="month">Month</SelectItem>
                        <SelectItem value="quarter">Quarter</SelectItem>
                        <SelectItem value="year">Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button className="w-full">Generate Report</Button>
                  <Button variant="outline" className="w-full">Save as Template</Button>
                </CardFooter>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>
                    {selectedReportTypeObj ? (
                      <div className="flex items-center gap-2">
                        <selectedReportTypeObj.icon className="h-5 w-5" />
                        <span>{selectedReportTypeObj.name}</span>
                      </div>
                    ) : (
                      "Report Preview"
                    )}
                  </CardTitle>
                  <CardDescription>
                    Preview of your report based on selected parameters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FinancialReportGenerator 
                    reportType={selectedReportType}
                    dateRange={dateRange}
                    format={selectedFormat}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    {!loading && (
                      <span>
                        Showing data from {dateRange.from.toLocaleDateString()} to {dateRange.to.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Printer className="h-4 w-4" />
                      <span>Print</span>
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </Button>
                    <Button className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          {/* Saved Reports Tab */}
          <TabsContent value="saved">
            <Card>
              <CardHeader>
                <CardTitle>Saved Reports</CardTitle>
                <CardDescription>
                  Access your previously generated reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-between">
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search reports..." className="pl-8 w-full" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span className="hidden sm:inline">Filter</span>
                    </Button>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Report Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {reportTypes.map(type => (
                          <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DataTable 
                  columns={savedReportsColumns} 
                  data={savedReports} 
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Delete Selected</Button>
                <Button>Generate New Report</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Scheduled Reports Tab */}
          <TabsContent value="scheduled">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Reports</CardTitle>
                <CardDescription>
                  Manage your automated report generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex justify-end">
                  <Button className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Schedule New Report</span>
                  </Button>
                </div>
                <DataTable 
                  columns={scheduledReportsColumns} 
                  data={scheduledReports} 
                />
              </CardContent>
            </Card>
            
            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Reports</CardTitle>
                  <CardDescription>
                    Reports scheduled for the next 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {scheduledReports
                      .sort((a, b) => new Date(a.nextRun).getTime() - new Date(b.nextRun).getTime())
                      .map((report, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{report.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(report.nextRun).toLocaleDateString()} - {report.frequency}
                            </p>
                          </div>
                          <Button size="sm">Run Now</Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Report Delivery</CardTitle>
                  <CardDescription>
                    Configure default delivery settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="defaultRecipients">Default Recipients</Label>
                      <Input 
                        id="defaultRecipients" 
                        placeholder="email@example.com, email2@example.com" 
                        defaultValue="finance@example.com"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Separate multiple email addresses with commas
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="defaultFormat">Default Format</Label>
                      <Select defaultValue="pdf">
                        <SelectTrigger id="defaultFormat">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="emailTemplate">Email Template</Label>
                      <Select defaultValue="standard">
                        <SelectTrigger id="emailTemplate">
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard Template</SelectItem>
                          <SelectItem value="detailed">Detailed Template</SelectItem>
                          <SelectItem value="minimal">Minimal Template</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Save Delivery Settings</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}; 