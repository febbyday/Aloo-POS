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
import { shopService } from './services/shop-service';

// Re-export services for easier access
export {
  productService,
  customerService,
  supplierService,
  orderService,
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
  customers: customerService,
  suppliers: supplierService,
  orders: orderService,
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

// Auto-initialize the module unless disabled
if (process.env.REACT_APP_DISABLE_AUTO_API_INIT !== 'true') {
  initializeApiModule();
}

// Export additional API utilities
export * from './utils/api-helpers';

import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Enable sending cookies with cross-origin requests
  withCredentials: true
});

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
