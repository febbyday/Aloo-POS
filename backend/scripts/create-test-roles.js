/**
 * Create Test Roles
 * 
 * This script creates test roles in the database to verify the roles module
 * functionality and database connection.
 */

const { PrismaClient } = require('@prisma/client');

// Initialize Prisma client
const prisma = new PrismaClient();

// Default system roles
const defaultRoles = [
  {
    name: 'Administrator',
    description: 'Full system access with all permissions',
    permissions: {
      users: { create: true, read: true, update: true, delete: true },
      staff: { create: true, read: true, update: true, delete: true },
      inventory: { create: true, read: true, update: true, delete: true },
      settings: { create: true, read: true, update: true, delete: true },
      reports: { create: true, read: true, update: true, delete: true },
      roles: { create: true, read: true, update: true, delete: true }
    },
    isSystemRole: true
  },
  {
    name: 'Manager',
    description: 'Store management with limited administrative access',
    permissions: {
      users: { create: false, read: true, update: true, delete: false },
      staff: { create: true, read: true, update: true, delete: false },
      inventory: { create: true, read: true, update: true, delete: true },
      settings: { create: false, read: true, update: true, delete: false },
      reports: { create: true, read: true, update: false, delete: false },
      roles: { create: false, read: true, update: false, delete: false }
    },
    isSystemRole: true
  },
  {
    name: 'Cashier',
    description: 'Point of sale and basic customer management',
    permissions: {
      users: { create: false, read: false, update: false, delete: false },
      staff: { create: false, read: true, update: false, delete: false },
      inventory: { create: false, read: true, update: false, delete: false },
      settings: { create: false, read: false, update: false, delete: false },
      reports: { create: false, read: true, update: false, delete: false },
      roles: { create: false, read: false, update: false, delete: false }
    },
    isSystemRole: true
  }
];

/**
 * Create roles in the database
 */
async function createRoles() {
  console.log('Starting role creation process...');
  
  try {
    // Check if roles already exist
    const existingRolesCount = await prisma.role.count();
    
    if (existingRolesCount > 0) {
      console.log(`Found ${existingRolesCount} existing roles. Deleting them first...`);
      
      // Delete existing roles to avoid conflicts
      await prisma.role.deleteMany({});
      console.log('Existing roles deleted.');
    }
    
    // Create each role
    for (const roleData of defaultRoles) {
      const role = await prisma.role.create({
        data: {
          name: roleData.name,
          description: roleData.description,
          permissions: roleData.permissions,
          isSystemRole: roleData.isSystemRole,
          isActive: true,
          staffCount: 0
        }
      });
      
      console.log(`Created role: ${role.name} (${role.id})`);
    }
    
    // Count roles to verify
    const finalCount = await prisma.role.count();
    console.log(`\n✅ Successfully created ${finalCount} roles in the database.`);
    
    // List all roles
    const allRoles = await prisma.role.findMany();
    console.log('\nAll roles:');
    allRoles.forEach(role => {
      console.log(`- ${role.name}: ${role.description || 'No description'}`);
    });
    
    return true;
  } catch (error) {
    console.error(`Error creating roles: ${error.message}`);
    console.error(error);
    return false;
  } finally {
    // Disconnect from the database
    await prisma.$disconnect();
    console.log('\nDisconnected from database.');
  }
}

// Run the creation function
createRoles()
  .catch((error) => {
    console.error(`Unhandled error: ${error.message}`);
    process.exit(1);
  });
