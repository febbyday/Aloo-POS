import { cn } from "@/lib/utils"

/**
 * Skeleton component for loading states
 * 
 * This component renders a placeholder loading state with a subtle animation
 * to indicate to users that content is being loaded.
 */
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-zinc-800/50", 
        className
      )}
      {...props}
    />
  )
} 