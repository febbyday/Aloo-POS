/**
 * Create Admin User Script
 * 
 * This script creates a default admin user for the system.
 * It can be run directly to set up an initial admin account.
 */

import { authService } from '../features/auth/services/authService';
import { ApiHealth } from '../lib/api/api-health';

// Admin user credentials
const ADMIN_USER = {
  username: 'admin',
  password: 'admin123',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User'
};

// Function to create admin user
async function createAdminUser() {
  console.log('Checking API health...');
  
  // Initialize API health monitoring
  const apiHealth = ApiHealth.getInstance();
  await apiHealth.checkHealth();
  
  if (!apiHealth.isHealthy) {
    console.error('API is not available. Please ensure the API server is running.');
    process.exit(1);
  }
  
  console.log('API is healthy. Creating admin user...');
  
  try {
    // Register the admin user
    const user = await authService.register(ADMIN_USER);
    
    if (user) {
      console.log('✅ Admin user created successfully!');
      console.log('----------------------------------');
      console.log('Username:', ADMIN_USER.username);
      console.log('Password:', ADMIN_USER.password);
      console.log('----------------------------------');
      console.log('You can now log in with these credentials.');
    } else {
      console.error('❌ Failed to create admin user. No response from the server.');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('409') || errorMessage.includes('already exists')) {
      console.log('ℹ️ Admin user already exists.');
      console.log('----------------------------------');
      console.log('Username:', ADMIN_USER.username);
      console.log('Password: [Use the password you set previously]');
      console.log('----------------------------------');
    } else {
      console.error('❌ Error creating admin user:', errorMessage);
    }
  }
}

// Run the function
createAdminUser().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
