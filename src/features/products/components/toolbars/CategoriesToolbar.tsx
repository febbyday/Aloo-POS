import { 
  RefreshCw, 
  Filter, 
  ArrowUpDown, 
  SlidersHorizontal,
  Plus,
  Upload,
  FileDown
} from "lucide-react"
import { ProductsToolbar } from "../ProductsToolbar"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

interface CategoriesToolbarProps {
  onAddCategory: () => void
  onExport: () => void
  onColumnsChange: () => void
}

export function CategoriesToolbar({ 
  onAddCategory,
  onExport, 
  onColumnsChange
}: CategoriesToolbarProps) {
  const { toast } = useToast()

  const toolbarGroups = [
    {
      buttons: [
        {
          icon: RefreshCw,
          label: "Refresh",
          onClick: () => {
            toast({
              title: "Refreshing data...",
              description: "Your categories list is being updated."
            })
          }
        }
      ]
    },
    {
      buttons: [
        {
          icon: Plus,
          label: "Add Category",
          onClick: onAddCategory
        },
        {
          icon: Filter,
          label: "Filter",
          onClick: () => {
            toast({
              title: "Filter options",
              description: "Filter categories by various criteria."
            })
          }
        }
      ]
    },
    {
      buttons: [
        {
          icon: ArrowUpDown,
          label: "Sort",
          onClick: () => {
            toast({
              title: "Sort options",
              description: "Sort categories by name or products count."
            })
          }
        },
        {
          icon: SlidersHorizontal,
          label: "Columns",
          onClick: onColumnsChange
        }
      ]
    },
    {
      buttons: [
        {
          icon: Upload,
          label: "Import",
          onClick: () => {
            toast({
              title: "Import data",
              description: "Import categories from file."
            })
          }
        },
        {
          icon: FileDown,
          label: "Export",
          onClick: onExport
        }
      ]
    }
  ]

  return (
    <ProductsToolbar 
      groups={toolbarGroups}
      rightContent={null}
    />
  )
}
