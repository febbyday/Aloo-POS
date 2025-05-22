import React, { lazy, Suspense, ComponentType } from 'react';
import { performanceMonitor } from '@/lib/performance/performance-monitor';

/**
 * Default loading component for lazy-loaded routes
 */
const DefaultLoading = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
  </div>
);

/**
 * Creates a lazy-loaded route component with performance tracking
 * 
 * @param importFn Function that imports the component
 * @param name Name for performance tracking
 * @param LoadingComponent Optional custom loading component
 * @returns Lazy-loaded component
 */
export function createLazyRoute<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  name: string,
  LoadingComponent: React.ComponentType = DefaultLoading
) {
  // Create lazy component
  const LazyComponent = lazy(importFn);
  
  // Return a wrapper component that handles loading state and performance tracking
  return function LazyRoute(props: React.ComponentProps<T>) {
    // Start performance tracking when the component is rendered
    React.useEffect(() => {
      performanceMonitor.markStart(`lazyRoute:${name}`);
      
      return () => {
        performanceMonitor.markEnd(`lazyRoute:${name}`);
      };
    }, []);
    
    return (
      <Suspense fallback={<LoadingComponent />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}
