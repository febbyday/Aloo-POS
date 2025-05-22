/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * API Error Boundary Component
 * 
 * This component provides a graceful error handling mechanism for API-related failures,
 * showing user-friendly error messages and allowing for retry functionality.
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, WifiOff, ServerCrash, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export interface ApiErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
  loadingComponent?: React.ReactNode;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

/**
 * Default error display component for API errors
 */
export const DefaultApiErrorDisplay: React.FC<{ error: Error; retry: () => void }> = ({ error, retry }) => {
  const [errorDetails, setErrorDetails] = useState({
    title: 'Something went wrong',
    icon: AlertCircle,
    description: 'An unexpected error occurred while fetching data.'
  });

  useEffect(() => {
    // Determine the error type and set appropriate messaging
    if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
      setErrorDetails({
        title: 'Connection Error',
        icon: WifiOff,
        description: 'Unable to connect to the server. Please check your internet connection and try again.'
      });
    } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
      setErrorDetails({
        title: 'Server Error',
        icon: ServerCrash,
        description: 'Our server is experiencing issues. The team has been notified and is working on a fix.'
      });
    } else if (error.message.includes('404') || error.message.includes('Not Found')) {
      setErrorDetails({
        title: 'Resource Not Found',
        icon: AlertCircle,
        description: 'The requested resource could not be found. It may have been moved or deleted.'
      });
    }
  }, [error]);

  const Icon = errorDetails.icon;

  return (
    <Card className="w-full max-w-lg mx-auto shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">{errorDetails.title}</CardTitle>
          <Icon className="h-6 w-6 text-destructive" />
        </div>
        <CardDescription>{errorDetails.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md overflow-auto max-h-[100px]">
          {error.message}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1" 
          onClick={retry}
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </CardFooter>
    </Card>
  );
};

/**
 * Default loading component
 */
export const DefaultLoadingDisplay: React.FC = () => (
  <div className="w-full space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-6 w-16" />
    </div>
    <Skeleton className="h-32 w-full" />
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-1/4" />
      <Skeleton className="h-6 w-20" />
    </div>
    <Skeleton className="h-32 w-full" />
  </div>
);

/**
 * API Error Boundary component for handling API-related errors
 */
export const ApiErrorBoundary: React.FC<ApiErrorBoundaryProps> = ({
  children,
  fallback,
  errorComponent: ErrorComponent = DefaultApiErrorDisplay,
  loadingComponent = <DefaultLoadingDisplay />,
  isLoading = false,
  error = null,
  onRetry
}) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  if (isLoading) {
    return <>{loadingComponent}</>;
  }

  if (error) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <ErrorComponent error={error} retry={handleRetry} />;
  }

  return <>{children}</>;
};

export default ApiErrorBoundary;
