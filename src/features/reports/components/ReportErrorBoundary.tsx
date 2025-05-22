import React, { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/lib/toast';
import { ErrorBoundary as UnifiedErrorBoundary } from '@/components/unified-error-boundary';

/**
 * Props for the ReportErrorBoundary component
 */
export interface ReportErrorBoundaryProps {
  /** The child components to render */
  children: ReactNode;

  /** Optional callback for when an error is caught */
  onError?: (error: Error) => void;

  /** Optional title for the error message */
  title?: string;
}

/**
 * Default error fallback component for reports module
 */
export function ReportErrorFallback({ error, onReset }: { error: Error, onReset?: () => void }) {
  const { toast } = useToast();

  const handleRetry = () => {
    if (onReset) {
      onReset();
    } else {
      window.location.reload();
    }
  };

  const handleReport = () => {
    // In a real app, this would send the error to your error tracking service
    toast({
      title: 'Error Reported',
      description: 'Thank you for reporting this issue. Our team will investigate and fix it as soon as possible.'
    });
  };

  return (
    <div className="p-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>
          Something went wrong
        </AlertTitle>
        <AlertDescription>
          <div className="mt-2 space-y-2">
            <p>
              An error occurred while processing your request. Please try again or report the issue if it persists.
            </p>
            <p className="font-mono text-sm bg-secondary/50 p-2 rounded">
              {error.message}
            </p>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleRetry}>
                Try Again
              </Button>
              <Button variant="outline" onClick={handleReport}>
                Report Issue
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}

/**
 * Error boundary component specialized for reports module
 *
 * This component uses the UnifiedErrorBoundary internally but provides
 * a report-specific error fallback UI with reporting capabilities.
 */
export function ReportErrorBoundary({ children, onError, title = "Report Error" }: ReportErrorBoundaryProps) {
  // Create an error handler adapter that matches the UnifiedErrorBoundary's expected signature
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    if (onError) {
      onError(error);
    }
    console.log('Report Error Boundary caught an error:', error, errorInfo);
  };

  return (
    <UnifiedErrorBoundary
      fallback={(error, reset) => (
        <ReportErrorFallback error={error} onReset={reset} />
      )}
      onError={handleError}
      title={title}
      showToast={false} // We handle toasts in our custom fallback
    >
      {children}
    </UnifiedErrorBoundary>
  );
}

export default ReportErrorBoundary;
