// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

/**
 * Shop schema for backend validation
 *
 * This file imports the shared schema from the shared directory
 * to ensure consistency between frontend and backend.
 */

// Import shared schemas
const {
  shopSchema,
  baseShopSchema,
  createShopSchema,
  updateShopSchema,
  shopActivitySchema,
  staffAssignmentSchema,
  addressSchema,
  SHOP_STATUS,
  SHOP_TYPE,
  Shop,
  CreateShopInput,
  UpdateShopInput,
  ShopActivity,
  StaffAssignment
} = require('../../../shared/schemas/shopSchema.cjs');

// Import local address types
import { Address } from '../models/addressTypes';

// Re-export for backward compatibility
export const ShopSchema = shopSchema;
export const BaseShopSchema = baseShopSchema;
export const CreateShopSchema = createShopSchema;
export const UpdateShopSchema = updateShopSchema;
export const ShopActivitySchema = shopActivitySchema;
export const ShopStaffMemberSchema = staffAssignmentSchema;
export const AddressSchema = addressSchema;

// Re-export types
export {
  Shop,
  CreateShopInput,
  UpdateShopInput,
  ShopActivity,
  SHOP_STATUS,
  SHOP_TYPE,
  Address
};

// For backward compatibility
export type ShopStaffMember = StaffAssignment;

/**
 * Frontend Shop interface
 * This represents the shop structure expected by the frontend
 * Note: This is kept for backward compatibility but should be phased out
 * in favor of the shared Shop type
 */
export interface FrontendShop {
  id: string;
  code: string;
  name: string;
  description?: string;
  address: Address; // Now using the shared Address type
  phone?: string;
  email?: string;
  status: string;
  type: string;
  manager?: string;
  operatingHours?: any;
  lastSync: string;
  isHeadOffice: boolean;
  licenseNumber?: string;
  logoUrl?: string;
  taxId?: string;
  timezone: string;
  website?: string;
  settings?: any;
  salesLastMonth?: number;
  inventoryCount?: number;
  averageOrderValue?: number;
  staffCount?: number;
  createdAt: string;
  updatedAt: string;
  recentActivity?: ShopActivity[];
  staffAssignments?: StaffAssignment[]; // Changed from staffMembers
}
