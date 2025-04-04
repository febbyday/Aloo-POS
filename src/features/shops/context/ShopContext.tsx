import React, { createContext, useContext, ReactNode } from 'react';
import { useShops } from '../hooks/useShops';
import { 
  Shop, 
  SHOP_STATUS, 
  ShopInventoryItem, 
  StaffAssignment, 
  ShopTransfer, 
  InventoryLocation 
} from '../types';

// Define the shape of the context
interface ShopContextType {
  shops: Shop[];
  isLoading: boolean;
  error: Error | null;
  selectedShop: Shop | null;
  shopInventory: ShopInventoryItem[];
  staffAssignments: StaffAssignment[];
  shopTransfers: ShopTransfer[];
  inventoryLocations: InventoryLocation[];
  
  // Shop methods
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

// Create the context with a default value
const ShopContext = createContext<ShopContextType | undefined>(undefined);

// Props for the provider component
interface ShopProviderProps {
  children: ReactNode;
}

/**
 * Provider component for the Shop context
 */
export function ShopProvider({ children }: ShopProviderProps) {
  // Use the shops hook to manage shop state
  const shopsData = useShops();
  
  // Provide the context value to all children
  return (
    <ShopContext.Provider value={shopsData}>
      {children}
    </ShopContext.Provider>
  );
}

/**
 * Custom hook to use the Shop context
 * @returns The ShopContext
 * @throws Error if used outside of ShopProvider
 */
export function useShopContext(): ShopContextType {
  const context = useContext(ShopContext);
  
  if (context === undefined) {
    throw new Error('useShopContext must be used within a ShopProvider');
  }
  
  return context;
} 