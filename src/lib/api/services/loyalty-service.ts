/**
 * Loyalty Service - API Integration for Loyalty Program Management
 *
 * This service handles all loyalty program operations, including:
 * - CRUD operations for tiers, rewards, and special events
 * - Points transactions and redemptions
 * - Loyalty program settings
 *
 * UPDATED: Now uses the enhanced API client and endpoint registry for standardized API access
 */

import { QueryParams } from './base-service';
import {
  LoyaltyTier,
  LoyaltyReward,
  LoyaltyEvent,
  LoyaltyTransaction,
  LoyaltySettings
} from '@/features/customers/types/customers.types';
import { enhancedApiClient } from '../enhanced-api-client';
import { LOYALTY_ENDPOINTS } from '../endpoint-registry';
import { ApiError, ApiErrorType, createErrorHandler, safeApiCall } from '../error-handler';

// Log service initialization
console.log('Initializing Loyalty Service with enhanced API client');

// Create a module-specific error handler
const loyaltyErrorHandler = createErrorHandler('loyalty');

// Define retry configuration for loyalty endpoints
const LOYALTY_RETRY_CONFIG = {
  maxRetries: 2,
  initialDelay: 500,
  maxDelay: 5000,
  backoffFactor: 2,
  shouldRetry: (error: ApiError) => {
    // Only retry network or server errors, not validation or auth errors
    return [ApiErrorType.NETWORK, ApiErrorType.SERVER, ApiErrorType.TIMEOUT].includes(error.type);
  }
};

/**
 * Safe API call with fallback
 *
 * @param apiCall Function that makes the API call
 * @param fallbackFn Function to call if the API call fails
 * @param errorMessage Error message to display
 * @returns The API response or fallback data
 */
async function safeApiCallWithFallback<T>(
  apiCall: () => Promise<T>,
  fallbackFn: () => T,
  errorMessage: string
): Promise<T> {
  const [result, error] = await loyaltyErrorHandler.safeCall(apiCall, errorMessage);

  if (error) {
    console.warn(`Falling back to local data: ${errorMessage}`);
    return fallbackFn();
  }

  return result as T;
}

/**
 * LoyaltyService class for managing loyalty program operations
 */
export class LoyaltyService {
  constructor() {
    console.log("Loyalty service initialized with enhanced API client integration");
  }

  /**
   * Get loyalty program settings
   */
  public async getSettings(): Promise<LoyaltySettings> {
    return safeApiCallWithFallback(
      async () => {
        return await loyaltyErrorHandler.withRetry(() =>
          enhancedApiClient.get<LoyaltySettings>(
            'loyalty/SETTINGS',
            undefined,
            { cache: 'default' }
          ),
          LOYALTY_RETRY_CONFIG
        );
      },
      this.fallbackToLocalSettings,
      'Error fetching loyalty program settings'
    );
  }

  /**
   * Fallback to local settings when API fails
   */
  private fallbackToLocalSettings(): LoyaltySettings {
    console.warn('Using fallback loyalty settings');
    // Return default settings as fallback
    return {
      pointsPerDollar: 1,
      pointValueInCents: 1,
      minimumRedemption: 100,
      expiryPeriodInDays: 365,
      welcomeBonus: 100,
      referralBonus: 50,
      birthdayBonus: 200,
      isEnabled: true,
      termsAndConditions: "Default terms and conditions"
    };
  }

  /**
   * Update loyalty program settings
   */
  public async updateSettings(settings: Partial<LoyaltySettings>): Promise<LoyaltySettings> {
    const [result, error] = await loyaltyErrorHandler.safeCall(
      () => enhancedApiClient.put<LoyaltySettings>(
        'loyalty/UPDATE_SETTINGS',
        settings
      ),
      'Error updating loyalty program settings'
    );

    if (error) {
      throw error;
    }

    return result as LoyaltySettings;
  }

  /**
   * Get all loyalty tiers
   */
  public async getTiers(params?: QueryParams) {
    return safeApiCallWithFallback(
      async () => {
        const response = await loyaltyErrorHandler.withRetry(
          () => enhancedApiClient.get<LoyaltyTier[]>(
            'loyalty/TIERS',
            undefined,
            {
              params,
              cache: 'default'
            }
          ),
          LOYALTY_RETRY_CONFIG
        );
        return { data: response };
      },
      this.fallbackToLocalTiers,
      'Error getting loyalty tiers'
    );
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
    const [result, error] = await loyaltyErrorHandler.safeCall(
      () => enhancedApiClient.post<LoyaltyTier>(
        'loyalty/TIERS',
        tier
      ),
      'Error creating loyalty tier'
    );

    if (error) {
      throw error;
    }

    return result;
  }

