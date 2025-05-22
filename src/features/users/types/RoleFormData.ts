/**
 * Role Form Data Types
 *
 * This file defines types for the role form data.
 */

import { z } from 'zod';
import { getDefaultPermissions } from './permissions';
import { Role } from './role';
import { baseRoleSchema } from '../../../shared/schemas/roleSchema';

// Create a schema for role form data by extending the shared base schema
export const roleFormSchema = baseRoleSchema.extend({
  // Override description to make it required in the form
  description: z.string().min(1, { message: "Description is required" }),
  // Add additional form-specific fields
  staffCount: z.number().default(0),
  id: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Export the RoleFormData type
export type RoleFormData = z.infer<typeof roleFormSchema>;

// Form values type for role create/edit
export type RoleFormValues = Omit<Role, 'id' | 'createdAt' | 'updatedAt'>;
