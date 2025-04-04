import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Download, Calendar } from 'lucide-react'

interface LabelAnalyticsProps {
  onExport: (format: 'csv' | 'pdf') => void
}

// Mock data - replace with real data from your backend
const mockData = {
  dailyUsage: [
    { date: '2024-01-01', count: 150 },
    { date: '2024-01-02', count: 200 },
    { date: '2024-01-03', count: 180 },
    { date: '2024-01-04', count: 220 },
    { date: '2024-01-05', count: 190 },
    { date: '2024-01-06', count: 240 },
    { date: '2024-01-07', count: 210 },
  ],
  categoryUsage: [
    { name: 'Products', value: 45 },
    { name: 'Price Tags', value: 25 },
    { name: 'Shipping', value: 20 },
    { name: 'Inventory', value: 10 },
  ],
  printerUsage: [
    { name: 'Printer 1', count: 1200 },
    { name: 'Printer 2', count: 800 },
    { name: 'Printer 3', count: 600 },
  ],
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export function LabelAnalytics({ onExport }: LabelAnalyticsProps) {
  const [timeRange, setTimeRange] = useState('7d')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Label Analytics</h3>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => onExport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => onExport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Daily Usage Chart */}
        <Card className="p-4">
          <h4 className="text-sm font-medium mb-4">Daily Label Usage</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData.dailyUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8884d8"
                  name="Labels Printed"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Usage Chart */}
        <Card className="p-4">
          <h4 className="text-sm font-medium mb-4">Label Usage by Category</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockData.categoryUsage}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockData.categoryUsage.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Printer Usage Chart */}
        <Card className="p-4">
          <h4 className="text-sm font-medium mb-4">Printer Usage</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData.printerUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Labels Printed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Summary Stats */}
        <Card className="p-4">
          <h4 className="text-sm font-medium mb-4">Summary Statistics</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Labels</p>
                <p className="text-2xl font-bold">2,600</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Average Daily</p>
                <p className="text-2xl font-bold">371</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Peak Usage</p>
                <p className="text-2xl font-bold">240</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Active Printers</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                Most Used Template
              </p>
              <p className="font-medium">Standard Product Label</p>
              <p className="text-sm text-muted-foreground">1,200 prints</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
} 