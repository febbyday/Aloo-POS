import { Card } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon, TrendingUp, Clock, Star, Package } from "lucide-react"

interface Metric {
  name: string
  value: string
  change: string
  trend: "up" | "down"
  icon: React.ElementType
}

const metrics: Metric[] = [
  {
    name: "Average Delivery Time",
    value: "2.4 days",
    change: "12%",
    trend: "down",
    icon: Clock,
  },
  {
    name: "Quality Rating",
    value: "4.8/5",
    change: "8%",
    trend: "up",
    icon: Star,
  },
  {
    name: "Order Volume",
    value: "842",
    change: "15%",
    trend: "up",
    icon: Package,
  },
  {
    name: "Performance Score",
    value: "92%",
    change: "5%",
    trend: "up",
    icon: TrendingUp,
  },
]

export function PerformanceMetrics() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.name}>
          <div className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-primary/10 p-2">
              <metric.icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {metric.name}
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold">{metric.value}</h3>
                <div
                  className={`flex items-center text-sm ${
                    metric.trend === "up"
                      ? "text-success"
                      : "text-destructive"
                  }`}
                >
                  {metric.trend === "up" ? (
                    <ArrowUpIcon className="h-4 w-4" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4" />
                  )}
                  {metric.change}
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
