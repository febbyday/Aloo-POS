/**
 * Add Super Admin Role Script
 * 
 * This script adds a Super Admin role to the database with all permissions.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Define the Super Admin role with full permissions
const superAdminRole = {
  name: 'Super Admin',
  description: 'Complete system access with all permissions',
  isSystemRole: true,
  isActive: true,
  permissions: {
    // Sales module
    sales: {
      view: 'all',
      create: 'all',
      edit: 'all',
      delete: 'all',
      export: 'all',
      approve: 'all'
    },
    // Inventory module
    inventory: {
      view: 'all',
      create: 'all',
      edit: 'all',
      delete: 'all',
      export: 'all',
      approve: 'all'
    },
    // Staff module
    staff: {
      view: 'all',
      create: 'all',
      edit: 'all',
      delete: 'all',
      export: 'all',
      approve: 'all'
    },
    // Reports module
    reports: {
      view: 'all',
      create: 'all',
      edit: 'all',
      delete: 'all',
      export: 'all'
    },
    // Settings module
    settings: {
      view: 'all',
      create: 'all',
      edit: 'all',
      delete: 'all'
    },
    // Financial module
    financial: {
      view: 'all',
      create: 'all',
      edit: 'all',
      delete: 'all',
      export: 'all',
      approve: 'all'
    },
    // Customers module
    customers: {
      view: 'all',
      create: 'all',
      edit: 'all',
      delete: 'all',
      export: 'all'
    },
    // Shops module
    shops: {
      view: 'all',
      create: 'all',
      edit: 'all',
      delete: 'all'
    },
    // Markets module
    markets: {
      view: 'all',
      create: 'all',
      edit: 'all',
      delete: 'all'
    },
    // Expenses module
    expenses: {
      view: 'all',
      create: 'all',
      edit: 'all',
      delete: 'all',
      approve: 'all'
    },
    // Repairs module
    repairs: {
      view: 'all',
      create: 'all',
      edit: 'all',
      delete: 'all'
    },
    // Suppliers module
    suppliers: {
      view: 'all',
      create: 'all',
      edit: 'all',
      delete: 'all'
    }
  }
};

/**
 * Create or update the Super Admin role
 */
async function createSuperAdminRole() {
  console.log('=== SUPER ADMIN ROLE CREATION ===');
  
  try {
    // Check if Super Admin role already exists
    console.log('Checking if Super Admin role already exists...');
    
    const existingRole = await prisma.role.findFirst({
      where: {
        name: {
          equals: superAdminRole.name,
          mode: 'insensitive'
        }
      }
    });
    
    if (existingRole) {
      console.log(`Super Admin role already exists with ID: ${existingRole.id}`);
      console.log('Updating existing Super Admin role with latest permissions...');
      
      // Update the existing role with the latest permissions
      const updatedRole = await prisma.role.update({
        where: { id: existingRole.id },
        data: {
          description: superAdminRole.description,
          permissions: superAdminRole.permissions,
          isSystemRole: superAdminRole.isSystemRole,
          isActive: superAdminRole.isActive,
          updatedAt: new Date()
        }
      });
      
      console.log(`Super Admin role updated successfully!`);
      console.log(`Role ID: ${updatedRole.id}`);
      console.log(`Role Name: ${updatedRole.name}`);
      return updatedRole;
    }
    
    // Create new Super Admin role
    console.log('Creating new Super Admin role...');
    
    const newRole = await prisma.role.create({
      data: {
        name: superAdminRole.name,
        description: superAdminRole.description,
        permissions: superAdminRole.permissions,
        isSystemRole: superAdminRole.isSystemRole,
        isActive: superAdminRole.isActive
      }
    });
    
    console.log('Super Admin role created successfully!');
    console.log(`Role ID: ${newRole.id}`);
    console.log(`Role Name: ${newRole.name}`);
    return newRole;
  } catch (error) {
    console.error(`Failed to create Super Admin role: ${error.message}`);
    console.error(error);
    return null;
  }
}

/**
 * Display all roles in the database
 */
async function displayAllRoles() {
  console.log('=== EXISTING ROLES ===');
  
  try {
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        isSystemRole: true,
        isActive: true,
        staffCount: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (roles.length === 0) {
      console.log('No roles found in the database');
      return;
    }
    
    console.log(`Found ${roles.length} roles in the database:`);
    
    roles.forEach((role, index) => {
      console.log(`\n${index + 1}. ${role.name}`);
      console.log(`   ID: ${role.id}`);
      console.log(`   Description: ${role.description || 'N/A'}`);
      console.log(`   System Role: ${role.isSystemRole ? 'Yes' : 'No'}`);
      console.log(`   Active: ${role.isActive ? 'Yes' : 'No'}`);
      console.log(`   Staff Count: ${role.staffCount}`);
      console.log(`   Created: ${role.createdAt}`);
      console.log(`   Updated: ${role.updatedAt}`);
    });
  } catch (error) {
    console.error(`Failed to retrieve roles: ${error.message}`);
  }
}

/**
 * Main function
 */
async function main() {
  try {
    // Display existing roles
    await displayAllRoles();
    
    // Create or update Super Admin role
    await createSuperAdminRole();
    
    // Display updated roles
    await displayAllRoles();
    
    console.log('=== SCRIPT COMPLETED SUCCESSFULLY ===');
  } catch (error) {
    console.error(`Script failed: ${error.message}`);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
