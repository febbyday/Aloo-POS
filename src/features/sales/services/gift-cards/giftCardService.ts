/**
 * @deprecated This service is deprecated. Use the factory-based gift card service instead.
 * Import from the parent directory's index.ts file:
 * import { GiftCardService } from '../services';
 */
import { GiftCard, GiftCardTransaction, TransactionType } from '../../types/gift-cards';
import { enhancedApiClient } from '@/lib/api/enhanced-api-client';
import { getApiUrl } from '@/lib/api/enhanced-config';
import { withApiTransition } from '@/lib/api/api-transition-utils';
import { v4 as uuidv4 } from 'uuid';

// Fallback data for when API is unavailable
const fallbackGiftCards: GiftCard[] = [
  {
    id: "1",
    code: "GIFT-ABCD-1234",
    initialValue: 100,
    balance: 75,
    expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
    issueDate: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString(),
    lastUsedDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    status: "active",
    recipient: {
      name: "Jane Doe",
      email: "jane.doe@example.com"
    },
    sender: {
      name: "John Smith",
      email: "john.smith@example.com"
    },
    message: "Happy Birthday!",
    designTemplateId: "template1",
    metadata: {}
  },
  {
    id: "2",
    code: "GIFT-EFGH-5678",
    initialValue: 50,
    balance: 50,
    expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
    issueDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
    lastUsedDate: null,
    status: "active",
    recipient: {
      name: "Bob Johnson",
      email: "bob.johnson@example.com"
    },
    sender: {
      name: "Alice Williams",
      email: "alice.williams@example.com"
    },
    message: "Thank you for your help!",
    designTemplateId: "template2",
    metadata: {}
  },
  {
    id: "3",
    code: "GIFT-IJKL-9012",
    initialValue: 200,
    balance: 0,
    expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
    issueDate: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString(),
    lastUsedDate: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    status: "depleted",
    recipient: {
      name: "Charlie Brown",
      email: "charlie.brown@example.com"
    },
    sender: {
      name: "Lucy Van Pelt",
      email: "lucy.vanpelt@example.com"
    },
    message: "Congratulations on your graduation!",
    designTemplateId: "template3",
    metadata: {}
  }
];

// Fallback transaction data for when API is unavailable
const fallbackTransactions: GiftCardTransaction[] = [
  {
    id: "1",
    giftCardId: "1",
    type: "issue",
    amount: 100,
    date: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString(),
    notes: "Initial issue",
    performedBy: "staff-1",
    balanceAfter: 100
  },
  {
    id: "2",
    giftCardId: "1",
    type: "redeem",
    amount: 25,
    date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    notes: "Purchase - Order #12345",
    performedBy: "staff-2",
    balanceAfter: 75,
    orderId: "12345"
  },
  {
    id: "3",
    giftCardId: "2",
    type: "issue",
    amount: 50,
    date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
    notes: "Initial issue",
    performedBy: "staff-1",
    balanceAfter: 50
  },
  {
    id: "4",
    giftCardId: "3",
    type: "issue",
    amount: 200,
    date: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString(),
    notes: "Initial issue",
    performedBy: "staff-3",
    balanceAfter: 200
  },
  {
    id: "5",
    giftCardId: "3",
    type: "redeem",
    amount: 150,
    date: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(),
    notes: "Purchase - Order #12346",
    performedBy: "staff-2",
    balanceAfter: 50,
    orderId: "12346"
  },
  {
    id: "6",
    giftCardId: "3",
    type: "redeem",
    amount: 50,
    date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    notes: "Purchase - Order #12347",
    performedBy: "staff-4",
    balanceAfter: 0,
    orderId: "12347"
  }
];

