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
  Package,
  AlertTriangle,
  ArrowLeftRight,
  TrendingUp,
  History,
  Tags
} from "lucide-react"
import { format } from "date-fns"
import { LoadingState } from '@/components/ui/loading-state'

// Mock data for inventory reports
const mockInventoryData = [
  {
    product: "iPhone 15 Pro",
    category: "Smartphones",
    currentStock: 45,
    minimumStock: 20,
    maximumStock: 100,
    reorderPoint: 30,
    lastRestocked: new Date("2024-02-20"),
    value: 67500.00,
    turnoverRate: 3.5
  },
  {
    product: "Samsung Galaxy S24",
    category: "Smartphones",
    currentStock: 38,
    minimumStock: 15,
    maximumStock: 80,
    reorderPoint: 25,
    lastRestocked: new Date("2024-02-18"),
    value: 49400.00,
    turnoverRate: 4.2
  },
  // Add more mock data as needed
]

const reportTypes = [
  {
    id: "stock-levels",
    name: "Stock Levels",
    description: "Current inventory levels and stock status",
    icon: Package
  },
  {
    id: "low-stock",
    name: "Low Stock Alerts",
    description: "Products near or below reorder points",
    icon: AlertTriangle
  },
  {
    id: "movements",
    name: "Stock Movements",
    description: "Inventory transfers and adjustments",
    icon: ArrowLeftRight
  },
  {
    id: "valuation",
    name: "Inventory Valuation",
    description: "Current value of inventory holdings",
    icon: TrendingUp
  },
  {
    id: "history",
    name: "Stock History",
    description: "Historical inventory changes",
    icon: History
  },
  {
    id: "categories",
    name: "Category Analysis",
    description: "Stock levels by product category",
    icon: Tags
  }
]

export function InventoryReportsPage() {
  const [selectedReport, setSelectedReport] = useState("stock-levels")
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
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead className="text-right">Min Stock</TableHead>
                <TableHead className="text-right">Max Stock</TableHead>
                <TableHead className="text-right">Reorder Point</TableHead>
                <TableHead>Last Restocked</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Turnover Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInventoryData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.product}</TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={
                      row.currentStock <= row.minimumStock ? "destructive" :
                      row.currentStock <= row.reorderPoint ? "warning" : "default"
                    }>
                      {row.currentStock}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{row.minimumStock}</TableCell>
                  <TableCell className="text-right">{row.maximumStock}</TableCell>
                  <TableCell className="text-right">{row.reorderPoint}</TableCell>
                  <TableCell>{format(row.lastRestocked, "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD"
                    }).format(row.value)}
                  </TableCell>
                  <TableCell className="text-right">{row.turnoverRate.toFixed(1)}x</TableCell>
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
          <h1 className="text-3xl font-bold tracking-tight">Inventory Reports</h1>
          <p className="text-muted-foreground">
            Monitor and analyze your inventory metrics
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
            loadingText="Generating inventory report..."
            center
          >
            {renderChart()}
          </LoadingState>
        </CardContent>
      </Card>
    </div>
  )
}
