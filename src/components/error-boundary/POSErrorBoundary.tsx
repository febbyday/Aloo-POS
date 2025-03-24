// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import React, { Component, ErrorInfo, ReactNode, useState, useCallback } from 'react'
import { Terminal } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

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
 * Error boundary component that catches JavaScript errors in its child component tree.
 * Displays a fallback UI instead of crashing the whole app.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  resetErrorBoundary = (): void => {
    // Call the onReset callback if provided
    if (this.props.onReset) {
      this.props.onReset()
    }
    
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback
      }
      
      // Otherwise, use the default error UI
      return (
        <div className="pos-error-overlay p-6 rounded-lg border border-destructive bg-destructive/10 max-w-md mx-auto my-8">
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>POS System Error</AlertTitle>
            <AlertDescription>
              {this.state.error?.message || 'An unexpected error occurred'}
            </AlertDescription>
          </Alert>
          <div className="flex justify-center mt-4">
            <Button onClick={this.resetErrorBoundary} variant="outline">
              Reset POS State
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
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
    <ErrorBoundary onReset={onReset}>
      {children}
    </ErrorBoundary>
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
