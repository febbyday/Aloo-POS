import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react'
import {
  Category,
  CategoryFormData,
  CategoryFilter,
  CategorySort,
  CategoryBulkAction
} from '../types/category'
import { categoryService } from '../services/categoryService'
import { useToast } from '@/lib/toast'
import { useToastManager } from '@/components/ui/toast-manager'

// Fallback mock categories data in case API fails
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
  addCategory: (data: CategoryFormData) => Promise<Category>
  updateCategory: (id: string, data: CategoryFormData) => Promise<Category>
  deleteCategory: (id: string) => Promise<void>
  deleteCategories: (ids: string[]) => Promise<void>
  bulkAction: (action: CategoryBulkAction) => Promise<void>
  refreshCategories: () => Promise<void>
  getCategory: (id: string) => Promise<Category | null>
  getCategoryHierarchy: () => Category[]
  moveCategory: (id: string, newParentId: string | null) => Promise<void>
  getChildCategories: (parentId: string) => Category[]
  getCategoryPath: (id: string) => Category[]
}

export const CategoryContext = createContext<CategoryContextType | undefined>(undefined)

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [filters, setFilters] = useState<CategoryFilter>({})
  const [sort, setSort] = useState<CategorySort>({ field: 'name', direction: 'asc' })
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 })
  const showToast = useToastManager();

  // Fetch categories on mount
  useEffect(() => {
    refreshCategories();
  }, []);

  // Refresh categories from API
  const refreshCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.fetchAll();
      setCategories(data);
      setPagination(prev => ({ ...prev, total: data.length }));
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err as Error);
      // Fallback to mock data if API fails
      setCategories(mockCategories);
      setPagination(prev => ({ ...prev, total: mockCategories.length }));
    } finally {
      setLoading(false);
    }
  };

  // Get a single category by ID
  const getCategory = async (id: string): Promise<Category | null> => {
    try {
      const category = await categoryService.fetchById(id);
      return category;
    } catch (err) {
      console.error(`Error fetching category ${id}:`, err);
      setError(err as Error);
      // Try to find in local state as fallback
      return categories.find(cat => cat.id === id) || null;
    }
  };

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

    if (filters.parentId) {
      filtered = filtered.filter(cat => cat.parentId === filters.parentId)
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

  // Add a new category
  const addCategory = async (data: CategoryFormData) => {
    setLoading(true)
    try {
      // Generate slug if not provided
      if (!data.slug) {
        data.slug = data.name.toLowerCase().replace(/\s+/g, '-');
      }

      // Call API to create category
      const newCategory = await categoryService.create(data);

      // Update local state
      setCategories(prev => [...prev, newCategory]);
      showToast.success('Success', 'Category created successfully');
      return newCategory;
    } catch (err) {
      console.error('Error creating category:', err);
      setError(err as Error);
      showToast.error('Error', 'Failed to create category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing category
  const updateCategory = async (id: string, data: CategoryFormData) => {
    setLoading(true);
    try {
      // Call API to update category
      const updatedCategory = await categoryService.update(id, data);

      // Update local state
      setCategories(prev =>
        prev.map(cat => cat.id === id ? updatedCategory : cat)
      );

      showToast.success('Success', 'Category updated successfully');
      return updatedCategory;
    } catch (err) {
      console.error(`Error updating category ${id}:`, err);
      setError(err as Error);
      showToast.error('Error', 'Failed to update category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a single category
  const deleteCategory = async (id: string) => {
    setLoading(true);
    try {
      // Call API to delete category
      await categoryService.delete(id);

      // Update local state
      setCategories(prev => prev.filter(cat => cat.id !== id));
      showToast.success('Success', 'Category deleted successfully');
    } catch (err) {
      console.error(`Error deleting category ${id}:`, err);
      setError(err as Error);
      showToast.error('Error', 'Failed to delete category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete multiple categories
  const deleteCategories = async (ids: string[]) => {
    setLoading(true);
    try {
      // Delete each category one by one
      await Promise.all(ids.map(id => categoryService.delete(id)));

      // Update local state
      setCategories(prev => prev.filter(cat => !ids.includes(cat.id)));
      showToast.success('Success', `${ids.length} categories deleted successfully`);
    } catch (err) {
      console.error('Error deleting categories:', err);
      setError(err as Error);
      showToast.error('Error', 'Failed to delete categories');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Move a category to a new parent
  const moveCategory = async (id: string, newParentId: string | null) => {
    setLoading(true);
    try {
      const category = categories.find(cat => cat.id === id);
      if (!category) {
        throw new Error(`Category with ID ${id} not found`);
      }

      // Update category with new parent
      const updatedData: CategoryFormData = {
        name: category.name,
        description: category.description,
        parentId: newParentId,
        status: category.status
      };

      await updateCategory(id, updatedData);
      showToast.success('Success', 'Category moved successfully');
    } catch (err) {
      console.error(`Error moving category ${id}:`, err);
      setError(err as Error);
      showToast.error('Error', 'Failed to move category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Bulk actions implementation
  const bulkAction = async (action: CategoryBulkAction) => {
    setLoading(true);
    try {
      switch (action.type) {
        case 'delete':
          await deleteCategories(action.ids);
          break;
        case 'status':
          // Update status for each category
          await Promise.all(action.ids.map(id => {
            const category = categories.find(cat => cat.id === id);
            if (category) {
              return updateCategory(id, {
                ...category,
                status: action.value
              });
            }
            return Promise.resolve();
          }));
          break;
        case 'move':
          // Move each category to new parent
          await Promise.all(action.ids.map(id => moveCategory(id, action.value)));
          break;
        case 'attribute':
          // Add attribute to each category
          await Promise.all(action.ids.map(id => {
            const category = categories.find(cat => cat.id === id);
            if (category) {
              return updateCategory(id, {
                ...category,
                attributes: [...(category.attributes || []), action.value]
              });
            }
            return Promise.resolve();
          }));
          break;
      }
      showToast.success('Success', 'Bulk action completed successfully');
    } catch (err) {
      console.error('Error performing bulk action:', err);
      setError(err as Error);
      showToast.error('Error', 'Failed to complete bulk action');
    } finally {
      setLoading(false);
    }
  };

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
    updateCategory,
    deleteCategory,
    deleteCategories,
    bulkAction,
    refreshCategories,
    getCategory,
    getCategoryHierarchy: () => buildHierarchy(categories),
    moveCategory,
    getChildCategories: (parentId: string) => categories.filter(cat => cat.parentId === parentId),
    getCategoryPath: (id: string) => {
      const category = categories.find(cat => cat.id === id);
      return category?.path?.map(id => categories.find(cat => cat.id === id)) ?? [];
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
