import { Category } from '../types/category'
import { FolderOpen, ChevronRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCategories } from '../context/CategoryContext'

interface CategoryNameCellProps {
  category: Category
}

export function CategoryNameCell({ category }: CategoryNameCellProps) {
  const { getChildCategories } = useCategories()
  const children = getChildCategories(category.id)
  const hasChildren = children.length > 0
  const level = category.level || 0

  return (
    <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
      {hasChildren ? (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => {
            // Toggle expansion logic here
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      ) : (
        <div className="w-6" /> // Spacing for alignment
      )}
      <FolderOpen className="h-4 w-4 text-blue-400" />
      <span className="font-medium">{category.name}</span>
      {category.attributes?.length > 0 && (
        <Badge variant="outline" className="ml-2">
          {category.attributes.length} attributes
        </Badge>
      )}
    </div>
  )
}