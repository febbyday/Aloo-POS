import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"
import { cn } from '@/lib/utils/cn';
import { motion } from "framer-motion"

export interface IconToolbarButton {
  icon: LucideIcon
  onClick: () => void
  disabled?: boolean
  title?: string
}

export interface IconToolbarProps {
  buttons: IconToolbarButton[]
  className?: string
  variant?: "default" | "transparent" | "subtle"
  size?: "default" | "sm" | "lg"
  animated?: boolean
}

export function IconToolbar({ 
  buttons, 
  className,
  variant = "default",
  size = "default",
  animated = true
}: IconToolbarProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "transparent":
        return "bg-transparent";
      case "subtle":
        return "bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b";
      case "default":
      default:
        return "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b";
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "p-1 gap-1";
      case "lg":
        return "p-6 gap-4";
      case "default":
      default:
        return "p-4 gap-2";
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

  const Container = animated ? motion.div : "div";
  const ButtonContainer = animated ? motion.div : "div";

  const containerProps = animated ? {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.2 }
  } : {};

  const buttonProps = (index: number) => animated ? {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { delay: index * 0.05, duration: 0.2 },
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 }
  } : {};

  return (
    <Container
      {...containerProps}
      className={cn(
        "flex items-center justify-between",
        getVariantStyles(),
        getSizeStyles(),
        className
      )}
    >
      <div className="flex items-center">
        {buttons.map((button, index) => {
          const Icon = button.icon;
          return (
            <ButtonContainer
              key={index}
              {...buttonProps(index)}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={button.onClick}
                disabled={button.disabled}
                title={button.title}
                className="relative overflow-hidden group"
              >
                {animated && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    layoutId={`icon-highlight-${index}`}
                  />
                )}
                <Icon className={cn(getIconSize(), "transition-transform group-hover:scale-110")} />
              </Button>
            </ButtonContainer>
          );
        })}
      </div>
    </Container>
  );
}
