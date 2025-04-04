export interface Brand {
  id: string
  name: string
  description?: string
  logo?: string
  website?: string
  products: number
  createdAt: string
  updatedAt: string
  slug: string
  status: 'active' | 'inactive'
  metrics?: BrandMetrics
}

export interface BrandMetrics {
  totalProducts: number
  activeProducts: number
  totalSales: number
  totalRevenue: number
  salesTrend: {
    percentage: number
    trend: 'up' | 'down' | 'stable'
    periodChange: number
  }
  lastUpdated: string
}

export interface BrandFormData {
  name: string
  description?: string
  logo?: string
  website?: string
  slug?: string
  status: 'active' | 'inactive'
  seo?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string
  }
}

export interface BrandFilter {
  search?: string
  status?: 'all' | 'active' | 'inactive'
  hasProducts?: boolean
}

export interface BrandSort {
  field: 'name' | 'products' | 'createdAt' | 'updatedAt'
  direction: 'asc' | 'desc'
}

export type BrandBulkAction = 
  | { type: 'delete'; ids: string[] }
  | { type: 'status'; ids: string[]; value: 'active' | 'inactive' };
