/**
 * Simple test script
 */

console.log('Starting simple test');

// Import the email service
import { emailService } from '../src/services/emailService';

// Initialize the email service
console.log('Initializing email service');
emailService.initialize();

// Create a test email
const testEmail = {
  to: 'test@example.com',
  subject: 'Test Email',
  text: 'This is a test email',
  html: '<h1>Test Email</h1><p>This is a test email</p>'
};

// Send the email
console.log('Sending test email');
emailService.sendEmail(testEmail)
  .then(result => {
    console.log('Email sent result:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('Error sending email:', error);
    process.exit(1);
  });
