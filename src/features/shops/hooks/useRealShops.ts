import { useState, useEffect, useCallback } from 'react';
import { realShopService } from '../services/realShopService';
import { Shop, SHOP_STATUS, ShopInventoryItem, StaffAssignment } from '../types';
import { useToast } from '@/components/ui/use-toast';

// Check if in development mode
const isDevelopment = import.meta.env.MODE === 'development';

interface UseRealShopsReturnType {
  shops: Shop[];
  isLoading: boolean;
  error: Error | null;
  selectedShop: Shop | null;
  shopInventory: ShopInventoryItem[];
  staffAssignments: StaffAssignment[];

  // Shop methods
  fetchShops: () => Promise<void>;
  fetchShopById: (id: string) => Promise<Shop>;
  createShop: (shop: Omit<Shop, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Shop>;
  updateShop: (id: string, shopData: Partial<Shop>) => Promise<Shop>;
  deleteShop: (id: string) => Promise<void>;
  updateShopStatus: (id: string, status: SHOP_STATUS) => Promise<Shop>;

  // Inventory methods
  fetchShopInventory: (shopId: string) => Promise<void>;

  // Staff methods
  fetchStaffAssignments: (shopId: string) => Promise<void>;
  assignStaff: (shopId: string, staffId: string, role?: string, isPrimary?: boolean) => Promise<StaffAssignment>;
  removeStaff: (assignmentId: string) => Promise<void>;

  // Report methods
  generateReport: (shopId: string, reportType: string, dateRange: { from: Date, to: Date }) => Promise<any>;
}

/**
 * Custom hook for managing shops data and operations with real backend
 */
export function useRealShops(): UseRealShopsReturnType {
  const { toast } = useToast();
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [shopInventory, setShopInventory] = useState<ShopInventoryItem[]>([]);
  const [staffAssignments, setStaffAssignments] = useState<StaffAssignment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all shops
  const fetchShops = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Add a retry mechanism for better reliability
      let retryCount = 0;
      const maxRetries = 2;
      let fetchedShops: Shop[] = [];
      let lastError: Error | null = null;
      
      while (retryCount <= maxRetries) {
        try {
          console.log(`Attempting to fetch shops (attempt ${retryCount + 1} of ${maxRetries + 1})`);
          fetchedShops = await realShopService.fetchAll();
          // If successful, break out of the retry loop
          break;
        } catch (err) {
          // Ensure error is properly formatted regardless of type
          lastError = err instanceof Error ? err : new Error(
            typeof err === 'string' ? err : 'Unknown error occurred while fetching shops'
          );
          console.warn(`Shop fetch attempt ${retryCount + 1} failed:`, err);
          retryCount++;
          
          // If we haven't reached max retries, wait before trying again
          if (retryCount <= maxRetries) {
            const delay = retryCount * 1000; // Increase delay with each retry
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      // If we have shops, update the state
      if (fetchedShops.length > 0) {
        setShops(fetchedShops);
        setError(null);
      } else if (lastError) {
        // If all retries failed, handle the error
        throw lastError;
      }
    } catch (err) {
      console.error('Shop fetch error after retries:', err);
      
      // Ensure error is always an Error object
      const formattedError = err instanceof Error ? err : new Error(
        typeof err === 'string' ? err : 'Failed to fetch shops'
      );
      
      setError(formattedError);

      // Show error toast with more detailed information
      toast({
        title: "Error",
        description: `Failed to fetch shops: ${formattedError.message}. Please try again later or contact support if the issue persists.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch a shop by ID
  const fetchShopById = useCallback(async (id: string): Promise<Shop> => {
    setIsLoading(true);
    setError(null);

    try {
      const shop = await realShopService.fetchById(id);
      setSelectedShop(shop);

      // Successfully fetched shop from the API

      return shop; // Return the shop for component use
    } catch (err) {
      console.error(`Shop fetch error for ID ${id}:`, err);
      setError(err as Error);

      // Show error toast
      toast({
        title: "Error",
        description: `Failed to fetch shop: ${(err as Error).message}`,
        variant: "destructive",
      });
      throw err; // Re-throw to allow components to handle
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Create a new shop
  const createShop = useCallback(async (shop: Omit<Shop, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);

    try {
      const newShop = await realShopService.createShop(shop);

      // Add the new shop to the shops list
      setShops(prevShops => {
        // Check if the shop already exists in the list
        const exists = prevShops.some(s => s.id === newShop.id);
        if (exists) {
          // Update the existing shop
          return prevShops.map(s => s.id === newShop.id ? newShop : s);
        } else {
          // Add the new shop
          return [...prevShops, newShop];
        }
      });

      toast({
        title: "Success",
        description: `Shop "${newShop.name}" created successfully`,
      });

      // Refresh the shops list to ensure we have the latest data
      setTimeout(() => fetchShops(), 500);

      return newShop;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error",
        description: `Failed to create shop: ${(err as Error).message}`,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchShops]);

  // Update an existing shop
  const updateShop = useCallback(async (id: string, shopData: Partial<Shop>) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedShop = await realShopService.updateShop(id, shopData);

      // Update shops list
      setShops(prevShops =>
        prevShops.map(shop =>
          shop.id === id ? updatedShop : shop
        )
      );

      // Update selected shop if it's the one being updated
      if (selectedShop?.id === id) {
        setSelectedShop(updatedShop);
      }

      toast({
        title: "Success",
        description: `Shop "${updatedShop.name}" updated successfully`,
      });

      return updatedShop;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error",
        description: `Failed to update shop: ${(err as Error).message}`,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedShop, toast]);

  // Delete a shop
  const deleteShop = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await realShopService.deleteShop(id);

      // Remove from shops list
      setShops(prevShops => prevShops.filter(shop => shop.id !== id));

      // Clear selected shop if it's the one being deleted
      if (selectedShop?.id === id) {
        setSelectedShop(null);
      }

      toast({
        title: "Success",
        description: "Shop deleted successfully",
      });
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error",
        description: `Failed to delete shop: ${(err as Error).message}`,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedShop, toast]);

  // Update shop status
  const updateShopStatus = useCallback(async (id: string, status: SHOP_STATUS): Promise<Shop> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the generic updateShop method to update the status
      const updatedShop = await updateShop(id, { status });
      
      // Update the global shops list to reflect this change
      setShops(prevShops => 
        prevShops.map(shop => 
          shop.id === id ? {...shop, status} : shop
        )
      );
      
      // Return the updated shop
      return updatedShop;
    } catch (err) {
      // Log the error for debugging
      console.error('Error updating shop status:', err);
      
      // Set the error state
      const formattedError = err instanceof Error ? err : new Error(
        typeof err === 'string' ? err : 'Failed to update shop status'
      );
      
      setError(formattedError);
      
      // Show toast notification
      toast({
        title: "Status Update Failed",
        description: formattedError.message,
        variant: "destructive",
      });
      
      // In development mode, simulate a successful update to avoid breaking the UI
      if (isDevelopment) {
        console.warn('Using fallback shop status update in development mode');
        
        // Find the shop in the current list
        const existingShop = shops.find(s => s.id === id);
        
        if (existingShop) {
          // Create an updated version with the new status
          const mockUpdatedShop = {
            ...existingShop,
            status,
            updatedAt: new Date().toISOString()
          };
          
          // Update the shops list with this mock update
          setShops(prevShops => 
            prevShops.map(shop => 
              shop.id === id ? mockUpdatedShop : shop
            )
          );
          
          // Return the mock updated shop
          return mockUpdatedShop;
        }
      }
      
      // If we're not in development mode or couldn't find the shop, re-throw
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [updateShop, shops, toast, setError, setIsLoading, setShops, isDevelopment]);

  // Fetch shop inventory
  const fetchShopInventory = useCallback(async (shopId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const inventory = await realShopService.fetchInventory(shopId);
      setShopInventory(inventory);
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error",
        description: `Failed to fetch inventory: ${(err as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch staff assignments
  const fetchStaffAssignments = useCallback(async (shopId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const assignments = await realShopService.fetchStaffAssignments(shopId);
      setStaffAssignments(assignments);
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error",
        description: `Failed to fetch staff assignments: ${(err as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Assign staff to a shop
  const assignStaff = useCallback(async (
    shopId: string, 
    staffId: string, 
    role?: string, 
    isPrimary: boolean = false
  ): Promise<StaffAssignment> => {
    setIsLoading(true);
    setError(null);

    try {
      // Create staff assignment object
      const staffAssignment = {
        staffId,
        role: role || 'Associate',
        isPrimary,
        startDate: new Date().toISOString(),
      };

      // If the method exists in the service, use it, otherwise simulate
      let assignment;
      if (typeof realShopService.assignStaffToShop === 'function') {
        assignment = await realShopService.assignStaffToShop(shopId, staffAssignment);
      } else {
        // Mock implementation as fallback
        console.warn('Using mock implementation for assignStaff - realShopService.assignStaffToShop not available');
        assignment = {
          id: `assignment-${Date.now()}`,
          shopId,
          staffId,
          role: role || 'Associate',
          isPrimary,
          startDate: new Date().toISOString(),
        };
      }

      // Update staff assignments
      setStaffAssignments(prev => [...prev, assignment]);

      return assignment;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Remove staff from a shop
  const removeStaff = useCallback(async (assignmentId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // If the method exists in the service, use it, otherwise simulate
      if (typeof realShopService.removeStaffAssignment === 'function') {
        await realShopService.removeStaffAssignment(assignmentId);
      } else {
        // Mock implementation as fallback
        console.warn('Using mock implementation for removeStaff - realShopService.removeStaffAssignment not available');
        // Just simulate success
      }

      // Update staff assignments
      setStaffAssignments(prev => prev.filter(assignment => assignment.id !== assignmentId));
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate shop report
  const generateReport = useCallback(async (
    shopId: string, 
    reportType: string, 
    dateRange: { from: Date, to: Date }
  ): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      // If the method exists in the service, use it, otherwise simulate
      if (typeof realShopService.getShopReports === 'function') {
        return await realShopService.getShopReports(shopId, 'month');
      } else {
        // Mock implementation as fallback
        console.warn('Using mock implementation for generateReport - realShopService.getShopReports not available');
        return {
          period: 'month',
          shopId,
          reportType,
          dateRange,
          data: {
            sales: 0,
            transactions: 0,
            averageTransactionValue: 0,
            topProducts: [],
            salesByDay: []
          }
        };
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load shops on initial mount
  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  // Define the return value for the hook
  return {
    shops,
    isLoading,
    error,
    selectedShop,
    shopInventory,
    staffAssignments,

    // Shop methods
    fetchShops,
    fetchShopById,
    createShop,
    updateShop,
    deleteShop,
    updateShopStatus,

    // Inventory methods
    fetchShopInventory,

    // Staff methods
    fetchStaffAssignments,
    assignStaff,
    removeStaff,

    // Report methods
    generateReport,
  } as UseRealShopsReturnType;
}

export default useRealShops;
