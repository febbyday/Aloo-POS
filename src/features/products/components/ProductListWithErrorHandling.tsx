/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * 
 * ProductListWithErrorHandling Component
 * 
 * This component demonstrates the implementation of the error handling and retry system
 * in a real-world component that fetches and displays product data.
 */

import React, { useState } from 'react';
import { useApiCall } from '@/lib/hooks/useApiCall';
import enhancedProductService from '../services/enhancedProductService';
import { Product, ProductFilter } from '../types/product.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiErrorType } from '@/lib/api/error-handler';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';

const ProductListWithErrorHandling: React.FC = () => {
  const [filter, setFilter] = useState<ProductFilter>({
    sortBy: 'name',
    sortDirection: 'asc',
    limit: 10,
    page: 1
  });
  
  // Use our useApiCall hook with the enhanced product service
  const {
    execute: fetchProducts,
    loading,
    data: products,
    error,
    reset
  } = useApiCall<Product[]>(
    () => enhancedProductService.getAllProducts(filter),
    {
      autoExecuteOnMount: true,
      autoRetry: {
        maxRetries: 3,
        shouldRetry: (error) => {
          // Only retry network or server errors
          return [ApiErrorType.NETWORK, ApiErrorType.SERVER, ApiErrorType.TIMEOUT].includes(error.type);
        },
        onRetry: (error, attempt) => {
          console.log(`Retrying product fetch, attempt ${attempt}/${3}`, error.message);
        }
      },
      dependencies: [filter],
      cacheKey: `products-${JSON.stringify(filter)}`,
      invalidationTimeout: 2 * 60 * 1000, // 2 minutes cache
      onError: (error) => {
        console.error('Error fetching products:', error.getUserMessage());
      }
    }
  );
  
  // Retry manually on button click
  const handleRetry = () => {
    fetchProducts();
  };
  
  // Render error state component
  const renderError = () => {
    if (!error) return null;
    
    let title = 'Error';
    let description = error.getUserMessage();
    
    // Customize based on error type
    switch (error.type) {
      case ApiErrorType.NETWORK:
        title = 'Connection Error';
        break;
      case ApiErrorType.AUTHORIZATION:
        title = 'Access Denied';
        break;
      case ApiErrorType.AUTHENTICATION:
        title = 'Authentication Required';
        break;
      case ApiErrorType.VALIDATION:
        title = 'Invalid Request';
        break;
      case ApiErrorType.SERVER:
        title = 'Server Error';
        break;
    }
    
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          {description}
          <div className="mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </>
              )}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  };
  
  // Loading skeleton
  const renderSkeleton = () => {
    return Array(5).fill(null).map((_, index) => (
      <Card key={`skeleton-${index}`} className="mb-2">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-8 w-24" />
        </CardFooter>
      </Card>
    ));
  };
  
  // Render products
  const renderProducts = () => {
    if (!products || products.length === 0) {
      return (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No products found. Try adjusting your filters.
          </CardContent>
        </Card>
      );
    }
    
    return products.map(product => (
      <Card key={product.id} className="mb-4">
        <CardHeader>
          <CardTitle>{product.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-2">
            {product.description || product.shortDescription || 'No description available'}
          </p>
          <p className="font-bold">
            ${product.retailPrice.toFixed(2)}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-500">
            Category: {product.category}
          </div>
          <Button size="sm">View Details</Button>
        </CardFooter>
      </Card>
    ));
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Products</h2>
        <Button 
          variant="outline" 
          onClick={handleRetry} 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </div>
      
      {renderError()}
      
      <div className="grid gap-4">
        {loading && !products ? renderSkeleton() : renderProducts()}
      </div>
    </div>
  );
};

export default ProductListWithErrorHandling;
