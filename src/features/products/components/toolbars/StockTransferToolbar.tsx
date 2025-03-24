import { 
  RefreshCw, 
  Filter, 
  ArrowUpDown, 
  SlidersHorizontal,
  Plus,
  Upload,
  FileDown,
  Printer,
  FileText,
  Edit
} from "lucide-react"
import { ProductsToolbar } from "../ProductsToolbar"
import { useToast } from "@/components/ui/use-toast"

interface StockTransferToolbarProps {
  onNewTransfer: () => void
  onExport: () => void
  onColumnsChange: () => void
  onEditTransfer?: () => void
  selectedTransfer?: any
}

export function StockTransferToolbar({ 
  onNewTransfer,
  onExport, 
  onColumnsChange,
  onEditTransfer,
  selectedTransfer
}: StockTransferToolbarProps) {
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
              description: "Your transfer list is being updated."
            })
          }
        }
      ]
    },
    {
      buttons: [
        {
          icon: Plus,
          label: "New Transfer",
          onClick: onNewTransfer
        },
        {
          icon: Edit,
          label: "Edit Transfer",
          onClick: onEditTransfer,
          disabled: !selectedTransfer || !onEditTransfer
        },
        {
          icon: Filter,
          label: "Filter",
          onClick: () => {
            toast({
              title: "Filter options",
              description: "Filter transfers by various criteria."
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
              description: "Sort transfers by date, status, or location."
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
          icon: Printer,
          label: "Print",
          onClick: () => {
            toast({
              title: "Preparing print...",
              description: "Your print job is being prepared."
            })
          }
        },
        {
          icon: FileText,
          label: "Save as PDF",
          onClick: onExport
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
              description: "Import transfers from file."
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
    />
  )
}
