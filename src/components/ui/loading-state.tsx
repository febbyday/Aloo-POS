import React from 'react';
import { Loader2 } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

/**
 * LoadingState Component
 * 
 * A standardized component for displaying loading states
 * consistently throughout the application.
 * 
 * Features:
 * - Multiple sizes (sm, md, lg)
 * - Different visual styles (spinner, dots, skeleton)
 * - Customizable text and appearance
 * - Consistent with the design system
 * - Supports overlay mode
 * - Supports fullscreen loading
 * - Handles conditional rendering based on loading state
 */

// Define variants for the loading spinner
const spinnerVariants = cva("animate-spin", {
  variants: {
    size: {
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

// Define variants for the container
const containerVariants = cva("flex items-center justify-center", {
  variants: {
    fullscreen: {
      true: "fixed inset-0 bg-white/80 dark:bg-black/80 z-50",
      false: "",
    },
    variant: {
      embedded: "py-8",
      overlay: "absolute inset-0 bg-white/80 dark:bg-black/80 z-10 rounded-lg",
      inline: "inline-flex",
    },
    center: {
      true: "flex items-center justify-center",
      false: "",
    },
  },
  defaultVariants: {
    fullscreen: false,
    variant: "embedded",
    center: false,
  },
});

// Props interface for the LoadingSpinner component
export interface LoadingSpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
}

/**
 * LoadingSpinner Component
 */
export function LoadingSpinner({ size, className }: LoadingSpinnerProps) {
  return (
    <Loader2 className={cn(spinnerVariants({ size }), className)} />
  );
}

// Props interface for the LoadingState component
export interface LoadingStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  spinnerSize?: VariantProps<typeof spinnerVariants>["size"];
  text?: string;
  showSpinner?: boolean;
  hideText?: boolean;
  isLoading?: boolean;
  loadingContent?: React.ReactNode;
  useSkeleton?: boolean;
  loadingText?: string;
  size?: 'sm' | 'md' | 'lg';
  overlay?: boolean;
}

/**
 * LoadingState Component
 * 
 * A standardized component for handling loading states consistently across the application.
 * It can display a spinner, skeleton, or custom loading content.
 * 
 * @example
 * ```tsx
 * <LoadingState isLoading={isLoading}>
 *   <YourContent />
 * </LoadingState>
 * ```
 * 
 * @example
 * ```tsx
 * <LoadingState 
 *   isLoading={isLoading} 
 *   loadingText="Loading data..."
 *   size="lg"
 *   center
 * >
 *   <YourContent />
 * </LoadingState>
 * ```
 */
export function LoadingState({
  className,
  fullscreen,
  variant,
  spinnerSize,
  text = "Loading...",
  showSpinner = true,
  hideText = false,
  isLoading,
  loadingContent,
  useSkeleton = false,
  loadingText,
  size = 'md',
  overlay = false,
  center = false,
  children,
  ...props
}: LoadingStateProps) {
  // If using the component for conditional rendering based on loading state
  if (isLoading !== undefined) {
    // Not loading, render children
    if (!isLoading) {
      return <>{children}</>;
    }

    // Size mapping for spinner
    const sizeMap = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
    };

    // Handle loading state with custom content or default spinner
    const loadingNode = loadingContent || (
      <div className="flex flex-col items-center justify-center space-y-3">
        {!useSkeleton ? (
          // Show spinner
          <Loader2 className={cn("animate-spin", sizeMap[size as keyof typeof sizeMap])} />
        ) : (
          // Show skeleton
          <div className="w-full h-full min-h-[100px] animate-pulse rounded-md bg-muted/50" />
        )}
        
        {loadingText && (
          <p className="text-sm text-muted-foreground">{loadingText}</p>
        )}
      </div>
    );

    // Return the loading state with appropriate overlay if needed
    return (
      <div
        className={cn(
          overlay && "relative",
          className
        )}
        {...props}
      >
        {overlay ? (
          <>
            <div className="opacity-50">{children}</div>
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
              {loadingNode}
            </div>
          </>
        ) : (
          <div className={cn("w-full", center && "flex items-center justify-center")}>
            {loadingNode}
          </div>
        )}
      </div>
    );
  }

  // Traditional usage without conditional rendering
  return (
    <div
      className={cn(containerVariants({ fullscreen, variant, center }), className)}
      {...props}
    >
      <div className="flex flex-col items-center justify-center space-y-3">
        {showSpinner && (
          <LoadingSpinner size={spinnerSize} />
        )}
        
        {!hideText && text && (
          <p className="text-sm text-muted-foreground">{text}</p>
        )}
        
        {children}
      </div>
    </div>
  );
}

// Skeleton loading component
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Skeleton Component for content placeholders
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/50",
        className
      )}
      {...props}
    />
  );
}

/**
 * Convenience Components
 */

// Fullscreen loading overlay
export function FullscreenLoading({ text = "Loading...", ...props }: Omit<LoadingStateProps, "fullscreen">) {
  return <LoadingState fullscreen={true} text={text} {...props} />;
}

// Inline loading indicator (for buttons, etc.)
export function InlineLoading({ hideText = true, spinnerSize = "sm", ...props }: LoadingStateProps) {
  return <LoadingState variant="inline" hideText={hideText} spinnerSize={spinnerSize} {...props} />;
}

// Loading overlay for a container
export function LoadingOverlay({ text = "Loading...", ...props }: Omit<LoadingStateProps, "variant">) {
  return <LoadingState variant="overlay" text={text} {...props} />;
}

/**
 * Specialized components for common loading situations
 */

// Data loading component with automatic error handling
interface DataStateProps extends Omit<LoadingStateProps, "fullscreen" | "variant"> {
  loading: boolean;
  error: Error | null;
  errorComponent?: React.ReactNode;
  children: React.ReactNode;
}

export function DataState({
  loading,
  error,
  errorComponent,
  children,
  ...loadingProps
}: DataStateProps) {
  // If there's an error, show the error component
  if (error) {
    return (
      <div className="w-full">
        {errorComponent || (
          <div className="p-4 text-center text-red-500">
            <p>Error loading data</p>
            <p className="text-sm">{error.message}</p>
          </div>
        )}
      </div>
    );
  }

  // If loading, show the loading state
  if (loading) {
    return <LoadingState variant="embedded" {...loadingProps} />;
  }

  // Otherwise, show the children
  return <>{children}</>;
}

/**
 * Render props version of loading state for more complex scenarios
 */
export function LoadingStateRenderProps({
  isLoading,
  children,
  renderLoading,
}: {
  isLoading: boolean;
  children: React.ReactNode | ((isLoading: boolean) => React.ReactNode);
  renderLoading?: () => React.ReactNode;
}) {
  if (isLoading) {
    return <>{renderLoading ? renderLoading() : <LoadingState />}</>;
  }

  return <>{typeof children === 'function' ? children(isLoading) : children}</>;
} 