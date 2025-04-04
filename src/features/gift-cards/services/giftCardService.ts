import { GiftCard, GiftCardTransaction, TransactionType } from '../types';
import { mockGiftCards, mockTransactions } from '../data/mockData';

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

// Helper to generate a new ID based on current array length
const generateId = (array: any[]): string => {
  return (array.length + 1).toString();
};

// Gift Card Service to handle CRUD operations
export const GiftCardService = {
  // Get all gift cards
  getAllGiftCards: async (): Promise<GiftCard[]> => {
    // In a real application, this would fetch from an API
    return Promise.resolve([...mockGiftCards]);
  },

  // Get a gift card by ID
  getGiftCardById: async (id: string): Promise<GiftCard | null> => {
    const giftCard = mockGiftCards.find(card => card.id === id);
    return Promise.resolve(giftCard || null);
  },

  // Get a gift card by code
  getGiftCardByCode: async (code: string): Promise<GiftCard | null> => {
    const giftCard = mockGiftCards.find(card => card.code === code);
    return Promise.resolve(giftCard || null);
  },

  // Create a new gift card
  createGiftCard: async (giftCardData: Partial<GiftCard>): Promise<GiftCard> => {
    const newGiftCard: GiftCard = {
      id: generateId(mockGiftCards),
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

    // In a real application, this would call an API to create the gift card
    mockGiftCards.push(newGiftCard);

    // Create an issue transaction if there's an initial value
    if (newGiftCard.initialValue > 0) {
      const transaction: GiftCardTransaction = {
        id: generateId(mockTransactions),
        giftCardId: newGiftCard.id,
        type: 'issue',
        amount: newGiftCard.initialValue,
        date: new Date(),
        notes: 'Initial issue',
        performedBy: 'current-user', // In a real app, this would be the current user's ID
        balanceAfter: newGiftCard.initialValue,
      };

      mockTransactions.push(transaction);
    }

    return Promise.resolve(newGiftCard);
  },

  // Update a gift card
  updateGiftCard: async (id: string, updates: Partial<GiftCard>): Promise<GiftCard | null> => {
    const index = mockGiftCards.findIndex(card => card.id === id);
    if (index === -1) return Promise.resolve(null);

    const updatedGiftCard = {
      ...mockGiftCards[index],
      ...updates,
      // Prevent overriding these fields
      id: mockGiftCards[index].id,
      code: mockGiftCards[index].code,
      initialValue: mockGiftCards[index].initialValue,
    };

    // In a real application, this would call an API to update the gift card
    mockGiftCards[index] = updatedGiftCard;

    return Promise.resolve(updatedGiftCard);
  },

  // Adjust gift card balance
  adjustBalance: async (
    id: string, 
    amount: number, 
    type: TransactionType, 
    notes: string = '',
    orderId?: string
  ): Promise<GiftCard | null> => {
    const giftCard = mockGiftCards.find(card => card.id === id);
    if (!giftCard) return Promise.resolve(null);

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

    // In a real application, this would call an API to update the gift card
    const index = mockGiftCards.findIndex(card => card.id === id);
    mockGiftCards[index] = updatedGiftCard;

    // Create a transaction record
    const transaction: GiftCardTransaction = {
      id: generateId(mockTransactions),
      giftCardId: id,
      type,
      amount,
      date: new Date(),
      notes,
      performedBy: 'current-user', // In a real app, this would be the current user's ID
      balanceAfter: newBalance,
      orderId,
    };

    mockTransactions.push(transaction);

    return Promise.resolve(updatedGiftCard);
  },

  // Get transaction history for a gift card
  getTransactionHistory: async (giftCardId: string): Promise<GiftCardTransaction[]> => {
    const transactions = mockTransactions.filter(tx => tx.giftCardId === giftCardId);
    return Promise.resolve([...transactions]);
  },

  // Validate a gift card (check if it's valid for use)
  validateGiftCard: async (code: string): Promise<{ valid: boolean; message: string; giftCard?: GiftCard }> => {
    const giftCard = mockGiftCards.find(card => card.code === code);
    
    if (!giftCard) {
      return Promise.resolve({ valid: false, message: 'Gift card not found' });
    }

    if (giftCard.status === 'expired') {
      return Promise.resolve({ valid: false, message: 'Gift card has expired', giftCard });
    }

    if (giftCard.status === 'used') {
      return Promise.resolve({ valid: false, message: 'Gift card has been fully redeemed', giftCard });
    }

    if (giftCard.status === 'disabled') {
      return Promise.resolve({ valid: false, message: 'Gift card has been disabled', giftCard });
    }

    if (giftCard.balance <= 0) {
      return Promise.resolve({ valid: false, message: 'Gift card has zero balance', giftCard });
    }

    if (giftCard.expirationDate && new Date() > giftCard.expirationDate) {
      // Update the card to expired status
      this.adjustBalance(giftCard.id, giftCard.balance, 'expire', 'Card expired');
      return Promise.resolve({ valid: false, message: 'Gift card has expired', giftCard });
    }

    return Promise.resolve({ valid: true, message: 'Gift card is valid', giftCard });
  },

  // Redeem a gift card (use in purchase)
  redeemGiftCard: async (code: string, amount: number, orderId: string): Promise<{ 
    success: boolean; 
    message: string; 
    giftCard?: GiftCard;
    amountUsed?: number;
    remainingBalance?: number;
  }> => {
    const validationResult = await this.validateGiftCard(code);
    
    if (!validationResult.valid) {
      return Promise.resolve({ 
        success: false, 
        message: validationResult.message
      });
    }

    const giftCard = validationResult.giftCard!;
    
    // Check if amount is greater than balance
    const amountToUse = Math.min(amount, giftCard.balance);
    
    // Update the card
    const updatedGiftCard = await this.adjustBalance(
      giftCard.id, 
      amountToUse, 
      'redeem', 
      `Redeemed for order #${orderId}`,
      orderId
    );

    if (!updatedGiftCard) {
      return Promise.resolve({ 
        success: false, 
        message: 'Failed to redeem gift card' 
      });
    }

    return Promise.resolve({
      success: true,
      message: 'Gift card successfully redeemed',
      giftCard: updatedGiftCard,
      amountUsed: amountToUse,
      remainingBalance: updatedGiftCard.balance,
    });
  },
};

export default GiftCardService; 