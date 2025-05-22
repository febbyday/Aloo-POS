import { useState, useCallback } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import debounce from "lodash/debounce"
import type { Product, Category } from "../../types"

interface ProductSearchProps {
  onProductSelect: (product: Product) => void
  categories: Category[]
}

export function ProductSearch({ onProductSelect, categories }: ProductSearchProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  const searchProducts = async (term: string, category: string) => {
    setLoading(true)
    try {
      // Replace this with your actual API call
      const response = await fetch(`/api/products/search?q=${term}&category=${category}`)
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error("Error searching products:", error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // Debounce the search function to prevent too many API calls
  const debouncedSearch = useCallback(
    debounce((term: string, category: string) => {
      searchProducts(term, category)
    }, 300),
    []
  )

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    debouncedSearch(value, selectedCategory)
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    debouncedSearch(searchTerm, value)
  }

  return (
    <div className="flex gap-4">
      <Select value={selectedCategory} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[400px] justify-between"
          >
            {searchTerm || "Search products..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput
              placeholder="Search products..."
              value={searchTerm}
              onValueChange={handleSearch}
            />
            <CommandEmpty>
              {loading ? "Searching..." : "No products found."}
            </CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto">
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.id}
                  onSelect={() => {
                    onProductSelect(product)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      searchTerm === product.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {product.name} - {product.sku}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default ProductSearch;
