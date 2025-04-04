/**
 * Create Sample Shop Script
 * 
 * This script creates a sample shop with the new address structure
 * to verify that the address structure is correctly implemented.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSampleShop() {
  try {
    console.log('Creating sample shop with new address structure...');

    // Create a sample shop
    const shop = await prisma.shop.create({
      data: {
        code: 'SAMPLE01',
        name: 'Sample Shop',
        description: 'A sample shop for testing the address structure',
        address: {
          street: '123 Main Street',
          street2: 'Suite 100',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'USA',
          latitude: 40.7128,
          longitude: -74.0060
        },
        phone: '123-456-7890',
        email: 'sample@example.com',
        status: 'ACTIVE',
        type: 'RETAIL',
        isHeadOffice: false,
        timezone: 'America/New_York',
        settings: {
          allowNegativeInventory: false,
          defaultTaxRate: 8.5,
          requireStockCheck: true,
          autoPrintReceipt: true,
          defaultDiscountRate: 0,
          enableCashierTracking: true,
          allowReturnWithoutReceipt: false,
          minPasswordLength: 8,
          requireManagerApproval: {
            forDiscount: true,
            forVoid: true,
            forReturn: true,
            forRefund: true,
            forPriceChange: true
          },
          thresholds: {
            lowStock: 5,
            criticalStock: 2,
            reorderPoint: 10
          }
        }
      }
    });

    console.log('✅ Sample shop created successfully:');
    console.log(shop);

    console.log('\nAddress structure:');
    console.log(shop.address);

  } catch (error) {
    console.error('Error creating sample shop:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleShop();
