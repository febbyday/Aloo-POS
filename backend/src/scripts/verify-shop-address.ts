/**
 * Shop Address Structure Verification Script
 * 
 * This script verifies that the shop address structure is correctly defined
 * and that the imports and exports are working properly.
 */

const { Address } = require('../../../shared/schemas/shopSchema.cjs');
import { validateShopAddress } from '../validators/shopValidators';

// Sample address data
const sampleAddress: Address = {
  street: '123 Main Street',
  city: 'New York',
  state: 'NY',
  postalCode: '10001',
  country: 'USA'
};

// Verify that the address type is correctly defined
console.log('Address type verification:');
console.log('Sample address:', sampleAddress);

// Verify that the address validator works
try {
  const validatedAddress = validateShopAddress(sampleAddress);
  console.log('Address validation successful:', validatedAddress);
} catch (error) {
  console.error('Address validation failed:', error);
}

// Verify that the address schema is correctly imported
console.log('\nAddress schema verification complete.');
console.log('If you see this message without errors, the address structure is correctly defined.');
