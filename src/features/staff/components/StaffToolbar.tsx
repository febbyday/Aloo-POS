import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Search, Plus, UserPlus, FileText, UserCheck, UserX } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from '@/lib/utils';
import { ReactNode } from "react"

interface ToolbarButton {
  icon: any
  label: string
  onClick: () => void
  disabled?: boolean
}

interface ToolbarGroup {
  buttons: ToolbarButton[]
}

interface StaffToolbarProps {
  groups: ToolbarGroup[]
  rightContent?: React.ReactNode
  children?: React.ReactNode
  onSearch?: (query: string) => void
}

export function StaffToolbar({ groups, rightContent, children, onSearch }: StaffToolbarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full flex flex-wrap items-center justify-between bg-zinc-900/95 backdrop-blur-sm gap-2"
    >
      <div className="flex flex-wrap items-center gap-2">
        {groups.map((group, groupIndex) => (
          <motion.div
            key={groupIndex}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: groupIndex * 0.05 }}
            className="flex flex-wrap items-center"
          >
            {groupIndex > 0 && (
              <Separator orientation="vertical" className="h-8 bg-zinc-700/50 mx-2 hidden sm:block" />
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
                  className="flex-shrink-0"
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
                      <Icon className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                      <span className="hidden sm:inline">{button.label}</span>
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        ))}
      </div>
        
      {rightContent && (
        <div className="flex items-center mt-2 sm:mt-0 w-full sm:w-auto">
          {rightContent}
        </div>
      )}
      
      {children}
    </motion.div>
  )
}
