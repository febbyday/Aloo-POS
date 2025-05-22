/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * 
 * Factory-Based Gift Card Service
 * 
 * This service uses the centralized service factory and endpoint registry to provide
 * a consistent implementation of gift card-related operations with minimal duplication.
 */

import { GiftCard, GiftCardTransaction, TransactionType, DesignTemplate } from '../types';
import { createServiceMethod, createStandardService } from '@/lib/api/service-endpoint-factory';
import { ApiErrorType, createErrorHandler } from '@/lib/api/error-handler';

// Create a module-specific error handler
const giftCardErrorHandler = createErrorHandler('gift-cards');

// Define retry configuration
const GIFT_CARD_RETRY_CONFIG = {
  maxRetries: 2,
  initialDelay: 500,
  maxDelay: 5000,
  backoffFactor: 2,
  shouldRetry: (error: any) => {
    return ![
      ApiErrorType.VALIDATION, 
      ApiErrorType.CONFLICT,
      ApiErrorType.AUTHORIZATION
    ].includes(error.type);
  }
};

/**
 * Gift Card service with standardized endpoint handling
 */
export const giftCardService = {
  // Basic CRUD operations from the standard service factory
  ...createStandardService<GiftCard>('gift-cards', {
    useEnhancedClient: true,
    withRetry: GIFT_CARD_RETRY_CONFIG,
    cacheResponse: true,
    // Custom response mapping if needed
    mapResponse: (data: any) => {
      if (Array.isArray(data)) {
        return data.map(item => ({
          ...item,
          issueDate: item.issueDate ? new Date(item.issueDate) : new Date(),
          expirationDate: item.expirationDate ? new Date(item.expirationDate) : null,
          lastUsedDate: item.lastUsedDate ? new Date(item.lastUsedDate) : null,
        }));
      }
      return {
        ...data,
        issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
        expirationDate: data.expirationDate ? new Date(data.expirationDate) : null,
        lastUsedDate: data.lastUsedDate ? new Date(data.lastUsedDate) : null,
      };
    }
  }),
  
  // Custom methods for gift card-specific operations
  
  /**
   * Get gift card by code
   */
  getByCode: createServiceMethod<GiftCard>(
    'gift-cards', 'BY_CODE', 'get',
    { 
      withRetry: GIFT_CARD_RETRY_CONFIG,
      cacheResponse: true 
    }
  ),
  
  /**
   * Get transaction history for a gift card
   */
  getTransactionHistory: createServiceMethod<GiftCardTransaction[]>(
    'gift-cards', 'TRANSACTIONS', 'get',
    { 
      withRetry: GIFT_CARD_RETRY_CONFIG,
      cacheResponse: true 
    }
  ),
  
  /**
   * Create a transaction for a gift card
   */
  createTransaction: createServiceMethod<GiftCardTransaction, {
    giftCardId: string;
    type: TransactionType;
    amount: number;
    notes?: string;
    orderId?: string;
  }>(
    'gift-cards', 'CREATE_TRANSACTION', 'post',
    { withRetry: false }
  ),
  
  /**
   * Adjust gift card balance
   */
  adjustBalance: createServiceMethod<GiftCard, {
    id: string;
    amount: number;
    type: TransactionType;
    notes?: string;
    orderId?: string;
  }>(
    'gift-cards', 'ADJUST_BALANCE', 'put',
    { withRetry: false }
  ),
  
  /**
   * Validate a gift card
   */
  validateGiftCard: createServiceMethod<{
    valid: boolean;
    message: string;
    giftCard?: GiftCard;
  }, {
    code: string;
  }>(
    'gift-cards', 'VALIDATE', 'post',
    { 
      withRetry: GIFT_CARD_RETRY_CONFIG,
      cacheResponse: false 
    }
  ),
  
  /**
   * Redeem a gift card
   */
  redeemGiftCard: createServiceMethod<{
    success: boolean;
    message: string;
    giftCard?: GiftCard;
    amountUsed?: number;
    remainingBalance?: number;
  }, {
    code: string;
    amount: number;
    orderId: string;
  }>(
    'gift-cards', 'REDEEM', 'post',
    { withRetry: false }
  ),
  
  /**
   * Get design templates
   */
  getDesignTemplates: createServiceMethod<DesignTemplate[]>(
    'gift-cards', 'TEMPLATES', 'get',
    { cacheResponse: true }
  ),
  
  /**
   * Create design template
   */
  createDesignTemplate: createServiceMethod<DesignTemplate, Partial<DesignTemplate>>(
    'gift-cards', 'CREATE_TEMPLATE', 'post',
    { withRetry: false }
  )
};

export default giftCardService;
