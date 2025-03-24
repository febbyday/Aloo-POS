/**
 * Product Form Adapter Example
 * 
 * This example demonstrates how to use the ProductFormAdapter in legacy pages.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductFormAdapter } from '../components';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { ArrowLeft, Save } from 'lucide-react';
import { useToastManager } from '@/components/ui/toast-manager';

/**
 * Example component showing how to use ProductFormAdapter in a legacy page
 */
export const ProductFormAdapterExample: React.FC = () => {
  const navigate = useNavigate();
  const showToast = useToastManager();
  
  // Example product data (would come from your context or API)
  const [product] = useState({
    id: 'example-product-1',
    name: 'Example Product',
    description: 'This is an example product',
    shortDescription: 'Example product',
    category: 'Examples',
    productType: 'simple',
    status: 'active',
    retailPrice: 19.99,
    costPrice: 9.99,
    stock: 100,
    sku: 'EX-001',
    barcode: '123456789',
  });
  
  /**
   * Example submit handler
   */
  const handleSubmit = async (data: any) => {
    console.log('Submitting product data:', data);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Show success message
    showToast.success('Success', 'Product updated successfully');
  };
  
  /**
   * Example cancel handler
   */
  const handleCancel = () => {
    navigate('/products');
  };
  
  /**
   * Example success handler
   */
  const handleSuccess = (product: any) => {
    console.log('Product saved successfully:', product);
    navigate('/products');
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Product Form Adapter Example"
        description="Example of using the ProductFormAdapter in a legacy page"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        }
      />
      
      {/* Use the ProductFormAdapter */}
      <ProductFormAdapter
        product={product}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onSuccess={handleSuccess}
        isEdit={true}
      />
    </div>
  );
};

export default ProductFormAdapterExample; 