/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * 
 * Factory-Based Gift Card Service for Sales Module
 * 
 * This service uses the centralized service factory and endpoint registry to provide
 * a consistent implementation of gift card-related operations with minimal duplication.
 */

import { GiftCard, GiftCardTransaction, TransactionType } from '../../types/gift-cards';
import { createServiceMethod, createStandardService } from '@/lib/api/service-endpoint-factory';
import { ApiErrorType, createErrorHandler } from '@/lib/api/error-handler';

// Create a module-specific error handler
const giftCardErrorHandler = createErrorHandler('sales/gift-cards');

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
 * Gift Card service with standardized endpoint handling for the Sales module
 */
export const giftCardService = {
  // Basic CRUD operations from the standard service factory
  ...createStandardService<GiftCard>('sales/gift-cards', {
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
    'sales/gift-cards', 'BY_CODE', 'get',
    { 
      withRetry: GIFT_CARD_RETRY_CONFIG,
      cacheResponse: true 
    }
  ),
  
  /**
   * Get transaction history for a gift card
   */
  getTransactionHistory: createServiceMethod<GiftCardTransaction[]>(
    'sales/gift-cards', 'TRANSACTIONS', 'get',
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
    'sales/gift-cards', 'CREATE_TRANSACTION', 'post',
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
    'sales/gift-cards', 'ADJUST_BALANCE', 'put',
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
    'sales/gift-cards', 'VALIDATE', 'post',
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
    'sales/gift-cards', 'REDEEM', 'post',
    { withRetry: false }
  ),
  
  /**
   * Apply gift card to order
   */
  applyToOrder: createServiceMethod<{
    success: boolean;
    message: string;
    amountApplied: number;
    remainingBalance: number;
    orderId: string;
  }, {
    code: string;
    orderId: string;
    amount?: number; // If not provided, will use the full balance or order amount, whichever is less
  }>(
    'sales/gift-cards', 'APPLY_TO_ORDER', 'post',
    { withRetry: false }
  )
};

export default giftCardService;
