/**
 * Verify Local Address Types Script
 * 
 * This script verifies that the local address types are correctly defined
 * and that the type guards work properly.
 */

// Check if the address types file exists
const fs = require('fs');
const path = require('path');

const addressTypesPath = path.join(__dirname, '../types/models/addressTypes.ts');
const shopTypesPath = path.join(__dirname, '../types/models/shopTypes.ts');

console.log('Verifying local address types...');

// Check if the address types file exists
if (!fs.existsSync(addressTypesPath)) {
  console.error(`❌ Address types file not found: ${addressTypesPath}`);
  process.exit(1);
}

console.log(`✅ Address types file found: ${addressTypesPath}`);

// Check if the shop types file exists
if (!fs.existsSync(shopTypesPath)) {
  console.error(`❌ Shop types file not found: ${shopTypesPath}`);
  process.exit(1);
}

console.log(`✅ Shop types file found: ${shopTypesPath}`);

// Read the address types file
const addressTypesContent = fs.readFileSync(addressTypesPath, 'utf8');

// Check if the Address interface is defined
if (!addressTypesContent.includes('export interface Address')) {
  console.error('❌ Address interface is not defined in the address types file');
  process.exit(1);
}

console.log('✅ Address interface is defined in the address types file');

// Check if the isAddress function is defined
if (!addressTypesContent.includes('export function isAddress')) {
  console.error('❌ isAddress function is not defined in the address types file');
  process.exit(1);
}

console.log('✅ isAddress function is defined in the address types file');

// Read the shop types file
const shopTypesContent = fs.readFileSync(shopTypesPath, 'utf8');

// Check if the Address type is imported
if (!shopTypesContent.includes('import { Address, isAddress }')) {
  console.error('❌ Address type is not imported in the shop types file');
  process.exit(1);
}

console.log('✅ Address type is imported in the shop types file');

// Check if the ShopAddress type is defined
if (!shopTypesContent.includes('export type ShopAddress = Address')) {
  console.error('❌ ShopAddress type is not defined in the shop types file');
  process.exit(1);
}

console.log('✅ ShopAddress type is defined in the shop types file');

// Check if the isShopAddress function is defined
if (!shopTypesContent.includes('export function isShopAddress')) {
  console.error('❌ isShopAddress function is not defined in the shop types file');
  process.exit(1);
}

console.log('✅ isShopAddress function is defined in the shop types file');

console.log('\nVerification complete.');
console.log('If you see all ✅ checks, the local address types are correctly defined.');
