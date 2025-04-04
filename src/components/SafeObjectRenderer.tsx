// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useSafeRender } from '@/hooks/useSafeRender';
import { ErrorBoundary } from '@/components/unified-error-boundary';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

/**
 * Component that demonstrates how to safely render objects in React
 * and how to handle the "Objects are not valid as a React child" error
 */
export const SafeObjectRenderer: React.FC = () => {
  const { renderSafely, renderObjectProperty, showObjectRenderingErrorToast } = useSafeRender();
  
  // Example object that would cause the error if rendered directly
  const exampleObject = {
    id: 1,
    name: 'Product Name',
    description: 'Product Description'
  };
  
  // Function to demonstrate the error
  const triggerError = () => {
    try {
      // This would cause an error if actually rendered
      // We're just simulating it here
      throw new Error('Objects are not valid as a React child (found: object with keys {id, name, description})');
    } catch (error) {
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Something went wrong",
          description: error.message,
        });
      }
    }
  };
  
  // Function to demonstrate the correct way
  const showCorrectUsage = () => {
    toast({
      title: "Correct Usage",
      description: "Objects should be converted to strings or accessed by property",
      variant: "default",
    });
  };

  return (
    <ErrorBoundary>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Safe Object Rendering</CardTitle>
          <CardDescription>
            Demonstrates how to handle the "Objects are not valid as a React child" error
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Example Object:</h3>
            <pre className="p-2 bg-muted rounded-md text-xs overflow-auto">
              {JSON.stringify(exampleObject, null, 2)}
            </pre>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">❌ Incorrect (would cause error):</h3>
            <div className="p-2 bg-destructive/10 text-destructive rounded-md flex items-start">
              <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <code className="text-xs">
                {'<div>{exampleObject}</div> /* This would cause the error */'}
              </code>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">✅ Correct (safe rendering):</h3>
            <div className="p-2 bg-green-500/10 text-green-600 dark:text-green-400 rounded-md flex items-start">
              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <code className="text-xs">
                {'<div>{renderSafely(exampleObject)}</div>'}
              </code>
            </div>
          </div>
          
          <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md flex items-start">
            <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-medium">Safe rendering examples:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Name: {renderObjectProperty(exampleObject, 'name')}</li>
                <li>Full object (stringified): {renderSafely(exampleObject)}</li>
              </ul>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={triggerError}>
            Show Error Toast
          </Button>
          <Button onClick={showCorrectUsage}>
            Show Correct Usage
          </Button>
        </CardFooter>
      </Card>
    </ErrorBoundary>
  );
};
