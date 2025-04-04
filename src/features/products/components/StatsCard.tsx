import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts"

interface StatsCardProps {
  title: string
  value: number
  icon: LucideIcon
  iconColor: string
  iconBgColor: string
  trend?: {
    data: Array<{ value: number }>
    isPositive: boolean
    percentage: number
  }
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor, 
  iconBgColor,
  trend 
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <motion.p 
                className="text-2xl font-bold"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                {value}
              </motion.p>
              {trend && (
                <div className="flex items-center space-x-2">
                  <span 
                    className={trend.isPositive ? "text-green-500" : "text-red-500"}
                  >
                    {trend.isPositive ? "↑" : "↓"} {trend.percentage}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    vs last month
                  </span>
                </div>
              )}
            </div>
            <motion.div 
              className={`p-3 rounded-full ${iconBgColor}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </motion.div>
          </div>

          {trend && (
            <div className="h-[70px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend.data}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop 
                        offset="5%" 
                        stopColor={trend.isPositive ? "#22c55e" : "#ef4444"} 
                        stopOpacity={0.1}
                      />
                      <stop 
                        offset="95%" 
                        stopColor={trend.isPositive ? "#22c55e" : "#ef4444"} 
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ 
                      background: "rgba(0,0,0,0.8)", 
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "12px"
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={trend.isPositive ? "#22c55e" : "#ef4444"}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
