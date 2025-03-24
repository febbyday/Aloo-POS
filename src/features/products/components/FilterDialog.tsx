import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle, X } from "lucide-react"

interface FilterCondition {
  column: string
  operator: string
  value: string
}

interface FilterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  columns: { id: string; label: string }[]
  filters?: FilterCondition[]
  onFiltersChange: (filters: FilterCondition[]) => void
}

const operators = [
  { value: "eq", label: "Equals" },
  { value: "neq", label: "Not Equals" },
  { value: "contains", label: "Contains" },
  { value: "gt", label: "Greater Than" },
  { value: "lt", label: "Less Than" },
  { value: "gte", label: "Greater Than or Equal" },
  { value: "lte", label: "Less Than or Equal" },
]

export function FilterDialog({
  open,
  onOpenChange,
  columns,
  filters = [],
  onFiltersChange,
}: FilterDialogProps) {
  const addFilter = () => {
    onFiltersChange([
      ...filters,
      { column: columns[0]?.id || "", operator: "eq", value: "" },
    ])
  }

  const removeFilter = (index: number) => {
    const newFilters = [...filters]
    newFilters.splice(index, 1)
    onFiltersChange(newFilters)
  }

  const updateFilter = (index: number, field: keyof FilterCondition, value: string) => {
    const newFilters = [...filters]
    newFilters[index] = { ...newFilters[index], [field]: value }
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    onFiltersChange([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Filter Data</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {filters.map((filter, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-secondary/20 rounded-lg">
                <div className="grid grid-cols-3 gap-2 flex-1">
                  <div className="space-y-2">
                    <Label>Column</Label>
                    <Select
                      value={filter.column}
                      onValueChange={(value) => updateFilter(index, "column", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {columns.map((column) => (
                          <SelectItem key={column.id} value={column.id}>
                            {column.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Operator</Label>
                    <Select
                      value={filter.operator}
                      onValueChange={(value) => updateFilter(index, "operator", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {operators.map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Value</Label>
                    <Input
                      value={filter.value}
                      onChange={(e) => updateFilter(index, "value", e.target.value)}
                      placeholder="Filter value..."
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFilter(index)}
                  className="self-end"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearFilters}>
              Clear All
            </Button>
            <Button onClick={addFilter}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Filter
            </Button>
          </div>
          <Button variant="default" onClick={() => onOpenChange(false)}>
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
