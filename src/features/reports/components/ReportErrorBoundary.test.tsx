// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { IntlProvider } from 'react-intl';
import { ReportErrorBoundary, withReportErrorBoundary } from './ReportErrorBoundary';

// Mock the toast component
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

// Mock translations
const messages = {
  'reports.errors.title': 'Something went wrong',
  'reports.errors.description': 'An error occurred while processing your request. Please try again or report the issue if it persists.',
  'reports.errors.retry': 'Try Again',
  'reports.errors.report': 'Report Issue',
  'reports.errors.reported': 'Error Reported',
  'reports.errors.reportedDescription': 'Thank you for reporting this issue. Our team will investigate and fix it as soon as possible.'
};

// Test components
const WorkingComponent = () => <div>Working Component</div>;

const BrokenComponent = () => {
  throw new Error('Test error');
  return <div>Broken Component</div>;
};

const CustomFallback = () => <div>Custom Fallback</div>;

describe('ReportErrorBoundary', () => {
  const originalConsoleError = console.error;
  
  beforeEach(() => {
    // Suppress console.error for expected errors
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('renders children when there is no error', () => {
    render(
      <IntlProvider locale="en" messages={messages}>
        <ReportErrorBoundary>
          <WorkingComponent />
        </ReportErrorBoundary>
      </IntlProvider>
    );

    expect(screen.getByText('Working Component')).toBeInTheDocument();
  });

  it('renders error UI when there is an error', () => {
    render(
      <IntlProvider locale="en" messages={messages}>
        <ReportErrorBoundary>
          <BrokenComponent />
        </ReportErrorBoundary>
      </IntlProvider>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    render(
      <IntlProvider locale="en" messages={messages}>
        <ReportErrorBoundary fallback={<CustomFallback />}>
          <BrokenComponent />
        </ReportErrorBoundary>
      </IntlProvider>
    );

    expect(screen.getByText('Custom Fallback')).toBeInTheDocument();
  });

  it('calls onError when an error occurs', () => {
    const handleError = vi.fn();

    render(
      <IntlProvider locale="en" messages={messages}>
        <ReportErrorBoundary onError={handleError}>
          <BrokenComponent />
        </ReportErrorBoundary>
      </IntlProvider>
    );

    expect(handleError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object)
    );
  });

  it('shows retry and report buttons in error UI', () => {
    render(
      <IntlProvider locale="en" messages={messages}>
        <ReportErrorBoundary>
          <BrokenComponent />
        </ReportErrorBoundary>
      </IntlProvider>
    );

    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Report Issue')).toBeInTheDocument();
  });

  it('reloads page when retry button is clicked', () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true
    });

    render(
      <IntlProvider locale="en" messages={messages}>
        <ReportErrorBoundary>
          <BrokenComponent />
        </ReportErrorBoundary>
      </IntlProvider>
    );

    fireEvent.click(screen.getByText('Try Again'));
    expect(reloadMock).toHaveBeenCalled();
  });

  describe('withReportErrorBoundary HOC', () => {
    it('wraps component with error boundary', () => {
      const WrappedComponent = withReportErrorBoundary(WorkingComponent);

      render(
        <IntlProvider locale="en" messages={messages}>
          <WrappedComponent />
        </IntlProvider>
      );

      expect(screen.getByText('Working Component')).toBeInTheDocument();
    });

    it('handles errors in wrapped component', () => {
      const WrappedComponent = withReportErrorBoundary(BrokenComponent);

      render(
        <IntlProvider locale="en" messages={messages}>
          <WrappedComponent />
        </IntlProvider>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('passes options to error boundary', () => {
      const WrappedComponent = withReportErrorBoundary(BrokenComponent, {
        fallback: <CustomFallback />
      });

      render(
        <IntlProvider locale="en" messages={messages}>
          <WrappedComponent />
        </IntlProvider>
      );

      expect(screen.getByText('Custom Fallback')).toBeInTheDocument();
    });
  });
}); 