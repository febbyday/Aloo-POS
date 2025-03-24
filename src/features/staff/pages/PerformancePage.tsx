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
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
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
} from "lucide-react"

// Mock data for staff performance
const mockPerformanceData = [
  {
    id: 1,
    name: "John Smith",
    role: "Store Manager",
    metrics: {
      salesTarget: 95,
      customerSatisfaction: 92,
      attendance: 98,
      taskCompletion: 94,
      teamManagement: 96
    },
    recentSales: 25000,
    transactions: 150,
    hoursWorked: 160,
    rating: 4.8
  },
  {
    id: 2,
    name: "Sarah Johnson",
    role: "Sales Associate",
    metrics: {
      salesTarget: 88,
      customerSatisfaction: 95,
      attendance: 96,
      taskCompletion: 90,
      teamManagement: 85
    },
    recentSales: 18500,
    transactions: 120,
    hoursWorked: 155,
    rating: 4.5
  },
  // Add more mock data as needed
]

const performanceMetrics = [
  { id: "salesTarget", name: "Sales Target", icon: Target },
  { id: "customerSatisfaction", name: "Customer Satisfaction", icon: Star },
  { id: "attendance", name: "Attendance", icon: Clock },
  { id: "taskCompletion", name: "Task Completion", icon: FileText },
  { id: "teamManagement", name: "Team Management", icon: Users }
]

export function PerformancePage() {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>()
  const [selectedMetric, setSelectedMetric] = useState("overall")
  const [chartType, setChartType] = useState<"table" | "bar" | "line" | "pie">("table")
  const [isLoading, setIsLoading] = useState(false)

  const handleRefresh = () => {
    setIsLoading(true)
    // Simulate data refresh
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const getPerformanceColor = (value: number) => {
    if (value >= 90) return "text-green-500"
    if (value >= 75) return "text-yellow-500"
    return "text-red-500"
  }

  const getPerformanceBadge = (value: number) => {
    if (value >= 90) return "default"
    if (value >= 75) return "warning"
    return "destructive"
  }

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
            <div className="text-2xl font-bold">$43,500</div>
            <div className="flex items-center pt-1 text-green-500">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-xs">+12.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">270</div>
            <div className="flex items-center pt-1 text-green-500">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-xs">+8.2% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.6</div>
            <div className="flex items-center pt-1 text-yellow-500">
              <TrendingDown className="h-4 w-4 mr-1" />
              <span className="text-xs">-0.2 from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Worked</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">315</div>
            <div className="flex items-center pt-1 text-green-500">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-xs">+5.8% from last month</span>
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
        </CardHeader>
        <CardContent>
          {chartType === "table" ? (
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
                        {metric.id === 'salesTarget' && <ShoppingCart className="h-4 w-4" />}
                        {metric.id === 'customerSatisfaction' && <Star className="h-4 w-4" />}
                        {metric.id === 'attendance' && <Clock className="h-4 w-4" />}
                        {metric.id === 'taskCompletion' && <Target className="h-4 w-4" />}
                        {metric.id === 'teamManagement' && <Users className="h-4 w-4" />}
                        <span>{metric.name}</span>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead>
                    <div className="flex items-center space-x-1">
                      <BarChart className="h-4 w-4" />
                      <span>Overall</span>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPerformanceData.map((staff) => {
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
            <div className="h-[400px] flex items-center justify-center border rounded-lg">
              <div className="text-center">
                {chartType === "bar" && <BarChart className="h-16 w-16 text-muted-foreground mb-4" />}
                {chartType === "line" && <LineChart className="h-16 w-16 text-muted-foreground mb-4" />}
                {chartType === "pie" && <PieChart className="h-16 w-16 text-muted-foreground mb-4" />}
                <p className="text-muted-foreground">Chart visualization will be implemented here</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPerformanceData
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
              {mockPerformanceData.map((staff) => {
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
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
