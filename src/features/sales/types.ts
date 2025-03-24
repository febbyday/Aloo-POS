export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  discount?: {
    type: 'percentage' | 'amount'
    value: number
    reason?: string
  }
  notes?: string
  size?: string
  iceLevel?: number
}

export interface DraftSale {
  id: string
  name: string
  items: number
  total: number
  createdAt: string
}

export interface Transaction {
  id: string
  total: number
  time: string
  status: 'completed' | 'pending' | 'voided'
  items?: number
  customer?: string
  paymentMethod?: string
}