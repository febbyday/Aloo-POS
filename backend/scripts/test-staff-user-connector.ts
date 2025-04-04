/**
 * Test script for the Staff-User Connector
 *
 * This script tests the functionality of the StaffUserConnector service
 * by creating a staff member and verifying that a user account is created.
 */

import { PrismaClient } from '@prisma/client';
import { StaffService } from '../src/staff/services/staff.service';
import { staffUserConnector } from '../src/services/staffUserConnector';
import { UserRepository } from '../src/repositories/UserRepository';
import { logger } from '../src/utils/logger';

const prisma = new PrismaClient();
const staffService = new StaffService();

async function testStaffUserConnector() {
  try {
    console.log('Starting Staff-User Connector test');
    logger.info('Starting Staff-User Connector test');

    // Initialize the connector
    console.log('Initializing Staff-User Connector...');
    staffUserConnector.initialize();
    console.log('Staff-User Connector initialized');
    logger.info('Staff-User Connector initialized');

    // Create a test staff member
    const testStaff = {
      code: `STF${Date.now()}`, // Generate a unique code
      firstName: 'Test',
      lastName: 'User',
      email: `test.user.${Date.now()}@example.com`,
      phone: '123-456-7890',
      roleId: '1', // Assuming role ID 1 exists
      status: 'ACTIVE' as const, // Explicitly set status
    };

    console.log('Creating test staff member:', testStaff);
    logger.info('Creating test staff member:', testStaff);

    // Create the staff member
    console.log('Calling staffService.createStaff...');
    const staff = await staffService.createStaff(testStaff);
    console.log('Test staff member created:', staff);
    logger.info('Test staff member created:', staff);

    // Wait a moment for the event to be processed
    logger.info('Waiting for event processing...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if a user was created
    const user = await UserRepository.findByEmail(testStaff.email);

    if (user) {
      logger.info('Success! User was created:', {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      });
    } else {
      logger.error('Test failed! No user was created for the staff member');
    }

    // Clean up
    logger.info('Cleaning up test data...');
    await prisma.staff.delete({ where: { id: staff.id } });
    if (user) {
      await prisma.user.delete({ where: { id: user.id } });
    }

    logger.info('Test completed');
  } catch (error) {
    logger.error('Test failed with error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testStaffUserConnector().catch(error => {
  logger.error('Unhandled error in test:', error);
  process.exit(1);
});
