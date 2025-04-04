import { useState, useEffect, useCallback } from 'react';
import { GiftCard, GiftCardTransaction, GiftCardFilter, TransactionType } from '../../types/gift-cards';
import GiftCardService from '../../services/gift-cards/giftCardService';

// Hook for managing gift cards
export function useGiftCards() {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [filteredGiftCards, setFilteredGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<GiftCardFilter>({});
  const [selectedGiftCard, setSelectedGiftCard] = useState<GiftCard | null>(null);
  const [transactions, setTransactions] = useState<GiftCardTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState<boolean>(false);

  // Load gift cards
  const loadGiftCards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await GiftCardService.getAllGiftCards();
      setGiftCards(data);
      setFilteredGiftCards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gift cards');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load transactions for a gift card
  const loadTransactions = useCallback(async (giftCardId: string) => {
    setTransactionsLoading(true);
    try {
      const history = await GiftCardService.getTransactionHistory(giftCardId);
      setTransactions(history);
    } catch (err) {
      console.error('Failed to load transaction history', err);
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

  // Select a gift card and load its transactions
  const selectGiftCard = useCallback(async (giftCard: GiftCard) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedGiftCard(giftCard);
      await loadTransactions(giftCard.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gift card details');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadTransactions]);

  // Clear selected gift card
  const clearSelectedGiftCard = useCallback(() => {
    setSelectedGiftCard(null);
    setTransactions([]);
  }, []);

  // Create a new gift card
  const createGiftCard = useCallback(async (giftCard: Omit<GiftCard, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      const newGiftCard = await GiftCardService.createGiftCard(giftCard);
      setGiftCards(prev => [...prev, newGiftCard]);
      applyFilter(filter, [...giftCards, newGiftCard]);
      return newGiftCard;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create gift card');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [giftCards, filter]);

  // Update a gift card
  const updateGiftCard = useCallback(async (id: string, updates: Partial<GiftCard>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedGiftCard = await GiftCardService.updateGiftCard(id, updates);
      setGiftCards(prev => prev.map(card => 
        card.id === id ? updatedGiftCard : card
      ));
      applyFilter(filter, giftCards.map(card => card.id === id ? updatedGiftCard : card));
      
      // Update selected gift card if it's the one being updated
      if (selectedGiftCard && selectedGiftCard.id === id) {
        setSelectedGiftCard(updatedGiftCard);
      }
      return updatedGiftCard;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update gift card');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [giftCards, selectedGiftCard, filter]);

  // Adjust gift card balance
  const adjustBalance = useCallback(async (
    id: string,
    amount: number,
    type: TransactionType,
    reason: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const updatedGiftCard = await GiftCardService.adjustBalance(id, amount, type, reason);
      setGiftCards(prev => prev.map(card => 
        card.id === id ? updatedGiftCard : card
      ));
      applyFilter(filter, giftCards.map(card => card.id === id ? updatedGiftCard : card));
      
      // Update selected gift card if it's the one being updated
      if (selectedGiftCard && selectedGiftCard.id === id) {
        setSelectedGiftCard(updatedGiftCard);
        loadTransactions(id); // Reload transactions
      }
      return updatedGiftCard;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to adjust balance');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [giftCards, selectedGiftCard, filter, loadTransactions]);

  // Validate a gift card by code
  const validateGiftCard = useCallback(async (code: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await GiftCardService.validateGiftCard(code);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate gift card');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Redeem a gift card
  const redeemGiftCard = useCallback(async (code: string, amount: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await GiftCardService.redeemGiftCard(code, amount, '');
      if (result.success && result.giftCard) {
        setGiftCards(prevCards => 
          prevCards.map(card => card.id === result.giftCard!.id ? result.giftCard! : card)
        );
        applyFilter(filter, giftCards.map(card => card.id === result.giftCard!.id ? result.giftCard! : card));
        
        // Update selected gift card if it's the one being redeemed
        if (selectedGiftCard && selectedGiftCard.id === result.giftCard.id) {
          setSelectedGiftCard(result.giftCard);
          loadTransactions(result.giftCard.id); // Reload transactions
        }
      }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to redeem gift card');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [giftCards, selectedGiftCard, filter, loadTransactions]);

  // Apply filter function
  const applyFilter = useCallback((filter: GiftCardFilter, cards: GiftCard[] = giftCards) => {
    setFilter(filter);
    
    let filtered = [...cards];
    
    // Apply status filter
    if (filter.status) {
      filtered = filtered.filter(card => card.status === filter.status);
    }
    
    // Apply balance range filter
    if (filter.minBalance !== undefined) {
      filtered = filtered.filter(card => card.balance >= (filter.minBalance || 0));
    }
    
    if (filter.maxBalance !== undefined) {
      filtered = filtered.filter(card => card.balance <= (filter.maxBalance || Infinity));
    }
    
    // Apply date range filter
    if (filter.startDate) {
      filtered = filtered.filter(card => new Date(card.issueDate) >= (filter.startDate || new Date(0)));
    }
    
    if (filter.endDate) {
      const endDate = new Date(filter.endDate);
      endDate.setHours(23, 59, 59, 999); // End of the day
      filtered = filtered.filter(card => new Date(card.issueDate) <= (endDate || new Date()));
    }
    
    // Apply search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(card => 
        card.code.toLowerCase().includes(searchLower) ||
        (card.recipient.name && card.recipient.name.toLowerCase().includes(searchLower)) ||
        (card.recipient.email && card.recipient.email.toLowerCase().includes(searchLower)) ||
        (card.sender.name && card.sender.name.toLowerCase().includes(searchLower))
      );
    }
    
    setFilteredGiftCards(filtered);
  }, [giftCards]);

  // Load gift cards on initial render
  useEffect(() => {
    loadGiftCards();
  }, [loadGiftCards]);

  return {
    giftCards,
    filteredGiftCards,
    loading,
    error,
    filter,
    selectedGiftCard,
    transactions,
    transactionsLoading,
    selectGiftCard,
    clearSelectedGiftCard,
    loadGiftCards,
    adjustBalance,
    applyFilter,
    createGiftCard,
    updateGiftCard,
    validateGiftCard,
    redeemGiftCard,
  };
} 