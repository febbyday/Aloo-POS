/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 *
 * @deprecated This service is deprecated. Use the factory-based gift card service instead.
 * Import from the sales module:
 * import { GiftCardService } from '@/features/sales/services';
 */
import { GiftCard, GiftCardTransaction, TransactionType } from '../types';
import { enhancedApiClient } from '@/lib/api/enhanced-api-client';
import { getApiUrl } from '@/lib/api/enhanced-config';
import { withApiTransition } from '@/lib/api/api-transition-utils';
import { v4 as uuidv4 } from 'uuid';

// Fallback data for when API is unavailable
const fallbackGiftCards: GiftCard[] = [
  {
    id: "1",
    code: "ABCD-1234-EFGH-5678",
    initialValue: 50.00,
    balance: 35.75,
    expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    issueDate: new Date(new Date().setMonth(new Date().getMonth() - 2)),
    lastUsedDate: new Date(new Date().setDate(new Date().getDate() - 5)),
    status: 'active',
    recipient: {
      name: "Jane Doe",
      email: "jane.doe@example.com",
    },
    sender: {
      name: "John Smith",
      email: "john.smith@example.com",
    },
    message: "Happy Birthday! Enjoy your shopping!",
    designTemplateId: "1",
    metadata: {
      purchaseOrderNumber: "PO12345",
      salesAssociate: "Alice Johnson"
    },
  },
  {
    id: "2",
    code: "JKLM-5678-NOPQ-9012",
    initialValue: 100.00,
    balance: 100.00,
    expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    issueDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    lastUsedDate: null,
    status: 'active',
    recipient: {
      name: "Michael Brown",
      email: "michael.brown@example.com",
    },
    sender: {
      name: "Sarah Wilson",
      email: "sarah.wilson@example.com",
    },
    message: "Thank you for your help!",
    designTemplateId: "2",
    metadata: {
      occasion: "Thank You",
      store: "Downtown Branch"
    },
  },
  {
    id: "3",
    code: "RSTU-9012-VWXY-3456",
    initialValue: 200.00,
    balance: 0,
    expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    issueDate: new Date(new Date().setFullYear(new Date().getFullYear() - 2)),
    lastUsedDate: new Date(new Date().setMonth(new Date().getMonth() - 6)),
    status: 'expired',
    recipient: {
      name: "Emily Davis",
      email: "emily.davis@example.com",
    },
    sender: {
      name: "David Miller",
      email: "david.miller@example.com",
    },
    message: "Happy Holidays!",
    designTemplateId: "3",
    metadata: {
      occasion: "Christmas",
      storeId: "STR-5678"
    },
  }
];

const fallbackTransactions: GiftCardTransaction[] = [
  {
    id: "1",
    giftCardId: "1",
    type: "issue",
    amount: 50.00,
    date: new Date(new Date().setMonth(new Date().getMonth() - 2)),
    notes: "Initial issue",
    performedBy: "system",
    balanceAfter: 50.00
  },
  {
    id: "2",
    giftCardId: "1",
    type: "redeem",
    amount: 14.25,
    date: new Date(new Date().setDate(new Date().getDate() - 5)),
    notes: "Purchase - Order #12345",
    performedBy: "user-456",
    balanceAfter: 35.75,
    orderId: "12345"
  },
  {
    id: "3",
    giftCardId: "2",
    type: "issue",
    amount: 100.00,
    date: new Date(new Date().setDate(new Date().getDate() - 1)),
    notes: "Initial issue",
    performedBy: "user-789",
    balanceAfter: 100.00
  },
  {
    id: "4",
    giftCardId: "3",
    type: "issue",
    amount: 200.00,
    date: new Date(new Date().setFullYear(new Date().getFullYear() - 2)),
    notes: "Initial issue",
    performedBy: "user-123",
    balanceAfter: 200.00
  },
  {
    id: "5",
    giftCardId: "3",
    type: "redeem",
    amount: 125.50,
    date: new Date(new Date().setMonth(new Date().getMonth() - 18)),
    notes: "Purchase - Order #10987",
    performedBy: "user-456",
    balanceAfter: 74.50,
    orderId: "10987"
  },
  {
    id: "6",
    giftCardId: "3",
    type: "redeem",
    amount: 74.50,
    date: new Date(new Date().setMonth(new Date().getMonth() - 6)),
    notes: "Purchase - Order #11567",
    performedBy: "user-789",
    balanceAfter: 0,
    orderId: "11567"
  },
  {
    id: "7",
    giftCardId: "3",
    type: "expire",
    amount: 0,
    date: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    notes: "Card expired",
    performedBy: "system",
    balanceAfter: 0
  }
];

