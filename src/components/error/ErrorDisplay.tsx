/**
 * ErrorDisplay Component
 * 
 * A component to display error information to users.
 * Provides a user-friendly way to show errors and recover from them.
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface ErrorDisplayProps {
  /**
   * The error to display
   */
  error: Error;
  
  /**
   * Function to reset the error state
   */
  resetError: () => void;
  
  /**
   * Optional title for the error display
   */
  title?: string;
  
  /**
   * Optional description for the error display
   */
  description?: string;
  
  /**
   * Optional flag to show technical details by default
   */
  showTechnicalDetails?: boolean;
  
  /**
   * Optional additional actions to display
   */
  actions?: React.ReactNode;
}

/**
 * ErrorDisplay Component
 * 
 * Displays a user-friendly error message with options to retry or see technical details.
 */
export function ErrorDisplay({
  error,
  resetError,
  title = 'Something went wrong',
  description = 'We\'re sorry, but we encountered an error. Please try again or contact support if the problem persists.',
  showTechnicalDetails: initialShowDetails = false,
  actions
}: ErrorDisplayProps): JSX.Element {
  const [showDetails, setShowDetails] = useState(initialShowDetails);
  
  // Get a clean error message without the stack trace
  const errorMessage = error.message.split('\n')[0];
  
  return (
    <Card className="w-full max-w-2xl mx-auto my-8 border-red-200">
      <CardHeader className="bg-red-50">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <Alert className="mb-4">
          <AlertTitle>Error Details</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
        
        {error.stack && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 mb-2"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Hide Technical Details
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Show Technical Details
                </>
              )}
            </Button>
            
            {showDetails && (
              <pre className="bg-slate-100 p-4 rounded text-xs overflow-auto max-h-64">
                {error.stack}
              </pre>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between gap-2 border-t pt-4">
        <Button
          onClick={resetError}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
        
        {actions}
      </CardFooter>
    </Card>
  );
} 