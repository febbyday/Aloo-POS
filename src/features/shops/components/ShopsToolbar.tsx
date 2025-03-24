import { 
  Building2, 
  Plus, 
  RefreshCw, 
  Trash, 
  Download, 
  Upload,
  Settings,
  FilterX,
  Filter,
  Search,
  Eye,
  Edit,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { Shop } from '../types/shops.types'

interface ToolbarButton {
  icon: typeof Building2
  label: string
  onClick: () => void
  disabled?: boolean
  title?: string
  loading?: boolean
}

interface ToolbarGroup {
  buttons: ToolbarButton[]
}

interface ShopsToolbarProps {
  onRefresh: () => void
  onNewShop: () => void
  onDelete: () => void
  onExport: () => void
  onImport: () => void
  onSettings: () => void
  onClearFilters: () => void
  onViewDetails: () => void
  onEditShop: () => void
  searchValue: string
  onSearchChange: (value: string) => void
  selectedCount: number
  filtersActive: boolean
  selectedShopId: string | null
  loading?: boolean
}

export function ShopsToolbar({
  onRefresh,
  onNewShop,
  onDelete,
  onExport,
  onImport,
  onSettings,
  onClearFilters,
  onViewDetails,
  onEditShop,
  searchValue,
  onSearchChange,
  selectedCount,
  filtersActive,
  selectedShopId,
  loading = false
}: ShopsToolbarProps) {
  const toolbarGroups: ToolbarGroup[] = [
    {
      buttons: [
        {
          icon: loading ? Loader2 : RefreshCw,
          label: loading ? 'Loading' : 'Refresh',
          onClick: onRefresh,
          disabled: loading,
          title: loading ? 'Loading data...' : 'Refresh shops data',
          loading
        }
      ]
    },
    {
      buttons: [
        {
          icon: Building2,
          label: 'New Shop',
          onClick: onNewShop,
          disabled: loading,
          title: 'Create a new shop'
        },
        {
          icon: Edit,
          label: 'Edit Shop',
          onClick: onEditShop,
          disabled: selectedCount !== 1,
          title: selectedCount === 1 ? 'Edit selected shop' : 'Select a shop to edit'
        },
        {
          icon: Trash,
          label: `Delete${selectedCount > 0 ? ` (${selectedCount})` : ''}`,
          onClick: onDelete,
          disabled: selectedCount === 0 || loading,
          title: selectedCount > 0 ? `Delete ${selectedCount} selected shops` : 'Select shops to delete'
        }
      ]
    },
    {
      buttons: [
        {
          icon: Eye,
          label: 'View Details',
          onClick: onViewDetails,
          disabled: selectedCount !== 1,
          title: selectedCount === 1 ? 'View shop details' : 'Select a shop to view details'
        }
      ]
    },
    {
      buttons: [
        {
          icon: Download,
          label: 'Export',
          onClick: onExport,
          title: 'Export shops data',
          disabled: false
        },
        {
          icon: Upload,
          label: 'Import',
          onClick: onImport,
          title: 'Import shops data'
        }
      ]
    },
    {
      buttons: [
        {
          icon: Settings,
          label: 'Settings',
          onClick: onSettings,
          title: 'Shop settings'
        },
        {
          icon: filtersActive ? FilterX : Filter,
          label: filtersActive ? 'Clear Filters' : 'Filters',
          onClick: filtersActive ? onClearFilters : () => {},
          disabled: !filtersActive,
          title: filtersActive ? 'Clear all filters' : 'Filter shops'
        }
      ]
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full px-4 py-2 flex items-center justify-between bg-zinc-900/95 backdrop-blur-sm overflow-hidden"
    >
      <div className="flex items-center gap-2">
        {toolbarGroups.map((group, groupIndex) => (
          <motion.div
            key={groupIndex}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: groupIndex * 0.05 }}
            className="flex items-center shrink-0"
          >
            {groupIndex > 0 && (
              <Separator orientation="vertical" className="h-8 bg-zinc-700/50 mx-2 shrink-0" />
            )}
            {group.buttons.map((button, buttonIndex) => {
              const Icon = button.icon
              return (
                <motion.div
                  key={buttonIndex}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    delay: (groupIndex * group.buttons.length + buttonIndex) * 0.03,
                    duration: 0.2,
                    ease: "easeOut"
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="shrink-0"
                >
                  <div 
                    role="button"
                    tabIndex={0}
                    onMouseDown={(e) => {
                      if (!button.disabled && button.onClick) {
                        button.onClick()
                      }
                    }}
                    className="relative"
                    title={button.title || button.label}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={button.disabled}
                      className={cn(
                        "h-8 text-zinc-100 hover:text-white bg-transparent pointer-events-none",
                        "hover:bg-white/5 active:bg-white/10 transition-all duration-200",
                        "relative overflow-hidden group font-medium",
                        button.disabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                        layoutId={`highlight-${groupIndex}-${buttonIndex}`}
                      />
                      <Icon className={cn(
                        "h-4 w-4 mr-2 transition-transform group-hover:scale-110",
                        button.loading && "animate-spin"
                      )} />
                      {button.label}
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        ))}
        
        <Separator orientation="vertical" className="h-8 bg-zinc-700/50 mx-2 shrink-0" />
        <div className="h-8 flex items-center ml-auto shrink-0 relative w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search shops..."
            className="pl-8 h-8 bg-white/5 border-zinc-700/50 text-zinc-100 placeholder:text-zinc-400 focus:ring-zinc-500"
          />
        </div>
      </div>
    </motion.div>
  )
} 