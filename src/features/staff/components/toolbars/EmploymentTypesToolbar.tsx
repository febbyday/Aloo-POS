import { 
  RefreshCw, 
  Filter, 
  FileDown, 
  Plus,
  Search,
  Trash2,
  Eye
} from "lucide-react"
import { Toolbar } from "@/components/ui/toolbar/toolbar"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface EmploymentTypesToolbarProps {
  onRefresh?: () => void
  onFilter?: () => void
  onExport?: () => void
  onAddEmploymentType?: () => void
  onSearch?: (query: string) => void
  onViewDetails?: () => void
  onDelete?: () => void
  selectedCount?: number
}

export function EmploymentTypesToolbar({ 
  onRefresh,
  onFilter,
  onExport,
  onAddEmploymentType,
  onSearch,
  onViewDetails,
  onDelete,
  selectedCount = 0
}: EmploymentTypesToolbarProps) {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery)
    }
  }

  const toolbarGroups = [
    {
      buttons: [
        ...(onRefresh ? [{ 
          icon: RefreshCw, 
          label: "Refresh", 
          onClick: onRefresh 
        }] : []),
        ...(onFilter ? [{ 
          icon: Filter, 
          label: "Filter", 
          onClick: onFilter 
        }] : [])
      ]
    },
    {
      buttons: [
        ...(onAddEmploymentType ? [{ 
          icon: Plus, 
          label: "Add Employment Type", 
          onClick: onAddEmploymentType 
        }] : []),
        ...(onViewDetails ? [{ 
          icon: Eye, 
          label: "View Details", 
          onClick: onViewDetails,
          disabled: selectedCount !== 1,
          title: selectedCount === 1 ? 'View employment type details' : 'Select an employment type to view details'
        }] : []),
        ...(onDelete ? [{ 
          icon: Trash2, 
          label: `Delete${selectedCount > 0 ? ` (${selectedCount})` : ''}`, 
          onClick: onDelete,
          disabled: selectedCount === 0,
          title: selectedCount > 0 ? `Delete ${selectedCount} selected employment types` : 'Select employment types to delete'
        }] : [])
      ]
    },
    {
      buttons: [
        ...(onExport ? [{ 
          icon: FileDown, 
          label: "Export", 
          onClick: onExport 
        }] : [])
      ]
    }
  ]

  const rightContent = onSearch ? (
    <div className="flex items-center gap-2">
      <Input
        className="h-8 w-[180px] bg-background"
        placeholder="Search employment types..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      />
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8" 
        onClick={handleSearch}
      >
        <Search className="h-4 w-4" />
      </Button>
    </div>
  ) : undefined

  return (
    <Toolbar 
      groups={toolbarGroups}
      rightContent={rightContent}
    />
  )
} 