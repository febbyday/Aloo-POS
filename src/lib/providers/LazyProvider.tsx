import React, { Suspense, lazy, ReactNode, useEffect, useState } from 'react';
import { performanceMonitor } from '@/lib/performance/performance-monitor';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface LazyProviderProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
}

/**
 * Creates a lazy-loaded provider component
 * 
 * @param importFn Function that imports the provider component
 * @param name Name for performance tracking
 * @returns Lazy-loaded provider component
 */
export function createLazyProvider<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  name: string
) {
  // Create lazy component
  const LazyProviderComponent = lazy(importFn);
  
  // Return a wrapper component that handles loading state
  return function LazyProvider({ 
    children, 
    fallback = null, 
    errorFallback = <LazyLoadErrorFallback providerName={name} />,
    ...props 
  }: LazyProviderProps & React.ComponentProps<T>) {
    const [error, setError] = useState<Error | null>(null);

    // Reset error state when props change
    useEffect(() => {
      setError(null);
    }, [props]);

    if (error) {
      return errorFallback;
    }
    
    return (
      <Suspense fallback={fallback}>
        <ErrorBoundary onError={setError}>
          <LazyProviderTracker name={name}>
            <LazyProviderComponent {...props}>
              {children}
            </LazyProviderComponent>
          </LazyProviderTracker>
        </ErrorBoundary>
      </Suspense>
    );
  };
}

/**
 * Component to track performance of lazy-loaded providers
 */
function LazyProviderTracker({ 
  children, 
  name 
}: { 
  children: ReactNode; 
  name: string;
}) {
  React.useEffect(() => {
    performanceMonitor.markStart(`lazyProvider:${name}`);
    
    return () => {
      performanceMonitor.markEnd(`lazyProvider:${name}`);
    };
  }, [name]);
  
  return children;
}

/**
 * Simple error boundary component
 */
class ErrorBoundary extends React.Component<{
  children: ReactNode;
  onError: (error: Error) => void;
}> {
  componentDidCatch(error: Error) {
    console.error('[LazyProvider] Error loading component:', error);
    this.props.onError(error);
  }

  render() {
    return this.props.children;
  }
}

/**
 * Error fallback component for lazy-loaded providers
 */
function LazyLoadErrorFallback({ providerName }: { providerName: string }) {
  return (
    <Alert className="my-4 mx-auto max-w-3xl">
      <AlertTitle className="text-xl font-semibold text-red-500">
        Error Loading {providerName}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2">
          There was an error loading this component. This might be due to:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>The API server is not running</li>
          <li>Network connectivity issues</li>
          <li>Required data not being available</li>
        </ul>
        <div className="mt-4 flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Page
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
