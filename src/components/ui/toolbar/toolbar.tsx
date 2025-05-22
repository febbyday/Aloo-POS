import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from '@/lib/utils/cn';
import { ReactNode } from "react";

export interface ToolbarButton {
  icon: LucideIcon
  label: string
  onClick: () => void
  disabled?: boolean
  title?: string
}

export interface ToolbarGroup {
  buttons: ToolbarButton[]
}

export interface ToolbarProps {
  groups: ToolbarGroup[]
  rightContent?: React.ReactNode
  children?: React.ReactNode
  variant?: "default" | "transparent" | "subtle"
  size?: "default" | "sm" | "lg"
  animated?: boolean
}

export function Toolbar({ 
  groups, 
  rightContent, 
  children, 
  variant = "default", 
  size = "default", 
  animated = true 
}: ToolbarProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "transparent":
        return "bg-transparent backdrop-blur-none";
      case "subtle":
        return "bg-background/60 backdrop-blur-sm border-b";
      case "default":
      default:
        return "bg-zinc-900/95 backdrop-blur-sm";
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "px-2 py-1";
      case "lg":
        return "px-6 py-3";
      case "default":
      default:
        return "px-4 py-2";
    }
  }

  const getButtonSize = () => {
    switch (size) {
      case "sm":
        return "h-7";
      case "lg":
        return "h-10";
      case "default":
      default:
        return "h-8";
    }
  }

  const getIconSize = () => {
    switch (size) {
      case "sm":
        return "h-3.5 w-3.5";
      case "lg":
        return "h-5 w-5";
      case "default":
      default:
        return "h-4 w-4";
    }
  }

  const MotionContainer = animated ? motion.div : "div";
  const MotionGroup = animated ? motion.div : "div";
  const MotionButton = animated ? motion.div : "div";

  const animationProps = animated ? {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.2 }
  } : {};

  const groupAnimationProps = animated ? (groupIndex: number) => ({
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { delay: groupIndex * 0.05 }
  }) : () => ({});

  const buttonAnimationProps = animated ? (groupIndex: number, buttonIndex: number, groupLength: number) => ({
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { 
      delay: (groupIndex * groupLength + buttonIndex) * 0.03,
      duration: 0.2,
      ease: "easeOut"
    },
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 }
  }) : () => ({});

  return (
    <MotionContainer
      {...animationProps}
      className={cn(
        "w-full flex items-center justify-between overflow-hidden",
        getVariantStyles(),
        getSizeStyles()
      )}
    >
      <div className="flex items-center gap-2">
        {groups.map((group, groupIndex) => (
          <MotionGroup
            key={groupIndex}
            {...groupAnimationProps(groupIndex)}
            className="flex items-center shrink-0"
          >
            {groupIndex > 0 && (
              <Separator orientation="vertical" className={cn("bg-zinc-700/50 mx-2 shrink-0", getButtonSize())} />
            )}
            {group.buttons.map((button, buttonIndex) => {
              const Icon = button.icon
              return (
                <MotionButton
                  key={buttonIndex}
                  {...buttonAnimationProps(groupIndex, buttonIndex, group.buttons.length)}
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
                        getButtonSize(),
                        "text-zinc-100 hover:text-white bg-transparent pointer-events-none",
                        "hover:bg-white/5 active:bg-white/10 transition-all duration-200",
                        "relative overflow-hidden group font-medium",
                        button.disabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {animated && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                          layoutId={`highlight-${groupIndex}-${buttonIndex}`}
                        />
                      )}
                      <Icon className={cn(getIconSize(), "mr-2 transition-transform group-hover:scale-110")} />
                      {button.label}
                    </Button>
                  </div>
                </MotionButton>
              )
            })}
          </MotionGroup>
        ))}
        
        {rightContent && (
          <>
            <Separator orientation="vertical" className={cn("bg-zinc-700/50 mx-2 shrink-0", getButtonSize())} />
            <div className={cn("flex items-center ml-auto shrink-0", getButtonSize())}>
              {rightContent}
            </div>
          </>
        )}
      </div>
      
      {children && (
        <div className="flex items-center ml-auto">
          {children}
        </div>
      )}
    </MotionContainer>
  )
}
