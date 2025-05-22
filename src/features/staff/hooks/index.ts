/**
 * Staff Hooks
 *
 * This module exports all custom hooks for the staff feature.
 */

// Export all hooks here

export * from './useStaff';
export * from './useStaffDocuments';
// Import useRoles from the centralized roles module
export { useRoles, useUserManagement } from '@/features/roles/hooks';
export * from './useEmploymentTypes';
export * from './useEmploymentStatuses';
