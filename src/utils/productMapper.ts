/**
 * Product Mapper Utility
 * 
 * This utility provides functions to map between different Product types in the application.
 * It helps resolve type incompatibilities between modules while we work toward type standardization.
 */

import { Product as FeatureProduct } from '@/features/products/types';
import { Product as InventoryProduct } from '@/types/inventory';

/**
 * Maps a Product from the features/products module to the inventory Product type
 */
export function mapFeatureProductToInventoryProduct(product: FeatureProduct): InventoryProduct {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    description: product.description,
    sku: product.sku,
    barcode: product.barcode,
    costPrice: product.costPrice,
    retailPrice: product.retailPrice,
    supplier: product.supplier,
    minStock: product.minStock,
    maxStock: product.maxStock,
    locations: product.locations,
    variants: product.variants.map(variant => ({
      id: variant.id,
      sku: variant.sku,
      barcode: variant.barcode || undefined,
      size: variant.size,
      color: variant.color,
      style: variant.style,
      costPrice: variant.costPrice,
      retailPrice: variant.retailPrice,
      locations: [],
      stock: variant.stock,
      createdAt: new Date(product.createdAt),
      updatedAt: new Date(product.updatedAt)
    })),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    
    // Default values for required WooCommerce fields
    productType: 'simple',
    status: 'publish',
    featured: false,
    catalogVisibility: 'visible',
    taxStatus: 'taxable',
    taxClass: '',
    downloadable: false,
    virtual: false,
    manageStock: true,
    stockStatus: 'instock',
    backorders: 'no',
    backordersAllowed: false,
    soldIndividually: false,
    reviewsAllowed: true,
    averageRating: 0,
    ratingCount: 0,
    relatedIds: [],
    upsellIds: [],
    crossSellIds: [],
    parentId: '',
    purchasePrice: product.costPrice,
    regularPrice: product.retailPrice,
    categories: [{ id: product.category, name: product.category, slug: product.category.toLowerCase().replace(/\s+/g, '-') }],
    tags: [],
    wcStatus: 'pending',
  };
}

/**
 * Maps an array of feature Products to inventory Products
 */
export function mapFeatureProductsToInventoryProducts(products: FeatureProduct[]): InventoryProduct[] {
  return products.map(mapFeatureProductToInventoryProduct);
}

/**
 * Maps a Product from the inventory module to the features/products Product type
 */
export function mapInventoryProductToFeatureProduct(product: InventoryProduct): FeatureProduct {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    description: product.description || '',
    sku: product.sku,
    barcode: product.barcode || '',
    costPrice: product.costPrice,
    retailPrice: product.retailPrice,
    supplier: product.supplier,
    minStock: product.minStock,
    maxStock: product.maxStock,
    locations: product.locations,
    variants: product.variants.map(variant => ({
      id: variant.id,
      productId: product.id,
      sku: variant.sku,
      barcode: variant.barcode || '',
      size: variant.size,
      color: variant.color,
      style: variant.style,
      costPrice: variant.costPrice || product.costPrice,
      retailPrice: variant.retailPrice || product.retailPrice,
      stock: variant.stock,
      isActive: true
    })),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  };
}

/**
 * Maps an array of inventory Products to feature Products
 */
export function mapInventoryProductsToFeatureProducts(products: InventoryProduct[]): FeatureProduct[] {
  return products.map(mapInventoryProductToFeatureProduct);
} 