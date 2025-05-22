/**
 * Database Connection Check Script
 * 
 * This script checks the database connection and schema.
 * Run it with: npx ts-node src/scripts/check-database.ts
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a new Prisma client instance
const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('🔍 Checking database connection...');
  console.log(`📊 Using DATABASE_URL: ${maskConnectionString(process.env.DATABASE_URL || '')}`);
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test a simple query
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database query successful');
    
    // Check if Product table exists
    try {
      const productCount = await prisma.product.count();
      console.log(`✅ Product table exists with ${productCount} records`);
    } catch (error) {
      console.error('❌ Error accessing Product table:', error);
      console.log('💡 You may need to run migrations: npx prisma migrate dev');
    }
    
    // Check if other essential tables exist
    const tables = ['Category', 'Supplier', 'Shop', 'Order'];
    for (const table of tables) {
      try {
        // @ts-ignore - Dynamic access to prisma client
        const count = await prisma[table.toLowerCase()].count();
        console.log(`✅ ${table} table exists with ${count} records`);
      } catch (error) {
        console.error(`❌ Error accessing ${table} table:`, error);
      }
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Check if your PostgreSQL server is running');
    console.log('2. Verify your DATABASE_URL in the .env file');
    console.log('3. Make sure the database exists');
    console.log('4. Check if the user has proper permissions');
    console.log('5. Run migrations: npx prisma migrate dev');
  } finally {
    await prisma.$disconnect();
  }
}

// Mask the connection string for security
function maskConnectionString(url: string): string {
  if (!url) return 'Not set';
  
  try {
    const regex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
    return url.replace(regex, 'postgresql://$1:****@$3:$4/$5');
  } catch {
    return 'Invalid connection string format';
  }
}

// Run the check
checkDatabase().catch(console.error);
