// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useSafeRender } from '@/hooks/useSafeRender';
import { ErrorBoundary } from '@/components/unified-error-boundary';
import { Coffee, IceCream, AlertCircle, Check } from 'lucide-react';

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
 * Component that demonstrates how to safely render product objects
 * with customization options like size and ice level
 */
export const ProductRenderer: React.FC = () => {
  const { renderSafely, renderObjectProperty } = useSafeRender();
  
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
  
  // Function to demonstrate the error
  const showErrorExample = () => {
    toast({
      variant: "destructive",
      title: "Something went wrong",
      description: "Objects are not valid as a React child (found: object with keys {id, name, description}). If you meant to render a collection of children, use an array instead.",
    });
  };
  
  // Function to demonstrate the correct way
  const showCorrectExample = () => {
    toast({
      title: "Correct Usage",
      description: "Product properties rendered safely",
      variant: "default",
    });
  };

  return (
    <ErrorBoundary>
      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Rendering Example</CardTitle>
            <CardDescription>
              How to safely render product objects with customization options
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-primary" />
              <h3 className="font-medium">{renderObjectProperty(exampleProduct, 'name')}</h3>
              <Badge variant="outline" className="ml-auto">
                {renderObjectProperty(exampleProduct, 'category')}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {renderObjectProperty(exampleProduct, 'description')}
            </p>
            
            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold">
                ${renderObjectProperty(exampleProduct, 'price')}
              </div>
              <Badge variant={exampleProduct.stockQuantity && exampleProduct.stockQuantity > 0 ? "success" : "destructive"}>
                {exampleProduct.stockQuantity && exampleProduct.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>
            
            {/* Size Options - Safely Rendered */}
            {exampleProduct.sizeOptions && exampleProduct.sizeOptions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Size Options</h4>
                <div className="flex flex-wrap gap-2">
                  {exampleProduct.sizeOptions.map(size => (
                    <Badge key={size} variant="secondary">
                      {size} {exampleProduct.sizePrices?.[size] ? `($${exampleProduct.sizePrices[size].toFixed(2)})` : ''}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Ice Options - Safely Rendered */}
            {exampleProduct.iceOptions && exampleProduct.iceOptions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Ice Options</h4>
                <div className="flex flex-wrap gap-2">
                  {exampleProduct.iceOptions.map(option => (
                    <Badge key={option} variant="outline" className="flex items-center gap-1">
                      <IceCream className="h-3 w-3" />
                      {option}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Product Options - Safely Rendered */}
            {exampleProduct.options && exampleProduct.options.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Add-ons</h4>
                <div className="space-y-2">
                  {exampleProduct.options.map(option => (
                    <div key={option.id} className="flex justify-between items-center text-sm">
                      <span>{renderObjectProperty(option, 'name')}</span>
                      {option.price && <span>${option.price.toFixed(2)}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            <div className="w-full p-3 bg-amber-50 dark:bg-amber-950 rounded-md text-amber-800 dark:text-amber-300 text-sm">
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium">Common Error:</p>
                  <code className="text-xs bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">
                    {'<div>{product}</div> /* This causes the error */'}
                  </code>
                </div>
              </div>
            </div>
            
            <div className="w-full p-3 bg-green-50 dark:bg-green-950 rounded-md text-green-800 dark:text-green-300 text-sm">
              <div className="flex items-start">
                <Check className="h-4 w-4 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium">Correct Usage:</p>
                  <code className="text-xs bg-green-100 dark:bg-green-900 px-1 py-0.5 rounded">
                    {'<div>{renderObjectProperty(product, "name")}</div>'}
                  </code>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between w-full mt-2">
              <Button variant="destructive" size="sm" onClick={showErrorExample}>
                Show Error Toast
              </Button>
              <Button variant="default" size="sm" onClick={showCorrectExample}>
                Show Correct Usage
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </ErrorBoundary>
  );
};
