#!/usr/bin/env ts-node

/**
 * Create Test Shops Command-line Script
 * 
 * This script creates 4 test shops in the database.
 * Run using: npm run create-test-shops
 * or: npx ts-node scripts/createTestShops.ts
 */

import { addTestShops } from '../src/features/shops/utils/addTestShops';

console.log('=== POS Test Shop Creation Tool ===');
console.log('This tool will add 4 test shops to your database.');
console.log('');

// Run the shop creation function
addTestShops()
  .then((shopIds) => {
    console.log('');
    console.log(`Successfully created ${shopIds.length} test shops.`);
    console.log('You can now use these shops in your POS application.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to create test shops:', error);
    process.exit(1);
  }); 