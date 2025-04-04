import { useState, useEffect, useCallback } from 'react';
import { marketsService } from '../services/marketsService';
import { 
  Market, 
  CreateMarketInput, 
  UpdateMarketInput, 
  StockAllocation, 
  CreateStockAllocationInput,
  StaffAssignment,
  CreateStaffAssignmentInput,
  MarketFilter,
  MARKET_STATUS
} from '../types';

/**
 * Hook for managing markets data and operations
 */
export interface UseMarketsReturn {
  // State
  markets: Market[];
  selectedMarket: Market | null;
  stockAllocations: StockAllocation[];
  staffAssignments: StaffAssignment[];
  isLoading: boolean;
  error: Error | null;
  filters: MarketFilter;
  
  // Actions
  fetchMarkets: (filters?: MarketFilter) => Promise<Market[]>;
  fetchMarketById: (id: string) => Promise<Market | null>;
  createMarket: (marketData: CreateMarketInput) => Promise<Market>;
  updateMarket: (id: string, marketData: UpdateMarketInput) => Promise<Market>;
  deleteMarket: (id: string) => Promise<boolean>;
  fetchStockAllocations: (marketId: string) => Promise<StockAllocation[]>;
  allocateStock: (allocationData: CreateStockAllocationInput) => Promise<StockAllocation>;
  fetchStaffAssignments: (marketId: string) => Promise<StaffAssignment[]>;
  assignStaff: (assignmentData: CreateStaffAssignmentInput) => Promise<StaffAssignment>;
  setFilters: (newFilters: MarketFilter) => void;
}

export function useMarkets(): UseMarketsReturn {
  // State declarations
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [stockAllocations, setStockAllocations] = useState<StockAllocation[]>([]);
  const [staffAssignments, setStaffAssignments] = useState<StaffAssignment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<MarketFilter>({
    status: MARKET_STATUS.ACTIVE,
    searchTerm: '',
    sortBy: 'startDate',
    sortDirection: 'asc',
    page: 1,
    limit: 10
  });

  // Fetch all markets with optional filters
  const fetchMarkets = useCallback(async (newFilters?: MarketFilter): Promise<Market[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const appliedFilters = newFilters || filters;
      const results = await marketsService.fetchAll(appliedFilters);
      setMarkets(results);
      return results;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch markets');
      setError(error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Fetch a single market by ID
  const fetchMarketById = useCallback(async (id: string): Promise<Market | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const market = await marketsService.fetchById(id);
      setSelectedMarket(market);
      return market;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to fetch market with ID: ${id}`);
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new market
  const createMarket = useCallback(async (marketData: CreateMarketInput): Promise<Market> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newMarket = await marketsService.createMarket(marketData);
      setMarkets(prevMarkets => [...prevMarkets, newMarket]);
      return newMarket;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create market');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update an existing market
  const updateMarket = useCallback(async (id: string, marketData: UpdateMarketInput): Promise<Market> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedMarket = await marketsService.updateMarket(id, marketData);
      
      setMarkets(prevMarkets => 
        prevMarkets.map(market => 
          market.id === id ? updatedMarket : market
        )
      );
      
      if (selectedMarket?.id === id) {
        setSelectedMarket(updatedMarket);
      }
      
      return updatedMarket;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to update market with ID: ${id}`);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedMarket]);

  // Delete a market
  const deleteMarket = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await marketsService.deleteMarket(id);
      
      if (success) {
        setMarkets(prevMarkets => prevMarkets.filter(market => market.id !== id));
        
        if (selectedMarket?.id === id) {
          setSelectedMarket(null);
        }
      }
      
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to delete market with ID: ${id}`);
      setError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedMarket]);

  // Fetch stock allocations for a market
  const fetchStockAllocations = useCallback(async (marketId: string): Promise<StockAllocation[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const allocations = await marketsService.getStockAllocations(marketId);
      setStockAllocations(allocations);
      return allocations;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to fetch stock allocations for market: ${marketId}`);
      setError(error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Allocate stock to a market
  const allocateStock = useCallback(async (allocationData: CreateStockAllocationInput): Promise<StockAllocation> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newAllocation = await marketsService.allocateStock(allocationData);
      setStockAllocations(prevAllocations => [...prevAllocations, newAllocation]);
      return newAllocation;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to allocate stock');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch staff assignments for a market
  const fetchStaffAssignments = useCallback(async (marketId: string): Promise<StaffAssignment[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const assignments = await marketsService.getStaffAssignments(marketId);
      setStaffAssignments(assignments);
      return assignments;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to fetch staff assignments for market: ${marketId}`);
      setError(error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Assign staff to a market
  const assignStaff = useCallback(async (assignmentData: CreateStaffAssignmentInput): Promise<StaffAssignment> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newAssignment = await marketsService.assignStaff(assignmentData);
      setStaffAssignments(prevAssignments => [...prevAssignments, newAssignment]);
      return newAssignment;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to assign staff');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update filters and trigger market fetch
  const updateFilters = useCallback((newFilters: MarketFilter) => {
    setFilters(newFilters);
  }, []);

  // Fetch markets on initial load or when filters change
  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets, filters]);

  return {
    // State
    markets,
    selectedMarket,
    stockAllocations,
    staffAssignments,
    isLoading,
    error,
    filters,
    
    // Actions
    fetchMarkets,
    fetchMarketById,
    createMarket,
    updateMarket,
    deleteMarket,
    fetchStockAllocations,
    allocateStock,
    fetchStaffAssignments,
    assignStaff,
    setFilters: updateFilters
  };
} 