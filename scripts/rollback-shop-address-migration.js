/**
 * Shop Address Migration Rollback Script
 * 
 * This script rolls back the shop address structure migration by:
 * 1. Adding back the individual address columns
 * 2. Populating them with data from the JSON address field
 * 3. Optionally removing the JSON address field
 * 
 * IMPORTANT: This script should only be run in case of emergency!
 * 
 * Usage:
 * node rollback-shop-address-migration.js [environment] [--remove-json-field]
 * 
 * Where:
 * - environment is one of: local, dev, staging, production (default: staging)
 * - --remove-json-field is an optional flag to remove the JSON address field
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Get environment from command line args
const environment = process.argv[2] || 'staging';
const removeJsonField = process.argv.includes('--remove-json-field');

console.log(`Rolling back shop address structure in ${environment} environment...`);
if (removeJsonField) {
  console.log('WARNING: The JSON address field will be removed after rollback.');
}

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
const logFile = path.join(logDir, `shop-address-rollback-${environment}-${new Date().toISOString().replace(/:/g, '-')}.log`);
const logger = fs.createWriteStream(logFile, { flags: 'a' });

// Log to both console and file
function log(message) {
  console.log(message);
  logger.write(message + '\n');
}

// Confirm rollback
function confirmRollback() {
  return new Promise((resolve) => {
    if (environment === 'production') {
      log('\n⚠️ WARNING: You are about to roll back the shop address migration in PRODUCTION! ⚠️');
      log('This is a destructive operation that could potentially cause data loss.');
      log('Please type "ROLLBACK PRODUCTION" to confirm:');
      
      process.stdin.once('data', (data) => {
        const input = data.toString().trim();
        if (input === 'ROLLBACK PRODUCTION') {
          log('Confirmation received. Proceeding with rollback...');
          resolve(true);
        } else {
          log('Confirmation failed. Aborting rollback.');
          resolve(false);
        }
      });
    } else {
      log(`Proceeding with rollback in ${environment} environment...`);
      resolve(true);
    }
  });
}

// Main rollback function
async function rollbackShopAddressMigration() {
  try {
    // Confirm rollback
    const confirmed = await confirmRollback();
    if (!confirmed) {
      return;
    }
    
    // Check if the old address columns already exist
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Shop' 
      AND column_name IN ('addressStreet', 'addressCity', 'addressState', 'addressPostalCode', 'addressCountry')
    `;
    
    if (tableInfo.length > 0) {
      const existingColumns = tableInfo.map(col => col.column_name).join(', ');
      log(`Some old address columns already exist: ${existingColumns}`);
      log(`Partial rollback may have been attempted before.`);
    }
    
    // Check if the JSON address column exists
    const addressColumnExists = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Shop' 
      AND column_name = 'address'
    `;
    
    if (addressColumnExists.length === 0) {
      log(`❌ ERROR: The 'address' JSON column does not exist.`);
      log(`Cannot proceed with rollback as there is no data to migrate back.`);
      return;
    }
    
    // Get all shops
    const shops = await prisma.shop.findMany();
    log(`Found ${shops.length} shops to roll back.`);
    
    // Add back the individual address columns if they don't exist
    log(`Adding back individual address columns...`);
    await prisma.$executeRaw`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Shop' AND column_name = 'addressStreet') THEN
          ALTER TABLE "Shop" ADD COLUMN "addressStreet" TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Shop' AND column_name = 'addressStreet2') THEN
          ALTER TABLE "Shop" ADD COLUMN "addressStreet2" TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Shop' AND column_name = 'addressCity') THEN
          ALTER TABLE "Shop" ADD COLUMN "addressCity" TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Shop' AND column_name = 'addressState') THEN
          ALTER TABLE "Shop" ADD COLUMN "addressState" TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Shop' AND column_name = 'addressPostalCode') THEN
          ALTER TABLE "Shop" ADD COLUMN "addressPostalCode" TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Shop' AND column_name = 'addressCountry') THEN
          ALTER TABLE "Shop" ADD COLUMN "addressCountry" TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Shop' AND column_name = 'addressLatitude') THEN
          ALTER TABLE "Shop" ADD COLUMN "addressLatitude" DOUBLE PRECISION;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Shop' AND column_name = 'addressLongitude') THEN
          ALTER TABLE "Shop" ADD COLUMN "addressLongitude" DOUBLE PRECISION;
        END IF;
      END
      $$;
    `;
    
    // Populate the individual address columns from the JSON address field
    log(`Populating individual address columns from JSON data...`);
    await prisma.$executeRaw`
      UPDATE "Shop"
      SET 
        "addressStreet" = "address"->>'street',
        "addressStreet2" = "address"->>'street2',
        "addressCity" = "address"->>'city',
        "addressState" = "address"->>'state',
        "addressPostalCode" = "address"->>'postalCode',
        "addressCountry" = "address"->>'country',
        "addressLatitude" = ("address"->>'latitude')::DOUBLE PRECISION,
        "addressLongitude" = ("address"->>'longitude')::DOUBLE PRECISION
    `;
    
    // Optionally remove the JSON address field
    if (removeJsonField) {
      log(`Removing the JSON address field...`);
      await prisma.$executeRaw`
        ALTER TABLE "Shop" DROP COLUMN "address"
      `;
    }
    
    // Verify the rollback
    const verificationShops = await prisma.shop.findMany({
      select: {
        id: true,
        name: true,
        addressStreet: true,
        addressCity: true,
        addressState: true,
        addressPostalCode: true,
        addressCountry: true
      }
    });
    
    let successCount = 0;
    let failCount = 0;
    
    for (const shop of verificationShops) {
      if (shop.addressStreet && shop.addressCity && shop.addressState && shop.addressPostalCode && shop.addressCountry) {
        successCount++;
      } else {
        failCount++;
        log(`❌ Shop ${shop.name} (${shop.id}) has missing address fields after rollback.`);
      }
    }
    
    log(`\nRollback Results:`);
    log(`✅ Successfully rolled back: ${successCount} shops`);
    log(`❌ Failed to roll back: ${failCount} shops`);
    
    if (failCount > 0) {
      log(`\nSome shops have missing address fields after rollback.`);
      log(`You may need to manually fix these shops.`);
    } else {
      log(`\n✅ Rollback completed successfully!`);
    }
    
    // Update Prisma schema
    log(`\nIMPORTANT: You need to update your Prisma schema to match the new database structure.`);
    log(`Add back the individual address fields and run 'npx prisma generate'.`);
    
  } catch (error) {
    log(`\n❌ ERROR: ${error.message}`);
    log(error.stack);
  } finally {
    await prisma.$disconnect();
    logger.end();
    log(`\nRollback operation complete. Log saved to ${logFile}`);
    
    if (environment === 'production') {
      process.exit();
    }
  }
}

// Run the rollback
rollbackShopAddressMigration();
