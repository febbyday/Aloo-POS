import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsLoadingIndicatorProps {
  /**
   * Whether the component is in a loading state
   */
  loading: boolean;
  
  /**
   * Optional text to display next to the loading spinner
   */
  text?: string;
  
  /**
   * Optional CSS class name to apply to the container
   */
  className?: string;
  
  /**
   * Optional size of the loading spinner (default: "md")
   */
  size?: "sm" | "md" | "lg";
}

/**
 * A reusable loading indicator component for settings pages
 * Shows a spinner with optional text when loading is true
 */
export function SettingsLoadingIndicator({
  loading,
  text = "Loading settings...",
  className,
  size = "md"
}: SettingsLoadingIndicatorProps) {
  if (!loading) return null;
  
  // Determine spinner size based on the size prop
  const spinnerSize = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  }[size];
  
  // Determine text size based on the size prop
  const textSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }[size];
  
  return (
    <div className={cn(
      "flex items-center gap-2 text-muted-foreground animate-in fade-in duration-300",
      className
    )}>
      <Loader2 className={cn("animate-spin", spinnerSize)} />
      {text && <span className={textSize}>{text}</span>}
    </div>
  );
}

/**
 * A full-page loading indicator for settings pages
 */
export function SettingsFullPageLoading() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-10rem)] w-full">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    </div>
  );
}
