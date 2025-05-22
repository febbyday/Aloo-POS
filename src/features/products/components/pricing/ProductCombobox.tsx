import * as React from "react"
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
import { useCallback, useState } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import type { Product } from "../../types"

interface ProductComboboxProps {
  value?: string
  onChange: (value: string) => void
}

export function ProductCombobox({ value, onChange }: ProductComboboxProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const searchProducts = useCallback(async (term: string) => {
    if (!term) {
      setProducts([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(term)}`)
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error("Error searching products:", error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    searchProducts(debouncedSearchTerm)
  }, [debouncedSearchTerm, searchProducts])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? products.find((product) => product.id === value)?.name || "Select a product"
            : "Select a product"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search products..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandEmpty>
            {loading ? "Searching..." : "No products found."}
          </CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {products.map((product) => (
              <CommandItem
                key={product.id}
                value={product.id}
                onSelect={(currentValue) => {
                  onChange(currentValue)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === product.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {product.name} - {product.sku}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default ProductCombobox;
