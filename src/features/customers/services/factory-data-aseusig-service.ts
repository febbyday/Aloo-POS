/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * 
 * Factory-Based Data Aseusig Service
 * 
 * This service uses the centralized service factory and endpoint registry to provide
 * a consistent implementation of Data Aseusig integration operations with minimal duplication.
 */

import { Customer, LoyaltyProgram } from '../types';
import { createServiceMethod } from '@/lib/api/service-endpoint-factory';
import { ApiErrorType, createErrorHandler } from '@/lib/api/error-handler';
import { enhancedApiClient } from '@/lib/api/enhanced-api-client';
import { registerEndpoints } from '@/lib/api/endpoint-registry';

// Register Data Aseusig endpoints
export const DATA_ASEUSIG_ENDPOINTS = registerEndpoints('data-aseusig', {
  SYNC_CUSTOMER: { path: 'customers', requiresAuth: true, description: 'Sync customer data with Data Aseusig' },
  LOYALTY: { path: 'loyalty/:customerId', requiresAuth: true, description: 'Get loyalty program details for a customer' }
});

// Create module-specific error handler
const errorHandler = createErrorHandler('data-aseusig');

// Define retry configuration
const DATA_ASEUSIG_RETRY_CONFIG = {
  maxRetries: 2,
  retryDelay: 1000,
  shouldRetry: (error: any) => {
    // Only retry on network errors, not on validation errors
    return error.type === ApiErrorType.NETWORK || 
           error.type === ApiErrorType.TIMEOUT || 
           error.type === ApiErrorType.SERVER;
  }
};

/**
 * Factory-based Data Aseusig Service
 * 
 * This service handles integration with the Data Aseusig API for loyalty program management.
 */
class FactoryDataAseusigService {
  private apiKey: string | null = null;

  /**
   * Initialize service with API credentials
   */
  setApiCredentials(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): Record<string, string> {
    if (!this.apiKey) {
      throw new Error('Data Aseusig API credentials not configured');
    }

    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Map customer to Aseusig format
   */
  private mapCustomerToAseusigFormat(customer: Customer): any {
    // TODO: Implement proper mapping once we have API details
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone
    };
  }

  /**
   * Map Aseusig loyalty to local format
   */
  private mapAseusigLoyaltyToLocalFormat(response: any): LoyaltyProgram {
    // TODO: Implement proper mapping once we have API details
    return {
      points: response.points || 0,
      tier: response.tier || 'basic',
      rewards: response.rewards || []
    };
  }

  /**
   * Sync customer data with Data Aseusig
   */
  async syncCustomer(customer: Customer): Promise<void> {
    if (!this.apiKey) {
      throw new Error('Data Aseusig API credentials not configured');
    }

    try {
      await enhancedApiClient.post(
        'data-aseusig/SYNC_CUSTOMER',
        this.mapCustomerToAseusigFormat(customer),
        undefined,
        {
          headers: this.getAuthHeaders(),
          retry: DATA_ASEUSIG_RETRY_CONFIG
        }
      );
    } catch (error) {
      console.error('Failed to sync customer with Data Aseusig:', error);
      throw errorHandler.handleError(error, 'syncCustomer');
    }
  }

  /**
   * Get loyalty program details for a customer
   */
  async getLoyaltyProgram(customerId: string): Promise<LoyaltyProgram> {
    if (!this.apiKey) {
      throw new Error('Data Aseusig API credentials not configured');
    }

    try {
      const response = await enhancedApiClient.get(
        'data-aseusig/LOYALTY',
        { customerId },
        {
          headers: this.getAuthHeaders(),
          retry: DATA_ASEUSIG_RETRY_CONFIG
        }
      );
      
      return this.mapAseusigLoyaltyToLocalFormat(response);
    } catch (error) {
      console.error('Failed to fetch loyalty program:', error);
      throw errorHandler.handleError(error, 'getLoyaltyProgram');
    }
  }
}

// Export singleton instance
export const factoryDataAseusigService = new FactoryDataAseusigService();

// Export for backward compatibility
export default factoryDataAseusigService;
