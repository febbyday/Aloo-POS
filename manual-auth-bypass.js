/**
 * Manual Authentication Bypass Script
 * 
 * This script sets up mock authentication data to bypass the login page.
 * Copy and paste this entire script into your browser console and press Enter.
 * Then refresh the page to apply the changes.
 */

// Clear any existing auth data
localStorage.removeItem('auth_token');
localStorage.removeItem('auth_user');
sessionStorage.removeItem('auth_state');
sessionStorage.removeItem('dev_auth_setup_complete');
sessionStorage.removeItem('dev_auth_reload_count');

// Set up mock authentication data
localStorage.setItem('auth_token', 'dev-token');
localStorage.setItem('auth_user', JSON.stringify({
  id: '1',
  username: 'dev_user',
  email: 'dev@example.com',
  fullName: 'Development User',
  firstName: 'Development',
  lastName: 'User',
  roles: ['Admin'],
  permissions: ['*'],
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastLogin: new Date().toISOString()
}));

// Set up auth state in session storage
sessionStorage.setItem('auth_state', JSON.stringify({
  isAuthenticated: true,
  user: {
    id: '1',
    username: 'dev_user',
    email: 'dev@example.com',
    fullName: 'Development User',
    firstName: 'Development',
    lastName: 'User',
    roles: ['Admin'],
    permissions: ['*'],
    isActive: true
  },
  permissions: ['*']
}));

// Mark setup as complete to prevent automatic reloads
sessionStorage.setItem('dev_auth_setup_complete', 'true');

console.log('Authentication bypass complete!');
console.log('Refresh the page to apply changes.');
console.log('You should now be able to access all routes, including /users and /roles/permissions.');
