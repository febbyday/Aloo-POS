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
  useRealApi = SHOPS_CONFIG.USE_REAL_API 
}: UnifiedShopProviderProps) {
  // Use the appropriate hook based on configuration
  const mockShopsData = useShops();
  const realShopsData = useRealShops();
  
  // Select the data source
  const shopsData = useRealApi ? realShopsData : mockShopsData;
  
  // Create a unified context value
  const contextValue: UnifiedShopContextType = {
    ...shopsData,
    
    // Add flag indicating if using real API
    usingRealApi: useRealApi,
    
    // Add mock-only properties if using mock data
    ...(useRealApi ? {} : {
      shopTransfers: mockShopsData.shopTransfers,
      inventoryLocations: mockShopsData.inventoryLocations,
    }),
    
    // Staff methods need special handling due to different signatures
    fetchStaffAssignments: useRealApi 
      ? realShopsData.fetchStaffAssignments
      : mockShopsData.fetchStaffAssignments,
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
