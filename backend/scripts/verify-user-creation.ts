/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * Script to verify user exists in the database
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Prisma client instance
const prisma = new PrismaClient();

async function listAllUsers() {
  try {
    console.log('Fetching all users from database...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true, 
        lastName: true,
        role: true,
        createdAt: true,
        permissions: true,
        lastLogin: true
      }
    });
    
    console.log('Total users found:', users.length);
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Username: ${user.username}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.firstName} ${user.lastName}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Created: ${user.createdAt}`);
      console.log(`  Last Login: ${user.lastLogin || 'Never'}`);
      console.log(`  Permissions: ${user.permissions.join(', ') || 'None'}`);
    });
    
    return users;
  } catch (error) {
    console.error('Error fetching users:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  } finally {
    // Disconnect from the database when done
    await prisma.$disconnect();
  }
}

// Execute the main function
listAllUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });
