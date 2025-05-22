import { createContext, useContext, ReactNode } from 'react';
import { useShops } from '../hooks/useShops';
import { useRealShops } from '../hooks/useRealShops';
import { SHOPS_CONFIG } from '../config';
import { Shop, SHOP_STATUS, ShopInventoryItem, StaffAssignment, ShopTransfer, InventoryLocation } from '../types';

// Define the shape of the context
interface UnifiedShopContextType {
  shops: Shop[];
  isLoading: boolean;
  error: Error | null;
  selectedShop: Shop | null;
  shopInventory: ShopInventoryItem[];
  staffAssignments: StaffAssignment[];

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

  // Additional properties and methods from mock data
  shopTransfers?: ShopTransfer[];
  inventoryLocations?: InventoryLocation[];

  // Flag indicating if using real API
  usingRealApi: boolean;
}

// Create the context with a default value
const UnifiedShopContext = createContext<UnifiedShopContextType | undefined>(undefined);

// Props for the provider component
interface UnifiedShopProviderProps {
  children: ReactNode;
  useRealApi?: boolean;
}

/**
 * Provider component for the Unified Shop context
 * This provider will use either real API data or mock data based on configuration
 */
export function UnifiedShopProvider({
  children,
  useRealApi = true // Always use real API
}: UnifiedShopProviderProps) {
  // Always use real data
  const realShopsData = useRealShops();

  // Create a unified context value
  const contextValue: UnifiedShopContextType = {
    ...realShopsData,

    // Add flag indicating if using real API
    usingRealApi: true,

    // Staff methods
    fetchStaffAssignments: realShopsData.fetchStaffAssignments,
  };

  // Provide the context value to all children
  return (
    <UnifiedShopContext.Provider value={contextValue}>
      {children}
    </UnifiedShopContext.Provider>
  );
}

/**
 * Custom hook to use the Unified Shop context
 * @returns The UnifiedShopContext
 * @throws Error if used outside of UnifiedShopProvider
 */
export function useUnifiedShopContext(): UnifiedShopContextType {
  const context = useContext(UnifiedShopContext);

  if (context === undefined) {
    throw new Error('useUnifiedShopContext must be used within a UnifiedShopProvider');
  }

  return context;
}

export default UnifiedShopContext;
