import { Card } from "@/components/ui/card"
import { Market } from "../pages/MarketsPage"
import { Bar, Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Package, TrendingUp, DollarSign, BarChart3, ArrowUpDown, Download, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from '@/lib/utils';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
)

interface MarketAnalyticsProps {
  market: Market
}

type TopProduct = {
  id: string
  name: string
  sales: number
  revenue: number
  turnover: number
}

// Mock data - replace with real data from your API
const mockSalesData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Sales',
      data: [650, 590, 800, 810, 760, 850, 920],
      backgroundColor: 'rgba(34, 197, 94, 0.2)',
      borderColor: 'rgb(34, 197, 94)',
      borderWidth: 2,
    },
  ],
}

const mockRevenueData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Revenue',
      data: [1200, 1900, 1500, 1800, 2200, 2500, 2800],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      tension: 0.4,
    },
  ],
}

const topProducts: TopProduct[] = [
  { id: '1', name: 'Product A', sales: 150, revenue: 3000, turnover: 85 },
  { id: '2', name: 'Product B', sales: 120, revenue: 2400, turnover: 75 },
  { id: '3', name: 'Product C', sales: 100, revenue: 2000, turnover: 90 },
  { id: '4', name: 'Product D', sales: 80, revenue: 1600, turnover: 70 },
  { id: '5', name: 'Product E', sales: 60, revenue: 1200, turnover: 65 },
]

const columns = [
  { 
    id: 'name', 
    label: 'Product Name',
    icon: Package
  },
  { 
    id: 'sales', 
    label: 'Sales',
    icon: BarChart3
  },
  { 
    id: 'revenue', 
    label: 'Revenue',
    icon: DollarSign
  },
  { 
    id: 'turnover', 
    label: 'Turnover Rate',
    icon: TrendingUp
  }
]

export function MarketAnalytics({ market }: MarketAnalyticsProps) {
  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <Card className="p-6 border-l-4 border-l-green-500">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Performance Overview</h3>
            <p className="text-sm text-muted-foreground">Key metrics and statistics</p>
          </div>
          <Select defaultValue="week">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24 hours</SelectItem>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-green-500/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Package className="h-5 w-5 text-green-500" />
              </div>
              <span className="font-medium">Products</span>
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-green-500">
                {market.products?.length || 150}
              </div>
              <div className="flex items-center text-xs font-medium text-green-500">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12%
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Active products</span>
              <span>{((market.products?.length || 150) * 0.8).toFixed(0)}</span>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-green-500/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <span className="font-medium">Revenue</span>
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-green-500">
                ${market.revenue?.toLocaleString() || '12,450'}
              </div>
              <div className="flex items-center text-xs font-medium text-green-500">
                <TrendingUp className="h-3 w-3 mr-1" />
                +23%
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Avg. daily</span>
              <span>${((market.revenue || 12450) / 7).toFixed(0)}</span>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-green-500/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <ArrowUpDown className="h-5 w-5 text-green-500" />
              </div>
              <span className="font-medium">Transactions</span>
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-green-500">
                {market.transactions || 450}
              </div>
              <div className="flex items-center text-xs font-medium text-green-500">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8%
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Success rate</span>
              <span>98.5%</span>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-green-500/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <BarChart3 className="h-5 w-5 text-green-500" />
              </div>
              <span className="font-medium">Performance</span>
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-green-500">
                {market.performance || '92%'}
              </div>
              <div className="flex items-center text-xs font-medium text-green-500">
                <TrendingUp className="h-3 w-3 mr-1" />
                +5%
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Target</span>
              <span>95%</span>
            </div>
          </Card>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Sales Performance</h3>
              <p className="text-sm text-muted-foreground">Daily sales volume</p>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
          <Bar 
            data={mockSalesData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                  },
                },
                x: {
                  grid: {
                    display: false,
                  },
                },
              },
            }}
          />
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Revenue Trends</h3>
              <p className="text-sm text-muted-foreground">Daily revenue analysis</p>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
          <Line 
            data={mockRevenueData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                  },
                },
                x: {
                  grid: {
                    display: false,
                  },
                },
              },
            }}
          />
        </Card>
      </div>

      {/* Top Products Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Top Performing Products</h3>
            <p className="text-sm text-muted-foreground">Best selling items by revenue</p>
          </div>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
        <div className="border rounded-md">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                {columns.map((column) => (
                  <TableHead 
                    key={column.id}
                    className="h-12 px-2"
                  >
                    <div className="flex items-center gap-2">
                      <column.icon className="h-4 w-4 text-muted-foreground" />
                      <span>{column.label}</span>
                      {column.id !== 'name' && (
                        <ArrowUpDown className="h-4 w-4 text-muted-foreground ml-auto" />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.map((product) => (
                <TableRow key={product.id} className="h-16">
                  <TableCell className="px-2">
                    <div className="font-medium">{product.name}</div>
                  </TableCell>
                  <TableCell className="px-2">
                    <Badge variant="secondary">{product.sales}</Badge>
                  </TableCell>
                  <TableCell className="px-2">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(product.revenue)}
                  </TableCell>
                  <TableCell className="px-2">
                    <div className="flex items-center gap-2">
                      <Progress value={product.turnover} className="w-[60px]" />
                      <span className="text-muted-foreground text-sm">{product.turnover}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
