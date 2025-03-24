import { 
  RefreshCw, 
  Filter, 
  FileDown, 
  Plus,
  Percent,
  Search
} from "lucide-react"
import { Toolbar } from "@/components/ui/toolbar/toolbar"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface DiscountsToolbarProps {
  onRefresh?: () => void
  onFilter?: () => void
  onExport?: () => void
  onAddDiscount?: () => void
  onSearch?: (query: string) => void
}

export function DiscountsToolbar({ 
  onRefresh,
  onFilter,
  onExport,
  onAddDiscount,
  onSearch
}: DiscountsToolbarProps) {
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
        ...(onAddDiscount ? [{ 
          icon: Plus, 
          label: "Add Discount", 
          onClick: onAddDiscount 
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
        placeholder="Search discounts..."
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
