/**
 * Fix for Problematic Routes
 * 
 * This script fixes authentication issues with the /users, /roles, and /permissions routes.
 * Copy and paste this entire script into your browser console when you're on one of these routes.
 */

// Clear any existing auth data
localStorage.removeItem('auth_token');
localStorage.removeItem('auth_user');
sessionStorage.removeItem('auth_state');
sessionStorage.removeItem('dev_auth_setup_complete');
sessionStorage.removeItem('dev_auth_reload_count');
sessionStorage.removeItem('special_route_reload_count');

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

// Mark the current route as handled
const currentPath = window.location.pathname;
const routeKey = `route_handled_${currentPath.replace(/\//g, '_')}`;
sessionStorage.setItem(routeKey, 'true');

// Prevent navigation throttling
sessionStorage.setItem('navigation_throttle_prevented', 'true');

console.log('Authentication bypass for problematic route complete!');
console.log('Refreshing page to apply changes...');

// Reload the page to apply changes
setTimeout(() => {
  window.location.reload();
}, 1000);
