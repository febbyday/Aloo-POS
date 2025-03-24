import React, { useState } from 'react';
import { ErrorBoundary } from '@/components/unified-error-boundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * A component that throws an error when triggered
 */
const BuggyComponent: React.FC<{ throwError?: boolean }> = ({ throwError = false }) => {
  if (throwError) {
    throw new Error('This is a test error from BuggyComponent');
  }
  
  return <div>This component works correctly when not throwing errors</div>;
};

/**
 * A test component for the ErrorBoundary
 */
export const ErrorBoundaryTest: React.FC = () => {
  const [shouldThrow, setShouldThrow] = useState(false);
  
  return (
    <div className="space-y-8 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Error Boundary Test</CardTitle>
          <CardDescription>
            Test the unified error boundary component by triggering errors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              This is a test component for the unified error boundary. Click the
              button below to trigger an error and see how the error boundary handles it.
            </p>
            
            <div className="bg-muted p-4 rounded-md">
              <ErrorBoundary>
                <BuggyComponent throwError={shouldThrow} />
              </ErrorBoundary>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant={shouldThrow ? "outline" : "default"}
            onClick={() => setShouldThrow(prev => !prev)}
          >
            {shouldThrow ? "Reset Component" : "Trigger Error"}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Custom Error Handling</CardTitle>
          <CardDescription>
            Test the error boundary with custom error UI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ErrorBoundary
            fallback={(error, reset) => (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
                <h3 className="text-lg font-medium text-yellow-800">Custom Error UI</h3>
                <p className="text-yellow-700 mt-1">{error.message}</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-2"
                  onClick={reset}
                >
                  Reset
                </Button>
              </div>
            )}
          >
            <BuggyComponent throwError={true} />
          </ErrorBoundary>
        </CardContent>
      </Card>
    </div>
  );
}; 