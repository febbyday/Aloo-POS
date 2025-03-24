/**
 * Products Module
 * 
 * This module provides functionality for managing products in the POS system.
 * It includes components, hooks, services, and utilities for product management.
 */

// Export types
export * from './types';

// Export hooks
export * from './hooks';

// Export services
export * from './services';

// Export store
export * from './store';

// Export components
export * from './components';

// Export pages
export * from './pages';

// Export events
export * from './events';

// Export utilities
export * from './utils';

/**
 * Products Module Public API
 * 
 * This file defines the public interface for the Products module.
 * Only export what is explicitly intended to be used by other modules.
 */

// Re-export types that are part of the public interface
import {
  Product,
  ProductCategory,
  ProductVariant,
  ProductVariantOption,
  ProductFormData,
  ProductWithVariants,
  ProductSchema,
  ProductCategorySchema,
  ProductVariantSchema,
} from './types/product.types';

// Re-export hooks for external use
import { useProduct } from './hooks/useProduct';
import { useProductCategories } from './hooks/useProductCategories';
import { useProductVariants } from './hooks/useProductVariants';

// Re-export context providers
import { ProductProvider, useProductContext } from './context/ProductContext';
import { ProductCategoryProvider, useProductCategoryContext } from './context/CategoryContext';

// Re-export service interfaces
import { productService } from './services/productService';
import { categoryService } from './services/categoryService';

// Re-export public components (only those meant to be used outside the module)
import { ProductSelector } from './components/ProductSelector';
import { ProductCard } from './components/ProductCard';
import { ProductImage } from './components/ProductImage';
import { CategoryBadge } from './components/CategoryBadge';

// Re-export events
import { PRODUCT_EVENTS } from './events';

/**
 * Public API for the Products module
 */
export {
  // Types
  Product,
  ProductCategory,
  ProductVariant,
  ProductVariantOption,
  ProductFormData,
  ProductWithVariants,
  ProductSchema,
  ProductCategorySchema,
  ProductVariantSchema,
  
  // Hooks
  useProduct,
  useProductCategories,
  useProductVariants,
  
  // Context
  ProductProvider,
  useProductContext,
  ProductCategoryProvider,
  useProductCategoryContext,
  
  // Services
  productService,
  categoryService,
  
  // Components
  ProductSelector,
  ProductCard,
  ProductImage,
  CategoryBadge,
  
  // Events
  PRODUCT_EVENTS,
};

/**
 * Initialization function for the Products module
 * This should be called during application startup
 */
export const initializeProductsModule = () => {
  console.log('Products module initialized');
  
  // Initialize the product integration
  const { initializeProductIntegration } = require('./components');
  initializeProductIntegration();
};
