/**
 * Prisma Client
 * 
 * This file exports the Prisma Client instance used throughout the application.
 * It includes extensions for typed JSON fields.
 */

import { PrismaClient } from '@prisma/client';
import { createExtendedPrismaClient, ExtendedPrismaClient } from './prismaExtensions';

// Create a singleton instance of the extended Prisma Client
let prisma: ExtendedPrismaClient;

// Initialize the Prisma Client with extensions
if (process.env.NODE_ENV === 'production') {
  prisma = createExtendedPrismaClient();
} else {
  // In development, use a global variable to prevent multiple instances during hot reloading
  if (!global.prisma) {
    global.prisma = createExtendedPrismaClient();
  }
  prisma = global.prisma;
}

export { prisma };
