import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"

interface Column {
  id: string
  label: string
}

interface ColumnVisibilityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  columns: Column[]
  visibleColumns?: string[]
  onVisibilityChange: (columns: string[]) => void
}

export function ColumnVisibilityDialog({
  open,
  onOpenChange,
  columns,
  visibleColumns = columns?.map(col => col.id) || [],
  onVisibilityChange,
}: ColumnVisibilityDialogProps) {
  const toggleColumn = (columnId: string) => {
    if (visibleColumns.includes(columnId)) {
      onVisibilityChange(visibleColumns.filter(id => id !== columnId))
    } else {
      onVisibilityChange([...visibleColumns, columnId])
    }
  }

  const selectAll = () => {
    onVisibilityChange(columns.map(col => col.id))
  }

  const deselectAll = () => {
    onVisibilityChange([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Column Visibility</DialogTitle>
        </DialogHeader>
        <div className="flex justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={selectAll}>
            Select All
          </Button>
          <Button variant="ghost" size="sm" onClick={deselectAll}>
            Deselect All
          </Button>
        </div>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {columns?.map((column, index) => (
              <motion.div
                key={column.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center space-x-2"
              >
                <Checkbox
                  id={column.id}
                  checked={visibleColumns.includes(column.id)}
                  onCheckedChange={() => toggleColumn(column.id)}
                />
                <label
                  htmlFor={column.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {column.label}
                </label>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
