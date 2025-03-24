// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorBoundary as UnifiedErrorBoundary } from './unified-error-boundary';

/**
 * @deprecated This component is deprecated. Please use the new UnifiedErrorBoundary from '@/components/unified-error-boundary' instead.
 * See migration guide at 'src/docs/error-boundary-migration.md'
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
}

/**
 * @deprecated This component is deprecated. Please use the new UnifiedErrorBoundary from '@/components/unified-error-boundary' instead.
 * See migration guide at 'src/docs/error-boundary-migration.md'
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * @deprecated This component is deprecated. Please use the new UnifiedErrorBoundary from '@/components/unified-error-boundary' instead.
 * See migration guide at 'src/docs/error-boundary-migration.md'
 * 
 * Error Boundary component that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 * 
 * @example
 * <ErrorBoundary>
 *   <ComponentThatMightError />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false,
      error: null
    };
    
    // Show deprecation warning
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'Deprecation Warning: ErrorBoundary from @/components/error-boundary is deprecated. ' +
        'Please use the new UnifiedErrorBoundary from @/components/unified-error-boundary instead. ' +
        'See migration guide at src/docs/error-boundary-migration.md'
      );
    }
  }

  render(): ReactNode {
    // Just delegate to the new UnifiedErrorBoundary
    return (
      <UnifiedErrorBoundary
        fallback={this.props.fallback 
          ? (error, reset) => this.props.fallback!(error) 
          : undefined
        }
      >
        {this.props.children}
      </UnifiedErrorBoundary>
    );
  }
}

// Show deprecation warning when the component is imported
if (process.env.NODE_ENV === 'development') {
  console.warn(
    'Deprecation Warning: ErrorBoundary from @/components/error-boundary is deprecated. ' +
    'Please use the new UnifiedErrorBoundary from @/components/unified-error-boundary instead. ' +
    'See migration guide at src/docs/error-boundary-migration.md'
  );
}