  /**
   * Get tier by ID
   */
  public async getTierById(id: string) {
    return safeApiCallWithFallback(
      async () => {
        return await loyaltyErrorHandler.withRetry(
          () => enhancedApiClient.get<LoyaltyTier>(
            'loyalty/DETAIL',
            { id },
            { cache: 'default' }
          ),
          LOYALTY_RETRY_CONFIG
        );
      },
      () => ({
        id,
        name: 'Unknown Tier',
        minimumPoints: 0,
        benefits: { discount: 0 }
      }),
      `Error fetching loyalty tier ${id}`
    );
  }

  /**
   * Update tier by ID
   */
  public async updateTier(id: string, tier: Partial<LoyaltyTier>) {
    const [result, error] = await loyaltyErrorHandler.safeCall(
      () => enhancedApiClient.put<LoyaltyTier>(
        'loyalty/DETAIL',
        { id },
        tier
      ),
      `Error updating loyalty tier ${id}`
    );

    if (error) {
      throw error;
    }

    return result;
  }

  /**
   * Delete tier by ID
   */
  public async deleteTier(id: string) {
    const [result, error] = await loyaltyErrorHandler.safeCall(
      () => enhancedApiClient.delete<void>(
        'loyalty/DETAIL',
        { id }
      ),
      `Error deleting loyalty tier ${id}`
    );

    if (error) {
      throw error;
    }

    return result;
  }

  /**
   * Get all loyalty rewards
   */
  public async getRewards(params?: QueryParams) {
    return safeApiCallWithFallback(
      async () => {
        const response = await loyaltyErrorHandler.withRetry(
          () => enhancedApiClient.get<LoyaltyReward[]>(
            'loyalty/REWARDS',
            undefined,
            {
              params,
              cache: 'default'
            }
          ),
          LOYALTY_RETRY_CONFIG
        );
        return { data: response };
      },
      this.fallbackToLocalRewards,
      'Error getting loyalty rewards'
    );
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
    const [result, error] = await loyaltyErrorHandler.safeCall(
      () => enhancedApiClient.post<LoyaltyReward>(
        'loyalty/REWARDS',
        reward
      ),
      'Error creating loyalty reward'
    );

    if (error) {
      throw error;
    }

    return result;
  }

  /**
   * Get reward by ID
   */
  public async getRewardById(id: string) {
    return safeApiCallWithFallback(
      async () => {
        return await loyaltyErrorHandler.withRetry(
          () => enhancedApiClient.get<LoyaltyReward>(
            'loyalty/DETAIL',
            { id },
            { cache: 'default' }
          ),
          LOYALTY_RETRY_CONFIG
        );
      },
      () => ({
        id,
        name: 'Unknown Reward',
        description: 'Reward details not available',
        pointsCost: 0,
        active: false
      }),
      `Error fetching loyalty reward ${id}`
    );
  }

  /**
   * Update reward by ID
   */
  public async updateReward(id: string, reward: Partial<LoyaltyReward>) {
    const [result, error] = await loyaltyErrorHandler.safeCall(
      () => enhancedApiClient.put<LoyaltyReward>(
        'loyalty/DETAIL',
        { id },
        reward
      ),
      `Error updating loyalty reward ${id}`
    );

    if (error) {
      throw error;
    }

    return result;
  }

  /**
   * Delete reward by ID
   */
  public async deleteReward(id: string) {
    const [result, error] = await loyaltyErrorHandler.safeCall(
      () => enhancedApiClient.delete<void>(
        'loyalty/DETAIL',
        { id }
      ),
      `Error deleting loyalty reward ${id}`
    );

    if (error) {
      throw error;
    }

    return result;
  }

  /**
   * Get all loyalty events
   */
  public async getEvents(params?: QueryParams) {
    return safeApiCallWithFallback(
      async () => {
        const response = await loyaltyErrorHandler.withRetry(
          () => enhancedApiClient.get<LoyaltyEvent[]>(
            'loyalty/EVENTS',
            undefined,
            {
              params,
              cache: 'default'
            }
          ),
          LOYALTY_RETRY_CONFIG
        );
        return { data: response };
      },
      this.fallbackToLocalEvents,
      'Error getting loyalty events'
    );
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
    const [result, error] = await loyaltyErrorHandler.safeCall(
      () => enhancedApiClient.post<LoyaltyEvent>(
        'loyalty/EVENTS',
        event
      ),
      'Error creating loyalty event'
    );

    if (error) {
      throw error;
    }

    return result;
  }

