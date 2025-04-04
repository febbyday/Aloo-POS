import { createContext, useContext, ReactNode } from 'react';
import { useRealShops } from '../hooks/useRealShops';
import { Shop, SHOP_STATUS, ShopInventoryItem, StaffAssignment } from '../types';

// Define the shape of the context
interface RealShopContextType {
  shops: Shop[];
  isLoading: boolean;
  error: Error | null | unknown;
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

// Create the context with a default value
const RealShopContext = createContext<RealShopContextType | undefined>(undefined);

// Props for the provider component
interface RealShopProviderProps {
  children: ReactNode;
}

/**
 * Provider component for the Real Shop context
 */
export function RealShopProvider({ children }: RealShopProviderProps) {
  // Use the real shops hook to manage shop state
  const shopsData = useRealShops();
  
  // Provide the context value to all children
  return (
    <RealShopContext.Provider value={shopsData}>
      {children}
    </RealShopContext.Provider>
  );
}

/**
 * Custom hook to use the Real Shop context
 * @returns The RealShopContext
 * @throws Error if used outside of RealShopProvider
 */
export function useRealShopContext(): RealShopContextType {
  const context = useContext(RealShopContext);
  
  if (context === undefined) {
    throw new Error('useRealShopContext must be used within a RealShopProvider');
  }
  
  return context;
}

export default RealShopContext;
