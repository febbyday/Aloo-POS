/**
 * Simple Database Connection Test
 * 
 * Basic script to verify database connection using Prisma
 */

const { PrismaClient } = require('@prisma/client');

// Create a new Prisma Client instance
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Attempting to connect to the database...');
    
    // First check if we can connect at all
    await prisma.$connect();
    console.log('✅ Connected to the database successfully!');
    
    // Then try to query the Role model
    const roleCount = await prisma.role.count();
    console.log(`✅ Role model is accessible! Found ${roleCount} roles.`);
    
    if (roleCount > 0) {
      // Get a sample role
      const sampleRole = await prisma.role.findFirst();
      console.log('Sample role:', JSON.stringify(sampleRole, null, 2));
    }
    
    console.log('Database connection test completed successfully.');
  } catch (error) {
    console.error('❌ Database connection error:', error);
  } finally {
    // Always disconnect
    await prisma.$disconnect();
    console.log('Disconnected from database');
  }
}

// Run the main function and handle any uncaught errors
main()
  .catch(e => {
    console.error('Unhandled error:', e);
    process.exit(1);
  });
