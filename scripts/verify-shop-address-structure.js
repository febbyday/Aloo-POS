/**
 * Shop Address Structure Verification Script
 * 
 * This script verifies that the shop address structure has been properly migrated
 * from individual fields to a structured JSON object.
 * 
 * Usage:
 * node verify-shop-address-structure.js [environment]
 * 
 * Where environment is one of: local, dev, staging, production (default: staging)
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Get environment from command line args
const environment = process.argv[2] || 'staging';
console.log(`Verifying shop address structure in ${environment} environment...`);

// Configure environment-specific database connection
let databaseUrl;
switch (environment) {
  case 'local':
    databaseUrl = 'postgresql://postgres:postgres@localhost:5432/pos_db';
    break;
  case 'dev':
    databaseUrl = process.env.DATABASE_URL_DEV;
    break;
  case 'staging':
    databaseUrl = process.env.DATABASE_URL_STAGING;
    break;
  case 'production':
    databaseUrl = process.env.DATABASE_URL_PRODUCTION;
    break;
  default:
    console.error(`Unknown environment: ${environment}`);
    process.exit(1);
}

// Initialize Prisma client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

// Create a log file
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
const logFile = path.join(logDir, `shop-address-verification-${environment}-${new Date().toISOString().replace(/:/g, '-')}.log`);
const logger = fs.createWriteStream(logFile, { flags: 'a' });

// Log to both console and file
function log(message) {
  console.log(message);
  logger.write(message + '\n');
}

// Validate address structure
function validateAddress(address) {
  if (!address) {
    return { valid: false, errors: ['Address is missing'] };
  }
  
  if (typeof address !== 'object') {
    return { valid: false, errors: [`Address is not an object: ${typeof address}`] };
  }
  
  const errors = [];
  
  // Check required fields
  ['street', 'city', 'state', 'postalCode', 'country'].forEach(field => {
    if (!address[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });
  
  // Check field types
  if (address.street && typeof address.street !== 'string') {
    errors.push(`street should be a string, got ${typeof address.street}`);
  }
  
  if (address.city && typeof address.city !== 'string') {
    errors.push(`city should be a string, got ${typeof address.city}`);
  }
  
  if (address.state && typeof address.state !== 'string') {
    errors.push(`state should be a string, got ${typeof address.state}`);
  }
  
  if (address.postalCode && typeof address.postalCode !== 'string') {
    errors.push(`postalCode should be a string, got ${typeof address.postalCode}`);
  }
  
  if (address.country && typeof address.country !== 'string') {
    errors.push(`country should be a string, got ${typeof address.country}`);
  }
  
  // Optional fields
  if (address.street2 && typeof address.street2 !== 'string') {
    errors.push(`street2 should be a string, got ${typeof address.street2}`);
  }
  
  if (address.latitude && typeof address.latitude !== 'number') {
    errors.push(`latitude should be a number, got ${typeof address.latitude}`);
  }
  
  if (address.longitude && typeof address.longitude !== 'number') {
    errors.push(`longitude should be a number, got ${typeof address.longitude}`);
  }
  
  return { valid: errors.length === 0, errors };
}

// Main verification function
async function verifyShopAddressStructure() {
  try {
    // Check if the old address columns still exist
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Shop' 
      AND column_name IN ('addressStreet', 'addressCity', 'addressState', 'addressPostalCode', 'addressCountry')
    `;
    
    if (tableInfo.length > 0) {
      const oldColumns = tableInfo.map(col => col.column_name).join(', ');
      log(`❌ ERROR: Old address columns still exist: ${oldColumns}`);
      log(`Migration has not been fully applied. Please run the migration script.`);
      return;
    }
    
    log(`✅ Database schema check passed: Old address columns have been removed.`);
    
    // Get all shops
    const shops = await prisma.shop.findMany();
    log(`Found ${shops.length} shops to verify.`);
    
    let validCount = 0;
    let invalidCount = 0;
    let invalidShops = [];
    
    // Verify each shop's address structure
    for (const shop of shops) {
      const { valid, errors } = validateAddress(shop.address);
      
      if (valid) {
        validCount++;
      } else {
        invalidCount++;
        invalidShops.push({
          id: shop.id,
          name: shop.name,
          code: shop.code,
          errors
        });
      }
    }
    
    // Log results
    log(`\nVerification Results:`);
    log(`✅ Valid addresses: ${validCount}`);
    log(`❌ Invalid addresses: ${invalidCount}`);
    
    if (invalidCount > 0) {
      log(`\nInvalid Shops:`);
      invalidShops.forEach(shop => {
        log(`\n- Shop: ${shop.name} (${shop.code}, ID: ${shop.id})`);
        shop.errors.forEach(error => log(`  - ${error}`));
      });
      
      log(`\nRecommendation: Run the address repair script to fix these issues.`);
    } else {
      log(`\n✅ All shops have valid address structures!`);
    }
    
    // Check frontend components
    log(`\nFrontend Component Check:`);
    log(`Please manually verify that the following components are using the new address structure:`);
    log(`- ShopDetailsPage: Should display address as shop.address.street, shop.address.city, etc.`);
    log(`- ShopsPage: Should display address in shop cards correctly`);
    log(`- ShopDialog: Should have form fields for address.street, address.city, etc.`);
    
  } catch (error) {
    log(`\n❌ ERROR: ${error.message}`);
    log(error.stack);
  } finally {
    await prisma.$disconnect();
    logger.end();
    log(`\nVerification complete. Log saved to ${logFile}`);
  }
}

// Run the verification
verifyShopAddressStructure();
