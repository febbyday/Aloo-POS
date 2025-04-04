/**
 * UI Components Barrel Export
 * 
 * This file exports all UI components from the UI directory to simplify imports.
 * Instead of importing each component individually, you can import them all from '@/components/ui'.
 */

// Export all UI components
export * from './accordion';
export * from './alert';
export * from './alert-dialog';
export * from './avatar';
export * from './badge';
export * from './button';
export * from './button-group';
export * from './calendar';
export * from './card';
export * from './checkbox';
export * from './command';
export * from './combobox';
export * from './dialog';
export * from './dropdown-menu';
export * from './form';
export * from './input';
export * from './label';
export * from './pagination';
export * from './popover';
export * from './progress';
export * from './radio-group';
export * from './scroll-area';
export * from './select';
export * from './separator';
export * from './skeleton';
export * from './slider';
export * from './switch';
export * from './tabs';
export * from './textarea';
export * from './toast';
export * from './toaster';
export * from './tooltip';
export * from './breadcrumb';

// Export custom components
export * from './action-feedback';
export * from './charts';
export * from './custom-calendar';
export * from './date-range-picker';
export * from './error-display';
export * from './help-tooltip';
export * from './image';
export * from './loading-state';
export * from './shared-table-styles';

// Table components
export * from './table';

// Re-export from folders with index files
export * from './toolbar';

// File upload components 
export * from './file-upload';
export * from './file-upload-container';
export * from './file-list';
export * from './file-preview';

// For components that might have hooks, export those as well
export { useToast } from './use-toast'; 