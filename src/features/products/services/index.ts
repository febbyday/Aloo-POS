/**
 * Product Services Index
 *
 * This file exports all product-related services for use throughout the application.
 * It provides a centralized point for accessing product functionality.
 */

// Export the main product service
export { productService } from './productService';

// Export other product-related services
export { default as stockAlerts } from './stockAlerts';

// Export deprecated services with warnings
/**
 * @deprecated Use productService from './productService' instead
 */
export { default as productsService } from './productsService';
