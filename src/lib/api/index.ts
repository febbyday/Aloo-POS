/**
 * API Module Entry Point
 * 
 * This file exports the configured API client and all service instances.
 * It serves as the main entry point for API-related functionality.
 */

// Export configured API client and authentication utilities
export * from './api-config';

// Import service instances
import { productService } from './services/product-service';
import { customerService } from './services/customer-service';
import { supplierService } from './services/supplier-service';
import { orderService } from './services/order-service';

// Re-export services for easier access
export {
  productService,
  customerService,
  supplierService,
  orderService,
};

// Export type definitions
export type { 
  ApiResponse, 
  ApiError, 
  ApiPagination,
  ApiErrorDetails, 
} from './api-client';

/**
 * Service registry that provides access to all available services
 */
export const serviceRegistry = {
  products: productService,
  customers: customerService,
  suppliers: supplierService,
  orders: orderService,
};

/**
 * Initialize the API module
 * 
 * Sets up global error handling for API requests and 
 * initializes any required listeners or connections.
 * 
 * @param options - Initialization options
 */
export function initializeApiModule(options: { 
  onError?: (error: Error) => void,
  useMock?: boolean,
} = {}): void {
  // Set up global error handling if provided
  if (options.onError) {
    // Register global error handler
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && event.reason.isApiError) {
        options.onError?.(event.reason);
      }
    });
  }
  
  // Set mock mode if specified
  if (options.useMock !== undefined) {
    import('./api-config').then(({ setApiMockMode }) => {
      setApiMockMode(options.useMock!);
    });
  }
}

// Auto-initialize the module unless disabled
if (process.env.REACT_APP_DISABLE_AUTO_API_INIT !== 'true') {
  initializeApiModule();
}

// Export additional API utilities
export * from './utils/api-helpers';
