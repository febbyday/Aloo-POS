import { useState, useEffect, useCallback } from 'react';
import { shopService } from '../services/shopService';
import { Shop, SHOP_STATUS, ShopInventoryItem, StaffAssignment, ShopTransfer, InventoryLocation } from '../types';

interface UseShopsReturnType {
  shops: Shop[];
  isLoading: boolean;
  error: Error | null;
  selectedShop: Shop | null;
  shopInventory: ShopInventoryItem[];
  staffAssignments: StaffAssignment[];
  shopTransfers: ShopTransfer[];
  inventoryLocations: InventoryLocation[];
  
  // Action methods
  fetchShops: () => Promise<void>;
  fetchShopById: (id: string) => Promise<void>;
  createShop: (shop: Omit<Shop, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Shop>;
  updateShop: (id: string, shopData: Partial<Shop>) => Promise<Shop>;
  deleteShop: (id: string) => Promise<void>;
  updateShopStatus: (id: string, status: SHOP_STATUS) => Promise<Shop>;
  
  // Inventory methods
  fetchShopInventory: (shopId: string) => Promise<void>;
  
  // Staff methods
  fetchStaffAssignments: (shopId: string) => Promise<void>;
  createStaffAssignment: (assignment: Omit<StaffAssignment, 'id'>) => Promise<StaffAssignment>;
  removeStaffAssignment: (assignmentId: string) => Promise<void>;
  
  // Transfer methods
  fetchShopTransfers: (shopId: string) => Promise<void>;
  createTransfer: (transfer: Omit<ShopTransfer, 'id' | 'createdAt' | 'completedAt'>) => Promise<ShopTransfer>;
  updateTransferStatus: (transferId: string, status: 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED') => Promise<ShopTransfer>;
  
  // Location methods
  fetchInventoryLocations: (shopId: string) => Promise<void>;
  createInventoryLocation: (shopId: string, location: Omit<InventoryLocation, 'id' | 'createdAt'>) => Promise<InventoryLocation>;
}

/**
 * Custom hook for managing shops data and operations
 */
export function useShops(): UseShopsReturnType {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [shopInventory, setShopInventory] = useState<ShopInventoryItem[]>([]);
  const [staffAssignments, setStaffAssignments] = useState<StaffAssignment[]>([]);
  const [shopTransfers, setShopTransfers] = useState<ShopTransfer[]>([]);
  const [inventoryLocations, setInventoryLocations] = useState<InventoryLocation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch all shops
  const fetchShops = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await shopService.fetchAll();
      setShops(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch shops'));
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Fetch a single shop by ID
  const fetchShopById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await shopService.fetchById(id);
      setSelectedShop(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch shop with ID ${id}`));
      setSelectedShop(null);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Create a new shop
  const createShop = useCallback(async (shopData: Omit<Shop, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newShop = await shopService.create(shopData);
      setShops(prevShops => [...prevShops, newShop]);
      return newShop;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create shop');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Update an existing shop
  const updateShop = useCallback(async (id: string, shopData: Partial<Shop>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedShop = await shopService.update(id, shopData);
      
      // Update the shops list
      setShops(prevShops => 
        prevShops.map(shop => shop.id === id ? updatedShop : shop)
      );
      
      // Update selected shop if it's the one being updated
      if (selectedShop && selectedShop.id === id) {
        setSelectedShop(updatedShop);
      }
      
      return updatedShop;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to update shop with ID ${id}`);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedShop]);
  
  // Delete a shop
  const deleteShop = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await shopService.delete(id);
      
      // Remove from shops list
      setShops(prevShops => prevShops.filter(shop => shop.id !== id));
      
      // Clear selected shop if it's the one being deleted
      if (selectedShop && selectedShop.id === id) {
        setSelectedShop(null);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to delete shop with ID ${id}`);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedShop]);
  
  // Update shop status
  const updateShopStatus = useCallback(async (id: string, status: SHOP_STATUS) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedShop = await shopService.updateStatus(id, status);
      
      // Update the shops list
      setShops(prevShops => 
        prevShops.map(shop => shop.id === id ? updatedShop : shop)
      );
      
      // Update selected shop if it's the one being updated
      if (selectedShop && selectedShop.id === id) {
        setSelectedShop(updatedShop);
      }
      
      return updatedShop;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to update status for shop with ID ${id}`);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedShop]);
  
  // Fetch inventory for a shop
  const fetchShopInventory = useCallback(async (shopId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const inventory = await shopService.fetchInventory(shopId);
      setShopInventory(inventory);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch inventory for shop with ID ${shopId}`));
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Fetch staff assignments for a shop
  const fetchStaffAssignments = useCallback(async (shopId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const assignments = await shopService.fetchStaffAssignments(shopId);
      setStaffAssignments(assignments);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch staff assignments for shop with ID ${shopId}`));
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Create a staff assignment
  const createStaffAssignment = useCallback(async (assignment: Omit<StaffAssignment, 'id'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newAssignment = await shopService.createStaffAssignment(assignment);
      setStaffAssignments(prevAssignments => [...prevAssignments, newAssignment]);
      return newAssignment;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create staff assignment');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Remove a staff assignment
  const removeStaffAssignment = useCallback(async (assignmentId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await shopService.removeStaffAssignment(assignmentId);
      setStaffAssignments(prevAssignments => 
        prevAssignments.filter(assignment => assignment.id !== assignmentId)
      );
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to remove staff assignment with ID ${assignmentId}`);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Fetch transfers for a shop
  const fetchShopTransfers = useCallback(async (shopId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const transfers = await shopService.fetchTransfers(shopId);
      setShopTransfers(transfers);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch transfers for shop with ID ${shopId}`));
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Create a transfer
  const createTransfer = useCallback(async (transfer: Omit<ShopTransfer, 'id' | 'createdAt' | 'completedAt'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newTransfer = await shopService.createTransfer(transfer);
      setShopTransfers(prevTransfers => [...prevTransfers, newTransfer]);
      return newTransfer;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create transfer');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Update transfer status
  const updateTransferStatus = useCallback(async (transferId: string, status: 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedTransfer = await shopService.updateTransferStatus(transferId, status);
      setShopTransfers(prevTransfers => 
        prevTransfers.map(transfer => transfer.id === transferId ? updatedTransfer : transfer)
      );
      return updatedTransfer;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to update status for transfer with ID ${transferId}`);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Fetch inventory locations for a shop
  const fetchInventoryLocations = useCallback(async (shopId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const locations = await shopService.fetchInventoryLocations(shopId);
      setInventoryLocations(locations);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch inventory locations for shop with ID ${shopId}`));
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Create an inventory location
  const createInventoryLocation = useCallback(async (shopId: string, location: Omit<InventoryLocation, 'id' | 'createdAt'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newLocation = await shopService.createInventoryLocation(shopId, location);
      setInventoryLocations(prevLocations => [...prevLocations, newLocation]);
      return newLocation;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to create inventory location for shop with ID ${shopId}`);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Load shops when the component mounts
  useEffect(() => {
    fetchShops();
  }, [fetchShops]);
  
  return {
    shops,
    isLoading,
    error,
    selectedShop,
    shopInventory,
    staffAssignments,
    shopTransfers,
    inventoryLocations,
    
    // Methods
    fetchShops,
    fetchShopById,
    createShop,
    updateShop,
    deleteShop,
    updateShopStatus,
    fetchShopInventory,
    fetchStaffAssignments,
    createStaffAssignment,
    removeStaffAssignment,
    fetchShopTransfers,
    createTransfer,
    updateTransferStatus,
    fetchInventoryLocations,
    createInventoryLocation
  };
} 