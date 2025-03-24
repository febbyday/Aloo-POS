import { 
  RefreshCw, 
  Filter, 
  ArrowUpDown, 
  SlidersHorizontal,
  Plus,
  History,
  Eye
} from "lucide-react"
import { ProductsToolbar } from "../ProductsToolbar"
import { useToast } from "@/components/ui/use-toast"
import { useNavigate } from 'react-router-dom';

interface ProductsToolbarContainerProps {
  onAdd: () => void
  onColumnsChange: () => void
  onViewHistory: () => void
  onViewProduct: (id: string) => void
}

export function ProductsToolbarContainer({ 
  onAdd,
  onColumnsChange,
  onViewHistory,
  onViewProduct
}: ProductsToolbarContainerProps) {
  const { toast } = useToast()
  const navigate = useNavigate()

  const toolbarGroups = [
    {
      buttons: [
        {
          icon: RefreshCw,
          label: "Refresh",
          onClick: () => {
            toast({
              title: "Refreshing data...",
              description: "Your products list is being updated."
            })
          }
        }
      ]
    },
    {
      buttons: [
        {
          icon: Plus,
          label: "Add Product",
          onClick: onAdd
        },
        {
          icon: Filter,
          label: "Filter",
          onClick: () => {
            toast({
              title: "Filter options",
              description: "Filter products by various criteria."
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
              description: "Sort products by name, stock, or category."
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
          icon: History,
          label: "History",
          onClick: onViewHistory
        },
        {
          icon: Eye,
          label: "View Product",
          onClick: () => {
            navigate("/products/:id")
          }
        }
      ]
    }
  ]

  return (
    <ProductsToolbar 
      groups={toolbarGroups}
    />
  )
}
