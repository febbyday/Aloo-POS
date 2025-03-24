import React, { Component, ErrorInfo, ReactNode, useState } from 'react';
import { ErrorDisplay, ErrorMessage } from '@/components/ui/error-display';
import { showErrorToast } from '@/utils/errorHandling';

/**
 * Props for the UnifiedErrorBoundary component
 */
interface ErrorBoundaryProps {
  /** The child components to render */
  children: ReactNode;
  
  /** Optional fallback component to render when an error occurs */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  
  /** Optional callback for when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  
  /** Whether to show a toast notification when an error occurs */
  showToast?: boolean;
  
  /** Title to display in the error message */
  title?: string;
  
  /** Whether to show the error stack trace (only visible in development) */
  showStack?: boolean;
  
  /** Whether to automatically log errors to the console */
  logErrors?: boolean;
}

/**
 * State for the UnifiedErrorBoundary component
 */
interface ErrorBoundaryState {
  /** Whether an error has occurred */
  hasError: boolean;
  
  /** The error that occurred */
  error: Error | null;
}

/**
 * UnifiedErrorBoundary Component
 * 
 * A standardized error boundary component that catches JavaScript errors
 * anywhere in its child component tree, logs those errors, and displays
 * a fallback UI instead of the component tree that crashed.
 * 
 * This component unifies multiple error boundary implementations in the codebase
 * and leverages the new error-display component for consistent error rendering.
 * 
 * @example
 * <UnifiedErrorBoundary>
 *   <ComponentThatMightError />
 * </UnifiedErrorBoundary>
 * 
 * @example
 * <UnifiedErrorBoundary 
 *   fallback={(error, reset) => (
 *     <CustomErrorComponent 
 *       error={error} 
 *       onReset={reset} 
 *     />
 *   )}
 * >
 *   <ComponentThatMightError />
 * </UnifiedErrorBoundary>
 */
class UnifiedErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public static defaultProps = {
    showToast: true,
    title: 'Something went wrong',
    showStack: process.env.NODE_ENV === 'development',
    logErrors: true
  };

  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  /**
   * Update state so the next render will show the fallback UI
   */
  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { 
      hasError: true, 
      error 
    };
  }

  /**
   * Log the error and call the onError callback if provided
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, showToast, logErrors } = this.props;
    
    // Log the error to console if logErrors is true
    if (logErrors) {
      console.error('UnifiedErrorBoundary caught an error:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }
    
    // Call the onError callback if provided
    if (onError) {
      onError(error, errorInfo);
    }
    
    // Show toast notification if enabled
    if (showToast) {
      showErrorToast(error);
    }
  }
  
  /**
   * Reset the error state to recover from the error
   */
  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    const { hasError, error } = this.state;
    const { children, fallback, title, showStack } = this.props;
    
    if (hasError && error) {
      // If a custom fallback is provided as a function, call it with the error and reset handler
      if (typeof fallback === 'function') {
        return fallback(error, this.handleReset);
      }
      
      // If a custom fallback is provided as a component, render it
      if (fallback) {
        return fallback;
      }
      
      // Otherwise, render the default error display
      return (
        <ErrorMessage
          title={title}
          description={error.message}
          error={error}
          showStack={showStack}
          onRetry={this.handleReset}
        />
      );
    }

    return children;
  }
}

/**
 * Functional component wrapper for the UnifiedErrorBoundary class component
 * 
 * This provides a more modern API for using error boundaries with hooks and function components.
 */
export const ErrorBoundary = (props: ErrorBoundaryProps) => {
  return <UnifiedErrorBoundary {...props} />;
};

export default UnifiedErrorBoundary; 