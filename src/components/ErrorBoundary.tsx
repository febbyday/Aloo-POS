// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import React, { Component, ErrorInfo, ReactNode, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import UnifiedErrorBoundary from './unified-error-boundary';

/**
 * @deprecated This component is deprecated. 
 * Please use UnifiedErrorBoundary from @/components/unified-error-boundary instead.
 * See migration guide at src/docs/error-boundary-migration.md
 */

/**
 * @deprecated This component is deprecated. Please use the new UnifiedErrorBoundary from '@/components/unified-error-boundary' instead.
 * See migration guide at 'src/docs/error-boundary-migration.md'
 */
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * @deprecated This component is deprecated. Please use the new UnifiedErrorBoundary from '@/components/unified-error-boundary' instead.
 * See migration guide at 'src/docs/error-boundary-migration.md'
 */
interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * @deprecated This component is deprecated. Please use the new UnifiedErrorBoundary from '@/components/unified-error-boundary' instead.
 * See migration guide at 'src/docs/error-boundary-migration.md'
 * 
 * ErrorBoundary component that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
    
    // Show deprecation warning
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'Deprecation Warning: ErrorBoundary from @/components/ErrorBoundary is deprecated. ' +
        'Please use the new UnifiedErrorBoundary from @/components/unified-error-boundary instead. ' +
        'See migration guide at src/docs/error-boundary-migration.md'
      );
    }
  }

  /**
   * Update state so the next render will show the fallback UI.
   */
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  /**
   * Log the error to an error reporting service.
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }
  
  /**
   * Try to recover from the error by resetting the state
   */
  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    // Just delegate to the new UnifiedErrorBoundary
    return (
      <UnifiedErrorBoundary
        fallback={this.props.fallback}
        onError={this.props.onError}
      >
        {this.props.children}
      </UnifiedErrorBoundary>
    );
  }
}

// Show deprecation warning when the component is imported
if (process.env.NODE_ENV === 'development') {
  console.warn(
    'Deprecation Warning: ErrorBoundary from @/components/ErrorBoundary is deprecated. ' +
    'Please use the new UnifiedErrorBoundary from @/components/unified-error-boundary instead. ' +
    'See migration guide at src/docs/error-boundary-migration.md'
  );
}

export default ErrorBoundary; 