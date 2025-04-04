export interface Category {
  id: string
  name: string
  description?: string
  parentId?: string
  level?: number // For hierarchy depth
  path?: string[] // Array of parent IDs for easy traversal
  products: number
  createdAt: string
  updatedAt: string
  slug: string
  status: 'active' | 'inactive'
  attributes?: CategoryAttribute[]
  metrics?: CategoryMetrics
  children?: Category[] // For hierarchical structure
}

export interface CategoryMetrics {
  totalProducts: number
  activeProducts: number
  lowStockProducts: number
  productsTrend: {
    percentage: number
    trend: 'up' | 'down' | 'stable'
    periodChange: number
  }
  lastUpdated: string
  usage: {
    views: number
    searches: number
  }
}

export interface CategoryAttribute {
  id: string
  name: string
  type: 'text' | 'number' | 'select' | 'boolean'
  required: boolean
  options?: string[] // For select type
  inherited?: boolean // Whether this attribute is inherited from parent
  value?: string | number | boolean // Default value
}

export interface CategoryFormData {
  name: string
  description?: string
  parentId?: string
  slug?: string
  attributes?: Omit<CategoryAttribute, 'id'>[]
  status: 'active' | 'inactive'
  inheritParentAttributes?: boolean
  seo?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string
  }
}

export interface CategoryFilter {
  search?: string
  status?: 'active' | 'inactive' | 'all'
  parentId?: string
  hasProducts?: boolean
  attributes?: Record<string, any>
  dateRange?: {
    start: Date
    end: Date
  }
}

export interface CategorySort {
  field: keyof Category | 'metrics.totalProducts'
  direction: 'asc' | 'desc'
}

export interface CategoryBulkAction {
  type: 'delete' | 'status' | 'move' | 'attribute'
  value: any
  ids: string[]
}
