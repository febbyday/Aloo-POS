import React from 'react';
import { AlertCircle, AlertTriangle, Info, XCircle, RefreshCw } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';
import { Button } from './button';

/**
 * ErrorDisplay component
 * 
 * A standardized component for displaying errors and other messages
 * consistently throughout the application. Supports different severity
 * levels and optional retry/refresh functionality.
 * 
 * Features:
 * - Multiple severity levels (error, warning, info)
 * - Consistent styling with the design system
 * - Optional retry button
 * - Optional stack trace for detailed errors (dev only)
 * - Customizable actions
 */

// Define variants for the error display
const errorDisplayVariants = cva(
  "relative w-full rounded-lg border p-4 flex gap-3 items-start",
  {
    variants: {
      severity: {
        error: "bg-red-50 text-red-900 border-red-200 dark:bg-red-950 dark:text-red-50 dark:border-red-800",
        warning: "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-50 dark:border-amber-800",
        info: "bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950 dark:text-blue-50 dark:border-blue-800",
        success: "bg-green-50 text-green-900 border-green-200 dark:bg-green-950 dark:text-green-50 dark:border-green-800",
      },
      size: {
        sm: "text-sm p-2",
        md: "text-base p-4",
        lg: "text-lg p-6",
      },
    },
    defaultVariants: {
      severity: "error",
      size: "md",
    },
  }
);

// Define the icon mapping for each severity level
const severityIcons = {
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  success: RefreshCw,
};

// Props interface for the ErrorDisplay component
export interface ErrorDisplayProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof errorDisplayVariants> {
  title?: string;
  description?: string;
  error?: Error | string;
  showStack?: boolean;
  onRetry?: () => void;
  retryText?: string;
  actions?: React.ReactNode;
}

/**
 * ErrorDisplay Component
 */
export function ErrorDisplay({
  className,
  severity = "error",
  size = "md",
  title,
  description,
  error,
  showStack = false,
  onRetry,
  retryText = "Try Again",
  actions,
  children,
  ...props
}: ErrorDisplayProps) {
  // Determine the icon based on severity
  const IconComponent = severityIcons[severity || "error"];
  
  // Format the error message
  const errorMessage = typeof error === 'string' 
    ? error 
    : error?.message || '';
  
  // Get the stack trace (only if showStack is true and we're in development)
  const stack = (
    showStack && 
    process.env.NODE_ENV === 'development' && 
    typeof error !== 'string' && 
    error?.stack
  ) ? error.stack : undefined;

  return (
    <div
      className={cn(errorDisplayVariants({ severity, size, className }))}
      {...props}
    >
      <div className="flex-shrink-0 mt-0.5">
        <IconComponent className="h-5 w-5" />
      </div>
      
      <div className="flex-grow">
        {title && (
          <h5 className="font-medium mb-1">{title}</h5>
        )}
        
        {description && (
          <p className="text-sm opacity-90">{description}</p>
        )}
        
        {errorMessage && (
          <p className="text-sm opacity-90 mt-1">{errorMessage}</p>
        )}
        
        {children}
        
        {stack && (
          <pre className="mt-2 text-xs p-2 bg-black/10 rounded overflow-auto max-h-[200px]">
            {stack}
          </pre>
        )}
        
        {(onRetry || actions) && (
          <div className="mt-3 flex gap-2">
            {onRetry && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onRetry}
                className={cn(
                  severity === 'error' && "border-red-300 hover:bg-red-100 dark:border-red-700 dark:hover:bg-red-900",
                  severity === 'warning' && "border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900",
                  severity === 'info' && "border-blue-300 hover:bg-blue-100 dark:border-blue-700 dark:hover:bg-blue-900",
                  severity === 'success' && "border-green-300 hover:bg-green-100 dark:border-green-700 dark:hover:bg-green-900"
                )}
              >
                <RefreshCw className="mr-1 h-3 w-3" /> {retryText}
              </Button>
            )}
            
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Convenience Components for different error types
 */

export function ErrorMessage({ 
  title = "An error occurred", 
  ...props 
}: ErrorDisplayProps) {
  return <ErrorDisplay severity="error" title={title} {...props} />;
}

export function WarningMessage({ 
  title = "Warning", 
  ...props 
}: ErrorDisplayProps) {
  return <ErrorDisplay severity="warning" title={title} {...props} />;
}

export function InfoMessage({ 
  title = "Information", 
  ...props 
}: ErrorDisplayProps) {
  return <ErrorDisplay severity="info" title={title} {...props} />;
}

export function SuccessMessage({ 
  title = "Success", 
  ...props 
}: ErrorDisplayProps) {
  return <ErrorDisplay severity="success" title={title} {...props} />;
} 