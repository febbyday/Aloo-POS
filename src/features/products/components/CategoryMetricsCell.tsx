import { CategoryMetrics } from '../types/category'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface CategoryMetricsCellProps {
  metrics?: CategoryMetrics
}

export function CategoryMetricsCell({ metrics }: CategoryMetricsCellProps) {
  if (!metrics) return null

  const activeProductsPercentage = (metrics.activeProducts / metrics.totalProducts) * 100 || 0
  const lowStockPercentage = (metrics.lowStockProducts / metrics.totalProducts) * 100 || 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>Active Products</span>
        <span className="font-mono">{activeProductsPercentage.toFixed(0)}%</span>
      </div>
      <Tooltip>
        <TooltipTrigger>
          <Progress value={activeProductsPercentage} className="h-2" />
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <div>Total Products: {metrics.totalProducts}</div>
            <div>Active Products: {metrics.activeProducts}</div>
            <div>Low Stock: {metrics.lowStockProducts}</div>
          </div>
        </TooltipContent>
      </Tooltip>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div>Views: {metrics.usage.views}</div>
        <div>Searches: {metrics.usage.searches}</div>
      </div>
    </div>
  )
}