/**
 * Staff Types
 * 
 * This module exports type definitions for the staff feature.
 */

// Export all types here

// Role definition
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  staffCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Create role data type
export type CreateRoleData = {
  name: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
};

// Update role data type
export type UpdateRoleData = Partial<CreateRoleData>;
