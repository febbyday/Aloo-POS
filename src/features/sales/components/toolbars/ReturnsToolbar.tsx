import { 
  RefreshCw, 
  Filter, 
  FileDown, 
  Plus,
  RotateCcw,
  Search,
  History,
  CreditCard
} from "lucide-react"
import { Toolbar } from "@/components/ui/toolbar/toolbar"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface ReturnsToolbarProps {
  onRefresh?: () => void
  onFilter?: () => void
  onExport?: () => void
  onNewReturn?: () => void
  onViewHistory?: () => void
  onManageRefunds?: () => void
  onSearch?: (query: string) => void
}

export function ReturnsToolbar({ 
  onRefresh,
  onFilter,
  onExport,
  onNewReturn,
  onViewHistory,
  onManageRefunds,
  onSearch
}: ReturnsToolbarProps) {
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
        ...(onNewReturn ? [{ 
          icon: RotateCcw, 
          label: "Process Return", 
          onClick: onNewReturn 
        }] : []),
        ...(onViewHistory ? [{ 
          icon: History, 
          label: "Return History", 
          onClick: onViewHistory 
        }] : []),
        ...(onManageRefunds ? [{ 
          icon: CreditCard, 
          label: "Manage Refunds", 
          onClick: onManageRefunds 
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
        placeholder="Search returns..."
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
