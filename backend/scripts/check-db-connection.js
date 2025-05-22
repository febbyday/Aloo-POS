/**
 * Check Database Connection Script
 * 
 * This script checks if the database connection is working.
 */

// Import required modules
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('Checking database connection...');

// Try to connect to the database
prisma.$connect()
  .then(() => {
    console.log('✅ Connected to the database successfully');
    
    // Try to query the Role table
    return prisma.role.findMany({
      take: 5
    });
  })
  .then((roles) => {
    console.log(`✅ Successfully queried the Role table. Found ${roles.length} roles.`);
    
    if (roles.length > 0) {
      console.log('\nSample role:');
      console.log(JSON.stringify(roles[0], null, 2));
    } else {
      console.log('\nNo roles found in the database.');
    }
    
    return prisma.$disconnect();
  })
  .then(() => {
    console.log('✅ Disconnected from the database');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
