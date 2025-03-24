/**
 * Loyalty Service - API Integration for Loyalty Program Management
 * 
 * This service handles all loyalty program operations, including:
 * - CRUD operations for tiers, rewards, and special events
 * - Points transactions and redemptions
 * - Loyalty program settings
 */

import { BaseService, QueryParams } from './base-service';
import { 
  LoyaltyTier, 
  LoyaltyReward, 
  LoyaltyEvent,
  LoyaltyTransaction,
  LoyaltySettings
} from '@/features/customers/types/customers.types';
import { apiClient, API_CONFIG } from '../api-config';
import { handleApiError } from '../api-client';

// Remove mock data variables and storage functions, as we'll use real APIs now

// Determine if we should use direct API access instead of going through proxy
const useDirect = import.meta.env.VITE_USE_DIRECT_API === 'true';
const apiBaseUrl = useDirect ? API_CONFIG.BACKEND_URL : '';

// Log API access strategy
console.log(`Loyalty service using ${useDirect ? 'direct backend connection' : 'proxy'} for API access`);

// Constants for API endpoints - updated to match backend routes
const API_ENDPOINTS = {
  TIERS: `${apiBaseUrl}/api/v1/loyalty/tiers`,
  REWARDS: `${apiBaseUrl}/api/v1/loyalty/rewards`,
  EVENTS: `${apiBaseUrl}/api/v1/loyalty/events`,
  TRANSACTIONS: `${apiBaseUrl}/api/v1/loyalty/transactions`,
  SETTINGS: `${apiBaseUrl}/api/v1/loyalty/settings`,
  CUSTOMER_TIERS: `${apiBaseUrl}/api/v1/loyalty/customer-tiers`,
  CUSTOMER_REWARDS: `${apiBaseUrl}/api/v1/loyalty/customer-rewards`,
  NEXT_TIER: `${apiBaseUrl}/api/v1/loyalty/next-tier`,
};

/**
 * Make API request with fallback to direct connection if proxy fails
 */
