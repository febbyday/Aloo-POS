/**
 * Staff Types
 *
 * This file defines types for the staff feature.
 */

import { z } from 'zod';
import { Role } from '@/features/users/types/role';

export const StaffStatusSchema = z.enum(["ACTIVE", "INACTIVE", "ON_LEAVE"]);
export const ShiftStatusSchema = z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]);
export const ShopStatusSchema = z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE"]);

export type StaffStatus = z.infer<typeof StaffStatusSchema>;
export type ShiftStatus = z.infer<typeof ShiftStatusSchema>;
export type ShopStatus = z.infer<typeof ShopStatusSchema>;

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
  role: z.custom<Role>(), // Use the imported Role type
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


export type Shop = z.infer<typeof ShopSchema>;
export type EmploymentStatus = z.infer<typeof EmploymentStatusSchema>;
export type EmploymentType = z.infer<typeof EmploymentTypeSchema>;
export type Staff = z.infer<typeof StaffSchema>;
export type CreateStaff = z.infer<typeof CreateStaffSchema>;
export type UpdateStaff = z.infer<typeof UpdateStaffSchema>;
export type Shift = z.infer<typeof ShiftSchema>;
export type CreateShift = z.infer<typeof CreateShiftSchema>;
export type UpdateShift = z.infer<typeof UpdateShiftSchema>;
