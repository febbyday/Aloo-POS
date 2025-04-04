import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { 
  Brand, 
  BrandFormData, 
  BrandFilter, 
  BrandSort, 
  BrandBulkAction 
} from '../types/brand'

// Mock brands data
const mockBrands: Brand[] = [
  {
    id: "1",
    name: "Nike",
    description: "Athletic footwear and apparel",
    logo: "https://via.placeholder.com/150?text=Nike",
    website: "https://www.nike.com",
    products: 45,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slug: "nike",
    status: "active",
    metrics: {
      totalProducts: 45,
      activeProducts: 40,
      totalSales: 1250,
      totalRevenue: 75000,
      salesTrend: {
        percentage: 12,
        trend: 'up',
        periodChange: 12
      },
      lastUpdated: new Date().toISOString()
    }
  },
  {
    id: "2",
    name: "Adidas",
    description: "Sportswear and athletic equipment",
    logo: "https://via.placeholder.com/150?text=Adidas",
    website: "https://www.adidas.com",
    products: 38,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slug: "adidas",
    status: "active",
    metrics: {
      totalProducts: 38,
      activeProducts: 35,
      totalSales: 980,
      totalRevenue: 58000,
      salesTrend: {
        percentage: 8,
        trend: 'up',
        periodChange: 8
      },
      lastUpdated: new Date().toISOString()
    }
  },
  {
    id: "3",
    name: "Puma",
    description: "Athletic and casual footwear",
    logo: "https://via.placeholder.com/150?text=Puma",
    website: "https://www.puma.com",
    products: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slug: "puma",
    status: "active",
    metrics: {
      totalProducts: 30,
      activeProducts: 28,
      totalSales: 750,
      totalRevenue: 45000,
      salesTrend: {
        percentage: 5,
        trend: 'up',
        periodChange: 5
      },
      lastUpdated: new Date().toISOString()
    }
  },
  {
    id: "4",
    name: "Reebok",
    description: "Fitness and training footwear",
    logo: "https://via.placeholder.com/150?text=Reebok",
    website: "https://www.reebok.com",
    products: 25,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slug: "reebok",
    status: "active",
    metrics: {
      totalProducts: 25,
      activeProducts: 22,
      totalSales: 620,
      totalRevenue: 37000,
      salesTrend: {
        percentage: 3,
        trend: 'up',
        periodChange: 3
      },
      lastUpdated: new Date().toISOString()
    }
  },
  {
    id: "5",
    name: "New Balance",
    description: "Athletic footwear and apparel",
    logo: "https://via.placeholder.com/150?text=New+Balance",
    website: "https://www.newbalance.com",
    products: 20,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slug: "new-balance",
    status: "active",
    metrics: {
      totalProducts: 20,
      activeProducts: 18,
      totalSales: 480,
      totalRevenue: 28000,
      salesTrend: {
        percentage: 2,
        trend: 'up',
        periodChange: 2
      },
      lastUpdated: new Date().toISOString()
    }
  },
  {
    id: "6",
    name: "Converse",
    description: "Casual footwear and apparel",
    logo: "https://via.placeholder.com/150?text=Converse",
    website: "https://www.converse.com",
    products: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slug: "converse",
    status: "active",
    metrics: {
      totalProducts: 15,
      activeProducts: 12,
      totalSales: 350,
      totalRevenue: 21000,
      salesTrend: {
        percentage: 1,
        trend: 'stable',
        periodChange: 1
      },
      lastUpdated: new Date().toISOString()
    }
  },
  {
    id: "7",
    name: "Vans",
    description: "Skateboarding shoes and apparel",
    logo: "https://via.placeholder.com/150?text=Vans",
    website: "https://www.vans.com",
    products: 18,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slug: "vans",
    status: "active",
    metrics: {
      totalProducts: 18,
      activeProducts: 16,
      totalSales: 420,
      totalRevenue: 25000,
      salesTrend: {
        percentage: 4,
        trend: 'up',
        periodChange: 4
      },
      lastUpdated: new Date().toISOString()
    }
  },
  {
    id: "8",
    name: "Under Armour",
    description: "Performance apparel and footwear",
    logo: "https://via.placeholder.com/150?text=Under+Armour",
    website: "https://www.underarmour.com",
    products: 22,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slug: "under-armour",
    status: "inactive",
    metrics: {
      totalProducts: 22,
      activeProducts: 0,
      totalSales: 0,
      totalRevenue: 0,
      salesTrend: {
        percentage: 0,
        trend: 'stable',
        periodChange: 0
      },
      lastUpdated: new Date().toISOString()
    }
  }
]