async function makeApiRequest(endpoint: string, options?: RequestInit) {
  try {
    // First try through the configured method (proxy or direct)
    const response = await fetch(endpoint, options);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error accessing endpoint ${endpoint}:`, error);
    
    // If already using direct connection, or this is not a GET request, don't retry
    if (useDirect || (options && options.method && options.method !== 'GET')) {
      throw error;
    }
    
    // Retry with direct connection if proxy failed for GET requests
    try {
      console.log(`Retry with direct connection: ${API_CONFIG.BACKEND_URL}${endpoint}`);
      const directResponse = await fetch(`${API_CONFIG.BACKEND_URL}${endpoint.replace(apiBaseUrl, '')}`, options);
      if (!directResponse.ok) {
        throw new Error(`Direct API request failed with status ${directResponse.status}`);
      }
      console.log('Direct connection successful where proxy failed');
      return await directResponse.json();
    } catch (directError) {
      console.error('Direct connection also failed:', directError);
      throw directError;
    }
  }
}

/**
 * LoyaltyService class for managing loyalty program operations
 */
export class LoyaltyService {
  private tierService: BaseService<LoyaltyTier>;
  private rewardService: BaseService<LoyaltyReward>;
  private eventService: BaseService<LoyaltyEvent>;
  private transactionService: BaseService<LoyaltyTransaction>;
  
  constructor() {
    this.tierService = new BaseService<LoyaltyTier>({
      endpoint: API_ENDPOINTS.TIERS,
      entityName: 'loyalty-tiers',
      usePersistence: false, // No longer using local persistence
    });
    
    this.rewardService = new BaseService<LoyaltyReward>({
      endpoint: API_ENDPOINTS.REWARDS,
      entityName: 'loyalty-rewards',
      usePersistence: false,
    });
    
    this.eventService = new BaseService<LoyaltyEvent>({
      endpoint: API_ENDPOINTS.EVENTS,
      entityName: 'loyalty-events',
      usePersistence: false,
    });
    
    this.transactionService = new BaseService<LoyaltyTransaction>({
      endpoint: API_ENDPOINTS.TRANSACTIONS,
      entityName: 'loyalty-transactions',
      usePersistence: false,
    });

    console.log("Loyalty service initialized with real API integration");
  }
  
  /**
   * Get loyalty program settings
   */
  public async getSettings(): Promise<LoyaltySettings> {
    try {
      try {
        // Try to get settings using our custom request function
        const result = await makeApiRequest(API_ENDPOINTS.SETTINGS);
        return result.data;
      } catch (apiError) {
        console.error('Failed to fetch settings via custom request:', apiError);
        // Fallback to apiClient
        const response = await apiClient.get<LoyaltySettings>(API_ENDPOINTS.SETTINGS);
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching loyalty program settings:', error);
      return this.fallbackToLocalSettings();
    }
  }
  
  /**
   * Fallback to local settings when API fails
   */
  private fallbackToLocalSettings(): LoyaltySettings {
    console.warn('Using fallback loyalty settings');
    // Return default settings as fallback
    return {
      enabled: true,
      pointsPerPurchase: 1,
      minimumPurchase: 10,
      welcomeBonus: 100,
      referralBonus: 50,
      birthdayBonus: 200,
      expiryDays: 365,
      termsAndConditions: "Default terms and conditions"
    };
  }
  
  /**
   * Update loyalty program settings
   */
  public async updateSettings(settings: Partial<LoyaltySettings>): Promise<LoyaltySettings> {
    try {
      const response = await apiClient.put<LoyaltySettings>(
        API_ENDPOINTS.SETTINGS,
        settings
      );
      return response.data;
    } catch (error) {
      console.error('Error updating loyalty program settings:', error);
      return handleApiError(error, 'Error updating loyalty program settings');
    }
  }
  
  /**
   * Get all loyalty tiers
   */
  public async getTiers(params?: QueryParams) {
    try {
      try {
        // Try to get tiers using our custom request function
        const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
        const result = await makeApiRequest(`${API_ENDPOINTS.TIERS}${queryString}`);
        return result;
      } catch (apiError) {
        console.error('Failed to fetch tiers via custom request:', apiError);
        // Fallback to apiClient
        const response = await apiClient.get<LoyaltyTier[]>(API_ENDPOINTS.TIERS, params);
        if (!response.data || !Array.isArray(response.data)) {
          console.warn('Invalid response format for tiers:', response);
          return { data: [] };
        }
        return response;
      }
    } catch (error) {
      console.error("Error getting tiers:", error);
      return this.fallbackToLocalTiers();
    }
  }
  
  /**
   * Fallback to local tiers when API fails
   */
  private fallbackToLocalTiers() {
    console.warn('Using fallback loyalty tiers');
    // Return default tiers as fallback
    return {
      data: [
        {
          id: 'bronze',
          name: 'Bronze',
          minimumPoints: 0,
          benefits: { discount: 0 }
        },
        {
          id: 'silver',
          name: 'Silver',
          minimumPoints: 1000,
          benefits: { discount: 5 }
        },
        {
          id: 'gold',
          name: 'Gold',
          minimumPoints: 5000,
          benefits: { discount: 10 }
        }
      ]
    };
  }
  
  /**
   * Create a new loyalty tier
   */
  public async createTier(tier: Omit<LoyaltyTier, 'id'>) {
    try {
      return await apiClient.post<LoyaltyTier>(API_ENDPOINTS.TIERS, tier);
    } catch (error) {
      console.error("Error creating tier:", error);
      return handleApiError(error, 'Error creating loyalty tier');
    }
  }
  
  /**
   * Get tier by ID
   */
  public async getTierById(id: string) {
    try {
      return await apiClient.get<LoyaltyTier>(`${API_ENDPOINTS.TIERS}/${id}`);
    } catch (error) {
      console.error(`Error getting tier ${id}:`, error);
      return handleApiError(error, `Error fetching loyalty tier ${id}`);
    }
  }
  
  /**
   * Update tier by ID
   */
  public async updateTier(id: string, tier: Partial<LoyaltyTier>) {
    try {
      return await apiClient.put<LoyaltyTier>(`${API_ENDPOINTS.TIERS}/${id}`, tier);
    } catch (error) {
      console.error(`Error updating tier ${id}:`, error);
      return handleApiError(error, `Error updating loyalty tier ${id}`);
    }
  }
  
  /**
   * Delete tier by ID
   */
  public async deleteTier(id: string) {
    try {
      return await apiClient.delete<LoyaltyTier>(`${API_ENDPOINTS.TIERS}/${id}`);
    } catch (error) {
      console.error(`Error deleting tier ${id}:`, error);
      return handleApiError(error, `Error deleting loyalty tier ${id}`);
    }
  }
  
  /**
   * Get all loyalty rewards
   */
  public async getRewards(params?: QueryParams) {
    try {
      try {
        // Try to get rewards using our custom request function
        const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
        const result = await makeApiRequest(`${API_ENDPOINTS.REWARDS}${queryString}`);
        return result;
      } catch (apiError) {
        console.error('Failed to fetch rewards via custom request:', apiError);
        // Fallback to apiClient
        const response = await apiClient.get<LoyaltyReward[]>(API_ENDPOINTS.REWARDS, params);
        if (!response.data || !Array.isArray(response.data)) {
          console.warn('Invalid response format for rewards:', response);
          return { data: [] };
        }
        return response;
      }
    } catch (error) {
      console.error("Error getting rewards:", error);
      return this.fallbackToLocalRewards();
    }
  }
  
  /**
   * Fallback to local rewards when API fails
   */
  private fallbackToLocalRewards() {
    console.warn('Using fallback loyalty rewards');
    // Return default rewards as fallback
    return {
      data: [
        {
          id: 'discount-10',
          name: '10% Discount',
          description: 'Get 10% off your next purchase',
          pointsCost: 500,
          active: true
        },
        {
          id: 'free-item',
          name: 'Free Item',
          description: 'Get a free item with your next purchase',
          pointsCost: 1000,
          active: true
        }
      ]
    };
  }
  
  /**
   * Create a new loyalty reward
   */
  public async createReward(reward: Omit<LoyaltyReward, 'id'>) {
    try {
      return await apiClient.post<LoyaltyReward>(API_ENDPOINTS.REWARDS, reward);
    } catch (error) {
      console.error("Error creating reward:", error);
      return handleApiError(error, 'Error creating loyalty reward');
    }
  }
  
  /**
   * Get reward by ID
   */
  public async getRewardById(id: string) {
    try {
      return await apiClient.get<LoyaltyReward>(`${API_ENDPOINTS.REWARDS}/${id}`);
    } catch (error) {
      console.error(`Error getting reward ${id}:`, error);
      return handleApiError(error, `Error fetching loyalty reward ${id}`);
    }
  }
  
  /**
   * Update reward by ID
   */
  public async updateReward(id: string, reward: Partial<LoyaltyReward>) {
    try {
      return await apiClient.put<LoyaltyReward>(`${API_ENDPOINTS.REWARDS}/${id}`, reward);
    } catch (error) {
      console.error(`Error updating reward ${id}:`, error);
      return handleApiError(error, `Error updating loyalty reward ${id}`);
    }
  }
  
  /**
   * Delete reward by ID
   */
  public async deleteReward(id: string) {
    try {
      return await apiClient.delete<LoyaltyReward>(`${API_ENDPOINTS.REWARDS}/${id}`);
    } catch (error) {
      console.error(`Error deleting reward ${id}:`, error);
      return handleApiError(error, `Error deleting loyalty reward ${id}`);
    }
  }
  
  /**
   * Get all loyalty events
   */
  public async getEvents(params?: QueryParams) {
    try {
      try {
        // Try to get events using our custom request function
        const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
        const result = await makeApiRequest(`${API_ENDPOINTS.EVENTS}${queryString}`);
        return result;
      } catch (apiError) {
        console.error('Failed to fetch events via custom request:', apiError);
        // Fallback to apiClient
        const response = await apiClient.get<LoyaltyEvent[]>(API_ENDPOINTS.EVENTS, params);
        if (!response.data || !Array.isArray(response.data)) {
          console.warn('Invalid response format for events:', response);
          return { data: [] };
        }
        return response;
      }
    } catch (error) {
      console.error("Error getting events:", error);
      return this.fallbackToLocalEvents();
    }
  }
  
  /**
   * Fallback to local events when API fails
   */
  private fallbackToLocalEvents() {
    console.warn('Using fallback loyalty events');
    // Return default events as fallback
    return {
      data: [
        {
          id: 'welcome',
          name: 'Welcome Bonus',
          description: 'Points awarded to new customers',
          pointsAward: 100,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          active: true
        },
        {
          id: 'holiday',
          name: 'Holiday Bonus',
          description: 'Extra points during holidays',
          pointsAward: 200,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          active: true
        }
      ]
    };
  }
  
  /**
   * Create a new loyalty event
   */
  public async createEvent(event: Omit<LoyaltyEvent, 'id'>) {
    try {
      return await apiClient.post<LoyaltyEvent>(API_ENDPOINTS.EVENTS, event);
    } catch (error) {
      console.error("Error creating event:", error);
      return handleApiError(error, 'Error creating loyalty event');
    }
  }
  
  /**
   * Get event by ID
   */
  public async getEventById(id: string) {
    try {
      return await apiClient.get<LoyaltyEvent>(`${API_ENDPOINTS.EVENTS}/${id}`);
    } catch (error) {
      console.error(`Error getting event ${id}:`, error);
      return handleApiError(error, `Error fetching loyalty event ${id}`);
    }
  }
  
  /**
   * Update event by ID
   */
  public async updateEvent(id: string, event: Partial<LoyaltyEvent>) {
    try {
      return await apiClient.put<LoyaltyEvent>(`${API_ENDPOINTS.EVENTS}/${id}`, event);
    } catch (error) {
      console.error(`Error updating event ${id}:`, error);
      return handleApiError(error, `Error updating loyalty event ${id}`);
    }
  }
  
  /**
   * Delete event by ID
   */
  public async deleteEvent(id: string) {
    try {
      return await apiClient.delete<LoyaltyEvent>(`${API_ENDPOINTS.EVENTS}/${id}`);
    } catch (error) {
      console.error(`Error deleting event ${id}:`, error);
      return handleApiError(error, `Error deleting loyalty event ${id}`);
    }
  }
  
  /**
   * Get loyalty transactions for a customer
   */
  public async getCustomerTransactions(customerId: string, params?: QueryParams) {
    try {
      return await apiClient.get<LoyaltyTransaction[]>(
        `${API_ENDPOINTS.TRANSACTIONS}/customer/${customerId}`,
        params
      );
    } catch (error) {
      console.error(`Error getting transactions for customer ${customerId}:`, error);
      return handleApiError(error, `Error fetching transactions for customer ${customerId}`);
    }
  }
  
  /**
   * Create a loyalty transaction
   */
  public async createTransaction(transaction: Omit<LoyaltyTransaction, 'id'>) {
    try {
      return await apiClient.post<LoyaltyTransaction>(API_ENDPOINTS.TRANSACTIONS, transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      return handleApiError(error, 'Error creating loyalty transaction');
    }
  }
  
  /**
   * Get next eligible tier for a customer
   */
  public async getNextTier(currentTierId: string, totalSpent: number) {
    try {
      return await apiClient.post<LoyaltyTier>(API_ENDPOINTS.NEXT_TIER, {
        currentTierId,
        totalSpent
      });
    } catch (error) {
      console.error("Error getting next tier:", error);
      return handleApiError(error, 'Error determining next loyalty tier');
    }
  }
  
  /**
   * Apply points to a customer account
   */
  public async applyPoints(customerId: string, points: number, source: string, description?: string) {
    try {
      return await apiClient.post<LoyaltyTransaction>(`${API_ENDPOINTS.TRANSACTIONS}/apply-points`, {
        customerId,
        points,
        source,
        description
      });
    } catch (error) {
      console.error(`Error applying points for customer ${customerId}:`, error);
      return handleApiError(error, `Error applying points for customer ${customerId}`);
    }
  }
  
  /**
   * Redeem points for a reward
   */
  public async redeemPoints(customerId: string, rewardId: string, orderReference?: string) {
    try {
      return await apiClient.post<LoyaltyTransaction>(`${API_ENDPOINTS.TRANSACTIONS}/redeem-points`, {
        customerId,
        rewardId,
        orderReference
      });
    } catch (error) {
      console.error(`Error redeeming points for customer ${customerId}:`, error);
      return handleApiError(error, `Error redeeming points for customer ${customerId}`);
    }
  }
}

// Create a single instance of the LoyaltyService
export const loyaltyService = new LoyaltyService(); 