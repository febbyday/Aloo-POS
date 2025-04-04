/**
 * Staff Types
 * 
 * This file defines types for the staff feature.
 */

import { z } from 'zod';
import { Permissions } from './permissions';

export const StaffStatusSchema = z.enum(["ACTIVE", "INACTIVE", "ON_LEAVE"]);
export const ShiftStatusSchema = z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]);
export const ShopStatusSchema = z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE"]);

export type StaffStatus = z.infer<typeof StaffStatusSchema>;
export type ShiftStatus = z.infer<typeof ShiftStatusSchema>;
export type ShopStatus = z.infer<typeof ShopStatusSchema>;

export const RoleSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters"),
  description: z.string().max(200, "Description cannot exceed 200 characters").default(''),
  permissions: z.union([
    z.array(z.string()), // Simple array of permission strings
    z.record(z.string(), z.any()).transform(obj => obj as Permissions) // Complex permissions object
  ]),
  staffCount: z.number().int().nonnegative("Staff count must be a non-negative number"),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  isSystemRole: z.boolean().optional().default(false)
});

export const ShopSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  address: z.string(),
  phone: z.string().nullable(),
  email: z.string().email().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE"]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const EmploymentStatusSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  description: z.string(),
  color: z.string(),
  isActive: z.boolean(),
  staffCount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const EmploymentTypeSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  description: z.string(),
  color: z.string(),
  benefits: z.array(z.string()),
  staffCount: z.number(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const StaffSchema = z.object({
  id: z.string().cuid(),
  code: z.string(),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().nullable(),
  roleId: z.string(),
  status: StaffStatusSchema,
  employmentStatusId: z.string().nullable(),
  employmentTypeId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  role: RoleSchema,
  employmentStatus: EmploymentStatusSchema.nullable(),
  employmentType: EmploymentTypeSchema.nullable(),
  shops: z.array(ShopSchema),
});

export const CreateStaffSchema = StaffSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  role: true,
  employmentStatus: true,
  employmentType: true,
  shops: true,
});

export const UpdateStaffSchema = CreateStaffSchema.partial();

export const ShiftSchema = z.object({
  id: z.string().cuid(),
  staffId: z.string(),
  shopId: z.string(),
  startTime: z.date(),
  endTime: z.date().nullable(),
  status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateShiftSchema = ShiftSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateShiftSchema = CreateShiftSchema.partial();

export type Role = z.infer<typeof RoleSchema>;
export type Shop = z.infer<typeof ShopSchema>;
export type EmploymentStatus = z.infer<typeof EmploymentStatusSchema>;
export type EmploymentType = z.infer<typeof EmploymentTypeSchema>;
export type Staff = z.infer<typeof StaffSchema>;
export type CreateStaff = z.infer<typeof CreateStaffSchema>;
export type UpdateStaff = z.infer<typeof UpdateStaffSchema>;
export type Shift = z.infer<typeof ShiftSchema>;
export type CreateShift = z.infer<typeof CreateShiftSchema>;
export type UpdateShift = z.infer<typeof UpdateShiftSchema>;

// Schema for creating a new role
export const CreateRoleSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters"),
  description: z.string().max(200, "Description cannot exceed 200 characters").default(''),
  permissions: z.union([
    z.array(z.string()), // Simple array of permission strings
    z.record(z.string(), z.any()) // Complex permissions object
  ]),
  isActive: z.boolean().default(true).optional()
});

// Schema for updating a role
export const UpdateRoleSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters").optional(),
  description: z.string().max(200, "Description cannot exceed 200 characters").optional(),
  permissions: z.union([
    z.array(z.string()).optional(), // Simple array of permission strings
    z.record(z.string(), z.any()).optional() // Complex permissions object
  ]),
  isActive: z.boolean().optional()
});