  /**
   * Get event by ID
   */
  public async getEventById(id: string) {
    return safeApiCallWithFallback(
      async () => {
        return await loyaltyErrorHandler.withRetry(
          () => enhancedApiClient.get<LoyaltyEvent>(
            'loyalty/DETAIL',
            { id },
            { cache: 'default' }
          ),
          LOYALTY_RETRY_CONFIG
        );
      },
      () => ({
        id,
        name: 'Unknown Event',
        description: 'Event details not available',
        pointsAward: 0,
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        active: false
      }),
      `Error fetching loyalty event ${id}`
    );
  }

  /**
   * Update event by ID
   */
  public async updateEvent(id: string, event: Partial<LoyaltyEvent>) {
    const [result, error] = await loyaltyErrorHandler.safeCall(
      () => enhancedApiClient.put<LoyaltyEvent>(
        'loyalty/DETAIL',
        { id },
        event
      ),
      `Error updating loyalty event ${id}`
    );

    if (error) {
      throw error;
    }

    return result;
  }

  /**
   * Delete event by ID
   */
  public async deleteEvent(id: string) {
    const [result, error] = await loyaltyErrorHandler.safeCall(
      () => enhancedApiClient.delete<void>(
        'loyalty/DETAIL',
        { id }
      ),
      `Error deleting loyalty event ${id}`
    );

    if (error) {
      throw error;
    }

    return result;
  }

  /**
   * Get loyalty transactions for a customer
   */
  public async getCustomerTransactions(customerId: string, params?: QueryParams) {
    return safeApiCallWithFallback(
      async () => {
        return await loyaltyErrorHandler.withRetry(
          () => enhancedApiClient.get<LoyaltyTransaction[]>(
            'loyalty/TRANSACTIONS',
            undefined,
            {
              params: { ...params, customerId },
              cache: 'default'
            }
          ),
          LOYALTY_RETRY_CONFIG
        );
      },
      () => [],
      `Error fetching transactions for customer ${customerId}`
    );
  }

  /**
   * Create a loyalty transaction
   */
  public async createTransaction(transaction: Omit<LoyaltyTransaction, 'id'>) {
    const [result, error] = await loyaltyErrorHandler.safeCall(
      () => enhancedApiClient.post<LoyaltyTransaction>(
        'loyalty/TRANSACTIONS',
        transaction
      ),
      'Error creating loyalty transaction'
    );

    if (error) {
      throw error;
    }

    return result;
  }

  /**
   * Get next eligible tier for a customer
   */
  public async getNextTier(currentTierId: string, totalSpent: number) {
    const [result, error] = await loyaltyErrorHandler.safeCall(
      () => enhancedApiClient.post<LoyaltyTier>(
        'loyalty/NEXT_TIER',
        {
          currentTierId,
          totalSpent
        }
      ),
      'Error determining next loyalty tier'
    );

    if (error) {
      throw error;
    }

    return result;
  }

  /**
   * Apply points to a customer account
   */
  public async applyPoints(customerId: string, points: number, source: string, description?: string) {
    const [result, error] = await loyaltyErrorHandler.safeCall(
      () => enhancedApiClient.post<LoyaltyTransaction>(
        'loyalty/TRANSACTIONS',
        {
          customerId,
          points,
          source,
          description,
          type: 'APPLY'
        }
      ),
      `Error applying points for customer ${customerId}`
    );

    if (error) {
      throw error;
    }

    return result;
  }

  /**
   * Redeem points for a reward
   */
  public async redeemPoints(customerId: string, rewardId: string, orderReference?: string) {
    const [result, error] = await loyaltyErrorHandler.safeCall(
      () => enhancedApiClient.post<LoyaltyTransaction>(
        'loyalty/TRANSACTIONS',
        {
          customerId,
          rewardId,
          orderReference,
          type: 'REDEEM'
        }
      ),
      `Error redeeming points for customer ${customerId}`
    );

    if (error) {
      throw error;
    }

    return result;
  }
}

// Create a single instance of the LoyaltyService
export const loyaltyService = new LoyaltyService();