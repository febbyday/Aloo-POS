/**
 * Shops Types
 *
 * This module exports type definitions for the shops feature.
 *
 * Note: This file re-exports types from the shared schema to ensure consistency
 * between frontend and backend.
 */

import {
  Shop as SharedShop,
  ShopActivity as SharedShopActivity,
  StaffAssignment,
  SHOP_STATUS,
  SHOP_TYPE,
  Address,
  OperatingHours as SharedOperatingHours,
  ShopSettings as SharedShopSettings
} from '../../../shared/schemas/shopSchema';

// Re-export the shared types with frontend-specific extensions
export interface Shop extends SharedShop {
  // Add any frontend-specific properties here
  staffMembers?: ShopStaffMember[];
}

// For backward compatibility
export interface ShopStaffMember {
  id: string;
  name: string;
  position: string;
  email: string;
}

// Re-export ShopActivity from shared schema
export type ShopActivity = SharedShopActivity;

export interface Shops {
  shops: Shop[];
  total: number;
  page: number;
  limit: number;
}

// Re-export enums from shared schema
export const ShopStatus = SHOP_STATUS;
export type ShopStatus = SHOP_STATUS;

export const ShopType = SHOP_TYPE;
export type ShopType = SHOP_TYPE;

// Re-export OperatingHours from shared schema
export type OperatingHours = SharedOperatingHours;
export type DayHours = SharedOperatingHours['monday'];

// Re-export ShopSettings from shared schema
export type ShopSettings = SharedShopSettings;

export interface ShopsFormValues {
  code: string;
  name: string;
  description?: string;
  address: Address;
  type: Shop['type'];
  status: Shop['status'];
  phone?: string;
  email?: string;
  manager?: string;
  operatingHours?: OperatingHours;
  settings?: ShopSettings;
  isHeadOffice?: boolean;
  timezone?: string;
  taxId?: string;
  licenseNumber?: string;
  website?: string;
  logoUrl?: string;
}

export interface ShopsFilterOptions {
  search?: string;
  type?: Shop['type'] | 'all';
  status?: Shop['status'] | 'all';
}

// Re-export the Shop interface from the types directory
export * from './index';
