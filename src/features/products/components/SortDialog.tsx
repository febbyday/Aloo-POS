import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle, X, GripVertical } from "lucide-react"

interface SortCondition {
  column: string
  direction: "asc" | "desc"
}

interface SortDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  columns: { id: string; label: string }[]
  sortOrder?: SortCondition[]
  onSortOrderChange: (sortOrder: SortCondition[]) => void
}

export function SortDialog({
  open,
  onOpenChange,
  columns,
  sortOrder = [],
  onSortOrderChange,
}: SortDialogProps) {
  const addSort = () => {
    onSortOrderChange([
      ...sortOrder,
      { column: columns[0]?.id || "", direction: "asc" },
    ])
  }

  const removeSort = (index: number) => {
    const newSortOrder = [...sortOrder]
    newSortOrder.splice(index, 1)
    onSortOrderChange(newSortOrder)
  }

  const updateSort = (
    index: number,
    field: keyof SortCondition,
    value: string
  ) => {
    const newSortOrder = [...sortOrder]
    newSortOrder[index] = {
      ...newSortOrder[index],
      [field]: value,
    } as SortCondition
    onSortOrderChange(newSortOrder)
  }

  const clearSort = () => {
    onSortOrderChange([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Sort Products</DialogTitle>
          <DialogDescription>
            Choose how to sort your products
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {sortOrder.map((sort, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-secondary/20 rounded-lg"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div className="space-y-2">
                    <Label>Column</Label>
                    <Select
                      value={sort.column}
                      onValueChange={(value) =>
                        updateSort(index, "column", value)
                      }
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
                    <Label>Direction</Label>
                    <Select
                      value={sort.direction}
                      onValueChange={(value) =>
                        updateSort(index, "direction", value as "asc" | "desc")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSort(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearSort}>
              Clear All
            </Button>
            <Button onClick={addSort}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Sort
            </Button>
          </div>
          <Button variant="default" onClick={() => onOpenChange(false)}>
            Apply Sort
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
