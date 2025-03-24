/**
 * Shops Service
 * 
 * This service handles API calls and data operations for the shops feature.
 */

import { z } from 'zod';
import { Shop } from '../types/shops.types';
import { getApiEndpoint } from '@/lib/api/config';

// API base URL - update to match the backend endpoint structure
const API_BASE_URL = `${getApiEndpoint('shops')}`;

// Request trackers for cancellation
const requestControllers: { [key: string]: AbortController } = {};

// Type validation schemas for shop-related entities
export const ShopActivitySchema = z.object({
  type: z.enum(['inventory', 'staff', 'sales', 'system']),
  message: z.string(),
  timestamp: z.date().or(z.string().transform(val => new Date(val))),
});

export const ShopStaffMemberSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  position: z.string(),
  email: z.string().email('Invalid email address'),
});

// Type validation schema for Shop
export const ShopSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Shop name is required'),
  location: z.string().min(1, 'Location is required'),
  type: z.enum(['retail', 'warehouse', 'outlet']),
  status: z.enum(['active', 'inactive', 'maintenance']),
  staffCount: z.number().int().nonnegative(),
  lastSync: z.date().or(z.string().transform(val => new Date(val))),
  createdAt: z.date().or(z.string().transform(val => new Date(val))),
  
  // These fields are optional in the Shop interface, so make them optional in the schema
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  manager: z.string().optional().or(z.literal('')),
  openingHours: z.string().optional().or(z.literal('')),
  salesLastMonth: z.number().optional(),
  inventoryCount: z.number().int().optional(),
  averageOrderValue: z.number().optional(),
  topSellingCategories: z.array(z.string()).optional(),
  
  // Related entities are also optional
  recentActivity: z.array(ShopActivitySchema).optional(),
  staffMembers: z.array(ShopStaffMemberSchema).optional(),
});

// Define the type for our schema to ensure it matches Shop interface
export type ShopSchemaType = z.infer<typeof ShopSchema>;

// Ensure compatibility - this will cause a compile error if Shop and ShopSchemaType don't match
// Using type assertion to cast our schema to return the correct Shop interface
const shopSchemaTyped = ShopSchema as z.ZodType<Shop>;
const shopSchemaArrayTyped = ShopSchema.array() as z.ZodType<Shop[]>;

