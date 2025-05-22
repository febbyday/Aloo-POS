/**
 * Create Admin User Script
 * 
 * This script creates a default admin user in the database.
 */

import { UserRepository } from '../repositories/userRepository';

// Admin user credentials
const ADMIN_USER = {
  username: 'admin',
  password: 'admin123',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN',
  isActive: true // ensure admin is active
};

// Function to create admin user
async function createAdminUser() {
  console.log('Checking if users exist in the database...');
  
  try {
    // Check if any users exist
    const hasUsers = await UserRepository.hasUsers();
    
    if (hasUsers) {
      console.log('✅ Users already exist in the database!');
      
      // Check if admin user exists
      const adminUser = await UserRepository.findByUsername(ADMIN_USER.username);
      
      if (adminUser) {
        console.log('✅ Admin user already exists!');
        console.log('----------------------------------');
        console.log('Username:', ADMIN_USER.username);
        console.log('----------------------------------');
      } else {
        console.log('ℹ️ Admin user does not exist. Creating now...');
        await createAdmin();
      }
    } else {
      console.log('ℹ️ No users found in the database. Creating admin user...');
      await createAdmin();
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Helper function to create admin user
async function createAdmin() {
  try {
    const user = await UserRepository.create({
      username: ADMIN_USER.username,
      password: ADMIN_USER.password,
      email: ADMIN_USER.email,
      name: `${ADMIN_USER.firstName} ${ADMIN_USER.lastName}`,
      firstName: ADMIN_USER.firstName,
      lastName: ADMIN_USER.lastName,
      role: ADMIN_USER.role,
      isActive: ADMIN_USER.isActive,
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('----------------------------------');
    console.log('Username:', ADMIN_USER.username);
    console.log('Password:', ADMIN_USER.password);
    console.log('----------------------------------');
    console.log('You can now log in with these credentials.');
  } catch (error) {
    console.error('❌ Failed to create admin user:', error instanceof Error ? error.message : error);
    throw error;
  }
}

// Run the function
createAdminUser().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
