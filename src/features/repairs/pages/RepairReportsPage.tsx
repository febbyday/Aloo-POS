import { useState } from 'react'
import { Repair, RepairStatus, LeatherProductType } from '../types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Download } from 'lucide-react'

export function RepairReportsPage() {
  const [dateRange, setDateRange] = useState('7days')

  // TODO: Replace with actual data fetching
  const repairs: Repair[] = []

  // Calculate date range
  const getDateRange = () => {
    switch (dateRange) {
      case '7days':
        return { start: subDays(new Date(), 7), end: new Date() }
      case '30days':
        return { start: subDays(new Date(), 30), end: new Date() }
      case 'month':
        return { start: startOfMonth(new Date()), end: endOfMonth(new Date()) }
      default:
        return { start: subDays(new Date(), 7), end: new Date() }
    }
  }

  // Filter repairs by date range
  const { start, end } = getDateRange()
  const filteredRepairs = repairs.filter(repair => 
    repair.createdAt >= start && repair.createdAt <= end
  )

  // Calculate statistics
  const totalRepairs = filteredRepairs.length
  const completedRepairs = filteredRepairs.filter(r => r.status === RepairStatus.COMPLETED).length
  const totalRevenue = filteredRepairs.reduce((sum, r) => sum + (r.actualCost || 0), 0)
  const avgRepairTime = filteredRepairs
    .filter(r => r.completedAt)
    .reduce((sum, r) => sum + (r.completedAt!.getTime() - r.createdAt.getTime()), 0) / (1000 * 60 * 60 * 24) / completedRepairs

  // Prepare chart data
  const repairsByDay = filteredRepairs.reduce((acc, repair) => {
    const date = format(repair.createdAt, 'MMM dd')
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const lineChartData = Object.entries(repairsByDay).map(([date, count]) => ({
    date,
    repairs: count
  }))

  // Product type distribution
  const productTypeData = Object.values(LeatherProductType).map(type => ({
    name: type,
    value: filteredRepairs.filter(r => r.productType === type).length
  }))

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Repair Reports</h1>
          <p className="text-muted-foreground">
            Analytics and insights for repair operations
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <Tabs value={dateRange} onValueChange={setDateRange}>
        <TabsList>
          <TabsTrigger value="7days">Last 7 Days</TabsTrigger>
          <TabsTrigger value="30days">Last 30 Days</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Repairs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRepairs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Repairs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedRepairs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Repair Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRepairTime.toFixed(1)} days</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Repairs Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="repairs" 
                    stroke="#8884d8" 
                    name="Number of Repairs"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => 
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {productTypeData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
