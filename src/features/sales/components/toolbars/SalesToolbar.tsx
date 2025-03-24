import { 
  RefreshCw, 
  Filter, 
  FileDown, 
  Printer, 
  Search,
  Plus,
  Receipt
} from "lucide-react"
import { Toolbar } from "@/components/ui/toolbar/toolbar"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface SalesToolbarProps {
  onRefresh?: () => void
  onFilter?: () => void
  onExport?: () => void
  onPrint?: () => void
  onNewSale?: () => void
  onSearch?: (query: string) => void
}

export function SalesToolbar({ 
  onRefresh,
  onFilter,
  onExport,
  onPrint,
  onNewSale,
  onSearch
}: SalesToolbarProps) {
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
        ...(onNewSale ? [{ 
          icon: Plus, 
          label: "New Sale", 
          onClick: onNewSale 
        }] : []),
        ...(onPrint ? [{ 
          icon: Printer, 
          label: "Print", 
          onClick: onPrint 
        }] : []),
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
        placeholder="Search sales..."
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
