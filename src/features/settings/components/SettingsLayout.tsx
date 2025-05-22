import { ReactNode, Suspense, lazy, useState, useEffect, memo } from "react"
import { SettingsSidebar } from "./SettingsSidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"

// Lazy load the settings preloader to avoid blocking initial render
// Add error handling to prevent crashes if the module fails to load
const SettingsPreloader = lazy(() =>
  import('@/lib/settings/SettingsPreloader')
    .then(module => ({ default: module.SettingsPreloader }))
    .catch(error => {
      console.error('Failed to load SettingsPreloader:', error);
      // Return a dummy component that doesn't do anything
      return { default: () => null };
    })
);

interface SettingsLayoutProps {
  children: ReactNode;
}

/**
 * Shared layout component for all settings pages
 * Provides consistent sidebar navigation and layout
 * Includes performance optimizations for settings loading
 * Memoized to prevent unnecessary re-renders
 */
export const SettingsLayout = memo(function SettingsLayout({ children }: SettingsLayoutProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate a quick loading state to improve perceived performance
  useEffect(() => {
    // Show loading state for a short time to prevent flashing
    const timer = window.setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => window.clearTimeout(timer);
  }, []);

  // Use a more efficient approach with error boundaries
  return (
    <div className="flex h-screen bg-background">
      {/* Settings Navigation Sidebar */}
      <SettingsSidebar />

      {/* Content Area with scrolling */}
      <div className="flex-1 overflow-auto relative">
        {/* Global loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading settings...</p>
            </div>
          </div>
        )}

        <div className="w-full py-6 pl-6 pr-6">
          {/* Wrap content in Suspense to handle lazy-loaded components */}
          <Suspense fallback={<SettingsLoadingSkeleton />}>
            {/* Render children first for better perceived performance */}
            {children}

            {/* Only load the preloader if we're not in loading state */}
            {!isLoading && <SettingsPreloader />}
          </Suspense>
        </div>
      </div>
    </div>
  );
});

/**
 * Loading skeleton for settings pages
 */
function SettingsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-[350px]" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-[150px] rounded-lg" />
        <Skeleton className="h-[150px] rounded-lg" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[350px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>

      <div className="flex gap-4">
        <Skeleton className="h-10 w-[100px]" />
        <Skeleton className="h-10 w-[100px]" />
      </div>
    </div>
  );
}