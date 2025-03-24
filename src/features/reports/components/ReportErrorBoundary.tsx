// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import UnifiedErrorBoundary, { ErrorBoundary } from '@/components/unified-error-boundary';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * @deprecated This component is deprecated. Please use the UnifiedErrorBoundary from '@/components/unified-error-boundary' instead.
 * This component now delegates to the unified implementation while maintaining backward compatibility.
 */
export class ReportErrorBoundary extends React.Component<Props> {
  render() {
    // Show deprecation warning in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'Deprecation Warning: ReportErrorBoundary is deprecated. ' +
        'Please use the UnifiedErrorBoundary from @/components/unified-error-boundary instead.'
      );
    }
    
    return (
      <UnifiedErrorBoundary
        fallback={(error, reset) => 
          this.props.fallback || <ReportErrorFallback error={error} onReset={reset} />
        }
        onError={this.props.onError}
        showToast={true}
        title="Report Error"
      >
        {this.props.children}
      </UnifiedErrorBoundary>
    );
  }
}

/**
 * Default error fallback component
 */
function ReportErrorFallback({ error, onReset }: { error: Error, onReset?: () => void }) {
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
 * @deprecated Please use the withErrorBoundary HOC from '@/components/unified-error-boundary' instead.
 * Higher-order component to wrap components with error boundary
 */
export function withReportErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: Omit<Props, 'children'> = {}
) {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'Deprecation Warning: withReportErrorBoundary is deprecated. ' +
      'Please use the withErrorBoundary HOC from @/components/unified-error-boundary instead.'
    );
  }
  
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary 
        fallback={(error, reset) => 
          options.fallback || <ReportErrorFallback error={error} onReset={reset} />
        }
        onError={options.onError}
        showToast={true}
        title="Report Error"
      >
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
} 