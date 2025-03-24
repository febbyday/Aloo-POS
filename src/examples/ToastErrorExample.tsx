// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { AlertTriangle, Check } from 'lucide-react';
import { safeStringify } from '@/utils/errorHandling';

/**
 * Example component that demonstrates how to handle the
 * "Objects are not valid as a React child" error in toast notifications
 */
export const ToastErrorExample: React.FC = () => {
  // Example product object that would cause an error if rendered directly
  const product = {
    id: 'prod123',
    name: 'Iced Latte',
    category: 'beverages',
    price: 4.99,
    options: {
      sizes: ['Small', 'Medium', 'Large'],
      iceOptions: ['No Ice', 'Less Ice', 'Normal Ice', 'Extra Ice']
    }
  };

  // This will trigger the error (but our enhanced toast will handle it safely)
  const showErrorToast = () => {
    toast({
      title: "Product Added",
      // This would normally cause an error, but our enhanced toast will handle it
      description: product,
      variant: "destructive"
    });
  };

  // The correct way to show an object in a toast
  const showCorrectToast = () => {
    toast({
      title: "Product Added",
      description: `Added ${product.name} ($${product.price.toFixed(2)}) to cart`,
      variant: "default"
    });
  };

  // Another correct approach using JSON.stringify
  const showJsonToast = () => {
    toast({
      title: "Product Details",
      description: safeStringify(product),
      variant: "default"
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Toast Error Example</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-md text-amber-800 dark:text-amber-300 text-sm">
          <div className="flex items-start">
            <AlertTriangle className="h-4 w-4 mr-2 mt-0.5" />
            <div>
              <p className="font-medium">Incorrect (would cause error):</p>
              <code className="text-xs bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">
                {'toast({ description: product })'}
              </code>
              <p className="mt-1 text-xs">This would normally cause: "Objects are not valid as a React child"</p>
            </div>
          </div>
        </div>
        
        <div className="p-3 bg-green-50 dark:bg-green-950 rounded-md text-green-800 dark:text-green-300 text-sm">
          <div className="flex items-start">
            <Check className="h-4 w-4 mr-2 mt-0.5" />
            <div>
              <p className="font-medium">Correct usage:</p>
              <code className="text-xs bg-green-100 dark:bg-green-900 px-1 py-0.5 rounded">
                {'toast({ description: `Added ${product.name} ($${product.price})` })'}
              </code>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between gap-2">
        <Button 
          variant="destructive" 
          onClick={showErrorToast}
          className="flex-1"
        >
          Show Error Toast
        </Button>
        <Button 
          variant="default" 
          onClick={showCorrectToast}
          className="flex-1"
        >
          Show Correct Toast
        </Button>
        <Button 
          variant="outline" 
          onClick={showJsonToast}
          className="flex-1"
        >
          Show JSON Toast
        </Button>
      </CardFooter>
    </Card>
  );
};
