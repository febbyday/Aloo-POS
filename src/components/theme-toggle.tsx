import { Moon, Sun, Laptop } from "lucide-react"
import { forwardRef } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ThemeToggleProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | null | undefined
  size?: "default" | "sm" | "lg" | "icon" | null | undefined
  showTooltip?: boolean
}

// Create a separate button component with forwardRef to use in the theme toggle
const ThemeButton = forwardRef<HTMLButtonElement, {
  variant?: ThemeToggleProps['variant'],
  size?: ThemeToggleProps['size'],
  className?: string,
  onClick?: () => void
}>(({ variant = "ghost", size = "icon", className = "", onClick }, ref) => {
  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={`relative ${className}`}
      onClick={onClick}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
})

ThemeButton.displayName = "ThemeButton"

// No longer needed - removed TooltipWrapper component

export function ThemeToggle({
  variant = "ghost",
  size = "icon",
  showTooltip = true
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  // Create the button element first
  const buttonElement = <ThemeButton variant={variant} size={size} />;

  // Wrap with tooltip if needed
  const triggerElement = showTooltip ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {buttonElement}
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Change theme</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : buttonElement;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {triggerElement}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Sun className="h-4 w-4" />
          <span>Light</span>
          {theme === "light" && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Moon className="h-4 w-4" />
          <span>Dark</span>
          {theme === "dark" && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Laptop className="h-4 w-4" />
          <span>System</span>
          {theme === "system" && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

ThemeToggle.displayName = "ThemeToggle"
