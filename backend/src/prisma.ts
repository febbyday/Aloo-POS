/**
 * Prisma Client
 *
 * This file exports the Prisma Client instance used throughout the application.
 * It is the ONLY place where PrismaClient should be instantiated.
 *
 * Features:
 * - Singleton pattern to prevent multiple instances
 * - Hot-reload safe in development
 * - Logging and error handling
 * - Connection testing
 * - Extensions for typed JSON fields
 */

import { PrismaClient } from '@prisma/client';
import { prismaClientExtensions } from './database/prismaExtensions';

// Define global type for PrismaClient
declare global {
  var prisma: PrismaClient | undefined;
}

// Configure logging options
const logOptions = process.env.NODE_ENV === 'development'
  ? {
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'info', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ],
    }
  : {
      log: [
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ],
    };

// Create a singleton instance of the Prisma client
function createPrismaClient(): PrismaClient {
  // Create the base client first
  const baseClient = new PrismaClient(logOptions);
  
  // Add event handlers to the base client
  baseClient.$on('error', (e) => {
    console.error('Prisma Client Error:', e);
    // Additional error handling logic could be added here
    // For example, sending errors to a monitoring service
  });

  baseClient.$on('connect', () => {
    console.log('Successfully connected to the database');
  });

  baseClient.$on('disconnect', () => {
    console.log('Disconnected from the database');
  });
  
  // Now extend the client and return the extended version
  const extendedClient = baseClient.$extends(prismaClientExtensions);
  
  return extendedClient;
}

// Initialize the Prisma Client with hot-reload protection
const prisma = global.prisma || createPrismaClient();

// In development, preserve the client across hot-reloads
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Log queries in development mode
if (process.env.NODE_ENV === 'development') {
  // Access the original client for event handling
  // This might not work after extension, so we'll handle it in the initial setup
  try {
    // @ts-ignore - Access internal property to get original client if possible
    const baseClient = (prisma as any)._basePrisma || prisma;
    baseClient.$on('query', (e) => {
      console.log('Query: ' + e.query);
      console.log('Duration: ' + e.duration + 'ms');
    });
  } catch (error) {
    console.warn('Could not attach query logger', error);
  }
}

// Test database connection on startup
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Test a simple query
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database query successful');

    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Run the test but don't block exports
testConnection().catch(console.error);

// Export the client as both default and named export
export default prisma;
export { prisma };