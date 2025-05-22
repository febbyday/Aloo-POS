/**
 * Test script to check if PIN-related fields are available in the User model
 */

const { prisma } = require('../prisma');

async function testPinFields() {
  try {
    // Get a user
    const user = await prisma.user.findFirst();
    
    if (!user) {
      console.log('No users found in the database');
      return;
    }
    
    console.log('User found:', user.id);
    
    // Check if PIN-related fields are available
    console.log('PIN fields:');
    console.log('- pinHash:', user.pinHash !== undefined ? 'Available' : 'Not available');
    console.log('- isPinEnabled:', user.isPinEnabled !== undefined ? 'Available' : 'Not available');
    console.log('- lastPinChange:', user.lastPinChange !== undefined ? 'Available' : 'Not available');
    console.log('- failedPinAttempts:', user.failedPinAttempts !== undefined ? 'Available' : 'Not available');
    console.log('- pinLockedUntil:', user.pinLockedUntil !== undefined ? 'Available' : 'Not available');
    
    // Try to update a user with PIN-related fields
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isPinEnabled: false,
        failedPinAttempts: 0,
        pinLockedUntil: null
      }
    });
    
    console.log('User updated successfully with PIN-related fields');
    
  } catch (error) {
    console.error('Error testing PIN fields:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPinFields();
