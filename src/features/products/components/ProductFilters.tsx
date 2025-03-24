import { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { InventoryFilter, StockLevel } from '@/types/inventory'

export interface ProductFiltersProps {
  filters: InventoryFilter
  onFilterChange: (filters: InventoryFilter) => void
  onFilterReset: () => void
}

const stockLevels: { label: string; value: StockLevel }[] = [
  { label: 'Out of Stock', value: 'out_of_stock' },
  { label: 'Low Stock', value: 'low' },
  { label: 'Medium Stock', value: 'medium' },
  { label: 'High Stock', value: 'high' },
]

export function ProductFilters({ filters, onFilterChange, onFilterReset }: ProductFiltersProps) {
  const [search, setSearch] = useState(filters.search || '')

  const handleSearchChange = (value: string) => {
    setSearch(value)
    onFilterChange({ ...filters, search: value })
  }

  const toggleStockLevel = (level: StockLevel) => {
    const currentLevels = filters.stockLevels || []
    const newLevels = currentLevels.includes(level)
      ? currentLevels.filter(l => l !== level)
      : [...currentLevels, level]
    onFilterChange({ ...filters, stockLevels: newLevels })
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Select
        value={filters.supplier || "all"}
        onValueChange={(value) => onFilterChange({ ...filters, supplier: value === "all" ? undefined : value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by supplier" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Suppliers</SelectItem>
          <SelectItem value="supplier1">Supplier 1</SelectItem>
          <SelectItem value="supplier2">Supplier 2</SelectItem>
          <SelectItem value="supplier3">Supplier 3</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.category || "all"}
        onValueChange={(value) => onFilterChange({ ...filters, category: value === "all" ? undefined : value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="electronics">Electronics</SelectItem>
          <SelectItem value="clothing">Clothing</SelectItem>
          <SelectItem value="food">Food</SelectItem>
        </SelectContent>
      </Select>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="ml-2">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Stock Levels</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {stockLevels.map((level) => (
              <DropdownMenuItem
                key={level.value}
                onClick={() => toggleStockLevel(level.value)}
              >
                <span className="flex-1">{level.label}</span>
                {filters.stockLevels?.includes(level.value) && (
                  <span className="text-primary">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
