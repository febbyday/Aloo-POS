/**
 * Direct Database Connection Test for Roles
 * 
 * This script directly checks the database connection for roles
 * without depending on the API or external libraries.
 */

const { PrismaClient } = require('@prisma/client');

// Initialize Prisma client
const prisma = new PrismaClient();

// ANSI color codes for terminal output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Simple logger with color support
 */
const log = {
  info: (msg) => console.log(`${COLORS.blue}[INFO]${COLORS.reset} ${msg}`),
  success: (msg) => console.log(`${COLORS.green}[SUCCESS]${COLORS.reset} ${msg}`),
  error: (msg) => console.log(`${COLORS.red}[ERROR]${COLORS.reset} ${msg}`),
  warn: (msg) => console.log(`${COLORS.yellow}[WARNING]${COLORS.reset} ${msg}`),
  debug: (msg) => console.log(`${COLORS.cyan}[DEBUG]${COLORS.reset} ${msg}`),
};

/**
 * Checks if the database connection is working and roles can be retrieved
 */
async function checkRolesDbConnection() {
  log.info('Testing direct database connection for roles...');
  
  try {
    // Attempt to get all roles from the database
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        permissions: true,
        staffCount: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (roles && Array.isArray(roles)) {
      log.success(`Database connection successful! Found ${roles.length} roles.`);
      
      if (roles.length > 0) {
        // Display first role as sample
        log.debug('Sample role from database:');
        console.log(JSON.stringify(roles[0], null, 2));
        
        // Check if any roles are linked to staff
        const staffCount = await prisma.staff.count({
          where: {
            roleId: {
              in: roles.map(r => r.id)
            }
          }
        });
        
        log.info(`Found ${staffCount} staff members with assigned roles.`);
        
        if (staffCount > 0) {
          // Get one staff with role to verify relation
          const staffWithRole = await prisma.staff.findFirst({
            where: {
              roleId: {
                in: roles.map(r => r.id)
              }
            },
            include: {
              role: true
            }
          });
          
          if (staffWithRole) {
            log.success('Role relationship verified! Sample staff member with role:');
            console.log(`Staff: ${staffWithRole.firstName} ${staffWithRole.lastName}`);
            console.log(`Role: ${staffWithRole.role.name}`);
          }
        }
      } else {
        log.warn('No roles found in the database yet.');
      }
      
      return true;
    } else {
      log.error('Unexpected response format from database.');
      return false;
    }
  } catch (error) {
    log.error(`Database connection error: ${error.message}`);
    console.error(error);
    return false;
  } finally {
    // Disconnect from the database
    await prisma.$disconnect();
  }
}

/**
 * Main function
 */
async function main() {
  log.info('Starting database connection verification...');
  
  const success = await checkRolesDbConnection();
  
  if (success) {
    log.success('✅ Database connection check passed! The roles module is correctly connected to the database.');
  } else {
    log.error('❌ Database connection check failed. Please check the database configuration.');
  }
}

// Run the verification
main()
  .catch((error) => {
    log.error(`Unhandled error: ${error.message}`);
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    // Make sure to disconnect
    await prisma.$disconnect();
  });
