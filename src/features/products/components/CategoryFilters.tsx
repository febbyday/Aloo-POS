import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CategoryFilter } from '../types/category'
import { useCategories } from '../context/CategoryContext'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Search, Filter, X } from 'lucide-react'

export function CategoryFilters() {
  const { filters, setFilters } = useCategories()
  const [isOpen, setIsOpen] = useState(false)

  const handleFilterChange = (partialFilter: Partial<CategoryFilter>) => {
    setFilters({ ...filters, ...partialFilter })
  }

  const clearFilters = () => {
    setFilters({})
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
            className="pl-8"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Filter className="h-4 w-4" />
        </Button>
        {Object.keys(filters).length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearFilters}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange({ status: value as any })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.hasProducts?.toString()}
            onValueChange={(value) => 
              handleFilterChange({ hasProducts: value === 'true' })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Has products</SelectItem>
              <SelectItem value="false">No products</SelectItem>
            </SelectContent>
          </Select>

          <DateRangePicker
            value={filters.dateRange}
            onChange={(range) => handleFilterChange({ dateRange: range })}
          />
        </div>
      )}
    </div>
  )
}