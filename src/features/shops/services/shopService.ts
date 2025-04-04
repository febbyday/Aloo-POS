import { getApiEndpoint } from '@/lib/api/config';
import {
  Shop,
  SHOP_STATUS,
  ShopInventoryItem,
  StaffAssignment,
  ShopTransfer,
  InventoryLocation
} from '../types';

// Shop service
export const shopService = {
  // Fetch all shops
  async fetchAll(): Promise<Shop[]> {
    try {
      const response = await fetch(getApiEndpoint('shops'));
      if (!response.ok) {
        throw new Error(`Failed to fetch shops: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching shops:', error);
      throw error;
    }
  },

  // Fetch shop by ID
  async fetchById(id: string): Promise<Shop> {
    try {
      const response = await fetch(`${getApiEndpoint('shops')}/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch shop: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching shop ${id}:`, error);
      throw error;
    }
  },

  // Create a new shop
  async createShop(shopData: Partial<Shop>): Promise<Shop> {
    try {
      const response = await fetch(getApiEndpoint('shops'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shopData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create shop: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating shop:', error);
      throw error;
    }
  },

  // Update an existing shop
  async updateShop(id: string, shopData: Partial<Shop>): Promise<Shop> {
    try {
      const response = await fetch(`${getApiEndpoint('shops')}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shopData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update shop: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating shop ${id}:`, error);
      throw error;
    }
  },

  // Delete a shop
  async deleteShop(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${getApiEndpoint('shops')}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete shop: ${response.status} ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting shop ${id}:`, error);
      throw error;
    }
  },

  // Fetch shop inventory
  async fetchInventory(shopId: string): Promise<ShopInventoryItem[]> {
    try {
      const response = await fetch(`${getApiEndpoint('shops')}/${shopId}/inventory`);
      if (!response.ok) {
        throw new Error(`Failed to fetch inventory: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching inventory for shop ${shopId}:`, error);
      throw error;
    }
  },

  // Fetch staff assignments for a shop
  async fetchStaffAssignments(shopId: string): Promise<StaffAssignment[]> {
    try {
      const response = await fetch(`${getApiEndpoint('shops')}/${shopId}/staff`);
      if (!response.ok) {
        throw new Error(`Failed to fetch staff assignments: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching staff assignments for shop ${shopId}:`, error);
      throw error;
    }
  },

  // Fetch inventory locations for a shop
  async fetchInventoryLocations(shopId: string): Promise<InventoryLocation[]> {
    try {
      const response = await fetch(`${getApiEndpoint('shops')}/${shopId}/locations`);
      if (!response.ok) {
        throw new Error(`Failed to fetch inventory locations: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching inventory locations for shop ${shopId}:`, error);
      throw error;
    }
  },

  // Create inventory transfer between shops
  async createTransfer(transferData: Partial<ShopTransfer>): Promise<ShopTransfer> {
    try {
      const response = await fetch(`${getApiEndpoint('shops')}/transfers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transferData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create transfer: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating transfer:', error);
      throw error;
    }
  },

  // Fetch transfers for a shop
  async fetchTransfers(shopId: string): Promise<ShopTransfer[]> {
    try {
      const response = await fetch(`${getApiEndpoint('shops')}/${shopId}/transfers`);
      if (!response.ok) {
        throw new Error(`Failed to fetch transfers: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching transfers for shop ${shopId}:`, error);
      throw error;
    }
  }
}; 