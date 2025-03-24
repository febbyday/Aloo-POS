// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { z } from 'zod';

/**
 * Shop schema for shared validation between frontend and backend
 * 
 * This schema defines the structure and validation rules for shop data
 * and should be kept in sync with the frontend schema.
 */

// Shop staff member schema
export const ShopStaffMemberSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  position: z.string(),
  email: z.string().email('Invalid email address'),
  active: z.boolean().default(true)
});

// Shop activity schema
export const ShopActivitySchema = z.object({
  type: z.enum(['inventory', 'staff', 'sales', 'system']),
  message: z.string(),
  timestamp: z.date().or(z.string().transform(val => new Date(val))),
});

// Base shop schema with common fields
export const BaseShopSchema = z.object({
  name: z.string().min(1, 'Shop name is required'),
  location: z.string().min(1, 'Location is required'),
  type: z.enum(['retail', 'warehouse', 'outlet']),
  status: z.enum(['active', 'inactive', 'maintenance']),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  manager: z.string().optional(),
  openingHours: z.string().optional(),
});

// Schema for creating a new shop
export const CreateShopSchema = BaseShopSchema.extend({
  staffMembers: z.array(ShopStaffMemberSchema).optional(),
  staffCount: z.number().int().nonnegative().optional().default(0),
});

// Schema for updating an existing shop
export const UpdateShopSchema = BaseShopSchema.partial();

// Complete shop schema with all fields
export const ShopSchema = BaseShopSchema.extend({
  id: z.string(),
  staffCount: z.number().int().nonnegative(),
  lastSync: z.date().or(z.string().transform(val => new Date(val))),
  createdAt: z.date().or(z.string().transform(val => new Date(val))),
  staffMembers: z.array(ShopStaffMemberSchema).optional(),
  recentActivity: z.array(ShopActivitySchema).optional(),
  salesLastMonth: z.number().optional(),
  inventoryCount: z.number().int().optional(),
  averageOrderValue: z.number().optional(),
  topSellingCategories: z.array(z.string()).optional(),
});

// Derived types from schemas
export type Shop = z.infer<typeof ShopSchema>;
export type CreateShopInput = z.infer<typeof CreateShopSchema>;
export type UpdateShopInput = z.infer<typeof UpdateShopSchema>;
export type ShopStaffMember = z.infer<typeof ShopStaffMemberSchema>;
export type ShopActivity = z.infer<typeof ShopActivitySchema>;
