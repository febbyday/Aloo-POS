/**
 * User Management Utility
 * 
 * This utility provides functions for checking and managing users in the database.
 */

import { apiClient } from '@/lib/api/api-client';
import { authService } from '../services/authService';
import { User, RegisterCredentials } from '../types/auth.types';
import { ApiHealth, ApiStatus } from '@/lib/api/api-health';

// API endpoints - using relative paths without /api/v1 prefix (added by API client)
const USERS_ENDPOINT = '/users';

// Initialize API health monitoring
const apiHealth = new ApiHealth(apiClient);

/**
 * Check if any users exist in the database
 * @returns Promise with array of users if found
 */
export async function checkExistingUsers(): Promise<User[]> {
  console.log('Checking for existing users in the database...');
  
  try {
    // Check if API is available
    if (apiHealth.getStatus() === ApiStatus.UNAVAILABLE) {
      console.log('API is unavailable, using mock data');
      // In mock mode, we always have the default admin user
      return [
        {
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          permissions: ['admin.access'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }
    
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
        return [];
      }
    }
    
    // Now try to fetch users
    console.log('Fetching users from API...');
    const response = await apiClient.get(USERS_ENDPOINT);
    
    if (response.success && Array.isArray(response.data)) {
      const users = response.data as User[];
      
      if (users.length === 0) {
        console.log('No users found in the database.');
      } else {
        console.log(`Found ${users.length} users in the database:`);
        users.forEach((user, index) => {
          console.log(`${index + 1}. ${user.username} (${user.email}) - Role: ${user.role}`);
        });
      }
      
      return users;
    } else {
      console.log('Failed to fetch users or unexpected response format:', response);
      return [];
    }
  } catch (error) {
    console.error('Error checking users:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        console.log('Authentication error. Please make sure you are logged in.');
      } else if (error.message.includes('403')) {
        console.log('Permission denied. Your account may not have permission to view users.');
      } else if (error.message.includes('404')) {
        console.log('Users endpoint not found. The API may not support this operation.');
      }
    }
    
    return [];
  }
}

/**
 * Create a new user in the system
 * @param userData User registration data
 * @returns Created user or null if failed
 */
export async function createUser(userData: RegisterCredentials): Promise<User | null> {
  console.log(`Creating new user: ${userData.username}`);
  
  try {
    const user = await authService.register(userData);
    console.log(`Successfully created user: ${user.username}`);
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

/**
 * Check if admin user exists, create one if not
 * @returns Admin user if exists or was created
 */
export async function ensureAdminUser(): Promise<User | null> {
  try {
    const users = await checkExistingUsers();
    
    // Check if admin user exists
    const adminUser = users.find(user => user.role === 'admin');
    
    if (adminUser) {
      console.log('Admin user already exists:', adminUser.username);
      return adminUser;
    }
    
    // Create admin user if none exists
    console.log('No admin user found. Creating default admin user...');
    
    const newAdminUser = await createUser({
      username: 'admin',
      password: 'admin123',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User'
    });
    
    if (newAdminUser) {
      console.log('Successfully created admin user.');
      return newAdminUser;
    } else {
      console.error('Failed to create admin user.');
      return null;
    }
  } catch (error) {
    console.error('Error ensuring admin user:', error);
    return null;
  }
}

/**
 * Initialize user management
 * This function checks for existing users and creates an admin user if needed
 */
export async function initializeUserManagement(): Promise<void> {
  console.log('Initializing user management...');
  
  try {
    // Wait for API to be available
    if (apiHealth.getStatus() === ApiStatus.UNKNOWN) {
      console.log('Waiting for API health check...');
      await new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (apiHealth.getStatus() !== ApiStatus.UNKNOWN) {
            clearInterval(checkInterval);
            resolve(true);
          }
        }, 500);
        
        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve(false);
        }, 10000);
      });
    }
    
    // Ensure admin user exists
    const adminUser = await ensureAdminUser();
    
    if (adminUser) {
      console.log('User management initialized successfully.');
    } else {
      console.warn('User management initialization completed with warnings.');
    }
  } catch (error) {
    console.error('Error initializing user management:', error);
  }
}
