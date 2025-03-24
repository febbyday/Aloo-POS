/**
 * @deprecated Use types from unified-product.types.ts instead
 * This interface will be removed in a future version
 */
export interface Product {
  id: string;
  name: string;
  description?: string;
  shortDescription?: string;
  sku: string;
  barcode?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  supplier?: {
    id: string;
    name: string;
  };
  images: string[];
  gallery?: string[];
  productType: 'simple' | 'variable';
  attributes?: ProductAttribute[];
  variations?: ProductVariation[];
  retailPrice: number;
  salePrice?: number;
  costPrice?: number;
  stock: number;
  minStock?: number;
  maxStock?: number;
  status: 'active' | 'inactive' | 'draft';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  isTemporary?: boolean;
}

/**
 * @deprecated Use ProductAttribute from unified-product.types.ts instead
 * This interface will be removed in a future version
 */
export interface ProductAttribute {
  id: string;
  name: string;
  options: string[];
}

/**
 * @deprecated Use ProductVariation from unified-product.types.ts instead
 * This interface will be removed in a future version
 */
export interface ProductVariation {
  id: string;
  attributes: Record<string, string>;
  sku: string;
  barcode?: string;
  retailPrice: number;
  salePrice?: number;
  costPrice?: number;
  stock: number;
  minStock?: number;
  maxStock?: number;
}

/**
 * @deprecated Use ProductLocation from unified-product.types.ts instead
 * This interface will be removed in a future version
 */
export interface ProductLocation {
  id: string;
  name: string;
  type: 'store' | 'warehouse';
  stock: number;
}

/**
 * @deprecated Use InventoryFilter from unified-product.types.ts instead
 * This interface will be removed in a future version
 */
export interface InventoryFilter {
  category?: string;
  brand?: string;
  supplier?: string;
  status?: 'active' | 'inactive' | 'draft';
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  maxStock?: number;
  tags?: string[];
}

/**
 * @deprecated Use Location from unified-product.types.ts instead
 * This interface will be removed in a future version
 */
export interface Location {
  id: string;
  name: string;
  type: 'store' | 'warehouse';
  address?: string;
  contact?: string;
}

// Export all types from unified-product.types.ts
export * from './unified-product.types';

// Export types from product.types.ts with deprecation notice
export * from './product.types';

// Export types from category.ts
export * from './category';
