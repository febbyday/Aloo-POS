/**
 * Verify Address Types Script
 *
 * This script verifies that the address types are correctly defined
 * and that the type guards work properly.
 */

// Import the types and type guards
const {
  isShopAddress,
  isShopOperatingHours,
  isShopSettingsData,
  isShopActivityData
} = require('../types/models/shopTypes');

// Sample address data
const sampleAddress = {
  street: '123 Main Street',
  street2: 'Suite 100',
  city: 'New York',
  state: 'NY',
  postalCode: '10001',
  country: 'USA',
  latitude: 40.7128,
  longitude: -74.0060
};

// Sample operating hours data
const sampleOperatingHours = {
  monday: { open: true, openTime: '09:00', closeTime: '17:00' },
  tuesday: { open: true, openTime: '09:00', closeTime: '17:00' },
  wednesday: { open: true, openTime: '09:00', closeTime: '17:00' },
  thursday: { open: true, openTime: '09:00', closeTime: '17:00' },
  friday: { open: true, openTime: '09:00', closeTime: '17:00' },
  saturday: { open: true, openTime: '10:00', closeTime: '15:00' },
  sunday: { open: false }
};

// Sample settings data
const sampleSettings = {
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
};

// Sample activity data
const sampleActivityData = [
  {
    type: 'inventory',
    message: 'Inventory updated',
    timestamp: new Date().toISOString()
  },
  {
    type: 'staff',
    message: 'Staff member added',
    timestamp: new Date().toISOString()
  }
];

// Verify the address type guard
console.log('Verifying address type guard:');
console.log('isShopAddress(sampleAddress):', isShopAddress(sampleAddress));
console.log('isShopAddress(null):', isShopAddress(null));
console.log('isShopAddress({}):', isShopAddress({}));

// Verify the operating hours type guard
console.log('\nVerifying operating hours type guard:');
console.log('isShopOperatingHours(sampleOperatingHours):', isShopOperatingHours(sampleOperatingHours));
console.log('isShopOperatingHours(null):', isShopOperatingHours(null));
console.log('isShopOperatingHours({}):', isShopOperatingHours({}));

// Verify the settings type guard
console.log('\nVerifying settings type guard:');
console.log('isShopSettingsData(sampleSettings):', isShopSettingsData(sampleSettings));
console.log('isShopSettingsData(null):', isShopSettingsData(null));
console.log('isShopSettingsData({}):', isShopSettingsData({}));

// Verify the activity data type guard
console.log('\nVerifying activity data type guard:');
console.log('isShopActivityData(sampleActivityData):', isShopActivityData(sampleActivityData));
console.log('isShopActivityData(null):', isShopActivityData(null));
console.log('isShopActivityData([]):', isShopActivityData([]));

console.log('\nVerification complete.');
console.log('If you see all type guards working correctly, the address types are correctly defined.');
