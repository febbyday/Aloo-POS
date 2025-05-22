import React, { Component, ErrorInfo, ReactNode, useState, useCallback } from 'react'
import { Terminal } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ErrorBoundary as UnifiedErrorBoundary } from '@/components/unified-error-boundary'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * @deprecated This component is deprecated. Please use the UnifiedErrorBoundary from '@/components/unified-error-boundary' instead.
 * Error boundary component that catches JavaScript errors in its child component tree.
 * Displays a fallback UI instead of crashing the whole app.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }

    // Show deprecation warning
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'Deprecation Warning: ErrorBoundary from @/components/error-boundary/POSErrorBoundary is deprecated. ' +
        'Please use the new UnifiedErrorBoundary from @/components/unified-error-boundary instead.'
      );
    }
  }

  render(): ReactNode {
    // Just delegate to the new UnifiedErrorBoundary
    return (
      <UnifiedErrorBoundary
        fallback={this.props.fallback ?
          (error, reset) => this.props.fallback :
          (error, reset) => (
            <div className="pos-error-overlay p-6 rounded-lg border border-destructive bg-destructive/10 max-w-md mx-auto my-8">
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>POS System Error</AlertTitle>
                <AlertDescription>
                  {error?.message || 'An unexpected error occurred'}
                </AlertDescription>
              </Alert>
              <div className="flex justify-center mt-4">
                <Button onClick={reset} variant="outline">
                  Reset POS State
                </Button>
              </div>
            </div>
          )
        }
        onError={this.props.onError}
      >
        {this.props.children}
      </UnifiedErrorBoundary>
    );
  }
}

/**
 * Functional component wrapper for the POSErrorBoundary
 */
export const POSErrorBoundary = ({
  children,
  onReset
}: {
  children: ReactNode
  onReset?: () => void
}) => {
  return (
    <UnifiedErrorBoundary onError={() => onReset?.()}>
      {children}
    </UnifiedErrorBoundary>
  )
}

/**
 * Hook for creating a component that can reset the error boundary
 */
export const useErrorHandler = () => {
  const [error, setError] = useState<Error | null>(null)

  const resetError = useCallback(() => {
    setError(null)
  }, [])

  const handleError = useCallback((error: Error) => {
    setError(error)
    // Re-throw the error to be caught by the nearest error boundary
    throw error
  }, [])

  return {
    error,
    resetError,
    handleError
  }
}

export default POSErrorBoundary
