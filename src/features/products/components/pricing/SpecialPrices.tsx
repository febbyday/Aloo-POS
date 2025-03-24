import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import type { Category, SpecialPrice } from "../../types"
import { SpecialPricesTable } from "./SpecialPricesTable"

export function SpecialPrices() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [specialPrices, setSpecialPrices] = useState<SpecialPrice[]>([])

  useEffect(() => {
    // Fetch categories when component mounts
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        setCategories(data)
      } catch (error) {
        console.error('Error fetching categories:', error)
        toast({
          title: "Error",
          description: "Failed to load categories. Please try again later.",
          variant: "destructive",
        })
      }
    }

    const fetchSpecialPrices = async () => {
      try {
        const response = await fetch('/api/special-prices')
        const data = await response.json()
        setSpecialPrices(data)
      } catch (error) {
        console.error('Error fetching special prices:', error)
        toast({
          title: "Error",
          description: "Failed to load special prices. Please try again later.",
          variant: "destructive",
        })
      }
    }

    fetchCategories()
    fetchSpecialPrices()
  }, [toast])

  const handleSpecialPricesAdded = (prices: SpecialPrice[]) => {
    setSpecialPrices(prev => [...prev, ...prices])
  }

  return (
    <div className="space-y-4">
      <SpecialPricesTable 
        categories={categories}
        data={specialPrices}
      />
    </div>
  )
}

export default SpecialPrices;
