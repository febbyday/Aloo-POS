import { useState } from 'react'
import {
  BarChart3,
  Download,
  Filter,
  LineChart,
  PieChart,
  RefreshCw,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { useToast } from '@/components/ui/use-toast'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

type TimeRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
type ChartType = 'bar' | 'line' | 'pie'

interface ChartConfig {
  type: ChartType
  title: string
  description: string
  data: any // Replace with actual chart data type
}

export function AnalyticsDashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('week')
  const [activeTab, setActiveTab] = useState('overview')
  const { toast } = useToast()

  const handleRefresh = () => {
    toast({
      title: "Refreshing data...",
      description: "Your analytics data is being updated."
    })
  }

  const handleExport = () => {
    toast({
      title: "Exporting report...",
      description: "Your export will be ready shortly."
    })
  }

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="bg-zinc-900 px-4 py-2 flex items-center gap-2 -mx-4 -mt-4">
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10"
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>

        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 text-zinc-400 hover:text-white hover:bg-white/10"
          onClick={handleExport}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>

        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 text-zinc-400 hover:text-white hover:bg-white/10"
        >
          <Settings className="h-4 w-4 mr-2" />
          Customize
        </Button>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <Select
          value={timeRange}
          onValueChange={(value: TimeRange) => setTimeRange(value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales Analysis</TabsTrigger>
          <TabsTrigger value="products">Product Performance</TabsTrigger>
          <TabsTrigger value="customers">Customer Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Sales Count
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+2350</div>
                <p className="text-xs text-muted-foreground">
                  +180.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Customers
                </CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+12,234</div>
                <p className="text-xs text-muted-foreground">
                  +19% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Order Value
                </CardTitle>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$59.62</div>
                <p className="text-xs text-muted-foreground">
                  +201 since last hour
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Revenue Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[240px]">
                  {/* Add Revenue Chart Component */}
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Chart Component Coming Soon
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[240px]">
                  {/* Add Category Chart Component */}
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Chart Component Coming Soon
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Charts */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[240px]">
                  {/* Add Products Chart Component */}
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Chart Component Coming Soon
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Customer Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[240px]">
                  {/* Add Demographics Chart Component */}
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Chart Component Coming Soon
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          {/* Sales Analysis Content */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Sales Analysis</CardTitle>
              <CardDescription>
                Comprehensive breakdown of sales performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Sales Analysis Coming Soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          {/* Product Performance Content */}
          <Card>
            <CardHeader>
              <CardTitle>Product Performance Metrics</CardTitle>
              <CardDescription>
                Detailed analysis of product sales and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Product Analysis Coming Soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          {/* Customer Insights Content */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Behavior Analysis</CardTitle>
              <CardDescription>
                Understanding customer patterns and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Customer Insights Coming Soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
