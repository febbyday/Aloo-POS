/**
 * Products Components
 * 
 * This module exports all components for the products feature.
 * Components are organized following atomic design principles:
 * - atoms: Basic UI components
 * - molecules: Simple component compositions
 * - organisms: Complex UI sections
 * - templates: Page layouts
 * - pages: Complete pages with data integration
 */

// Atoms (Basic UI components)
export { StockStatusBadge } from './StockStatusBadge';
export { ProductSearch } from './ProductSearch';
export { StatsCard } from './StatsCard';
export { CategoryNameCell } from './CategoryNameCell';
export { CategoryMetricsCell } from './CategoryMetricsCell';

// Molecules (Simple component compositions)
export { ProductActions } from './ProductActions';
export { ProductFilters } from './ProductFilters';
export { CategoryFilters } from './CategoryFilters';
export { ProductImageGallery } from './ProductImageGallery';
export { AttributeMatrix } from './AttributeMatrix';
export { PriceHistoryChart } from './PriceHistoryChart';
export { StockHeatmap } from './StockHeatmap';
export { StockAlerts } from './StockAlerts';
export { categoryColumns } from './CategoryColumns';
export { CategoryForm } from './CategoryForm';
export { RelatedProducts } from './RelatedProducts';

// Organisms (Complex UI sections)
export { ProductsTable } from './ProductsTable';
export { ProductsToolbar } from './ProductsToolbar';
export { ProductVariantsManager } from './ProductVariantsManager';
export { VariantManager } from './VariantManager';
export { QuickActionsPanel } from './QuickActionsPanel';
export { CategoryBulkActions } from './CategoryBulkActions';

// Forms
export { ProductForm } from './ProductForm';
export { ProductFormAdapter } from './ProductFormAdapter';
export { ProductFormIntegration, initializeProductIntegration } from './ProductFormIntegration';

// Dialogs and Modals
export { ProductDialog } from './ProductDialog';
export { PreviewProductDialog } from './PreviewProductDialog';
export { BulkEditModal } from './BulkEditModal';
export { FilterDialog } from './FilterDialog';
export { SortDialog } from './SortDialog';
export { ColumnVisibilityDialog } from './ColumnVisibilityDialog';
export { ImportDialog } from './ImportDialog';
export { ExportDialog } from './ExportDialog';
export { ImportExportDialog } from './ImportExportDialog';
export { StockTransferDialog } from './StockTransferDialog';
export { TransferDetailsDialog } from './TransferDetailsDialog';
export { AssignCategoryDialog } from './AssignCategoryDialog';
export { AddCategoryPopup } from './AddCategoryPopup';
export { EditCategoryPopup } from './EditCategoryPopup';
export { DeleteCategoryPopup } from './DeleteCategoryPopup';

// Complex Components
export { ProductRenderer } from './ProductRenderer';
export { ProductFormWrapper } from './ProductFormWrapper';
export { ProductAddPreview, ProductEditPreview } from './ProductPreview';
export { TransferWizard } from './TransferWizard';

// Nested Component Directories
export * from './toolbars';
export * from './analytics';
export * from './pricing';
export * from './inventory';
export * from './labels';

// Pages
export { ViewProductsDialog } from './ViewProductsDialog';

// Examples and Documentation
export { ProductToastExample } from './ProductToastExample';
