/**
 * User Check and Creation Utility
 * 
 * This script checks for existing users and creates an admin user if needed.
 */

import { checkExistingUsers, ensureAdminUser } from '../features/auth/utils/userManagement';

async function main() {
  console.log('=== POS System User Management ===');
  
  // First check for existing users
  console.log('\n--- Checking for existing users ---');
  const users = await checkExistingUsers();
  
  if (users.length === 0) {
    console.log('\n--- No users found, creating admin user ---');
    const adminUser = await ensureAdminUser();
    
    if (adminUser) {
      console.log('\nAdmin user created successfully:');
      console.log(`Username: ${adminUser.username}`);
      console.log(`Email: ${adminUser.email}`);
      console.log(`Role: ${adminUser.role}`);
      console.log('\nYou can now log in with:');
      console.log('Username: admin');
      console.log('Password: admin123');
    } else {
      console.error('\nFailed to create admin user. Please check the logs for details.');
    }
  } else {
    console.log(`\nFound ${users.length} existing users in the system:`);
    users.forEach((user, index) => {
      console.log(`\n--- User ${index + 1} ---`);
      console.log(`ID: ${user.id}`);
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.firstName} ${user.lastName}`);
      console.log(`Role: ${user.role}`);
      console.log(`Created: ${new Date(user.createdAt).toLocaleString()}`);
    });
  }
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error);
}).finally(() => {
  console.log('\n=== User check completed ===');
});
