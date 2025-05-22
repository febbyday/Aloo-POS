/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 *
 * API Module Entry Point
 *
 * This file exports the configured API client and all service instances.
 * It serves as the main entry point for API-related functionality.
 */

// Export configured API client and authentication utilities
export * from './api-config';

// Import factory-based service instances
import productService from '../../features/products/services/factory-product-service';
import customersService from '../../features/customers/services/factory-customers-service';
import suppliersService from '../../features/suppliers/services/factory-suppliers-service';
import ordersService from '../../features/orders/services/factory-orders-service';
import { shopService } from './services/shop-service';

// Re-export services for easier access
export {
  productService,
  customersService as customerService,
  suppliersService as supplierService,
  ordersService as orderService,
  shopService,
};

// Export type definitions
export type {
  ApiResponse,
  ApiError
} from './api-client';

/**
 * Service registry that provides access to all available services
 */
export const serviceRegistry = {
  products: productService,
  customers: customersService,
  suppliers: suppliersService,
  orders: ordersService,
  shops: shopService,
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

// Import debug utilities
import { initApiDebugging } from './api-debug';
import { applyApiPerformanceOptimizations } from './performance-optimizations';

// Auto-initialize the module unless disabled
if (import.meta.env.VITE_DISABLE_AUTO_API_INIT !== 'true') {
  initializeApiModule();

  // Initialize API debugging in development mode
  if (import.meta.env.MODE === 'development') {
    initApiDebugging();
  }
}

// Export additional API utilities
export * from './utils/api-helpers';

import axios from 'axios';
import { API_CONSTANTS } from './config';

// Use the centralized API configuration
const BASE_URL = API_CONSTANTS.FULL_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Enable sending cookies with cross-origin requests
  withCredentials: true,
  // Use the centralized timeout value
  timeout: API_CONSTANTS.TIMEOUT
});

// Apply performance optimizations to the API client
applyApiPerformanceOptimizations(api);

// Request interceptor for API requests
// We no longer need to manually add auth tokens as they're in HttpOnly cookies
api.interceptors.request.use((config) => {
  // No need to set Authorization header as the auth token is in HttpOnly cookies
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for handling auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Redirect to login page on authentication failure
      if (typeof window !== 'undefined') {
        window.location.href = '/login?session=expired';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
