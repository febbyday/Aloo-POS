import { apiClient } from '../../../lib/api/api-config';
import type { Customer, LoyaltyProgram } from '../types';

/**
 * Data Aseusig Service
 * 
 * This service handles integration with the Data Aseusig API for loyalty program management.
 * 
 * Note: API-specific configuration will be added once we have the API details
 */

class DataAseusigService {
  private baseUrl: string;
  private apiKey: string | null = null;

  constructor() {
    this.baseUrl = '/api/data-aseusig/v1';
  }

  /**
   * Initialize service with API credentials
   */
  setApiCredentials(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Sync customer data with Data Aseusig
   */
  async syncCustomer(customer: Customer): Promise<void> {
    if (!this.apiKey) {
      throw new Error('Data Aseusig API credentials not configured');
    }

    try {
      await apiClient.post(`${this.baseUrl}/customers`, {
        body: JSON.stringify(this.mapCustomerToAseusigFormat(customer)),
        headers: this.getAuthHeaders()
      });
    } catch (error) {
      console.error('Failed to sync customer with Data Aseusig:', error);
      throw error;
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
      const response = await apiClient.get(`${this.baseUrl}/loyalty/${customerId}`, {
        headers: this.getAuthHeaders()
      });
      
      return this.mapAseusigLoyaltyToLocalFormat(response);
    } catch (error) {
      console.error('Failed to fetch loyalty program:', error);
      throw error;
    }
  }

  private getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  private mapCustomerToAseusigFormat(customer: Customer): any {
    // TODO: Implement proper mapping once we have API details
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone
    };
  }

  private mapAseusigLoyaltyToLocalFormat(response: any): LoyaltyProgram {
    // TODO: Implement proper mapping once we have API details
    return {
      points: response.points || 0,
      tier: response.tier || 'basic',
      rewards: response.rewards || []
    };
  }
}

export const dataAseusigService = new DataAseusigService();