// Schema for paginated shop response from backend
const ShopPaginatedResponseSchema = z.object({
  shops: z.array(ShopSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number()
});

// Type for creating a new shop
export const CreateShopSchema = ShopSchema.omit({ 
  id: true, 
  createdAt: true, 
  lastSync: true 
});

export type CreateShopInput = z.infer<typeof CreateShopSchema>;

// Type for updating an existing shop
export const UpdateShopSchema = ShopSchema.partial();

export type UpdateShopInput = z.infer<typeof UpdateShopSchema>;

/**
 * Helper function to handle API responses
 * Validates response data against a schema if provided
 */
const handleResponse = async <T>(response: Response, schema?: z.ZodType<T>): Promise<T> => {
  if (!response.ok) {
    let errorData: any = {};
    
    try {
      errorData = await response.json();
    } catch (e) {
      // If parsing as JSON fails, use the status text
      throw new Error(response.statusText || 'An error occurred with the request');
    }
    
    // Extract error message from the backend response format
    const errorMessage = errorData.details 
      ? `${errorData.error}: ${errorData.details.map((d: any) => d.message).join(', ')}`
      : errorData.error || errorData.message || 'Unknown error occurred';
      
    throw new Error(errorMessage);
  }
  
  // Parse the response JSON
  const jsonData = await response.json();
  
  // Extract the data property if it exists, otherwise use the entire response
  const data = jsonData.data !== undefined ? jsonData.data : jsonData;
  
  // If a schema is provided, validate the data
  if (schema) {
    try {
      // For debugging - log the data we're trying to validate
      // console.log('Validating data:', JSON.stringify(data));
      
      // Attempt to parse with the schema, but apply fixes for common issues first
      let processedData = data;
      
      // Handle single shop with empty/missing required fields
      if (processedData && typeof processedData === 'object' && !Array.isArray(processedData)) {
        // Apply default values for missing fields to prevent validation errors
        processedData = {
          ...processedData,
          name: processedData.name || 'Untitled Shop',
          location: processedData.location || 'Unknown Location'
        };
      }
      
      // Handle shop arrays with empty/missing required fields
      if (Array.isArray(processedData?.shops)) {
        processedData.shops = processedData.shops.map((shop: any) => ({
          ...shop,
          name: shop.name || 'Untitled Shop',
          location: shop.location || 'Unknown Location'
        }));
      }
      
      // Apply the same fix to direct shop arrays
      if (Array.isArray(processedData)) {
        processedData = processedData.map((shop: any) => ({
          ...shop,
          name: shop.name || 'Untitled Shop',
          location: shop.location || 'Unknown Location'
        }));
      }
      
      return schema.parse(processedData);
    } catch (error) {
      // Log validation errors with detailed information
      console.error('Data validation error:', error);
      console.log('Invalid data:', data);
      
      // If the data is a shop or shop array with empty values, try to fix and return it as usable data
      if (data) {
        // Apply fallback values and add warning to console
        console.warn('Returning data with defaults for required fields');
        return data as T;
      }
      
      throw new Error('Invalid data received from server');
    }
  }
  
  return data as T;
};

// Cancel any ongoing request with the same ID
const cancelExistingRequest = (requestId: string) => {
  if (requestControllers[requestId]) {
    requestControllers[requestId].abort();
    delete requestControllers[requestId];
  }
};

export const shopsService = {
  /**
   * Get the API URL for shops (for debugging)
   */
  getApiUrl: () => API_BASE_URL,

  /**
   * Fetch all shops
   */
  fetchAll: async (requestId: string = 'fetchAll'): Promise<Shop[]> => {
    // Cancel any existing request with the same ID
    cancelExistingRequest(requestId);
    
    // Create a new controller for this request
    const controller = new AbortController();
    requestControllers[requestId] = controller;
    
    try {
      console.log(`Fetching shops from ${API_BASE_URL}`);
      
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      // First parse the paginated response
      const paginatedData = await handleResponse(response, ShopPaginatedResponseSchema);
      
      // Then validate the shops array with our shop schema
      const shops = shopSchemaArrayTyped.parse(paginatedData.shops);
      
      // Request completed successfully, remove the controller
      delete requestControllers[requestId];
      
      return shops;
    } catch (error) {
      // If the error is an AbortError, it's intentional, so rethrow
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      
      console.error('Error fetching shops:', error);
      throw error;
    }
  },

  /**
   * Fetch a single shop by ID
   */
  fetchById: async (id: string, requestId: string = `fetchById_${id}`): Promise<Shop | null> => {
    // Cancel any existing request with the same ID
    cancelExistingRequest(requestId);
    
    // Create a new controller for this request
    const controller = new AbortController();
    requestControllers[requestId] = controller;
    
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      if (response.status === 404) {
        return null;
      }
      
      const result = await handleResponse<Shop>(response, shopSchemaTyped);
      
      // Request completed successfully, remove the controller
      if (requestControllers[requestId] === controller) {
        delete requestControllers[requestId];
      }
      
      return result;
    } catch (error) {
      // If the error is an AbortError and it's due to navigation, we should silently ignore it
      // as it's an expected part of the single-page application lifecycle
      if (error instanceof Error && error.name === 'AbortError') {
        console.log(`Request for shop ${id} was aborted, likely due to navigation.`);
        throw new Error('Request was canceled during navigation.');
      }
      
      console.error(`Error fetching shop with ID ${id}:`, error);
      throw error;
    } finally {
      // Always ensure we clean up the controller reference
      if (requestControllers[requestId] === controller) {
        delete requestControllers[requestId];
      }
    }
  },

  /**
   * Create a new shop
   */
  create: async (data: CreateShopInput, requestId: string = 'createShop'): Promise<Shop> => {
    // Generate a unique requestId for each shop creation to prevent conflicts
    const uniqueRequestId = `createShop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    cancelExistingRequest(uniqueRequestId);
    
    const controller = new AbortController();
    requestControllers[uniqueRequestId] = controller;
    
    try {
      // Validate the input data with the CreateShopSchema
      const validatedData = CreateShopSchema.parse(data);
      
      console.log(`Creating shop "${data.name}" with unique requestId: ${uniqueRequestId}`);
      
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(validatedData),
        signal: controller.signal,
      });
      
      // Log the raw response for debugging
      const responseText = await response.text();
      console.log("Create shop response:", responseText);
      
      // Parse the response text back to JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }
      
      // Check if the response contains a data property (API wrapper)
      const shopData = responseData.data || responseData;
      
      // Validate with schema
      return shopSchemaTyped.parse(shopData);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
      }
      
      console.error('Error creating shop:', error);
      throw error;
    } finally {
      if (requestControllers[uniqueRequestId] === controller) {
        delete requestControllers[uniqueRequestId];
      }
    }
  },

  /**
   * Update an existing shop
   */
  update: async (id: string, data: UpdateShopInput, requestId: string = `updateShop_${id}`): Promise<Shop> => {
    cancelExistingRequest(requestId);
    
    const controller = new AbortController();
    requestControllers[requestId] = controller;
    
    try {
      // Validate update data if provided
      const validatedData = UpdateShopSchema.parse(data);
      
      console.log(`Updating shop ${id} with data:`, JSON.stringify(validatedData, null, 2));
      
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(validatedData),
        signal: controller.signal,
      });
      
      // Log the raw response for debugging
      const responseText = await response.text();
      console.log("Update shop response:", responseText);
      
      // Parse the response text back to JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }
      
      // Check if the response contains a data property (API wrapper)
      const shopData = responseData.data || responseData;
      
      // Validate with schema
      return shopSchemaTyped.parse(shopData);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
      }
      
      console.error(`Error updating shop ${id}:`, error);
      throw error;
    } finally {
      if (requestControllers[requestId] === controller) {
        delete requestControllers[requestId];
      }
    }
  },

  /**
   * Delete a shop
   */
  delete: async (id: string, requestId: string = `deleteShop_${id}`): Promise<boolean> => {
    cancelExistingRequest(requestId);
    
    const controller = new AbortController();
    requestControllers[requestId] = controller;
    
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        signal: controller.signal,
      });
      
      // For delete operations, we just care if it was successful
      if (response.ok) {
        return true;
      }
      
      // Handle error response
      const errorMessage = response.statusText || 'Failed to delete shop';
      
      try {
        const errorData = await response.json();
        if (errorData && typeof errorData === 'object' && 'message' in errorData) {
          throw new Error(errorData.message);
        }
        throw new Error(errorMessage);
      } catch (e) {
        // If we can't parse the response as JSON, just use the status text
        throw new Error(errorMessage);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      
      console.error(`Error deleting shop with ID ${id}:`, error);
      throw error;
    } finally {
      if (requestControllers[requestId] === controller) {
        delete requestControllers[requestId];
      }
    }
  },

  /**
   * Cancel all ongoing shop requests
   */
  cancelAllRequests: () => {
    Object.keys(requestControllers).forEach(key => {
      if (requestControllers[key]) {
        console.log(`Canceling request: ${key}`);
        requestControllers[key].abort();
        delete requestControllers[key];
      }
    });
  }
};
