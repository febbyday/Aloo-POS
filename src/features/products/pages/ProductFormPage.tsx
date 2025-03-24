/**
 * Product Form Page
 * 
 * This page provides a form for creating and editing products.
 * It uses the ProductForm component and product store.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductStore } from '../store';
import { selectProductById } from '../store/selectors';
import { ProductForm } from '../components';
import { UnifiedProduct } from '../types/unified-product.types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

/**
 * ProductFormPage component
 */
const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get product from store if editing
  const product = id ? selectProductById(id) : null;
  
  // Get store actions
  const fetchProductById = useProductStore(state => state.fetchProductById);
  
  // Fetch product if editing and not in store
  useEffect(() => {
    const loadProduct = async () => {
      if (id && !product) {
        setLoading(true);
        setError(null);
        
        try {
          await fetchProductById(id);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : `Failed to load product with ID ${id}`;
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadProduct();
  }, [id, product, fetchProductById]);
  
  // Handle form success
  const handleSuccess = (product: UnifiedProduct) => {
    // Navigate back to products list
    navigate('/products');
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigate('/products');
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/products')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
        
        <h1 className="text-3xl font-bold">
          {id ? 'Edit Product' : 'Create New Product'}
        </h1>
      </div>
      
      {/* Show loading state */}
      {loading && (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading product...</span>
        </div>
      )}
      
      {/* Show error state */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Show form when not loading or if creating new product */}
      {(!loading || !id) && (
        <ProductForm 
          product={product || undefined}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default ProductFormPage;
