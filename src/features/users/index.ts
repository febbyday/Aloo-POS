/**
 * Users Module Entry Point
 *
 * This file exports all components, services, and types from the users module.
 */

// Export components
export { UserModuleWrapper } from './components/UserModuleWrapper';

// Re-export the UserManagementPage from auth module for convenience
export { UserManagementPage } from '@/features/auth/pages/UserManagementPage';

// Export services
export * from './services';

// Export hooks
export * from './hooks';

// Export middleware
export * from './middleware';

// Export types
export * from './types/role';
export * from './types/permissions';
