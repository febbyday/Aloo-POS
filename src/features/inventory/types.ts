export interface Alert {
  id: string
  type: 'low_stock' | 'out_of_stock' | 'expiring' | 'expired'
  productId: string
  productName: string
  storeId: string
  storeName: string
  currentStock: number
  minStock: number
  maxStock: number
  createdAt: string
  status: 'active' | 'resolved' | 'ignored'
  resolvedAt?: string
  resolvedBy?: string
  notes?: string
}
