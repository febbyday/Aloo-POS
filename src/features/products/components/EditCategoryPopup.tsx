import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface EditCategoryPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: {
    id: string
    name: string
    products: number
    description: string
    parent: string
  }
  onCategoryUpdated: (updatedCategory: {
    id: string
    name: string
    products: number
    description: string
    parent: string
  }) => void
}

export function EditCategoryPopup({ 
  open, 
  onOpenChange,
  category,
  onCategoryUpdated
}: EditCategoryPopupProps) {
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [parentCategory, setParentCategory] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (category) {
      setName(category.name)
      setDescription(category.description)
      setParentCategory(category.parent)
    }
  }, [category])

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const updatedCategory = {
        id: category.id,
        name: name.trim(),
        products: category.products,
        description: description.trim(),
        parent: parentCategory
      }
      
      onCategoryUpdated(updatedCategory)
      onOpenChange(false)
      
      toast({
        title: "Category updated",
        description: `${updatedCategory.name} has been updated successfully.`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Update the product category details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Category description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent">Parent Category</Label>
            <Select 
              value={parentCategory} 
              onValueChange={setParentCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uncategorized">Uncategorized</SelectItem>
                <SelectItem value="apparel">Apparel</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="home-living">Home & Living</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? "Updating..." : "Update Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}