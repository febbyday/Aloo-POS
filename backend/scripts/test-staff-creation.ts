/**
 * Test script for staff creation
 */

import { StaffService } from '../src/staff/services/staff.service';

console.log('Starting staff creation test');

// Create a staff service instance
const staffService = new StaffService();

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

// Create the staff member
staffService.createStaff(testStaff)
  .then(staff => {
    console.log('Test staff member created:', staff);
    process.exit(0);
  })
  .catch(error => {
    console.error('Error creating staff member:', error);
    process.exit(1);
  });
