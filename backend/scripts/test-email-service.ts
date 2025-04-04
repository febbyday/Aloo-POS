/**
 * Test script for the Email Service
 *
 * This script tests the functionality of the EmailService by sending a test email.
 */

import { emailService, EmailTemplate } from '../src/services/emailService';
import { logger } from '../src/utils/logger';
import dotenv from 'dotenv';

// Configure logger to output to console
console.log = (...args) => {
  process.stdout.write(args.join(' ') + '\n');
};

// Load environment variables
dotenv.config();

async function testEmailService() {
  try {
    console.log('Starting Email Service test');
    logger.info('Starting Email Service test');

    // Initialize the email service
    emailService.initialize();
    console.log('Email Service initialized');
    logger.info('Email Service initialized');

    // Test email data
    const testEmail = {
      to: process.env.TEST_EMAIL || 'test@example.com',
      subject: 'Test Email from POS System',
      text: 'This is a test email from the POS System.',
      html: '<h1>Test Email</h1><p>This is a test email from the POS System.</p>'
    };

    // Send a simple test email
    console.log('Sending test email to:', testEmail.to);
    logger.info('Sending test email to:', testEmail.to);
    const simpleEmailResult = await emailService.sendEmail(testEmail);

    if (simpleEmailResult) {
      logger.info('Simple test email sent successfully');
    } else {
      logger.error('Failed to send simple test email');
    }

    // Test staff credentials email
    logger.info('Sending staff credentials test email');
    const staffCredentialsResult = await emailService.sendStaffCredentialsEmail(
      testEmail.to,
      {
        name: 'Test User',
        username: 'testuser',
        password: 'testpassword123',
        role: 'Manager'
      }
    );

    if (staffCredentialsResult) {
      logger.info('Staff credentials test email sent successfully');
    } else {
      logger.error('Failed to send staff credentials test email');
    }

    logger.info('Email Service test completed');
  } catch (error) {
    logger.error('Test failed with error:', error);
  }
}

// Run the test
testEmailService().catch(error => {
  logger.error('Unhandled error in test:', error);
  process.exit(1);
});
