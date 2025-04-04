/**
 * Role Form Data Types
 * 
 * This file defines types for the role form data.
 */

import { z } from 'zod';
import { roleSchema } from './role';
import { Permissions, getDefaultPermissions } from './permissions';

// Create a schema for role form data
export const roleFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "Role name must be at least 2 characters" }),
  description: z.string().min(1, { message: "Description is required" }),
  permissions: z.any().default(getDefaultPermissions()),
  isActive: z.boolean().default(true),
  staffCount: z.number().default(0),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  isSystemRole: z.boolean().optional().default(false)
});

// Export the RoleFormData type
export type RoleFormData = z.infer<typeof roleFormSchema>;
