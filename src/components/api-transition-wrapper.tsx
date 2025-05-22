/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * API Transition Wrapper Component
 * 
 * This component helps smoothly transition components from mock data to real API endpoints
 * by providing fallback content when API requests fail during the transition period.
 */

import React, { useState, useEffect } from 'react';
import { ApiError, ApiErrorType } from '@/lib/api/api-error-handler';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction, RefreshCw, Database, ServerOff } from 'lucide-react';

interface ApiTransitionWrapperProps {
  children: React.ReactNode;
  componentName: string;
  fallbackComponent?: React.ReactNode;
  isLoading?: boolean;
  error?: Error | null;
  requiresRealApi?: boolean;
  mockFallback?: React.ReactNode;
}

/**
 * API Transition Wrapper
 * 
 * Wraps components that are transitioning from mock data to real API endpoints,
 * providing helpful error messages and fallbacks during the transition period.
 */
export const ApiTransitionWrapper: React.FC<ApiTransitionWrapperProps> = ({
  children,
  componentName,
  fallbackComponent,
  isLoading = false,
  error = null,
  requiresRealApi = true,
  mockFallback
}) => {
  const [dismissed, setDismissed] = useState<boolean>(false);

  // Reset dismissed state when error changes
  useEffect(() => {
    if (error) {
      setDismissed(false);
    }
  }, [error]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-32 w-full" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
    );
  }

  // If there's an error and it's an ApiError with type MOCK_DISABLED
  if (
    error && 
    ((error instanceof ApiError && error.type === ApiErrorType.MOCK_DISABLED) ||
     error.message.includes('mock') || 
     error.message.includes('Mock'))
  ) {
    if (dismissed) {
      // If user dismissed the error message, show mock fallback if provided
      if (mockFallback) {
        return <>{mockFallback}</>;
      }
      
      // Otherwise, show minimal transition message
      return (
        <div className="p-4 rounded border border-muted bg-muted/20">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Construction size={18} />
            <span className="text-sm font-medium">
              {componentName} is in transition to real API endpoints
            </span>
          </div>
          {fallbackComponent || children}
        </div>
      );
    }

    // Show detailed transition message for mock data disabled errors
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-2 bg-muted/30">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Construction className="h-5 w-5 text-amber-500" />
              <span>API Transition in Progress</span>
            </CardTitle>
          </div>
          <CardDescription>
            {componentName} is being migrated from mock data to real API endpoints
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-sm space-y-2">
            <p>
              This component previously used mock data which has been disabled. The real API endpoint is not yet fully implemented or is returning errors.
            </p>
            {requiresRealApi ? (
              <Alert variant="warning" className="mt-2">
                <Database className="h-4 w-4" />
                <AlertTitle>Real API Required</AlertTitle>
                <AlertDescription>
                  This component requires the real backend API to be operational. Please ensure the backend server is running and properly configured.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="info" className="mt-2">
                <ServerOff className="h-4 w-4" />
                <AlertTitle>Mock Data Disabled</AlertTitle>
                <AlertDescription>
                  You can continue using the application, but some functionality in this component may be limited until the transition is complete.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 pt-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setDismissed(true)}
            className="text-xs"
          >
            Continue with Limited Functionality
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="text-xs flex items-center gap-1"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-3 w-3" />
            Refresh Page
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // If there's another type of error
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error in {componentName}</AlertTitle>
        <AlertDescription>
          {error.message || 'An unexpected error occurred'}
        </AlertDescription>
      </Alert>
    );
  }

  // No error, render children
  return <>{children}</>;
};

/**
 * Higher-Order Component to wrap components with ApiTransitionWrapper
 */
export function withApiTransition<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ApiTransitionWrapperProps, 'children'> & { 
    errorProp?: keyof P;
    loadingProp?: keyof P;
  }
) {
  const { 
    componentName, 
    fallbackComponent, 
    requiresRealApi,
    mockFallback,
    errorProp = 'error' as keyof P,
    loadingProp = 'isLoading' as keyof P
  } = options;
  
  return function WithApiTransition(props: P) {
    const error = props[errorProp] as Error | null | undefined;
    const isLoading = props[loadingProp] as boolean | undefined;
    
    return (
      <ApiTransitionWrapper
        componentName={componentName}
        fallbackComponent={fallbackComponent}
        error={error || null}
        isLoading={isLoading || false}
        requiresRealApi={requiresRealApi}
        mockFallback={mockFallback}
      >
        <Component {...props} />
      </ApiTransitionWrapper>
    );
  };
}

export default ApiTransitionWrapper;
