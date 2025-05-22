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
import { cn } from '@/lib/utils';
import {
  Download,
  FileText,
  BarChart,
  LineChart,
  PieChart,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Target,
  Star,
  Clock,
  DollarSign,
  Users,
  ShoppingCart,
  AlertCircle,
} from "lucide-react"
import { performanceService, StaffPerformance, PerformanceSummary } from "../services/performanceService"

// Define the performance metrics and their icons
const performanceMetrics = [
  { id: "salesTarget", name: "Sales Target", icon: Target },
  { id: "customerSatisfaction", name: "Customer Satisfaction", icon: Star },
  { id: "attendance", name: "Attendance", icon: Clock },
  { id: "taskCompletion", name: "Task Completion", icon: FileText },
  { id: "teamManagement", name: "Team Management", icon: Users }
]

export function PerformancePage() {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [selectedMetric, setSelectedMetric] = useState("overall")
  const [chartType, setChartType] = useState<"table" | "bar" | "line" | "pie">("table")
  const [isLoading, setIsLoading] = useState(true)
  const [performanceData, setPerformanceData] = useState<StaffPerformance[]>([])
  const [summaryData, setSummaryData] = useState<PerformanceSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load initial data
  useEffect(() => {
    loadPerformanceData();
  }, []);

  // Reload data when date range changes
  useEffect(() => {
    loadPerformanceData();
  }, [dateRange]);

  // Handle data refresh
  const handleRefresh = () => {
    loadPerformanceData();
  }

  // Load performance data from API
  const loadPerformanceData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch performance data
      const staffData = await performanceService.getStaffPerformance(
        dateRange?.from,
        dateRange?.to
      );
      setPerformanceData(staffData);

      // Fetch summary data
      const summary = await performanceService.getPerformanceSummary(
        dateRange?.from,
        dateRange?.to
      );
      setSummaryData(summary);
    } catch (error) {
      console.error("Error loading performance data:", error);
      setError("Failed to load performance data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPerformanceColor = (value: number) => {
    if (value >= 90) return "text-green-500"
    if (value >= 75) return "text-yellow-500"
    return "text-red-500"
  }

  const getPerformanceBadge = (value: number): "default" | "destructive" | "outline" | "secondary" => {
    if (value >= 90) return "default"
    if (value >= 75) return "secondary"
    return "destructive"
  }

  // Display a message when no data is available
  const NoDataDisplay = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No performance data available</h3>
      <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-md">
        There is no performance data available for the selected time period. 
        Try selecting a different date range or refreshing.
      </p>
      <Button onClick={handleRefresh} variant="outline">
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh Data
      </Button>
    </div>
  );

  return (
    <div className="w-full py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Performance</h1>
          <p className="text-muted-foreground">
            Monitor and analyze staff performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Schedule Review
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summaryData?.totalSales.toLocaleString() || 0}</div>
            <div className={`flex items-center pt-1 ${summaryData?.salesGrowth && summaryData.salesGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {summaryData?.salesGrowth && summaryData.salesGrowth >= 0 ? 
                <TrendingUp className="h-4 w-4 mr-1" /> : 
                <TrendingDown className="h-4 w-4 mr-1" />
              }
              <span className="text-xs">{summaryData?.salesGrowth ? `${Math.abs(summaryData.salesGrowth).toFixed(1)}% from last month` : 'N/A'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData?.transactions || 0}</div>
            <div className={`flex items-center pt-1 ${summaryData?.transactionsGrowth && summaryData.transactionsGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {summaryData?.transactionsGrowth && summaryData.transactionsGrowth >= 0 ? 
                <TrendingUp className="h-4 w-4 mr-1" /> : 
                <TrendingDown className="h-4 w-4 mr-1" />
              }
              <span className="text-xs">{summaryData?.transactionsGrowth ? `${Math.abs(summaryData.transactionsGrowth).toFixed(1)}% from last month` : 'N/A'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData?.averageRating || 0}</div>
            <div className={`flex items-center pt-1 ${summaryData?.ratingChange && summaryData.ratingChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {summaryData?.ratingChange && summaryData.ratingChange >= 0 ? 
                <TrendingUp className="h-4 w-4 mr-1" /> : 
              <TrendingDown className="h-4 w-4 mr-1" />
              }
              <span className="text-xs">{summaryData?.ratingChange ? `${Math.abs(summaryData.ratingChange).toFixed(1)} from last month` : 'N/A'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Worked</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData?.hoursWorked || 0}</div>
            <div className={`flex items-center pt-1 ${summaryData?.hoursGrowth && summaryData.hoursGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {summaryData?.hoursGrowth && summaryData.hoursGrowth >= 0 ? 
                <TrendingUp className="h-4 w-4 mr-1" /> : 
                <TrendingDown className="h-4 w-4 mr-1" />
              }
              <span className="text-xs">{summaryData?.hoursGrowth ? `${Math.abs(summaryData.hoursGrowth).toFixed(1)}% from last month` : 'N/A'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Performance Overview</CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overall">Overall Performance</SelectItem>
                  <SelectItem value="sales">Sales Performance</SelectItem>
                  <SelectItem value="customer">Customer Satisfaction</SelectItem>
                  <SelectItem value="attendance">Attendance</SelectItem>
                </SelectContent>
              </Select>
              <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="table">Table View</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                </SelectContent>
              </Select>
              <DateRangePicker 
                date={dateRange} 
                onChange={setDateRange} 
              />
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
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-destructive">
              <AlertCircle className="h-8 w-8 mb-4" />
              <p>{error}</p>
              <Button className="mt-4" variant="outline" onClick={handleRefresh}>
                Try Again
              </Button>
            </div>
          ) : performanceData.length === 0 ? (
            <NoDataDisplay />
          ) : chartType === "table" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>Staff Member</span>
                    </div>
                  </TableHead>
                  {performanceMetrics.map((metric) => (
                    <TableHead key={metric.id}>
                      <div className="flex items-center space-x-1">
                        <metric.icon className="h-4 w-4" />
                        <span>{metric.name}</span>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead>Overall</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performanceData.map((staff) => {
                  const overallScore = Object.values(staff.metrics).reduce((a, b) => a + b, 0) / Object.values(staff.metrics).length
                  return (
                    <TableRow key={staff.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{staff.name}</div>
                          <div className="text-sm text-muted-foreground">{staff.role}</div>
                        </div>
                      </TableCell>
                      {performanceMetrics.map((metric) => (
                        <TableCell key={metric.id}>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className={getPerformanceColor(staff.metrics[metric.id as keyof typeof staff.metrics])}>
                                {staff.metrics[metric.id as keyof typeof staff.metrics]}%
                              </span>
                            </div>
                            <Progress
                              value={staff.metrics[metric.id as keyof typeof staff.metrics]}
                              className="h-2"
                            />
                          </div>
                        </TableCell>
                      ))}
                      <TableCell>
                        <Badge variant={getPerformanceBadge(overallScore)}>
                          {overallScore.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground border rounded-md p-8">
              {chartType === "bar" && <BarChart className="h-24 w-24" />}
              {chartType === "line" && <LineChart className="h-24 w-24" />}
              {chartType === "pie" && <PieChart className="h-24 w-24" />}
              <div className="ml-4 text-center">
                <h3 className="text-lg font-medium">Chart Visualization</h3>
                <p className="text-sm text-muted-foreground">
                  Chart visualization for {selectedMetric} data would be rendered here
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {performanceData.length > 0 && (
        <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                {performanceData
                .sort((a, b) => {
                  const aScore = Object.values(a.metrics).reduce((x, y) => x + y, 0) / Object.values(a.metrics).length
                  const bScore = Object.values(b.metrics).reduce((x, y) => x + y, 0) / Object.values(b.metrics).length
                  return bScore - aScore
                })
                .slice(0, 3)
                .map((staff, index) => {
                  const overallScore = Object.values(staff.metrics).reduce((a, b) => a + b, 0) / Object.values(staff.metrics).length
                  return (
                    <div
                      key={staff.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{staff.name}</div>
                          <div className="text-sm text-muted-foreground">{staff.role}</div>
                        </div>
                      </div>
                      <Badge variant={getPerformanceBadge(overallScore)}>
                        {overallScore.toFixed(1)}%
                      </Badge>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Areas for Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                {performanceData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No performance data available
                  </div>
                ) : (
                  performanceData.map((staff) => {
                const lowestMetric = Object.entries(staff.metrics).reduce((a, b) =>
                  a[1] < b[1] ? a : b
                )
                if (lowestMetric[1] < 90) {
                  return (
                    <div
                      key={staff.id}
                      className="p-4 border rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{staff.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {performanceMetrics.find(m => m.id === lowestMetric[0])?.name}
                          </div>
                        </div>
                        <Badge variant={getPerformanceBadge(lowestMetric[1])}>
                          {lowestMetric[1]}%
                        </Badge>
                      </div>
                      <Progress value={lowestMetric[1]} className="h-2" />
                    </div>
                  )
                }
                return null
                  })
                )}
            </div>
          </CardContent>
        </Card>
      </div>
      )}
    </div>
  )
}
