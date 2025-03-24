import { Button } from "@/components/ui/button"
import { 
  RefreshCw, 
  Plus, 
  FileDown,
  Edit,
  Trash,
  Eye
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { ReactNode } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface MarketsToolbarProps {
  selectedMarkets: string[]
  onRefresh: () => void
  onNewMarket: () => void
  onEditMarket: () => void
  onDeleteMarket: () => void
  onExport: () => void
  onViewDetails: () => void
  rightContent?: ReactNode
}

export function MarketsToolbar({
  selectedMarkets,
  onRefresh,
  onNewMarket,
  onEditMarket,
  onDeleteMarket,
  onExport,
  onViewDetails,
  rightContent
}: MarketsToolbarProps) {
  const isOneSelected = selectedMarkets.length === 1
  const isAnySelected = selectedMarkets.length > 0

  const toolbarGroups = [
    {
      buttons: [
        {
          icon: RefreshCw,
          label: "Refresh",
          onClick: onRefresh,
        },
      ],
    },
    {
      buttons: [
        {
          icon: Plus,
          label: "New Market",
          onClick: onNewMarket,
          variant: "default" as const,
        },
        {
          icon: Edit,
          label: "Edit",
          onClick: onEditMarket,
          disabled: !isOneSelected,
        },
        {
          icon: Eye,
          label: "View Details",
          onClick: onViewDetails,
          disabled: !isOneSelected,
        },
        {
          icon: Trash,
          label: "Delete",
          onClick: onDeleteMarket,
          disabled: !isAnySelected,
          variant: "destructive" as const,
        },
      ],
    },
    {
      buttons: [
        {
          icon: FileDown,
          label: "Export",
          onClick: onExport,
        },
      ],
    },
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
                  >
                    <Button
                      type="button"
                      variant={button.variant || "ghost"}
                      size="sm"
                      disabled={button.disabled}
                      className={cn(
                        "h-8 text-white bg-transparent pointer-events-none",
                        "hover:bg-white/5 active:bg-white/10 transition-all duration-200",
                        "relative overflow-hidden group font-medium",
                        button.disabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                        layoutId={`highlight-${groupIndex}-${buttonIndex}`}
                      />
                      <Icon className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                      {button.label}
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        {rightContent}
      </div>
    </motion.div>
  )
}
