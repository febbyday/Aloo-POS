/**
 * Simple test script for the email service
 */

import { emailService } from '../src/services/emailService';

// Initialize the email service
console.log('Initializing email service...');
emailService.initialize();

// Send a staff credentials email
console.log('Sending staff credentials email...');
emailService.sendStaffCredentialsEmail(
  'test@example.com',
  {
    name: 'Test User',
    username: 'testuser',
    password: 'password123',
    role: 'Manager'
  }
)
.then(result => {
  console.log('Email sent result:', result);
  process.exit(0);
})
.catch(error => {
  console.error('Error sending email:', error);
  process.exit(1);
});
