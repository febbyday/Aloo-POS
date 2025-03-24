import React, { createContext, useContext, useState, useCallback } from 'react'
import { StockAlert, StockAlertService, StockAlertFilters } from '../services/stockAlerts'

interface StockAlertContextType {
  alerts: StockAlert[]
  loading: boolean
  total: number
  criticalCount: number
  warningCount: number
  filters: StockAlertFilters
  setFilters: (filters: StockAlertFilters) => void
  refreshAlerts: () => Promise<void>
  createRestockOrder: (alertIds: string[]) => Promise<void>
  updateThresholds: (alertId: string, updates: any) => Promise<void>
}

const StockAlertContext = createContext<StockAlertContextType | undefined>(undefined)

export function StockAlertProvider({ 
  children,
  service
}: { 
  children: React.ReactNode
  service: StockAlertService 
}) {
  const [alerts, setAlerts] = useState<StockAlert[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [criticalCount, setCriticalCount] = useState(0)
  const [warningCount, setWarningCount] = useState(0)
  const [filters, setFilters] = useState<StockAlertFilters>({})

  const refreshAlerts = useCallback(async () => {
    setLoading(true)
    try {
      const response = await service.getAlerts(1, 50, filters)
      setAlerts(response.alerts)
      setTotal(response.total)
      setCriticalCount(response.critical)
      setWarningCount(response.warning)
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
    } finally {
      setLoading(false)
    }
  }, [filters, service])

  const createRestockOrder = useCallback(async (alertIds: string[]) => {
    await service.createRestockOrder(alertIds)
    await refreshAlerts()
  }, [service, refreshAlerts])

  const updateThresholds = useCallback(async (alertId: string, updates: any) => {
    await service.updateThresholds(alertId, updates)
    await refreshAlerts()
  }, [service, refreshAlerts])

  return (
    <StockAlertContext.Provider value={{
      alerts,
      loading,
      total,
      criticalCount,
      warningCount,
      filters,
      setFilters,
      refreshAlerts,
      createRestockOrder,
      updateThresholds
    }}>
      {children}
    </StockAlertContext.Provider>
  )
}

export const useStockAlerts = () => {
  const context = useContext(StockAlertContext)
  if (context === undefined) {
    throw new Error('useStockAlerts must be used within a StockAlertProvider')
  }
  return context
}