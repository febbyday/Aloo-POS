// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

/**
 * User Check Utility
 * 
 * This script checks if there are any users created in the database
 * by making API calls to the backend.
 */

const { apiClient } = require('../lib/api/api-client');
const { authService } = require('../features/auth/services/authService');

// API endpoints
const API_VERSION = '/api/v1';
const USERS_ENDPOINT = `${API_VERSION}/users`;

/**
 * Check if any users exist in the database
 */
async function checkUsers() {
  console.log('Checking for existing users in the database...');
  
  try {
    // First check if we're authenticated
    if (!authService.isAuthenticated()) {
      console.log('Not authenticated. Attempting to login with default credentials...');
      
      try {
        // Try to login with default admin credentials
        await authService.login({
          username: 'admin',
          password: 'admin'
        });
        console.log('Successfully logged in with default credentials.');
      } catch (loginError) {
        console.error('Failed to login with default credentials:', loginError);
        console.log('You may need to create an admin user or check your credentials.');
        return;
      }
    }
    
    // Now try to fetch users
    console.log('Fetching users from API...');
    const response = await apiClient.get(USERS_ENDPOINT);
    
    if (response.success && Array.isArray(response.data)) {
      const users = response.data;
      
      if (users.length === 0) {
        console.log('No users found in the database.');
      } else {
        console.log(`Found ${users.length} users in the database:`);
        users.forEach((user, index) => {
          console.log(`${index + 1}. ${user.username} (${user.email}) - Role: ${user.role}`);
        });
      }
    } else {
      console.log('Failed to fetch users or unexpected response format:', response);
    }
  } catch (error) {
    console.error('Error checking users:', error);
    
    if (error.message && error.message.includes('401')) {
      console.log('Authentication error. Please make sure you are logged in.');
    } else if (error.message && error.message.includes('403')) {
      console.log('Permission denied. Your account may not have permission to view users.');
    } else if (error.message && error.message.includes('404')) {
      console.log('Users endpoint not found. The API may not support this operation.');
    }
  }
}

// Run the check
checkUsers().catch(error => {
  console.error('Unhandled error:', error);
});
