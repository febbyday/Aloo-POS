/**
 * Staff Types
 *
 * This module exports type definitions for the staff feature.
 */

// Re-export role types from the centralized roles module
export {
  IRole as Role,
  CreateRoleData,
  UpdateRoleData,
  RolePermissions,
  permissionsList
} from '@/features/roles/types/role';

// Import permission types directly from shared schemas
export { getDefaultPermissions } from '@/shared/schemas/permissions';

// Import AccessLevel directly from the standardized schema
export { AccessLevel } from '@/shared/schemas/accessLevel';
