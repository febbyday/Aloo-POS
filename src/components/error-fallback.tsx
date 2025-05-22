import React from 'react';
import { showErrorToast } from '@/utils/errorHandling';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Error boundary fallback component renderer
 */
export const renderErrorFallback = (error: Error): JSX.Element => {
  // Log the error to console
  console.error('Error boundary caught an error:', error);
  
  // Show toast notification
  showErrorToast(error);
  
  return (
    <div className="p-4 rounded-md bg-destructive/10 border border-destructive text-destructive">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold mb-2">Something went wrong</h3>
          <p className="text-sm">{error.message}</p>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-2" />
            Reload page
          </Button>
        </div>
      </div>
    </div>
  );
};