// Local memory cache for operations when offline
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
const GiftCardService = {
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
        () => enhancedApiClient.get('gift-cards/VALIDATE', { code }),
        localGiftCards.find(card => card.code === code) || null,
        { endpoint: 'gift-cards/VALIDATE' }
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
      issueDate: new Date().toISOString(),
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

      if (response.success) {
        // Update local cache
        localGiftCards.push(response.data);

        // Create an issue transaction if there's an initial value
        if (response.data.initialValue > 0) {
          await GiftCardService.createTransaction(response.data.id, {
            type: 'issue',
            amount: response.data.initialValue,
            notes: 'Initial issue',
          });
        }

        return response.data;
      } else if (response.isMock) {
        // Update local cache
        localGiftCards.push(newGiftCard);

        // Create an issue transaction if there's an initial value
        if (newGiftCard.initialValue > 0) {
          const transaction: GiftCardTransaction = {
            id: generateId(),
            giftCardId: newGiftCard.id,
            type: 'issue',
            amount: newGiftCard.initialValue,
            date: new Date().toISOString(),
            notes: 'Initial issue',
            performedBy: 'current-user', // In a real app, this would be the current user's ID
            balanceAfter: newGiftCard.initialValue,
          };

          localTransactions.push(transaction);
        }

        return newGiftCard;
      } else {
        throw new Error(response.error || 'Failed to create gift card');
      }
    } catch (error) {
      console.error('Error creating gift card:', error);

      // Fallback: Add to local cache only
      localGiftCards.push(newGiftCard);

      // Create a local transaction for the initial value
      if (newGiftCard.initialValue > 0) {
        const transaction: GiftCardTransaction = {
          id: generateId(),
          giftCardId: newGiftCard.id,
          type: 'issue',
          amount: newGiftCard.initialValue,
          date: new Date().toISOString(),
          notes: 'Initial issue (offline)',
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

    const updatedGiftCard = {
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
        // Update local cache
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

      // Fallback: Update local cache only
      const index = localGiftCards.findIndex(card => card.id === id);
      if (index !== -1) {
        localGiftCards[index] = updatedGiftCard;
      }

      return updatedGiftCard;
    }
  },

  // Create a transaction
  createTransaction: async (
    giftCardId: string,
    transactionData: {
      type: TransactionType;
      amount: number;
      notes?: string;
      orderId?: string;
    }
  ): Promise<GiftCardTransaction | null> => {
    const giftCard = localGiftCards.find(card => card.id === giftCardId);
    if (!giftCard) return null;

    let newBalance: number;

    // Calculate new balance based on transaction type
    if (transactionData.type === 'issue' || transactionData.type === 'reload') {
      newBalance = giftCard.balance + transactionData.amount;
    } else if (transactionData.type === 'redeem') {
      newBalance = giftCard.balance - transactionData.amount;
      if (newBalance < 0) return null; // Insufficient balance
    } else if (transactionData.type === 'void') {
      // For void transaction, amount is the amount to be returned to the balance
      newBalance = giftCard.balance + transactionData.amount;
    } else {
      newBalance = giftCard.balance;
    }

    const transaction: GiftCardTransaction = {
      id: generateId(),
      giftCardId,
      type: transactionData.type,
      amount: transactionData.amount,
      date: new Date().toISOString(),
      notes: transactionData.notes || '',
      performedBy: 'current-user', // In a real app, this would be the current user's ID
      balanceAfter: newBalance,
      orderId: transactionData.orderId,
    };

    try {
      const response = await withApiTransition(
        () => enhancedApiClient.post('gift-cards/TRANSACTIONS', transaction),
        transaction,
        { endpoint: 'gift-cards/TRANSACTIONS' }
      );

      if (response.success) {
        // Update local transaction cache
        localTransactions.push(response.data);

        // Update gift card balance
        const cardIndex = localGiftCards.findIndex(card => card.id === giftCardId);
        if (cardIndex !== -1) {
          localGiftCards[cardIndex] = {
            ...localGiftCards[cardIndex],
            balance: newBalance,
            lastUsedDate: new Date().toISOString(),
            status: newBalance <= 0 ? 'depleted' : 'active',
          };
        }

        return response.data;
      } else if (response.isMock) {
        // Update local transaction cache
        localTransactions.push(transaction);

        // Update gift card balance
        const cardIndex = localGiftCards.findIndex(card => card.id === giftCardId);
        if (cardIndex !== -1) {
          localGiftCards[cardIndex] = {
            ...localGiftCards[cardIndex],
            balance: newBalance,
            lastUsedDate: new Date().toISOString(),
            status: newBalance <= 0 ? 'depleted' : 'active',
          };
        }

        return transaction;
      } else {
        throw new Error(response.error || 'Failed to create transaction');
      }
    } catch (error) {
      console.error('Error creating transaction:', error);

      // Fallback: Update local cache only
      localTransactions.push(transaction);

      // Update gift card balance
      const cardIndex = localGiftCards.findIndex(card => card.id === giftCardId);
      if (cardIndex !== -1) {
        localGiftCards[cardIndex] = {
          ...localGiftCards[cardIndex],
          balance: newBalance,
          lastUsedDate: new Date().toISOString(),
          status: newBalance <= 0 ? 'depleted' : 'active',
        };
      }

      return transaction;
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
    return GiftCardService.createTransaction(id, { type, amount, notes, orderId })
      .then(transaction => {
        if (!transaction) return null;
        return GiftCardService.getGiftCardById(id);
      });
  },

  // Get transaction history for a gift card
  getTransactionHistory: async (giftCardId: string): Promise<GiftCardTransaction[]> => {
    try {
      const response = await withApiTransition(
        () => enhancedApiClient.get('gift-cards/TRANSACTIONS', { id: giftCardId }),
        localTransactions.filter(t => t.giftCardId === giftCardId),
        { endpoint: 'gift-cards/TRANSACTIONS' }
      );

      if (response.success) {
        return response.data;
      } else if (response.isMock) {
        return response.data;
      } else {
        throw new Error(response.error || `Failed to get transactions for gift card ${giftCardId}`);
      }
    } catch (error) {
      console.error(`Error fetching transactions for gift card ${giftCardId}:`, error);
      return localTransactions.filter(t => t.giftCardId === giftCardId);
    }
  },

  // Validate a gift card (check if it's valid for use)
  validateGiftCard: async (code: string): Promise<{ valid: boolean; message: string; giftCard?: GiftCard }> => {
    try {
      const giftCard = await GiftCardService.getGiftCardByCode(code);

      if (!giftCard) {
        return { valid: false, message: 'Gift card not found' };
      }

      if (giftCard.status !== 'active') {
        return {
          valid: false,
          message: `Gift card is ${giftCard.status}`,
          giftCard
        };
      }

      if (giftCard.balance <= 0) {
        return {
          valid: false,
          message: 'Gift card has no balance remaining',
          giftCard
        };
      }

      if (giftCard.expirationDate && new Date(giftCard.expirationDate) < new Date()) {
        return {
          valid: false,
          message: 'Gift card has expired',
          giftCard
        };
      }

      return {
        valid: true,
        message: `Gift card is valid with balance: $${giftCard.balance.toFixed(2)}`,
        giftCard
      };
    } catch (error) {
      console.error(`Error validating gift card with code ${code}:`, error);
      return { valid: false, message: 'Error validating gift card' };
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
      // First validate the gift card
      const validation = await GiftCardService.validateGiftCard(code);

      if (!validation.valid || !validation.giftCard) {
        return {
          success: false,
          message: validation.message
        };
      }

      const giftCard = validation.giftCard;

      // Check if requested amount exceeds balance
      if (amount > giftCard.balance) {
        // Use partial amount (up to available balance)
        const partialAmount = giftCard.balance;

        // Create redemption transaction
        await GiftCardService.adjustBalance(
          giftCard.id,
          partialAmount,
          'redeem',
          `Partial redemption - Order #${orderId}`,
          orderId
        );

        return {
          success: true,
          message: `Partial amount redeemed: $${partialAmount.toFixed(2)}. Gift card depleted.`,
          giftCard: await GiftCardService.getGiftCardById(giftCard.id),
          amountUsed: partialAmount,
          remainingBalance: 0
        };
      }

      // Create redemption transaction for full requested amount
      await GiftCardService.adjustBalance(
        giftCard.id,
        amount,
        'redeem',
        `Redemption - Order #${orderId}`,
        orderId
      );

      const updatedGiftCard = await GiftCardService.getGiftCardById(giftCard.id);

      return {
        success: true,
        message: `Successfully redeemed $${amount.toFixed(2)}`,
        giftCard: updatedGiftCard,
        amountUsed: amount,
        remainingBalance: updatedGiftCard?.balance || 0
      };
    } catch (error) {
      console.error(`Error redeeming gift card with code ${code}:`, error);
      return {
        success: false,
        message: 'Error processing gift card redemption'
      };
    }
  },
};

export default GiftCardService;