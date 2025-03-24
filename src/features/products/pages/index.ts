/**
 * Products Pages
 * 
 * This module exports page components for the products feature.
 */

// Export new refactored pages
export { default as ProductPage } from './ProductPage';
export { default as ProductFormPage } from './ProductFormPage';
export { default as ProductDetailsPage } from './ProductDetailsPage';

// Export category and inventory pages
export { default as CategoriesPage } from './CategoriesPage';
export { default as PrintLabelsPage } from './PrintLabelsPage';
export { default as LowStockAlertsPage } from './LowStockAlertsPage';
export { default as StockTransferPage } from './StockTransferPage';
export { default as StockHistoryPage } from './StockHistoryPage';
export { default as CreateTransferPage } from './CreateTransferPage';
export { default as EditTransferPage } from './EditTransferPage';
export { default as PricingPage } from './PricingPage';

// Deprecated pages (to be removed after refactoring)
/**
 * @deprecated Use ProductPage instead
 */
export { default as ProductsPage } from './ProductsPage';

/**
 * @deprecated Use ProductFormPage instead
 */
export { default as ProductAddPage } from './ProductAddPage';

/**
 * @deprecated Use ProductFormPage instead
 */
export { default as ProductEditPage } from './ProductEditPage';
