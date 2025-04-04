import { RefreshCw, Filter, FileDown, Plus, Search, Trash2, Eye } from "lucide-react"
import { Toolbar } from "@/components/ui/toolbar"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface EmploymentStatusToolbarProps {
  onRefresh?: () => void
  onFilter?: () => void
  onExport?: () => void
  onAddEmploymentStatus?: () => void
  onSearch?: (query: string) => void
  onViewDetails?: () => void
  onDelete?: () => void
  selectedCount?: number
  isRefreshing?: boolean
}

export const EmploymentStatusToolbar = ({
  onRefresh,
  onFilter,
  onExport,
  onAddEmploymentStatus,
  onSearch,
  onViewDetails,
  onDelete,
  selectedCount = 0,
  isRefreshing = false,
}: EmploymentStatusToolbarProps) => {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = () => {
    onSearch?.(searchQuery)
  }

  const groups = [
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
        ...(onAddEmploymentStatus ? [{
          icon: Plus,
          label: "Add Employment Status",
          onClick: onAddEmploymentStatus
        }] : []),
        ...(onViewDetails && selectedCount === 1 ? [{
          icon: Eye,
          label: "View Details",
          onClick: onViewDetails
        }] : []),
        ...(onDelete && selectedCount > 0 ? [{
          icon: Trash2,
          label: "Delete Selected",
          onClick: onDelete
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

  const rightContent = (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Search employment statuses..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch()
          }
        }}
      />
      <Button variant="outline" size="icon" onClick={handleSearch}>
        <Search className="h-4 w-4" />
      </Button>
    </div>
  )

  const refreshButton = (
    <Button
      variant="ghost"
      size="sm"
      onClick={onRefresh}
      disabled={isRefreshing}
      title="Refresh"
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
      Refresh
    </Button>
  )

  return (
    <Toolbar
      groups={groups}
      rightContent={rightContent}
    />
  )
} 