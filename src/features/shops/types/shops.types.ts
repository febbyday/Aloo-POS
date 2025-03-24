/**
 * Shops Types
 * 
 * This module exports type definitions for the shops feature.
 */

export interface Shop {
  id: string;
  name: string;
  location: string;
  type: 'retail' | 'warehouse' | 'outlet';
  status: 'active' | 'inactive' | 'maintenance';
  staffCount: number;
  lastSync: Date;
  createdAt: Date;
  
  // Additional properties for detailed view
  phone?: string;
  email?: string;
  manager?: string;
  openingHours?: string;
  salesLastMonth?: number;
  inventoryCount?: number;
  averageOrderValue?: number;
  topSellingCategories?: string[];
  
  // Related entities
  recentActivity?: ShopActivity[];
  staffMembers?: ShopStaffMember[];
}

export interface ShopActivity {
  type: 'inventory' | 'staff' | 'sales' | 'system';
  message: string;
  timestamp: Date;
}

export interface ShopStaffMember {
  id: string;
  name: string;
  position: string;
  email: string;
}

export interface Shops {
  shops: Shop[];
  total: number;
  page: number;
  limit: number;
}

export interface ShopsFormValues {
  name: string;
  location: string;
  type: Shop['type'];
  status: Shop['status'];
  phone?: string;
  email?: string;
  manager?: string;
  openingHours?: string;
}

export interface ShopsFilterOptions {
  search?: string;
  type?: Shop['type'] | 'all';
  status?: Shop['status'] | 'all';
}

// Re-export the Shop interface from the types directory
export * from './index';
