import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { cn } from '@/lib/utils/cn';

interface HelpTooltipProps {
  content: React.ReactNode;
  children?: React.ReactNode;
  iconSize?: "sm" | "md" | "lg";
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  iconClassName?: string;
  contentClassName?: string;
  maxWidth?: number;
}

/**
 * HelpTooltip - A reusable component for providing contextual help
 *
 * This component displays a help icon that, when hovered, shows a tooltip with help content.
 * It can be used alongside form fields to provide guidance on what information should be provided.
 */
export function HelpTooltip({
  content,
  children,
  iconSize = "sm",
  side = "top",
  align = "center",
  iconClassName,
  contentClassName,
  maxWidth = 300,
}: HelpTooltipProps) {
  // Determine icon size
  const iconDimensions = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  // Create the trigger element first
  const triggerElement = (
    <div className="inline-flex items-center cursor-help">
      {children}
      <HelpCircle
        className={cn(
          "ml-1 text-muted-foreground hover:text-foreground transition-colors",
          iconDimensions[iconSize],
          iconClassName
        )}
      />
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger>
          {triggerElement}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className={cn("p-3 text-sm max-w-xs", contentClassName)}
          style={{ maxWidth }}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * FieldHelpTooltip - A specialized help tooltip for form fields
 *
 * This component is specifically designed to be used with form fields.
 * It takes a label and shows a help icon beside it, which when hovered,
 * displays the provided help content.
 */
export function FieldHelpTooltip({
  label,
  content,
  labelClassName,
  required = false,
}: {
  label: string;
  content: React.ReactNode;
  labelClassName?: string;
  required?: boolean;
}) {
  return (
    <HelpTooltip content={content} iconSize="sm">
      <span className={cn("text-sm font-medium", labelClassName)}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </span>
    </HelpTooltip>
  );
}

/**
 * InfoBox - A component for displaying more prominent help information
 *
 * This component renders a highlighted box with an info icon and content.
 * Useful for displaying important notes, tips, or warnings within forms.
 */
export function InfoBox({
  children,
  variant = "info",
  className,
}: {
  children: React.ReactNode;
  variant?: "info" | "warning" | "success" | "error";
  className?: string;
}) {
  const variantStyles = {
    info: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300",
    success: "bg-green-50 border-green-200 text-green-900 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300",
    error: "bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300",
  };

  return (
    <div className={cn(
      "p-3 rounded-md border text-sm flex items-start gap-2",
      variantStyles[variant],
      className
    )}>
      <HelpCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}