interface BrandContextType {
  brands: Brand[]
  loading: boolean
  error: Error | null
  selectedBrands: string[]
  filters: BrandFilter
  sort: BrandSort
  pagination: {
    page: number
    pageSize: number
    total: number
  }
  setSelectedBrands: (ids: string[]) => void
  setFilters: (filters: BrandFilter) => void
  setSort: (sort: BrandSort) => void
  setPagination: (pagination: { page: number, pageSize: number }) => void
  addBrand: (data: BrandFormData) => Promise<void>
  updateBrand: (id: string, data: BrandFormData) => Promise<void>
  deleteBrands: (ids: string[]) => Promise<void>
  bulkAction: (action: BrandBulkAction) => Promise<void>
  refreshBrands: () => Promise<void>
}

export const BrandContext = createContext<BrandContextType | undefined>(undefined)

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brands, setBrands] = useState<Brand[]>(mockBrands)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [filters, setFilters] = useState<BrandFilter>({})
  const [sort, setSort] = useState<BrandSort>({ field: 'name', direction: 'asc' })
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 })

  // Get filtered and sorted brands
  const getFilteredBrands = useCallback(() => {
    let filtered = [...brands]

    // Apply filters
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(brand => 
        brand.name.toLowerCase().includes(search) ||
        brand.description?.toLowerCase().includes(search)
      )
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(brand => brand.status === filters.status)
    }

    if (filters.hasProducts !== undefined) {
      filtered = filtered.filter(brand => filters.hasProducts ? brand.products > 0 : brand.products === 0)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let valueA, valueB

      switch (sort.field) {
        case 'name':
          valueA = a.name
          valueB = b.name
          break
        case 'products':
          valueA = a.products
          valueB = b.products
          break
        case 'createdAt':
          valueA = new Date(a.createdAt).getTime()
          valueB = new Date(b.createdAt).getTime()
          break
        case 'updatedAt':
          valueA = new Date(a.updatedAt).getTime()
          valueB = new Date(b.updatedAt).getTime()
          break
        default:
          valueA = a.name
          valueB = b.name
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sort.direction === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA)
      } else {
        return sort.direction === 'asc' 
          ? (valueA as number) - (valueB as number) 
          : (valueB as number) - (valueA as number)
      }
    })

    return filtered
  }, [brands, filters, sort])

  // Add a new brand
  const addBrand = async (data: BrandFormData) => {
    setLoading(true)
    try {
      // API call would go here
      const newBrand: Brand = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        products: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        metrics: {
          totalProducts: 0,
          activeProducts: 0,
          totalSales: 0,
          totalRevenue: 0,
          salesTrend: {
            percentage: 0,
            trend: 'stable',
            periodChange: 0
          },
          lastUpdated: new Date().toISOString()
        }
      }
      setBrands(prev => [...prev, newBrand])
      return Promise.resolve()
    } catch (err) {
      setError(err as Error)
      return Promise.reject(err)
    } finally {
      setLoading(false)
    }
  }

  // Update an existing brand
  const updateBrand = async (id: string, data: BrandFormData) => {
    setLoading(true)
    try {
      // API call would go here
      setBrands(prev => prev.map(brand => 
        brand.id === id 
          ? { 
              ...brand, 
              ...data, 
              updatedAt: new Date().toISOString(),
              slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            } 
          : brand
      ))
      return Promise.resolve()
    } catch (err) {
      setError(err as Error)
      return Promise.reject(err)
    } finally {
      setLoading(false)
    }
  }

  // Delete brands
  const deleteBrands = async (ids: string[]) => {
    setLoading(true)
    try {
      // API call would go here
      setBrands(prev => prev.filter(brand => !ids.includes(brand.id)))
      setSelectedBrands([])
      return Promise.resolve()
    } catch (err) {
      setError(err as Error)
      return Promise.reject(err)
    } finally {
      setLoading(false)
    }
  }

  // Bulk actions
  const bulkAction = async (action: BrandBulkAction) => {
    setLoading(true)
    try {
      switch (action.type) {
        case 'delete':
          await deleteBrands(action.ids)
          break
        case 'status':
          setBrands(prev => prev.map(brand => 
            action.ids.includes(brand.id) 
              ? { ...brand, status: action.value, updatedAt: new Date().toISOString() }
              : brand
          ))
          break
      }
      return Promise.resolve()
    } catch (err) {
      setError(err as Error)
      return Promise.reject(err)
    } finally {
      setLoading(false)
    }
  }

  // Refresh brands
  const refreshBrands = async () => {
    setLoading(true)
    try {
      // API call would go here
      // For now, we'll just use the mock data
      setBrands(mockBrands)
      return Promise.resolve()
    } catch (err) {
      setError(err as Error)
      return Promise.reject(err)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    brands,
    loading,
    error,
    selectedBrands,
    filters,
    sort,
    pagination,
    setSelectedBrands,
    setFilters,
    setSort,
    setPagination,
    addBrand,
    updateBrand,
    deleteBrands,
    bulkAction,
    refreshBrands
  }

  return (
    <BrandContext.Provider value={value}>
      {children}
    </BrandContext.Provider>
  )
}

export function useBrands() {
  const context = useContext(BrandContext)
  if (context === undefined) {
    throw new Error('useBrands must be used within a BrandProvider')
  }
  return context
}
