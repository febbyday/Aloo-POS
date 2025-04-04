/**
 * Users Module Entry Point
 * 
 * This file exports all components, services, and types from the users module.
 */

// Export components
export { UserModuleWrapper } from './components/UserModuleWrapper';

// Re-export the UserManagementPage from auth module for convenience
export { UserManagementPage } from '@/features/auth/pages/UserManagementPage';
