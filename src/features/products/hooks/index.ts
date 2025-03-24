/**
 * Product Hooks Index
 * 
 * This file exports all product-related hooks for use throughout the application.
 */

// Export specialized hooks
export { default as useProductOperations } from './useProductOperations';
export { default as useProductFilters } from './useProductFilters';
export { default as useProductForm } from './useProductForm';

// Export legacy hooks with deprecation notices
/**
 * @deprecated Use useProductOperations, useProductFilters, and store selectors instead
 */
export { default as useProducts } from './useProducts';

/**
 * @deprecated Use specialized hooks from the store instead
 */
export { default as usePricingSettings } from './usePricingSettings';

/**
 * @deprecated Use specialized hooks from the store instead
 */
export { default as useStockAlerts } from './useStockAlerts';
