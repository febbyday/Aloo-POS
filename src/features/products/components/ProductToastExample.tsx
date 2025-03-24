// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Coffee, IceCream, AlertTriangle, Check } from 'lucide-react';
import { safeStringify } from '@/utils/errorHandling';
import { ErrorBoundary } from '@/components/unified-error-boundary';

// Define product type based on our existing customization options
interface ProductOption {
  id: string;
  name: string;
  price?: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  sizeOptions?: string[];
  sizePrices?: Record<string, number>;
  iceOptions?: string[];
  stockQuantity?: number;
  trackInventory?: boolean;
  options?: ProductOption[];
}

/**
 * Component that demonstrates how to properly show toast notifications
 * for products with customization options
 */
export const ProductToastExample: React.FC = () => {
  // Example product with customization options
  const exampleProduct: Product = {
    id: '123',
    name: 'Iced Coffee',
    description: 'Refreshing cold coffee with your choice of ice level',
    price: 4.99,
    category: 'beverages',
    sizeOptions: ['Small', 'Medium', 'Large'],
    sizePrices: {
      'Small': 4.99,
      'Medium': 5.99,
      'Large': 6.99
    },
    iceOptions: ['No Ice', 'Less Ice', 'Normal Ice', 'Extra Ice'],
    trackInventory: true,
    stockQuantity: 50,
    options: [
      { id: 'opt1', name: 'Extra Shot', price: 0.99 },
      { id: 'opt2', name: 'Vanilla Syrup', price: 0.50 },
      { id: 'opt3', name: 'Caramel Drizzle', price: 0.75 }
    ]
  };
  
  // This will trigger the error (but our enhanced toast will handle it safely)
  const triggerErrorToast = () => {
    toast({
      title: "Something went wrong",
      // This would normally cause an error, but our enhanced toast will handle it
      description: exampleProduct,
      variant: "destructive"
    });
  };

  // The correct way to show a product in a toast
  const showCorrectProductToast = () => {
    toast({
      title: "Product Added",
      description: `Added ${exampleProduct.name} ($${exampleProduct.price.toFixed(2)}) to cart`,
      variant: "default"
    });
  };

  // Correct way to show product with selected options
  const showProductWithOptionsToast = () => {
    const selectedSize = 'Medium';
    const selectedIceOption = 'Less Ice';
    const selectedAddons = [exampleProduct.options?.[0]];
    
    const sizePrice = exampleProduct.sizePrices?.[selectedSize] || exampleProduct.price;
    const addonPrice = selectedAddons.reduce((total, addon) => total + (addon?.price || 0), 0);
    const totalPrice = sizePrice + addonPrice;
    
    toast({
      title: "Customized Product Added",
      description: (
        <div className="space-y-1">
          <p><strong>{exampleProduct.name}</strong> - ${totalPrice.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Size: {selectedSize} | Ice: {selectedIceOption}</p>
          {selectedAddons.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Add-ons: {selectedAddons.map(addon => addon?.name).join(', ')}
            </p>
          )}
        </div>
      ),
      variant: "default"
    });
  };

  return (
    <ErrorBoundary>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-primary" />
            Toast Notification Examples
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-md text-amber-800 dark:text-amber-300 text-sm">
            <div className="flex items-start">
              <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error Example:</p>
                <code className="text-xs bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">
                  {'toast({ description: product })'}
                </code>
                <p className="mt-1 text-xs">Error: "Objects are not valid as a React child"</p>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-green-50 dark:bg-green-950 rounded-md text-green-800 dark:text-green-300 text-sm">
            <div className="flex items-start">
              <Check className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Correct Usage:</p>
                <code className="text-xs bg-green-100 dark:bg-green-900 px-1 py-0.5 rounded">
                  {'toast({ description: `Added ${product.name} ($${product.price})` })'}
                </code>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-green-50 dark:bg-green-950 rounded-md text-green-800 dark:text-green-300 text-sm">
            <div className="flex items-start">
              <Check className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Advanced Usage (JSX in toast):</p>
                <code className="text-xs bg-green-100 dark:bg-green-900 px-1 py-0.5 rounded whitespace-pre-wrap">
                  {'toast({\n  description: (\n    <div>\n      <p><strong>{product.name}</strong></p>\n      <p className="text-xs">Size: {size} | Ice: {iceOption}</p>\n    </div>\n  )\n})'}
                </code>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button 
              variant="destructive" 
              onClick={triggerErrorToast}
              className="w-full"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Show Error Toast
            </Button>
            
            <Button 
              variant="default" 
              onClick={showCorrectProductToast}
              className="w-full"
            >
              <Check className="h-4 w-4 mr-2" />
              Show Correct Toast
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            onClick={showProductWithOptionsToast}
            className="w-full"
          >
            <Coffee className="h-4 w-4 mr-2" />
            Show Product with Options
          </Button>
        </CardFooter>
      </Card>
    </ErrorBoundary>
  );
};
