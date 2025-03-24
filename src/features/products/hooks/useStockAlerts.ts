import { useState, useCallback } from 'react'

interface StockAlert {
  id: string
  name: string
  sku: string
  currentStock: number
  minThreshold: number
  category: string
  status: 'critical' | 'warning'
  lastRestocked: string
}

interface FetchAlertsParams {
  page: number
  limit: number
  search?: string
  status?: 'critical' | 'warning'
  category?: string
}

// Mock data for development
const mockAlerts: StockAlert[] = [
  {
    id: '1',
    name: 'Product A',
    sku: 'SKU001',
    currentStock: 5,
    minThreshold: 10,
    category: 'Electronics',
    status: 'critical',
    lastRestocked: '2024-02-01'
  },
  {
    id: '2',
    name: 'Product B',
    sku: 'SKU002',
    currentStock: 12,
    minThreshold: 15,
    category: 'Accessories',
    status: 'warning',
    lastRestocked: '2024-02-10'
  },
  // Add more mock items as needed
]

export function useStockAlerts() {
  const [alerts, setAlerts] = useState<StockAlert[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [criticalCount, setcriticalCount] = useState(0)
  const [warningCount, setWarningCount] = useState(0)

  const fetchAlerts = useCallback(async (params: FetchAlertsParams) => {
    setLoading(true)
    setError(null)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    try {
      // Filter and paginate mock data
      let filteredAlerts = [...mockAlerts]

      if (params.search) {
        const search = params.search.toLowerCase()
        filteredAlerts = filteredAlerts.filter(alert => 
          alert.name.toLowerCase().includes(search) ||
          alert.sku.toLowerCase().includes(search)
        )
      }

      if (params.status && params.status !== 'all') {
        filteredAlerts = filteredAlerts.filter(alert => 
          alert.status === params.status
        )
      }

      if (params.category && params.category !== 'all') {
        filteredAlerts = filteredAlerts.filter(alert => 
          alert.category === params.category
        )
      }

      // Calculate counts
      const critical = filteredAlerts.filter(a => a.status === 'critical').length
      const warning = filteredAlerts.filter(a => a.status === 'warning').length

      // Paginate
      const start = (params.page - 1) * params.limit
      const paginatedAlerts = filteredAlerts.slice(start, start + params.limit)

      setAlerts(paginatedAlerts)
      setTotalCount(filteredAlerts.length)
      setcriticalCount(critical)
      setWarningCount(warning)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  const createRestockOrder = useCallback(async (alertIds: string[]) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { success: true }
  }, [])

  return {
    alerts,
    loading,
    error,
    totalCount,
    criticalCount,
    warningCount,
    fetchAlerts,
    createRestockOrder
  }
}
