/**
 * ErrorBoundary Component
 * 
 * A React error boundary that catches errors in the component tree.
 * It prevents the entire app from crashing when an error occurs in a component.
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorDisplay } from './ErrorDisplay';
import { captureError } from '../../services/error-tracking';

interface ErrorBoundaryProps {
  /**
   * The children components to render
   */
  children: ReactNode;
  
  /**
   * Optional fallback component to render when an error occurs
   * If not provided, the default ErrorDisplay will be used
   */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  
  /**
   * Optional callback for when an error is caught
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  
  /**
   * Optional flag to determine if the error should be reported to the error tracking service
   */
  reportError?: boolean;
}

interface ErrorBoundaryState {
  /**
   * Whether an error has occurred
   */
  hasError: boolean;
  
  /**
   * The error that occurred
   */
  error: Error | null;
}

/**
 * Error Boundary Component
 * 
 * Catches errors in component tree and displays a fallback UI.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static defaultProps = {
    reportError: true
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to the console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Report the error to the error tracking service if enabled
    if (this.props.reportError) {
      captureError(error, { 
        componentStack: errorInfo.componentStack,
        boundary: this.constructor.name
      });
    }
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Render fallback UI
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error, this.resetErrorBoundary);
        }
        return this.props.fallback;
      }
      
      // Render default error display
      return (
        <ErrorDisplay 
          error={this.state.error}
          resetError={this.resetErrorBoundary}
        />
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
} 