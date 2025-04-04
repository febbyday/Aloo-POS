import { useState, useEffect } from "react"

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  sku: string
  categoryId: string
  price: number
  stock: number
  reorderPoint: number
  image?: string
  quantity?: number
}

// Mock data for development
const mockCategories: Category[] = [
  { id: "1", name: "Category A" },
  { id: "2", name: "Category B" },
  { id: "3", name: "Category C" },
]

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Product 1",
    sku: "SKU001",
    categoryId: "1",
    price: 9.99,
    stock: 15,
    reorderPoint: 10,
    image: "https://via.placeholder.com/50",
  },
  {
    id: "2",
    name: "Product 2",
    sku: "SKU002",
    categoryId: "2",
    price: 19.99,
    stock: 5,
    reorderPoint: 10,
    image: "https://via.placeholder.com/50",
  },
  {
    id: "3",
    name: "Product 3",
    sku: "SKU003",
    categoryId: "1",
    price: 29.99,
    stock: 0,
    reorderPoint: 10,
    image: "https://via.placeholder.com/50",
  },
]

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        // TODO: Replace with actual API call
        // For now, using mock data
        setProducts(mockProducts)
        setCategories(mockCategories)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch products"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return {
    products,
    categories,
    isLoading,
    error,
  }
} 