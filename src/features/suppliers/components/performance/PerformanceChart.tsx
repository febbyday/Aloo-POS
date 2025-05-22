import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts"
import { cn } from '@/lib/utils';

interface ChartData {
  date: string
  value: number
}

interface PerformanceChartProps {
  title: string
  data: ChartData[]
  color: string
  valuePrefix?: string
  valueSuffix?: string
  showGrid?: boolean
  type?: 'line' | 'area'
  height?: number
  period: "monthly" | "quarterly" | "yearly"
}

const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-lg">
        <p className="text-zinc-400 text-sm">{label}</p>
        <p className="text-zinc-100 font-medium">
          {prefix}{payload[0].value.toLocaleString()}{suffix}
        </p>
      </div>
    )
  }
  return null
}

// Mock data generator
const generateData = (period: string) => {
  const data = []
  const now = new Date()
  let points = period === "monthly" ? 30 : period === "quarterly" ? 12 : 12
  
  for (let i = 0; i < points; i++) {
    const date = new Date(now)
    date.setDate(now.getDate() - (points - i))
    
    data.push({
      date: date.toLocaleDateString(),
      deliveryTime: Math.random() * 5 + 2,
      qualityRating: Math.random() * 2 + 3,
      orderVolume: Math.floor(Math.random() * 50) + 20,
    })
  }
  
  return data
}

export function PerformanceChart({ 
  title, 
  data, 
  color, 
  valuePrefix = '', 
  valueSuffix = '',
  showGrid = true,
  type = 'line',
  height = 350,
  period
}: PerformanceChartProps) {
  const Chart = type === 'line' ? LineChart : AreaChart

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4">
          <div style={{ width: '100%', height }}>
            <ResponsiveContainer width="100%" height="100%">
              <Chart
                data={data || generateData(period)}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                {showGrid && (
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    vertical={false}
                    stroke="rgba(255,255,255,0.1)"
                  />
                )}
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.5)' }}
                  tickLine={{ stroke: 'rgba(255,255,255,0.5)' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.5)' }}
                  tickLine={{ stroke: 'rgba(255,255,255,0.5)' }}
                  tickFormatter={(value) => `${valuePrefix}${value}${valueSuffix}`}
                />
                <Tooltip 
                  content={<CustomTooltip prefix={valuePrefix} suffix={valueSuffix} />}
                />
                {type === 'line' ? (
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: color }}
                  />
                ) : (
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    fill={color}
                    fillOpacity={0.1}
                  />
                )}
              </Chart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
