/**
 * Shop Address Deployment Verification Script
 * 
 * This script verifies that the shop address structure is correctly implemented
 * in the database and that the migration has been applied.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyShopAddressDeployment() {
  try {
    console.log('Verifying shop address deployment...');

    // Check if the address column exists in the Shop table
    const shopColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Shop' 
      AND column_name = 'address'
    `;

    if (shopColumns.length === 0) {
      console.error('❌ The address column does not exist in the Shop table.');
      console.error('The migration has not been applied.');
      return;
    }

    console.log('✅ The address column exists in the Shop table.');

    // Check if the old address columns have been removed
    const oldAddressColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Shop' 
      AND column_name IN ('addressStreet', 'addressCity', 'addressState', 'addressPostalCode', 'addressCountry')
    `;

    if (oldAddressColumns.length > 0) {
      console.error('❌ The old address columns still exist in the Shop table:');
      oldAddressColumns.forEach(col => console.error(`- ${col.column_name}`));
      console.error('The migration has not been fully applied.');
    } else {
      console.log('✅ The old address columns have been removed from the Shop table.');
    }

    // Get a sample shop to check the address structure
    const shop = await prisma.shop.findFirst();

    if (!shop) {
      console.log('⚠️ No shops found in the database. Cannot verify address structure.');
      return;
    }

    console.log('\nSample shop address:');
    console.log(shop.address);

    // Check if the address is a valid JSON object
    if (typeof shop.address !== 'object') {
      console.error('❌ The address is not a valid JSON object.');
      return;
    }

    // Check if all required fields are present
    const requiredFields = ['street', 'city', 'state', 'postalCode', 'country'];
    const missingFields = requiredFields.filter(field => !shop.address[field]);

    if (missingFields.length > 0) {
      console.error('❌ Missing required fields in the address:', missingFields);
    } else {
      console.log('✅ All required address fields are present.');
    }

    console.log('\nShop address deployment verification complete.');
    console.log('If you see all ✅ checks, the address structure is correctly implemented.');

  } catch (error) {
    console.error('Error verifying shop address deployment:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyShopAddressDeployment();
