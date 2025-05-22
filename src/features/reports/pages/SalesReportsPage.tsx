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
import { cn } from '@/lib/utils';
import {
  Download,
  FileText,
  BarChart,
  LineChart,
  PieChart,
  RefreshCw,
  Calendar,
  Store,
  TrendingUp,
  ShoppingCart,
  Users,
  Package
} from "lucide-react"
import { format } from "date-fns"
import { LoadingState } from '@/components/ui/loading-state'

// Mock data for sales reports
const mockSalesData = [
  {
    date: new Date("2024-02-25"),
    totalSales: 12500.50,
    transactions: 45,
    averageOrderValue: 277.79,
    topSellingProduct: "iPhone 15 Pro",
    revenue: 15000.00,
    profit: 3750.25,
    store: "Main Store"
  },
  {
    date: new Date("2024-02-24"),
    totalSales: 9800.75,
    transactions: 38,
    averageOrderValue: 257.91,
    topSellingProduct: "Samsung Galaxy S24",
    revenue: 11760.90,
    profit: 2940.23,
    store: "Main Store"
  },
  // Add more mock data as needed
]

const reportTypes = [
  {
    id: "daily",
    name: "Daily Sales",
    description: "Daily sales performance breakdown",
    icon: Calendar
  },
  {
    id: "by-store",
    name: "Sales by Store",
    description: "Compare sales across different store locations",
    icon: Store
  },
  {
    id: "by-product",
    name: "Sales by Product",
    description: "Best and worst performing products",
    icon: Package
  },
  {
    id: "trends",
    name: "Sales Trends",
    description: "Sales trends and forecasting",
    icon: TrendingUp
  },
  {
    id: "transactions",
    name: "Transaction Analysis",
    description: "Detailed transaction metrics",
    icon: ShoppingCart
  },
  {
    id: "customer",
    name: "Customer Insights",
    description: "Sales data by customer segments",
    icon: Users
  }
]

export function SalesReportsPage() {
  const [selectedReport, setSelectedReport] = useState("daily")
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
                <TableHead>Store</TableHead>
                <TableHead className="text-right">Sales</TableHead>
                <TableHead className="text-right">Transactions</TableHead>
                <TableHead className="text-right">Avg. Order</TableHead>
                <TableHead>Top Product</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSalesData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{format(row.date, "MMM d, yyyy")}</TableCell>
                  <TableCell>{row.store}</TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD"
                    }).format(row.totalSales)}
                  </TableCell>
                  <TableCell className="text-right">{row.transactions}</TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD"
                    }).format(row.averageOrderValue)}
                  </TableCell>
                  <TableCell>{row.topSellingProduct}</TableCell>
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
                    }).format(row.profit)}
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
          <h1 className="text-3xl font-bold tracking-tight">Sales Reports</h1>
          <p className="text-muted-foreground">
            Analyze and track your sales performance metrics
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
        <CardContent className="px-0">
          <LoadingState
            isLoading={isLoading}
            loadingText="Loading report data..."
            center
          >
            {renderChart()}
          </LoadingState>
        </CardContent>
      </Card>
    </div>
  )
}
