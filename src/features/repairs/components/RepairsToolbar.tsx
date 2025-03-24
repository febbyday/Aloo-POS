import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { LucideIcon } from "lucide-react"
import { 
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  ArrowLeftRight,
  History,
  Printer,
  Download,
  Settings,
  Plus,
  Trash2,
} from "lucide-react"

interface ToolbarButton {
  icon: LucideIcon
  label: string
  onClick?: () => void
  element?: React.ReactNode
}

interface ToolbarGroup {
  buttons: ToolbarButton[]
}

interface RepairsToolbarProps {
  searchTerm: string
  onSearch: (value: string) => void
  onRefresh: () => void
  onPrint: () => void
  onExport: () => void
  onNewRepair: () => void
  onViewRepair: () => void
  onEditRepair: () => void
  onDeleteRepair: () => void
  selectedRepairs: string[]
  onBulkAction?: (action: 'view' | 'edit' | 'status' | 'history') => void
}

export function RepairsToolbar({
  searchTerm,
  onSearch,
  onRefresh,
  onPrint,
  onExport,
  onNewRepair,
  onViewRepair,
  onEditRepair,
  onDeleteRepair,
  selectedRepairs,
  onBulkAction,
}: RepairsToolbarProps) {
  const toolbarGroups: ToolbarGroup[] = [
    {
      buttons: [
        {
          icon: RefreshCw,
          label: "Refresh",
          onClick: onRefresh
        },
        {
          icon: Plus,
          label: "New Repair",
          onClick: onNewRepair
        },
        {
          icon: Eye,
          label: "View",
          onClick: onViewRepair
        },
        {
          icon: Edit,
          label: "Edit",
          onClick: onEditRepair
        },
        {
          icon: Trash2,
          label: "Delete",
          onClick: onDeleteRepair
        }
      ]
    },
    {
      buttons: selectedRepairs.length > 0 ? [
        {
          icon: ArrowLeftRight,
          label: "Change Status",
          onClick: () => onBulkAction?.('status')
        },
        {
          icon: History,
          label: "History",
          onClick: () => onBulkAction?.('history')
        }
      ] : []
    },
    {
      buttons: [
        {
          icon: Printer,
          label: "Print",
          onClick: onPrint
        },
        {
          icon: Download,
          label: "Export",
          onClick: onExport
        }
      ]
    },
    {
      buttons: [
        {
          icon: Filter,
          label: "Filter",
          onClick: () => {}
        },
        {
          icon: Search,
          label: "Search",
          element: (
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                placeholder="Search repairs..."
                value={searchTerm}
                onChange={(e) => onSearch(e.target.value)}
                className="h-8"
              />
            </div>
          )
        }
      ]
    }
  ]

  const renderButton = (button: ToolbarButton) => {
    const Icon = button.icon
    if (button.element) {
      return button.element
    }
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 py-0"
        onClick={button.onClick}
      >
        <Icon className="h-4 w-4 mr-2" />
        {button.label}
      </Button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full px-4 py-2 flex items-center justify-between bg-zinc-900/95 backdrop-blur-sm overflow-hidden rounded-md border border-border"
    >
      <div className="flex items-center">
        {toolbarGroups.slice(0, 3).map((group, groupIndex) => (
          <div key={groupIndex} className="flex items-center">
            {group.buttons.map((button, buttonIndex) => (
              <div key={buttonIndex} className="flex items-center">
                {renderButton(button)}
              </div>
            ))}
            {groupIndex < 3 && group.buttons.length > 0 && groupIndex < 2 && (
              <Separator orientation="vertical" className="mx-2 h-4" />
            )}
          </div>
        ))}
      </div>
      
      <div className="flex items-center ml-auto">
        {toolbarGroups[3].buttons.length > 0 && (
          <div className="flex items-center">
            {toolbarGroups[3].buttons.map((button, buttonIndex) => (
              <div key={buttonIndex} className="flex items-center">
                {renderButton(button)}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
