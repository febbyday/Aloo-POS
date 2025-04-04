/**
 * Authentication Bypass Script
 * 
 * This script sets up mock authentication data in localStorage and sessionStorage
 * to bypass the login page. Run this script in the browser console to automatically
 * log in as a development user.
 */

// Set up mock authentication data in localStorage
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

// Set up mock authentication state in sessionStorage
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
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  },
  permissions: ['*']
}));

console.log('Authentication bypass complete. Reload the page to apply changes.');
console.log('You can now access all protected routes, including /users and /roles/permissions.');

// Reload the page to apply the changes
window.location.reload();
