import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface StockAlert {
  id: string
  productId: string
  threshold: number
  status: 'active' | 'resolved'
  createdAt: Date
}

// Mock data - replace with actual API call
const mockAlerts: StockAlert[] = [
  {
    id: '1',
    productId: '1',
    threshold: 10,
    status: 'active',
    createdAt: new Date(),
  },
  {
    id: '2',
    productId: '2',
    threshold: 5,
    status: 'active',
    createdAt: new Date(),
  }
]

export function StockAlerts() {
  // TODO: Replace with actual data
  const lowStockCount = mockAlerts.length
  const hasAlerts = lowStockCount > 0

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className={cn(
        "h-8 px-3 font-medium",
        hasAlerts 
          ? "text-red-400 hover:text-red-300 hover:bg-red-500/10" 
          : "text-green-400 hover:text-green-300 hover:bg-green-500/10"
      )}
    >
      <AlertCircle className={cn(
        "h-4 w-4 mr-2",
        hasAlerts ? "animate-pulse" : ""
      )} />
      {hasAlerts 
        ? `${lowStockCount} Low Stock Item${lowStockCount === 1 ? '' : 's'}`
        : "Stock Levels Normal"
      }
    </Button>
  )
}
