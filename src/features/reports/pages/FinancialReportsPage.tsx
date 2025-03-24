import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Download,
  FileText,
  BarChart,
  LineChart,
  PieChart,
  RefreshCw,
  DollarSign,
  TrendingUp,
  ArrowUpDown,
  Receipt,
  CreditCard,
  Wallet
} from "lucide-react"
import { format } from "date-fns"

// Mock data for financial reports
const mockFinancialData = [
  {
    date: new Date("2024-02-25"),
    revenue: 15000.00,
    expenses: 8500.00,
    profit: 6500.00,
    taxes: 1500.00,
    cashFlow: 5000.00,
    accountsReceivable: 2500.00,
    accountsPayable: 3500.00
  },
  {
    date: new Date("2024-02-24"),
    revenue: 12500.00,
    expenses: 7000.00,
    profit: 5500.00,
    taxes: 1250.00,
    cashFlow: 4250.00,
    accountsReceivable: 2000.00,
    accountsPayable: 3000.00
  },
  // Add more mock data as needed
]

const reportTypes = [
  {
    id: "profit-loss",
    name: "Profit & Loss",
    description: "Income, expenses, and profit analysis",
    icon: DollarSign
  },
  {
    id: "cash-flow",
    name: "Cash Flow",
    description: "Cash inflows and outflows",
    icon: Wallet
  },
  {
    id: "revenue",
    name: "Revenue Analysis",
    description: "Detailed revenue breakdown",
    icon: TrendingUp
  },
  {
    id: "expenses",
    name: "Expense Tracking",
    description: "Expense categories and trends",
    icon: Receipt
  },
  {
    id: "balance",
    name: "Balance Sheet",
    description: "Assets, liabilities, and equity",
    icon: ArrowUpDown
  },
  {
    id: "transactions",
    name: "Payment Analysis",
    description: "Payment methods and settlements",
    icon: CreditCard
  }
]

export function FinancialReportsPage() {
  const [selectedReport, setSelectedReport] = useState("profit-loss")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>()
  const [isLoading, setIsLoading] = useState(false)
  const [chartType, setChartType] = useState<"table" | "bar" | "line" | "pie">("table")

  const handleRefresh = () => {
    setIsLoading(true)
    // Simulate data refresh
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <div className="h-[400px] flex items-center justify-center border rounded-lg">
            <div className="text-center">
              <BarChart className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Bar Chart Visualization</p>
            </div>
          </div>
        )
      case "line":
        return (
          <div className="h-[400px] flex items-center justify-center border rounded-lg">
            <div className="text-center">
              <LineChart className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Line Chart Visualization</p>
            </div>
          </div>
        )
      case "pie":
        return (
          <div className="h-[400px] flex items-center justify-center border rounded-lg">
            <div className="text-center">
              <PieChart className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Pie Chart Visualization</p>
            </div>
          </div>
        )
      default:
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Expenses</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-right">Taxes</TableHead>
                <TableHead className="text-right">Cash Flow</TableHead>
                <TableHead className="text-right">Receivables</TableHead>
                <TableHead className="text-right">Payables</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockFinancialData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{format(row.date, "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD"
                    }).format(row.revenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD"
                    }).format(row.expenses)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={row.profit >= 0 ? "default" : "destructive"}>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD"
                      }).format(row.profit)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD"
                    }).format(row.taxes)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={row.cashFlow >= 0 ? "default" : "destructive"}>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD"
                      }).format(row.cashFlow)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD"
                    }).format(row.accountsReceivable)}
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD"
                    }).format(row.accountsPayable)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
          <p className="text-muted-foreground">
            Track and analyze your financial performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => {}}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => {}}>
            <FileText className="h-4 w-4 mr-2" />
            Schedule
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {reportTypes.map((report) => (
          <Card
            key={report.id}
            className={cn(
              "cursor-pointer transition-colors hover:bg-muted/50",
              selectedReport === report.id ? "border-primary" : ""
            )}
            onClick={() => setSelectedReport(report.id)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {report.name}
              </CardTitle>
              <report.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {report.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="p-0 border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>
            {reportTypes.find(r => r.id === selectedReport)?.name}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select visualization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="table">Table View</SelectItem>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="pie">Pie Chart</SelectItem>
              </SelectContent>
            </Select>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-0">{renderChart()}</CardContent>
      </Card>
    </div>
  )
}
