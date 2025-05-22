/**
 * Create Super Admin Role Script
 *
 * This script creates a default super admin role in the database with all permissions.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Logger utility
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️ INFO:${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅ SUCCESS:${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️ WARNING:${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌ ERROR:${colors.reset} ${msg}`),
  section: (title) => console.log(`\n${colors.bright}${colors.cyan}=== ${title} ===${colors.reset}\n`)
};

// Super Admin role with full permissions
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
 * Create the Super Admin role
 */
async function createSuperAdminRole() {
  log.section('SUPER ADMIN ROLE CREATION');

  try {
    // Check if Super Admin role already exists
    log.info('Checking if Super Admin role already exists...');

    const existingRole = await prisma.role.findFirst({
      where: {
        name: {
          equals: superAdminRole.name,
          mode: 'insensitive'
        }
      }
    });

    if (existingRole) {
      log.warn(`Super Admin role already exists with ID: ${existingRole.id}`);
      log.info('Updating existing Super Admin role with latest permissions...');

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

      log.success(`Super Admin role updated successfully!`);
      log.info(`Role ID: ${updatedRole.id}`);
      log.info(`Role Name: ${updatedRole.name}`);
      return updatedRole;
    }

    // Create new Super Admin role
    log.info('Creating new Super Admin role...');

    const newRole = await prisma.role.create({
      data: {
        name: superAdminRole.name,
        description: superAdminRole.description,
        permissions: superAdminRole.permissions,
        isSystemRole: superAdminRole.isSystemRole,
        isActive: superAdminRole.isActive
      }
    });

    log.success('Super Admin role created successfully!');
    log.info(`Role ID: ${newRole.id}`);
    log.info(`Role Name: ${newRole.name}`);
    return newRole;
  } catch (error) {
    log.error(`Failed to create Super Admin role: ${error.message}`);
    console.error(error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the script
createSuperAdminRole()
  .then(() => {
    log.section('SCRIPT COMPLETED');
    process.exit(0);
  })
  .catch((error) => {
    log.error(`Script failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
