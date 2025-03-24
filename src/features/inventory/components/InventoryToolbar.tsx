import { Button } from "@/components/ui/button"
import { 
  ArrowLeftRight,
  FileSpreadsheet,
  FileText,
  History,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Users
} from "lucide-react"

interface InventoryToolbarProps {
  onRefresh?: () => void
  onNew?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onPrint?: () => void
  onExport?: () => void
  onSearch?: () => void
  selectedCount?: number
}

export function InventoryToolbar({
  onRefresh,
  onNew,
  onEdit,
  onDelete,
  onPrint,
  onExport,
  onSearch,
  selectedCount = 0
}: InventoryToolbarProps) {
  const hasSelection = selectedCount > 0

  return (
    <div className="flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2 p-4">
        {onRefresh && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}

        {onNew && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onNew}
            title="Create New"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}

        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            disabled={!hasSelection || selectedCount > 1}
            title="Edit"
          >
            <FileText className="h-4 w-4" />
          </Button>
        )}

        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            disabled={!hasSelection}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}

        {onPrint && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrint}
            disabled={!hasSelection}
            title="Print"
          >
            <Printer className="h-4 w-4" />
          </Button>
        )}

        {onExport && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onExport}
            title="Export"
          >
            <Save className="h-4 w-4" />
          </Button>
        )}

        {onSearch && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onSearch}
            title="Search"
          >
            <Search className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
