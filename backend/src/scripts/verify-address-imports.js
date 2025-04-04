/**
 * Verify Address Imports Script
 * 
 * This script verifies that the address imports are working correctly
 * by checking if the Address type is properly exported from the shared schema.
 */

// Check if the shared schema file exists
const fs = require('fs');
const path = require('path');

const sharedSchemaPath = path.join(__dirname, '../../../shared/schemas/shopSchema.ts');
const backendTypesPath = path.join(__dirname, '../types/models/shopTypes.ts');

console.log('Verifying address imports...');

// Check if the shared schema file exists
if (!fs.existsSync(sharedSchemaPath)) {
  console.error(`❌ Shared schema file not found: ${sharedSchemaPath}`);
  process.exit(1);
}

console.log(`✅ Shared schema file found: ${sharedSchemaPath}`);

// Check if the backend types file exists
if (!fs.existsSync(backendTypesPath)) {
  console.error(`❌ Backend types file not found: ${backendTypesPath}`);
  process.exit(1);
}

console.log(`✅ Backend types file found: ${backendTypesPath}`);

// Read the shared schema file
const sharedSchemaContent = fs.readFileSync(sharedSchemaPath, 'utf8');

// Check if the Address type is exported
if (!sharedSchemaContent.includes('export type Address =')) {
  console.error('❌ Address type is not exported from the shared schema');
  process.exit(1);
}

console.log('✅ Address type is exported from the shared schema');

// Read the backend types file
const backendTypesContent = fs.readFileSync(backendTypesPath, 'utf8');

// Check if the Address type is imported
if (!backendTypesContent.includes('import {') || !backendTypesContent.includes('Address')) {
  console.error('❌ Address type is not imported in the backend types');
  process.exit(1);
}

console.log('✅ Address type is imported in the backend types');

// Check if the ShopAddress type is defined
if (!backendTypesContent.includes('export type ShopAddress = Address')) {
  console.error('❌ ShopAddress type is not defined in the backend types');
  process.exit(1);
}

console.log('✅ ShopAddress type is defined in the backend types');

console.log('\nVerification complete.');
console.log('If you see all ✅ checks, the address imports are working correctly.');
