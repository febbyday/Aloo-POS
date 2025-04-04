/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * 
 * Admin Account Initialization
 * 
 * This file initializes the admin account for the application.
 */

import { User } from '../../features/auth/types/auth.types';

// Default admin user credentials
export const ADMIN_USERNAME = 'admin';
export const ADMIN_PASSWORD = 'admin';

// Default admin user
export const DEFAULT_ADMIN: User = {
  id: '1',
  username: ADMIN_USERNAME,
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  permissions: [
    'admin.access',
    'staff.view', 'staff.create', 'staff.edit', 'staff.delete',
    'products.view', 'products.create', 'products.edit', 'products.delete',
    'customers.view', 'customers.create', 'customers.edit', 'customers.delete',
    'sales.view', 'sales.create', 'sales.edit', 'sales.delete',
    'reports.view', 'reports.create',
    'settings.view', 'settings.edit'
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastLogin: new Date().toISOString()
};

/**
 * Initialize the admin account
 */
export function initAdminAccount(): void {
  // Check if admin account is already initialized
  const USERS_STORAGE_KEY = 'pos_mock_users';
  const users = localStorage.getItem(USERS_STORAGE_KEY);
  
  if (!users) {
    // Initialize admin account
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([DEFAULT_ADMIN]));
    console.log('Admin account initialized with username: admin, password: admin');
  }
}
