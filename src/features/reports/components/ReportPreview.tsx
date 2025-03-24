import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { CustomReportConfig } from "../types"
import {
  BarChart,
  LineChart,
  PieChart,
  Download,
  FileText,
  Edit,
  Calendar,
  RefreshCw
} from "lucide-react"
import { format } from "date-fns"

interface ReportPreviewProps {
  report: CustomReportConfig
  onEdit: () => void
  onExport: () => void
}

// Mock data for preview - In a real app, this would come from your backend
const mockData = [
  {
    "Category": "Electronics",
    "Month": new Date("2024-01-01"),
    "Total Sales": 150000,
    "Units Sold": 750
  },
  {
    "Category": "Clothing",
    "Month": new Date("2024-01-01"),
    "Total Sales": 85000,
    "Units Sold": 1200
  },
  {
    "Category": "Food & Beverage",
    "Month": new Date("2024-01-01"),
    "Total Sales": 65000,
    "Units Sold": 3200
  },
  {
    "Category": "Electronics",
    "Month": new Date("2024-02-01"),
    "Total Sales": 165000,
    "Units Sold": 820
  },
  {
    "Category": "Clothing",
    "Month": new Date("2024-02-01"),
    "Total Sales": 92000,
    "Units Sold": 1350
  }
]

export function ReportPreview({ report, onEdit, onExport }: ReportPreviewProps) {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>()
  const [isLoading, setIsLoading] = useState(false)

  const handleRefresh = () => {
    setIsLoading(true)
    // Simulate data refresh
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const renderChart = () => {
    switch (report.chartType) {
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
                {report.fields
                  .filter(field => field.visible)
                  .map(field => (
                    <TableHead key={field.id}>{field.name}</TableHead>
                  ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockData.map((row, index) => (
                <TableRow key={index}>
                  {report.fields
                    .filter(field => field.visible)
                    .map(field => (
                      <TableCell key={field.id}>
                        {formatValue(row[field.name as keyof typeof row], field.dataType)}
                      </TableCell>
                    ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
    }
  }

  const formatValue = (value: any, type: string) => {
    if (value === undefined || value === null) return "-"
    
    switch (type) {
      case "date":
        return format(new Date(value), "MMM d, yyyy")
      case "number":
        return typeof value === "number"
          ? new Intl.NumberFormat("en-US", {
              style: "decimal",
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            }).format(value)
          : value
      default:
        return value
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>{report.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {report.description}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={onExport}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div>
                <Badge variant="outline" className="space-x-1">
                  <FileText className="h-3 w-3" />
                  <span>{report.chartType.charAt(0).toUpperCase() + report.chartType.slice(1)}</span>
                </Badge>
              </div>
              <div>
                <Badge variant="outline" className="space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {dateRange?.from
                      ? `${format(dateRange.from, "MMM d, yyyy")} - ${
                          dateRange.to ? format(dateRange.to, "MMM d, yyyy") : "Present"
                        }`
                      : "All Time"}
                  </span>
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
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
          </div>

          <div className="pt-4">{renderChart()}</div>
        </CardContent>
      </Card>
    </div>
  )
}
