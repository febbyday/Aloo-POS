import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FolderPlus } from "lucide-react"
import type { Product, Category } from "../types"

interface AssignCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedProducts: Product[]
  categories: Category[]
  onAssign: (categoryId: string) => Promise<void>
}

export function AssignCategoryDialog({
  open,
  onOpenChange,
  selectedProducts,
  categories,
  onAssign
}: AssignCategoryDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [assigning, setAssigning] = useState(false)

  const handleAssign = async () => {
    if (!selectedCategory) return

    try {
      setAssigning(true)
      await onAssign(selectedCategory)
      onOpenChange(false)
      setSelectedCategory("")
    } catch (error) {
      console.error('Failed to assign category:', error)
    } finally {
      setAssigning(false)
    }
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setSelectedCategory("")
        }
        onOpenChange(isOpen)
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Category</DialogTitle>
          <DialogDescription>
            Select a category to assign to {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={assigning || !selectedCategory}
            className="gap-2"
          >
            <FolderPlus className={`h-4 w-4 ${assigning ? 'animate-spin' : ''}`} />
            {assigning ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
