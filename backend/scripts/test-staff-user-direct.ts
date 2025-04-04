/**
 * Test script for directly creating a staff member and user
 */

import { UserRepository } from '../src/repositories/UserRepository';
import { generateUsername } from '../src/utils/username';
import { generatePassword } from '../src/utils/password';
import { emailService } from '../src/services/emailService';

console.log('Starting direct staff-user test');

// Initialize the email service
console.log('Initializing email service...');
emailService.initialize();

// Generate test data
const firstName = 'Test';
const lastName = 'User';
const email = `test.user.${Date.now()}@example.com`;
const username = generateUsername(firstName, lastName);
const password = generatePassword();
const role = 'CASHIER';

console.log('Generated test data:', {
  firstName,
  lastName,
  email,
  username,
  password: '********', // Don't log the actual password
  role
});

// Create user account
console.log('Creating user account...');
UserRepository.create({
  username,
  password,
  email,
  firstName,
  lastName,
  name: `${firstName} ${lastName}`,
  role,
  active: true
})
.then(user => {
  console.log('User created:', {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  });

  // Send email with login credentials
  console.log('Sending credentials email...');
  return emailService.sendStaffCredentialsEmail(
    email,
    {
      name: `${firstName} ${lastName}`,
      username,
      password,
      role: role.charAt(0) + role.slice(1).toLowerCase() // Format role for display (e.g., 'ADMIN' -> 'Admin')
    }
  );
})
.then(emailResult => {
  console.log('Email sent result:', emailResult);
  process.exit(0);
})
.catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
