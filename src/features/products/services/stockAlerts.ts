import { AxiosInstance } from 'axios'

export interface StockAlert {
  id: string
  name: string
  sku: string
  currentStock: number
  minThreshold: number
  category: string
  status: 'critical' | 'warning'
  lastRestocked: Date
  locationId?: string
  locationName?: string
  supplierId?: string
  supplierName?: string
  reorderPoint?: number
  maxStock?: number
  unitCost?: number
  lastOrderDate?: Date
  averageDailyUsage?: number
}

export interface StockAlertFilters {
  status?: 'critical' | 'warning'
  category?: string
  location?: string
  search?: string
  minStock?: number
  maxStock?: number
  dateRange?: [Date, Date]
}

export interface StockAlertsResponse {
  alerts: StockAlert[]
  total: number
  critical: number
  warning: number
}

export class StockAlertService {
  constructor(private api: AxiosInstance) {}

  async getAlerts(
    page: number,
    limit: number,
    filters?: StockAlertFilters
  ): Promise<StockAlertsResponse> {
    const response = await this.api.get('/stock-alerts', {
      params: {
        page,
        limit,
        ...filters
      }
    })
    return response.data
  }

  async updateThresholds(
    alertId: string,
    updates: { minThreshold?: number; reorderPoint?: number; maxStock?: number }
  ) {
    return this.api.patch(`/stock-alerts/${alertId}/thresholds`, updates)
  }

  async createRestockOrder(alertIds: string[]) {
    return this.api.post('/stock-alerts/restock-order', { alertIds })
  }

  async acknowledgeAlerts(alertIds: string[]) {
    return this.api.post('/stock-alerts/acknowledge', { alertIds })
  }
}