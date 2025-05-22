/**
 * Error Handling Components
 *
 * This file exports all error-related components for easy imports.
 */

// Export the unified error boundary instead of the local one
export { ErrorBoundary } from '@/components/unified-error-boundary';
export { ErrorDisplay } from './ErrorDisplay';

// Export withErrorBoundary higher-order component for wrapping components
import { ComponentType, JSX } from 'react';
import { ErrorBoundary } from '@/components/unified-error-boundary';

/**
 * HOC to wrap a component with an ErrorBoundary
 *
 * @param Component The component to wrap
 * @param options Optional options for the ErrorBoundary
 * @returns The wrapped component
 */
export function withErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  options: {
    fallback?: JSX.Element | ((error: Error, reset: () => void) => JSX.Element);
    onError?: (error: Error, info: { componentStack: string }) => void;
    reportError?: boolean;
  } = {}
): ComponentType<P> {
  const { fallback, onError, reportError } = options;

  const WithErrorBoundary = (props: P): JSX.Element => (
    <ErrorBoundary
      fallback={fallback}
      onError={onError}
      reportError={reportError}
    >
      <Component {...props} />
    </ErrorBoundary>
  );

  // Set display name for debugging
  const displayName = Component.displayName || Component.name || 'Component';
  WithErrorBoundary.displayName = `WithErrorBoundary(${displayName})`;

  return WithErrorBoundary;
}