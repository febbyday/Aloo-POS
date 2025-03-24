/**
 * Hooks Barrel Export
 * 
 * This file exports all custom hooks to simplify imports.
 * Re-exports from other locations to provide a unified hooks API.
 */

// Re-export useToast from the UI components
export { useToast } from '@/components/ui/use-toast';

// Export the useConfirm hook
export { useConfirmDialog as useConfirm } from './useConfirmDialog';

// Export other hooks that might be used across the application
// Add more hooks as needed 