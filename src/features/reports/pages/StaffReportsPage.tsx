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
  Users,
  Clock,
  Target,
  TrendingUp,
  Star,
  Calendar,
  Loader2
} from "lucide-react"
import { format } from "date-fns"
import { useStaffReports } from "../hooks/useStaffReports"

// Report type definitions
const reportTypes = [
  {
    id: "performance",
    name: "Performance Metrics",
    description: "Staff performance and KPIs",
    icon: Target
  },
  {
    id: "attendance",
    name: "Attendance & Hours",
    description: "Working hours and attendance tracking",
    icon: Clock
  },
  {
    id: "sales",
    name: "Sales Performance",
    description: "Individual sales achievements",
    icon: TrendingUp
  },
  {
    id: "commissions",
    name: "Commissions",
    description: "Staff commissions and bonuses",
    icon: Star
  },
  {
    id: "schedule",
    name: "Schedule Analysis",
    description: "Staff scheduling and coverage",
    icon: Calendar
  },
  {
    id: "department",
    name: "Department Analysis",
    description: "Performance by department",
    icon: Users
  }
]

export function StaffReportsPage() {
  const [selectedReport, setSelectedReport] = useState("performance")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>()
  const [chartType, setChartType] = useState<"table" | "bar" | "line" | "pie">("table")
  
  // Use the staff reports hook to fetch real data
  const { reportData, isLoading, error, refetch } = useStaffReports()

  const handleRefresh = () => {
    refetch()
  }

  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span>Loading staff report data...</span>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-[400px] text-destructive">
          <p>Error loading staff data. Please try again.</p>
        </div>
      )
    }

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
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Sales</TableHead>
                <TableHead className="text-right">Transactions</TableHead>
                <TableHead className="text-right">Avg Ticket</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead className="text-right">Performance</TableHead>
                <TableHead className="text-right">Commissions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No staff data found. Please add staff members first.
                  </TableCell>
                </TableRow>
              ) : (
                reportData.map((staff, index) => (
                  <TableRow key={index}>
                    <TableCell>{staff.name}</TableCell>
                    <TableCell>{staff.role}</TableCell>
                    <TableCell>{staff.department}</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD"
                      }).format(staff.sales)}
                    </TableCell>
                    <TableCell className="text-right">{staff.transactions}</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD"
                      }).format(staff.avgTicket)}
                    </TableCell>
                    <TableCell className="text-right">{staff.hoursWorked}h</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={
                        staff.performance >= 90 ? "default" :
                        staff.performance >= 75 ? "warning" : "destructive"
                      }>
                        {staff.performance}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD"
                      }).format(staff.commissions)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Reports</h1>
          <p className="text-muted-foreground">
            Monitor staff performance and productivity
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Report: {reportTypes.find(r => r.id === selectedReport)?.name}</CardTitle>
          <div className="flex items-center space-x-2">
            <DateRangePicker 
              value={dateRange}
              onChange={setDateRange}
            />
            <Select
              value={chartType}
              onValueChange={(value: any) => setChartType(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select chart type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="table">Table View</SelectItem>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="pie">Pie Chart</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>
    </div>
  )
}
