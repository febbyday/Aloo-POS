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

// API endpoints - removing /api/v1 prefix as it's added by the API client
const PRODUCTS_API_ENDPOINT = '/products';
const CATEGORIES_API_ENDPOINT = '/categories';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch products from API
        const productsResponse = await fetch(PRODUCTS_API_ENDPOINT)
        if (!productsResponse.ok) {
          throw new Error(`Failed to fetch products: ${productsResponse.statusText}`)
        }
        const productsData = await productsResponse.json()
        setProducts(productsData.data || [])

        // Fetch categories from API
        const categoriesResponse = await fetch(CATEGORIES_API_ENDPOINT)
        if (!categoriesResponse.ok) {
          throw new Error(`Failed to fetch categories: ${categoriesResponse.statusText}`)
        }
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData.data || [])
      } catch (err) {
        console.error('Error fetching products data:', err)
        setError(err instanceof Error ? err : new Error("Failed to fetch products"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return {
    products,
    categories,
    isLoading,
    error,
  }
}