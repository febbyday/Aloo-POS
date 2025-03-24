/**
 * Product Form Adapter
 * 
 * This component adapts our new ProductForm component to work with legacy pages.
 * It handles the conversion between different product data formats and form handling approaches.
 */

import React, { useState, useEffect } from 'react';
import { ProductForm } from './ProductForm';
import { UnifiedProduct, ProductFormData } from '../types/unified-product.types';
import { Product } from '../types/product.types';

interface ProductFormAdapterProps {
  // Legacy product data
  product?: Product;
  // Legacy callbacks
  onSubmit?: (data: any) => Promise<void>;
  onCancel?: () => void;
  onSuccess?: (product: Product) => void;
  // Additional props
  isEdit?: boolean;
  className?: string;
}

/**
 * Converts a legacy Product to the new UnifiedProduct format
 */
const convertToUnifiedProduct = (product?: Product): UnifiedProduct | undefined => {
  if (!product) return undefined;
  
  // Map the legacy product fields to the new unified format
  return {
    id: product.id,
    name: product.name,
    description: product.description || '',
    shortDescription: product.shortDescription || '',
    category: product.category || '',
    productType: product.productType || 'simple',
    status: product.status || 'active',
    retailPrice: product.retailPrice || 0,
    salePrice: product.salePrice,
    costPrice: product.costPrice,
    stock: product.stock || 0,
    minStock: product.minStock || 0,
    maxStock: product.maxStock || 0,
    sku: product.sku || '',
    barcode: product.barcode || '',
    manageStock: product.trackInventory !== false,
    stockStatus: product.stockStatus || 'in_stock',
    featured: product.featured || false,
    onSale: product.onSale || false,
    weight: product.weight,
    dimensions: product.dimensions || { length: 0, width: 0, height: 0 },
    tags: product.tags || [],
    images: product.images || [],
    variants: product.variants || [],
    // Add any other fields needed
  };
};

/**
 * Converts a UnifiedProduct back to the legacy Product format
 */
const convertToLegacyProduct = (unifiedProduct: UnifiedProduct): Product => {
  return {
    id: unifiedProduct.id || '',
    name: unifiedProduct.name,
    description: unifiedProduct.description,
    shortDescription: unifiedProduct.shortDescription,
    category: unifiedProduct.category,
    productType: unifiedProduct.productType,
    status: unifiedProduct.status,
    retailPrice: unifiedProduct.retailPrice,
    salePrice: unifiedProduct.salePrice,
    costPrice: unifiedProduct.costPrice,
    stock: unifiedProduct.stock,
    minStock: unifiedProduct.minStock,
    maxStock: unifiedProduct.maxStock,
    sku: unifiedProduct.sku,
    barcode: unifiedProduct.barcode,
    trackInventory: unifiedProduct.manageStock,
    stockStatus: unifiedProduct.stockStatus,
    featured: unifiedProduct.featured,
    onSale: unifiedProduct.onSale,
    weight: unifiedProduct.weight,
    dimensions: unifiedProduct.dimensions,
    tags: unifiedProduct.tags,
    images: unifiedProduct.images,
    variants: unifiedProduct.variants,
    // Map any other fields needed
  };
};

/**
 * ProductFormAdapter component
 */
export const ProductFormAdapter: React.FC<ProductFormAdapterProps> = ({
  product,
  onSubmit,
  onCancel,
  onSuccess,
  isEdit = false,
  className,
}) => {
  const [unifiedProduct, setUnifiedProduct] = useState<UnifiedProduct | undefined>(
    convertToUnifiedProduct(product)
  );
  
  // Update unified product when legacy product changes
  useEffect(() => {
    setUnifiedProduct(convertToUnifiedProduct(product));
  }, [product]);
  
  // Handle form submission
  const handleFormSubmit = async (data: UnifiedProduct) => {
    if (onSubmit) {
      // Convert back to legacy format for the legacy onSubmit handler
      const legacyProduct = convertToLegacyProduct(data);
      await onSubmit(legacyProduct);
      
      // Call onSuccess if provided
      if (onSuccess) {
        onSuccess(legacyProduct);
      }
      
      return true;
    }
    return false;
  };
  
  return (
    <ProductForm
      product={unifiedProduct}
      onSuccess={handleFormSubmit}
      onCancel={onCancel}
      className={className}
    />
  );
};

export default ProductFormAdapter; 