// Local cache for gift cards and transactions
let localGiftCards: GiftCard[] = [...fallbackGiftCards];
let localTransactions: GiftCardTransaction[] = [...fallbackTransactions];

// Helper to generate random card code
const generateCardCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) result += '-';
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Helper to generate a new ID
const generateId = (): string => {
  return uuidv4();
};

// Gift Card Service to handle CRUD operations
export const GiftCardService = {
  // Get all gift cards
  getAllGiftCards: async (): Promise<GiftCard[]> => {
    try {
      const response = await withApiTransition(
        () => enhancedApiClient.get('gift-cards/LIST'),
        localGiftCards,
        { endpoint: 'gift-cards/LIST' }
      );

      if (response.success) {
        localGiftCards = response.data; // Update local cache
        return response.data;
      } else if (response.isMock) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to fetch gift cards');
      }
    } catch (error) {
      console.error('Error fetching gift cards:', error);
      return localGiftCards;
    }
  },

  // Get a gift card by ID
  getGiftCardById: async (id: string): Promise<GiftCard | null> => {
    try {
      const response = await withApiTransition(
        () => enhancedApiClient.get('gift-cards/DETAIL', { id }),
        localGiftCards.find(card => card.id === id) || null,
        { endpoint: 'gift-cards/DETAIL' }
      );

      if (response.success) {
        // Update local cache if found
        if (response.data) {
          const index = localGiftCards.findIndex(card => card.id === id);
          if (index !== -1) {
            localGiftCards[index] = response.data;
          } else {
            localGiftCards.push(response.data);
          }
        }
        return response.data;
      } else if (response.isMock) {
        return response.data;
      } else {
        throw new Error(response.error || `Gift card with ID ${id} not found`);
      }
    } catch (error) {
      console.error(`Error fetching gift card with ID ${id}:`, error);
      return localGiftCards.find(card => card.id === id) || null;
    }
  },

  // Get a gift card by code
  getGiftCardByCode: async (code: string): Promise<GiftCard | null> => {
    try {
      const response = await withApiTransition(
        () => enhancedApiClient.get('gift-cards/BY_CODE', { code }),
        localGiftCards.find(card => card.code === code) || null,
        { endpoint: 'gift-cards/BY_CODE' }
      );

      if (response.success) {
        // Update local cache if found
        if (response.data) {
          const index = localGiftCards.findIndex(card => card.id === response.data.id);
          if (index !== -1) {
            localGiftCards[index] = response.data;
          } else {
            localGiftCards.push(response.data);
          }
        }
        return response.data;
      } else if (response.isMock) {
        return response.data;
      } else {
        throw new Error(response.error || `Gift card with code ${code} not found`);
      }
    } catch (error) {
      console.error(`Error fetching gift card with code ${code}:`, error);
      return localGiftCards.find(card => card.code === code) || null;
    }
  },

  // Create a new gift card
  createGiftCard: async (giftCardData: Partial<GiftCard>): Promise<GiftCard> => {
    const newGiftCard: GiftCard = {
      id: generateId(),
      code: giftCardData.code || generateCardCode(),
      initialValue: giftCardData.initialValue || 0,
      balance: giftCardData.initialValue || 0,
      expirationDate: giftCardData.expirationDate || null,
      issueDate: new Date(),
      lastUsedDate: null,
      status: 'active',
      recipient: {
        name: giftCardData.recipient?.name || null,
        email: giftCardData.recipient?.email || null,
      },
      sender: {
        name: giftCardData.sender?.name || null,
        email: giftCardData.sender?.email || null,
      },
      message: giftCardData.message || null,
      designTemplateId: giftCardData.designTemplateId || null,
      metadata: giftCardData.metadata || {},
    };

    try {
      const response = await withApiTransition(
        () => enhancedApiClient.post('gift-cards/CREATE', newGiftCard),
        newGiftCard,
        { endpoint: 'gift-cards/CREATE' }
      );

      // Handle transaction creation if there's an initial value
      let transaction: GiftCardTransaction | null = null;
      if (newGiftCard.initialValue > 0) {
        transaction = {
          id: generateId(),
          giftCardId: response.success ? response.data.id : newGiftCard.id,
          type: 'issue',
          amount: newGiftCard.initialValue,
          date: new Date(),
          notes: 'Initial issue',
          performedBy: 'current-user', // In a real app, this would be the current user's ID
          balanceAfter: newGiftCard.initialValue,
        };

        try {
          await withApiTransition(
            () => enhancedApiClient.post('gift-cards/CREATE_TRANSACTION', transaction),
            transaction,
            { endpoint: 'gift-cards/CREATE_TRANSACTION' }
          );
        } catch (txError) {
          console.error('Error creating transaction:', txError);
          // Still add to local cache even if API fails
          localTransactions.push(transaction);
        }
      }

      if (response.success) {
        // Update local cache
        localGiftCards.push(response.data);
        return response.data;
      } else if (response.isMock) {
        // Handle the case of using fallback data
        // Add to local cache
        localGiftCards.push(newGiftCard);
        if (transaction) {
          localTransactions.push(transaction);
        }
        return newGiftCard;
      } else {
        throw new Error(response.error || 'Failed to create gift card');
      }
    } catch (error) {
      console.error('Error creating gift card:', error);

      // Fallback: Add to local cache
      localGiftCards.push(newGiftCard);

      // Create a transaction record for the initial value
      if (newGiftCard.initialValue > 0) {
        const transaction: GiftCardTransaction = {
          id: generateId(),
          giftCardId: newGiftCard.id,
          type: 'issue',
          amount: newGiftCard.initialValue,
          date: new Date(),
          notes: 'Initial issue',
          performedBy: 'current-user',
          balanceAfter: newGiftCard.initialValue,
        };
        localTransactions.push(transaction);
      }

      return newGiftCard;
    }
  },

  // Update a gift card
  updateGiftCard: async (id: string, updates: Partial<GiftCard>): Promise<GiftCard | null> => {
    const existingCard = localGiftCards.find(card => card.id === id);
    if (!existingCard) return null;

    const updatedGiftCard: GiftCard = {
      ...existingCard,
      ...updates,
      // Prevent overriding these fields
      id: existingCard.id,
      code: existingCard.code,
      initialValue: existingCard.initialValue,
    };

    try {
      const response = await withApiTransition(
        () => enhancedApiClient.put('gift-cards/UPDATE', updatedGiftCard, { id }),
        updatedGiftCard,
        { endpoint: 'gift-cards/UPDATE' }
      );

      if (response.success) {
        // Update local cache
        const index = localGiftCards.findIndex(card => card.id === id);
        if (index !== -1) {
          localGiftCards[index] = response.data;
        }
        return response.data;
      } else if (response.isMock) {
        // Handle the case of using fallback data
        // Update in local cache
        const index = localGiftCards.findIndex(card => card.id === id);
        if (index !== -1) {
          localGiftCards[index] = updatedGiftCard;
        }
        return updatedGiftCard;
      } else {
        throw new Error(response.error || `Failed to update gift card with ID ${id}`);
      }
    } catch (error) {
      console.error(`Error updating gift card with ID ${id}:`, error);

      // Fallback: Update in local cache
      const index = localGiftCards.findIndex(card => card.id === id);
      if (index !== -1) {
        localGiftCards[index] = updatedGiftCard;
      }
      return updatedGiftCard;
    }
  },

  // Adjust gift card balance
  adjustBalance: async (
    id: string,
    amount: number,
    type: TransactionType,
    notes: string = '',
    orderId?: string
  ): Promise<GiftCard | null> => {
    const giftCard = localGiftCards.find(card => card.id === id);
    if (!giftCard) return null;

    // Calculate new balance
    let newBalance = giftCard.balance;
    if (type === 'issue' || type === 'adjustment') {
      newBalance += amount;
    } else if (type === 'redeem' || type === 'expire') {
      newBalance -= amount;
      if (newBalance < 0) newBalance = 0;
    }

    // Update the gift card
    const updatedGiftCard: GiftCard = {
      ...giftCard,
      balance: newBalance,
      lastUsedDate: type === 'redeem' ? new Date() : giftCard.lastUsedDate,
      status: newBalance === 0 ? (type === 'expire' ? 'expired' : 'used') : giftCard.status,
    };

    // Create a transaction record
    const transaction: GiftCardTransaction = {
      id: generateId(),
      giftCardId: id,
      type,
      amount,
      date: new Date(),
      notes,
      performedBy: 'current-user', // In a real app, this would be the current user's ID
      balanceAfter: newBalance,
      orderId,
    };

    try {
      // First, create the transaction
      const txResponse = await withApiTransition(
        () => enhancedApiClient.post('gift-cards/CREATE_TRANSACTION', transaction),
        transaction,
        { endpoint: 'gift-cards/CREATE_TRANSACTION' }
      );

      if (!txResponse.success && !txResponse.isMock) {
        throw new Error(txResponse.error || `Failed to create transaction for gift card ${id}`);
      }

      // Then update the gift card
      const response = await withApiTransition(
        () => enhancedApiClient.put('gift-cards/UPDATE', updatedGiftCard, { id }),
        updatedGiftCard,
        { endpoint: 'gift-cards/UPDATE' }
      );

      // Add transaction to local cache
      if (txResponse.success || txResponse.isMock) {
        const transactionToAdd = txResponse.success ? txResponse.data : transaction;
        localTransactions.push(transactionToAdd);
      }

      if (response.success) {
        // Update local cache
        const index = localGiftCards.findIndex(card => card.id === id);
        if (index !== -1) {
          localGiftCards[index] = response.data;
        }
        return response.data;
      } else if (response.isMock) {
        // Handle the case of using fallback data
        // Update in local cache
        const index = localGiftCards.findIndex(card => card.id === id);
        if (index !== -1) {
          localGiftCards[index] = updatedGiftCard;
        }
        return updatedGiftCard;
      } else {
        throw new Error(response.error || `Failed to update gift card with ID ${id}`);
      }
    } catch (error) {
      console.error(`Error adjusting balance for gift card with ID ${id}:`, error);

      // Fallback: Update local cache
      const index = localGiftCards.findIndex(card => card.id === id);
      if (index !== -1) {
        localGiftCards[index] = updatedGiftCard;
      }
      localTransactions.push(transaction);

      return updatedGiftCard;
    }
  },

  // Get transaction history for a gift card
  getTransactionHistory: async (giftCardId: string): Promise<GiftCardTransaction[]> => {
    try {
      const response = await withApiTransition(
        () => enhancedApiClient.get('gift-cards/TRANSACTIONS', { id: giftCardId }),
        localTransactions.filter(tx => tx.giftCardId === giftCardId),
        { endpoint: 'gift-cards/TRANSACTIONS' }
      );

      if (response.success) {
        // Update local cache with new transactions
        const existingIds = new Set(localTransactions.map(tx => tx.id));
        response.data.forEach(tx => {
          if (!existingIds.has(tx.id)) {
            localTransactions.push(tx);
          }
        });
        return response.data;
      } else if (response.isMock) {
        return response.data;
      } else {
        throw new Error(response.error || `Failed to fetch transactions for gift card ${giftCardId}`);
      }
    } catch (error) {
      console.error(`Error fetching transactions for gift card ${giftCardId}:`, error);
      return localTransactions.filter(tx => tx.giftCardId === giftCardId);
    }
  },

  // Validate a gift card (check if it's valid for use)
  validateGiftCard: async (code: string): Promise<{ valid: boolean; message: string; giftCard?: GiftCard }> => {
    try {
      const response = await withApiTransition(
        () => enhancedApiClient.post('gift-cards/VALIDATE', { code }),
        async () => {
          // Fallback validation logic
          const giftCard = localGiftCards.find(card => card.code === code);

          if (!giftCard) {
            return { valid: false, message: 'Gift card not found' };
          }

          if (giftCard.status === 'expired') {
            return { valid: false, message: 'Gift card has expired', giftCard };
          }

          if (giftCard.status === 'used') {
            return { valid: false, message: 'Gift card has been fully redeemed', giftCard };
          }

          if (giftCard.status === 'disabled') {
            return { valid: false, message: 'Gift card has been disabled', giftCard };
          }

          if (giftCard.balance <= 0) {
            return { valid: false, message: 'Gift card has zero balance', giftCard };
          }

          if (giftCard.expirationDate && new Date() > giftCard.expirationDate) {
            // Update the card to expired status in local cache
            await GiftCardService.adjustBalance(giftCard.id, giftCard.balance, 'expire', 'Card expired');
            return { valid: false, message: 'Gift card has expired', giftCard };
          }

          return { valid: true, message: 'Gift card is valid', giftCard };
        },
        { endpoint: 'gift-cards/VALIDATE' }
      );

      if (response.success || response.isMock) {
        // If the API returns a valid giftCard object, update the local cache
        if (response.data.giftCard) {
          const index = localGiftCards.findIndex(card => card.id === response.data.giftCard.id);
          if (index !== -1) {
            localGiftCards[index] = response.data.giftCard;
          }
        }
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to validate gift card');
      }
    } catch (error) {
      console.error(`Error validating gift card with code ${code}:`, error);

      // Fallback validation
      const giftCard = localGiftCards.find(card => card.code === code);

      if (!giftCard) {
        return { valid: false, message: 'Gift card not found' };
      }

      if (giftCard.status === 'expired') {
        return { valid: false, message: 'Gift card has expired', giftCard };
      }

      if (giftCard.status === 'used') {
        return { valid: false, message: 'Gift card has been fully redeemed', giftCard };
      }

      if (giftCard.status === 'disabled') {
        return { valid: false, message: 'Gift card has been disabled', giftCard };
      }

      if (giftCard.balance <= 0) {
        return { valid: false, message: 'Gift card has zero balance', giftCard };
      }

      if (giftCard.expirationDate && new Date() > giftCard.expirationDate) {
        // Update the card to expired status
        GiftCardService.adjustBalance(giftCard.id, giftCard.balance, 'expire', 'Card expired');
        return { valid: false, message: 'Gift card has expired', giftCard };
      }

      return { valid: true, message: 'Gift card is valid', giftCard };
    }
  },

  // Redeem a gift card (use in purchase)
  redeemGiftCard: async (code: string, amount: number, orderId: string): Promise<{
    success: boolean;
    message: string;
    giftCard?: GiftCard;
    amountUsed?: number;
    remainingBalance?: number;
  }> => {
    try {
      const response = await withApiTransition(
        () => enhancedApiClient.post('gift-cards/REDEEM', { code, amount, orderId }),
        async () => {
          // Fallback redemption logic
          const validateResult = await GiftCardService.validateGiftCard(code);

          if (!validateResult.valid || !validateResult.giftCard) {
            return {
              success: false,
              message: validateResult.message
            };
          }

          const giftCard = validateResult.giftCard;

          // Check if the balance is sufficient
          if (giftCard.balance < amount) {
            return {
              success: false,
              message: `Insufficient balance. Available: ${giftCard.balance.toFixed(2)}`,
              giftCard,
              remainingBalance: giftCard.balance
            };
          }

          // Redeem the amount
          const updatedGiftCard = await GiftCardService.adjustBalance(
            giftCard.id,
            amount,
            'redeem',
            `Purchase - Order #${orderId}`,
            orderId
          );

          if (!updatedGiftCard) {
            return {
              success: false,
              message: 'Failed to redeem gift card',
              giftCard
            };
          }

          return {
            success: true,
            message: 'Gift card redeemed successfully',
            giftCard: updatedGiftCard,
            amountUsed: amount,
            remainingBalance: updatedGiftCard.balance
          };
        },
        { endpoint: 'gift-cards/REDEEM' }
      );

      if (response.success || response.isMock) {
        // If the API returns a giftCard object, update the local cache
        if (response.data.giftCard) {
          const index = localGiftCards.findIndex(card => card.id === response.data.giftCard.id);
          if (index !== -1) {
            localGiftCards[index] = response.data.giftCard;
          }
        }
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to redeem gift card');
      }
    } catch (error) {
      console.error(`Error redeeming gift card with code ${code}:`, error);

      // Fallback redemption with local logic
      const validateResult = await GiftCardService.validateGiftCard(code);

      if (!validateResult.valid || !validateResult.giftCard) {
        return {
          success: false,
          message: validateResult.message
        };
      }

      const giftCard = validateResult.giftCard;

      // Check if the balance is sufficient
      if (giftCard.balance < amount) {
        return {
          success: false,
          message: `Insufficient balance. Available: ${giftCard.balance.toFixed(2)}`,
          giftCard,
          remainingBalance: giftCard.balance
        };
      }

      // Redeem the amount
      const updatedGiftCard = await GiftCardService.adjustBalance(
        giftCard.id,
        amount,
        'redeem',
        `Purchase - Order #${orderId}`,
        orderId
      );

      if (!updatedGiftCard) {
        return {
          success: false,
          message: 'Failed to redeem gift card',
          giftCard
        };
      }

      return {
        success: true,
        message: 'Gift card redeemed successfully',
        giftCard: updatedGiftCard,
        amountUsed: amount,
        remainingBalance: updatedGiftCard.balance
      };
    }
  }
};

export default GiftCardService;