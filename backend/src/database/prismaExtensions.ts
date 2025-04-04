/**
 * Prisma Client Extensions
 * 
 * This file defines extensions to the Prisma Client to provide better type safety
 * for JSON fields in the database models.
 */

import { Prisma, PrismaClient } from '@prisma/client';
import { 
  ShopAddress, 
  ShopOperatingHours, 
  ShopSettingsData, 
  ShopActivityData 
} from '../types/models/shopTypes';

/**
 * Define Prisma Client extensions for typed JSON fields
 */
export const prismaClientExtensions = Prisma.defineExtension((client) => {
  return client.$extends({
    result: {
      shop: {
        // Type the address JSON field
        address: {
          needs: { address: true },
          compute(shop) {
            return shop.address as unknown as ShopAddress;
          },
        },
        // Type the operatingHours JSON field
        operatingHours: {
          needs: { operatingHours: true },
          compute(shop) {
            return shop.operatingHours as unknown as ShopOperatingHours | null;
          },
        },
        // Type the settings JSON field
        settings: {
          needs: { settings: true },
          compute(shop) {
            return shop.settings as unknown as ShopSettingsData | null;
          },
        },
        // Type the recentActivity JSON field
        recentActivity: {
          needs: { recentActivity: true },
          compute(shop) {
            return shop.recentActivity as unknown as ShopActivityData | null;
          },
        },
      },
    },
  });
});

/**
 * Create an extended Prisma Client with typed JSON fields
 */
export const createExtendedPrismaClient = () => {
  return new PrismaClient().$extends(prismaClientExtensions);
};

/**
 * Extended Prisma Client type with typed JSON fields
 */
export type ExtendedPrismaClient = ReturnType<typeof createExtendedPrismaClient>;
