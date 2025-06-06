/**
 * Shop Creation Integration Test
 * 
 * This test automatically creates 4 test shop records in the database
 * using the real shop service.
 */

import { test, expect, beforeAll, afterAll } from 'vitest';
import { realShopService } from '../../services/realShopService';
import { SHOP_STATUS, SHOP_TYPE } from '../../types';

// Test setup
beforeAll(async () => {
  // Any setup needed before running tests
  console.log('Starting shop creation test');
});

afterAll(async () => {
  console.log('Shop creation test completed');
});

// Test data for 4 different shops
const testShops = [
  {
    name: 'Downtown Flagship Store',
    code: 'DFS001',
    description: 'Our main downtown retail location with full service offerings',
    type: SHOP_TYPE.RETAIL,
    status: SHOP_STATUS.ACTIVE,
    address: {
      street: '123 Main Street',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60601',
      country: 'USA'
    },
    phone: '(312) 555-1234',
    email: 'downtown@example.com',
    manager: 'John Anderson',
    isHeadOffice: true,
    timezone: 'America/Chicago',
    taxId: 'US12345678',
    licenseNumber: 'IL-RET-12345',
    website: 'https://example.com/downtown'
  },
  {
    name: 'Suburban Mall Outlet',
    code: 'SMO002',
    description: 'Retail outlet in Woodfield Mall offering discounted items',
    type: SHOP_TYPE.OUTLET,
    status: SHOP_STATUS.ACTIVE,
    address: {
      street: '5 Woodfield Mall',
      street2: 'Unit B204',
      city: 'Schaumburg',
      state: 'IL',
      postalCode: '60173',
      country: 'USA'
    },
    phone: '(847) 555-2345',
    email: 'mall@example.com',
    manager: 'Sarah Johnson',
    isHeadOffice: false,
    timezone: 'America/Chicago',
    taxId: 'US23456789',
    licenseNumber: 'IL-OUT-23456'
  },
  {
    name: 'Central Distribution Warehouse',
    code: 'CDW003',
    description: 'Main distribution center for the Midwest region',
    type: SHOP_TYPE.WAREHOUSE,
    status: SHOP_STATUS.ACTIVE,
    address: {
      street: '789 Industrial Parkway',
      city: 'Indianapolis',
      state: 'IN',
      postalCode: '46219',
      country: 'USA'
    },
    phone: '(317) 555-3456',
    email: 'warehouse@example.com',
    manager: 'Mike Rodriguez',
    isHeadOffice: false,
    timezone: 'America/Indiana/Indianapolis',
    taxId: 'US34567890',
    licenseNumber: 'IN-WH-34567'
  },
  {
    name: 'Farmers Market Pop-up',
    code: 'FMP004',
    description: 'Seasonal market stall operating on weekends',
    type: SHOP_TYPE.MARKET,
    status: SHOP_STATUS.ACTIVE,
    address: {
      street: '1010 Market Square',
      city: 'Milwaukee',
      state: 'WI',
      postalCode: '53202',
      country: 'USA'
    },
    phone: '(414) 555-4567',
    email: 'market@example.com',
    manager: 'Lisa Chen',
    isHeadOffice: false,
    timezone: 'America/Chicago',
    taxId: 'US45678901',
    licenseNumber: 'WI-MKT-45678'
  }
];

// Helper function to serialize opening hours
const createOpeningHours = () => {
  return JSON.stringify({
    monday: { isOpen: true, timeSlots: [{ from: '09:00', to: '17:00' }] },
    tuesday: { isOpen: true, timeSlots: [{ from: '09:00', to: '17:00' }] },
    wednesday: { isOpen: true, timeSlots: [{ from: '09:00', to: '17:00' }] },
    thursday: { isOpen: true, timeSlots: [{ from: '09:00', to: '17:00' }] },
    friday: { isOpen: true, timeSlots: [{ from: '09:00', to: '17:00' }] },
    saturday: { isOpen: true, timeSlots: [{ from: '10:00', to: '15:00' }] },
    sunday: { isOpen: false, timeSlots: [] }
  });
};

// Test function to create all shops
test('should create 4 shop records', async () => {
  // Create array to store created shop IDs
  const createdShopIds: string[] = [];

  // Loop through test shops and create them
  for (const shopData of testShops) {
    try {
      // Add opening hours to the shop data
      const shopWithOpeningHours = {
        ...shopData,
        openingHours: createOpeningHours(),
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
      };

      // Create the shop using the service
      const createdShop = await realShopService.createShop(shopWithOpeningHours);
      
      // Verify the shop was created correctly
      expect(createdShop).toBeDefined();
      expect(createdShop.id).toBeDefined();
      expect(createdShop.name).toBe(shopData.name);
      expect(createdShop.code).toBe(shopData.code);
      
      // Store the created shop ID if it exists
      if (createdShop.id) {
        createdShopIds.push(createdShop.id);
        console.log(`Created shop: ${createdShop.name} with ID: ${createdShop.id}`);
      }
    } catch (error) {
      console.error(`Failed to create shop ${shopData.name}:`, error);
      throw error;
    }
  }

  // Fetch all shops to verify they were created
  const allShops = await realShopService.fetchAll();
  
  // Check if all created shops exist in the fetched results
  for (const shopId of createdShopIds) {
    const shopExists = allShops.some(shop => shop.id === shopId);
    expect(shopExists).toBe(true);
  }

  console.log(`Successfully created ${createdShopIds.length} shops`);
}); 