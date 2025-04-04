import { useState, useEffect } from "react"
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
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import {
  Download,
  FileText,
  BarChart,
  LineChart,
  PieChart,
  RefreshCw,
  Users,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Star,
  Gift,
  Wallet,
  Calendar,
  Loader2,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useCustomerReports, ReportDateRange } from "../hooks/useCustomerReports"
import { useParams } from "react-router-dom"

const reportTypes = [
  {
    id: "segments",
    name: "Customer Segments",
    description: "Distribution across segments",
    icon: Users
  },
  {
    id: "loyalty",
    name: "Loyalty Metrics",
    description: "Points earned and redeemed",
    icon: Gift
  },
  {
    id: "retention",
    name: "Retention Analysis",
    description: "Customer retention and churn",
    icon: TrendingUp
  },
  {
    id: "acquisition",
    name: "Acquisition",
    description: "New customer acquisition",
    icon: TrendingUp
  }
]

export function CustomerReportsPage() {
  const [selectedReport, setSelectedReport] = useState("segments")
  const [dateRange, setDateRange] = useState<ReportDateRange>({})
  const [chartType, setChartType] = useState<"table" | "bar" | "line" | "pie">("table")
  const { id } = useParams<{ id: string }>()
  
  const {
    loading,
    error,
    data,
    getSegmentDistribution,
    getCustomerSegmentsReport,
    getRetentionReport,
    getAcquisitionReport,
    getLoyaltyProgramReport,
    getCustomerMetrics,
    getCustomerLifetimeValue,
    getLoyaltyActivity,
  } = useCustomerReports()

  // Load the selected report when it changes
  useEffect(() => {
    loadReportData()
  }, [selectedReport])

  const loadReportData = async () => {
    switch (selectedReport) {
      case "segments":
        await getCustomerSegmentsReport()
        break
      case "loyalty":
        await getLoyaltyProgramReport()
        break
      case "retention":
        await getRetentionReport()
        break
      case "acquisition":
        await getAcquisitionReport()
        break
      default:
        await getCustomerSegmentsReport()
        break
    }
  }

  const handleRefresh = () => {
    loadReportData()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return "Invalid date"
    }
  }

  const renderSegmentsTable = () => {
    if (!data?.segments) return <div>No segment data available</div>
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Segment</TableHead>
            <TableHead className="text-right">Customers</TableHead>
            <TableHead className="text-right">Percentage</TableHead>
            <TableHead className="text-right">Total Spent</TableHead>
            <TableHead className="text-right">Avg. Spent</TableHead>
            <TableHead className="text-right">Loyalty Points</TableHead>
            <TableHead className="text-right">Avg. Order Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.segments.map((segment: any, index: number) => (
            <TableRow key={index}>
              <TableCell>
                <Badge variant={
                  segment.segment === "gold" ? "default" :
                  segment.segment === "silver" ? "secondary" : "outline"
                }>
                  {segment.segment}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {segment.customerCount.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {segment.percentage.toFixed(1)}%
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(segment.totalSpent)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(segment.averageSpent)}
              </TableCell>
              <TableCell className="text-right">
                {segment.totalLoyaltyPoints?.toLocaleString() || "N/A"}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(segment.averageOrderValue)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  const renderLoyaltyTable = () => {
    if (!data?.membershipDistribution) return <div>No loyalty data available</div>
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tier</TableHead>
            <TableHead className="text-right">Customers</TableHead>
            <TableHead className="text-right">Total Points</TableHead>
            <TableHead className="text-right">% of All Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.membershipDistribution.map((item: any, index: number) => (
            <TableRow key={index}>
              <TableCell>
                <Badge variant={
                  item.level === "gold" ? "default" :
                  item.level === "silver" ? "secondary" : "outline"
                }>
                  {item.level}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {item.customerCount.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {item.totalPoints.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {item.pointsPercentage.toFixed(1)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  const renderRetentionTable = () => {
    if (!data?.retentionRates) return <div>No retention data available</div>
    
    return (
      <>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">30-Day Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.retentionRates.thirtyDays.toFixed(1)}%
              </div>
              <div className="mt-2">
                <Progress value={data.retentionRates.thirtyDays} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">90-Day Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.retentionRates.ninetyDays.toFixed(1)}%
              </div>
              <div className="mt-2">
                <Progress value={data.retentionRates.ninetyDays} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">1-Year Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.retentionRates.oneYear.toFixed(1)}%
              </div>
              <div className="mt-2">
                <Progress value={data.retentionRates.oneYear} />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-right">Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Active Customers (30 days)</TableCell>
              <TableCell className="text-right">
                {data.activeCustomers.thirtyDays.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {((data.activeCustomers.thirtyDays / data.totalCustomers) * 100).toFixed(1)}%
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Active Customers (90 days)</TableCell>
              <TableCell className="text-right">
                {data.activeCustomers.ninetyDays.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {((data.activeCustomers.ninetyDays / data.totalCustomers) * 100).toFixed(1)}%
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>At-Risk Customers</TableCell>
              <TableCell className="text-right">
                {data.atRiskCustomers.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {((data.atRiskCustomers / data.totalCustomers) * 100).toFixed(1)}%
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Churned Customers</TableCell>
              <TableCell className="text-right">
                {data.churnedCustomers.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {((data.churnedCustomers / data.totalCustomers) * 100).toFixed(1)}%
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </>
    )
  }

  const renderAcquisitionTable = () => {
    if (!data?.acquisitionByMonth) return <div>No acquisition data available</div>
    
    // Only show the most recent 12 months
    const recentAcquisition = data.acquisitionByMonth.slice(-12)
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Period</TableHead>
            <TableHead className="text-right">New Customers</TableHead>
            <TableHead className="text-right">Growth Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentAcquisition.map((item: any, index: number) => {
            const growthRate = data.growthRates.find((g: any) => g.period === item.period)?.growthRate
            return (
              <TableRow key={index}>
                <TableCell>{item.period}</TableCell>
                <TableCell className="text-right">
                  {item.newCustomers.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {growthRate !== undefined ? (
                    <span className={growthRate >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
                    </span>
                  ) : 'N/A'}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    )
  }

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-40 text-red-500">
          Error loading report: {error.message}
        </div>
      )
    }

    if (!data) {
      return (
        <div className="flex items-center justify-center h-40 text-muted-foreground">
          No data available for this report
        </div>
      )
    }

    if (chartType === "bar" || chartType === "line" || chartType === "pie") {
      const ChartIcon = chartType === "bar" ? BarChart : 
                      chartType === "line" ? LineChart : PieChart
      
      return (
        <div className="h-[400px] flex items-center justify-center border rounded-lg">
          <div className="text-center">
            <ChartIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart Visualization
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              (Full chart visualization coming soon)
            </p>
          </div>
        </div>
      )
    }

    // Default to table view
    switch (selectedReport) {
      case "segments":
        return renderSegmentsTable()
      case "loyalty":
        return renderLoyaltyTable()
      case "retention":
        return renderRetentionTable()
      case "acquisition":
        return renderAcquisitionTable()
      default:
        return <div>Select a report type</div>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Reports</h1>
          <p className="text-muted-foreground">
            Analyze customer behavior and loyalty metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Schedule Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
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
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {reportTypes.find(r => r.id === selectedReport)?.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <DateRangePicker 
                date={dateRange} 
                onUpdate={(dateRange) => setDateRange(dateRange)} 
              />
              <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Chart Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="table">Table</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>
    </div>
  )
}
