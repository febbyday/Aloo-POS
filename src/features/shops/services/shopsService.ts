/**
 * Shops Service
 *
 * This service handles API calls and data operations for the shops feature.
 * Uses the enhanced API client and endpoint registry for improved error handling and consistency.
 */

import { z } from 'zod';
import { enhancedApiClient } from '@/lib/api/enhanced-api-client';
import { getApiUrl } from '@/lib/api/enhanced-config';

// Import types from the shared schema
import {
  Shop,
  shopSchema,
  createShopSchema,
  updateShopSchema,
  CreateShopInput as SharedCreateShopInput,
  UpdateShopInput as SharedUpdateShopInput
} from '../types';

// Request trackers for cancellation
const requestControllers: { [key: string]: AbortController } = {};

// Using the shared schema for validation
const shopSchemaTyped = shopSchema as z.ZodType<Shop>;
const shopSchemaArrayTyped = shopSchema.array() as z.ZodType<Shop[]>;

// Type aliases for compatibility with existing code
export type CreateShopInput = SharedCreateShopInput;
export type UpdateShopInput = SharedUpdateShopInput;

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
  getApiUrl: () => getApiUrl('shops', 'LIST'),

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
      const apiUrl = getApiUrl('shops', 'LIST');
      console.log(`Fetching shops from ${apiUrl}`);

      // Use the enhanced API client
      const response = await enhancedApiClient.get('shops/LIST', undefined, {
        signal: controller.signal
      });

      // If the response is already in the expected format
      if (response && response.shops) {
        // Then validate the shops array with our shop schema
        const shops = shopSchemaArrayTyped.parse(response.shops);

        // Request completed successfully, remove the controller
        delete requestControllers[requestId];

        return shops;
      }

      // If the response is just an array of shops
      if (Array.isArray(response)) {
        const shops = shopSchemaArrayTyped.parse(response);

        // Request completed successfully, remove the controller
        delete requestControllers[requestId];

        return shops;
      }

      // Request completed successfully, remove the controller
      delete requestControllers[requestId];

      // Fallback case - return empty array
      console.warn('Unexpected response format from shops API:', response);
      return [];
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
      // Use the enhanced API client with the DETAIL endpoint
      const [response, error] = await enhancedApiClient.safe(() =>
        enhancedApiClient.get('shops/DETAIL', { id }, {
          signal: controller.signal
        })
      );

      // Handle 404 or other errors
      if (error || !response) {
        if (error && error.message.includes('404')) {
          return null;
        }

        if (error) {
          throw error;
        }

        return null;
      }

      // Validate the response with our schema
      const result = shopSchemaTyped.parse(response);

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
  create: async (data: CreateShopInput): Promise<Shop> => {
    // Generate a unique requestId for each shop creation to prevent conflicts
    const uniqueRequestId = `createShop_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    cancelExistingRequest(uniqueRequestId);

    const controller = new AbortController();
    requestControllers[uniqueRequestId] = controller;

    try {
      // Validate the input data with the createShopSchema
      const validatedData = createShopSchema.parse(data);

      console.log(`Creating shop "${data.name}" with unique requestId: ${uniqueRequestId}`);

      // Use the enhanced API client with the CREATE endpoint
      const response = await enhancedApiClient.post('shops/CREATE', validatedData, undefined, {
        signal: controller.signal
      });

      console.log("Create shop response:", response);

      // Validate with schema
      return shopSchemaTyped.parse(response);
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
      const validatedData = updateShopSchema.parse(data);

      console.log(`Updating shop ${id} with data:`, JSON.stringify(validatedData, null, 2));

      // Use the enhanced API client with the UPDATE endpoint
      const response = await enhancedApiClient.patch('shops/UPDATE', validatedData, { id }, {
        signal: controller.signal
      });

      console.log("Update shop response:", response);

      // Validate with schema
      return shopSchemaTyped.parse(response);
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
      // Use the enhanced API client with the DELETE endpoint
      await enhancedApiClient.delete('shops/DELETE', { id }, {
        signal: controller.signal
      });

      // If no error was thrown, the operation was successful
      return true;
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
