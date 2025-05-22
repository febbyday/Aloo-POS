/**
 * Toast System
 * 
 * This module provides a standardized toast notification system for the application.
 * It includes a toast service, context provider, and enhanced toaster component.
 */

// Export the toast service
export { ToastService, toast } from './toast-service';
export type { ToastType, ToastOptions } from './toast-service';

// Export the toast context provider and hook
export { ToastProvider, useToast } from './toast-context';

// Export the enhanced toaster component
export { EnhancedToaster } from './enhanced-toaster';

// Export a default object for convenience
import { ToastService } from './toast-service';
export default ToastService;
