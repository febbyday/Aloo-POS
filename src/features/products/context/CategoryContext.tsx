import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react'
import { 
  Category, 
  CategoryFormData, 
  CategoryFilter, 
  CategorySort, 
  CategoryBulkAction 
} from '../types/category'

// Mock categories data
const mockCategories: Category[] = [
  {
    id: "1",
    name: "Wallets",
    description: "Card holders and billfolds",
    products: 25,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slug: "wallets",
    status: "active"
  },
  {
    id: "2",
    name: "Handbags",
    description: "Women's fashion bags",
    products: 40,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slug: "handbags",
    status: "active"
  },
  {
    id: "3",
    name: "Backpacks",
    description: "Casual and travel bags",
    products: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slug: "backpacks",
    status: "active"
  },
  {
    id: "4",
    name: "Clutches",
    description: "Evening and party bags",
    products: 20,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slug: "clutches",
    status: "active"
  },
  {
    id: "5",
    name: "Totes",
    description: "Shopping and beach bags",
    products: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slug: "totes",
    status: "active"
  },
  {
    id: "6",
    name: "Crossbody",
    description: "Shoulder strap bags",
    products: 35,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slug: "crossbody",
    status: "active"
  },
  {
    id: "7",
    name: "Travel",
    description: "Luggage and duffels",
    products: 18,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slug: "travel",
    status: "active"
  },
  {
    id: "8",
    name: "Mini Bags",
    description: "Small fashion bags",
    products: 22,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slug: "mini-bags",
    status: "active"
  }
]

interface CategoryContextType {
  categories: Category[]
  loading: boolean
  error: Error | null
  selectedCategories: string[]
  filters: CategoryFilter
  sort: CategorySort
  pagination: {
    page: number
    pageSize: number
    total: number
  }
  setSelectedCategories: (ids: string[]) => void
  setFilters: (filters: CategoryFilter) => void
  setSort: (sort: CategorySort) => void
  setPagination: (pagination: { page: number, pageSize: number }) => void
  addCategory: (data: CategoryFormData) => Promise<void>
  updateCategory: (id: string, data: CategoryFormData) => Promise<void>
  deleteCategories: (ids: string[]) => Promise<void>
  bulkAction: (action: CategoryBulkAction) => Promise<void>
  refreshCategories: () => Promise<void>
  getCategoryHierarchy: () => Category[]
  moveCategory: (id: string, newParentId: string | null) => Promise<void>
  getChildCategories: (parentId: string) => Category[]
  getCategoryPath: (id: string) => Category[]
}

export const CategoryContext = createContext<CategoryContextType | undefined>(undefined)

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(mockCategories)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [filters, setFilters] = useState<CategoryFilter>({})
  const [sort, setSort] = useState<CategorySort>({ field: 'name', direction: 'asc' })
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 })

  // Build category hierarchy
  const buildHierarchy = useCallback((cats: Category[]): Category[] => {
    const map = new Map<string, Category>()
    const roots: Category[] = []

    // First pass: map all categories by ID
    cats.forEach(cat => {
      map.set(cat.id, { ...cat, children: [] })
    })

    // Second pass: build hierarchy
    map.forEach(cat => {
      if (cat.parentId) {
        const parent = map.get(cat.parentId)
        if (parent) {
          parent.children = parent.children || []
          parent.children.push(cat)
        }
      } else {
        roots.push(cat)
      }
    })

    // Calculate levels and paths
    const assignLevelAndPath = (category: Category, level: number, parentPath: string[] = []) => {
      const path = [...parentPath, category.id]
      category.level = level
      category.path = path

      if (category.children) {
        category.children.forEach(child => assignLevelAndPath(child, level + 1, path))
      }
    }

    roots.forEach(root => assignLevelAndPath(root, 0))

    return roots
  }, [])

  // Get filtered and sorted categories
  const getFilteredCategories = useCallback(() => {
    let filtered = [...categories]

    // Apply filters
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(cat => 
        cat.name.toLowerCase().includes(search) ||
        cat.description?.toLowerCase().includes(search)
      )
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(cat => cat.status === filters.status)
    }

    if (filters.hasProducts !== undefined) {
      filtered = filtered.filter(cat => filters.hasProducts ? cat.products > 0 : cat.products === 0)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const field = sort.field
      const direction = sort.direction === 'asc' ? 1 : -1

      if (field.includes('.')) {
        const [obj, prop] = field.split('.')
        return ((a as any)[obj][prop] - (b as any)[obj][prop]) * direction
      }

      return ((a[field] > b[field] ? 1 : -1) * direction)
    })

    return filtered
  }, [categories, filters, sort])

  // Implement other methods...
  const addCategory = async (data: CategoryFormData) => {
    setLoading(true)
    try {
      // API call would go here
      const newCategory: Category = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        products: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        slug: data.name.toLowerCase().replace(/\s+/g, '-'),
        metrics: {
          totalProducts: 0,
          activeProducts: 0,
          lowStockProducts: 0,
          productsTrend: {
            percentage: 0,
            trend: 'stable',
            periodChange: 0
          },
          lastUpdated: new Date().toISOString(),
          usage: { views: 0, searches: 0 }
        }
      }
      setCategories(prev => [...prev, newCategory])
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  // Bulk actions implementation
  const bulkAction = async (action: CategoryBulkAction) => {
    setLoading(true)
    try {
      switch (action.type) {
        case 'delete':
          await deleteCategories(action.ids)
          break
        case 'status':
          setCategories(prev => prev.map(cat => 
            action.ids.includes(cat.id) 
              ? { ...cat, status: action.value, updatedAt: new Date().toISOString() }
              : cat
          ))
          break
        case 'move':
          setCategories(prev => prev.map(cat => 
            action.ids.includes(cat.id)
              ? { ...cat, parentId: action.value, updatedAt: new Date().toISOString() }
              : cat
          ))
          break
        case 'attribute':
          setCategories(prev => prev.map(cat => 
            action.ids.includes(cat.id)
              ? { 
                  ...cat, 
                  attributes: [...(cat.attributes || []), action.value],
                  updatedAt: new Date().toISOString()
                }
              : cat
          ))
          break
      }
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    categories,
    loading,
    error,
    selectedCategories,
    filters,
    sort,
    pagination,
    setSelectedCategories,
    setFilters,
    setSort,
    setPagination,
    addCategory,
    updateCategory: async () => {}, // Implement
    deleteCategories: async () => {}, // Implement
    bulkAction,
    refreshCategories: async () => {}, // Implement
    getCategoryHierarchy: () => buildHierarchy(categories),
    moveCategory: async () => {}, // Implement
    getChildCategories: (parentId: string) => categories.filter(cat => cat.parentId === parentId),
    getCategoryPath: (id: string) => {
      const category = categories.find(cat => cat.id === id)
      return category?.path?.map(id => categories.find(cat => cat.id === id)) ?? []
    }
  }

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  )
}

export const useCategories = () => {
  const context = useContext(CategoryContext)
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider')
  }
  return context
}
