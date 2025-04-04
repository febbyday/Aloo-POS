/**
 * Verify Roles API Connection
 * 
 * This script verifies that the roles endpoint is working correctly.
 * Run with: node scripts/verify-roles-connection.js
 */

const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000';
const API_ENDPOINT = '/api/v1/staff/roles';

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
 * Verifies the roles API endpoint
 */
async function verifyRolesEndpoint() {
  log.info(`Testing endpoint: ${API_BASE_URL}${API_ENDPOINT}`);
  
  try {
    // First, check the health endpoint
    log.info('Checking health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/api/v1/health`);
    
    if (!healthResponse.ok) {
      log.error(`Health check failed with status: ${healthResponse.status}`);
      log.error('Make sure the backend server is running!');
      return false;
    }
    
    log.success('Health endpoint is working!');
    
    // Test the roles endpoint
    log.info('Testing roles endpoint...');
    const rolesResponse = await fetch(`${API_BASE_URL}${API_ENDPOINT}`);
    
    if (!rolesResponse.ok) {
      log.error(`Roles endpoint failed with status: ${rolesResponse.status}`);
      const errorText = await rolesResponse.text();
      log.debug(`Response body: ${errorText}`);
      return false;
    }
    
    // Parse the response
    const roles = await rolesResponse.json();
    log.success('Roles endpoint is working!');
    log.info(`Found ${roles.length} roles in the system`);
    
    // Display some sample data
    if (roles.length > 0) {
      log.debug('Sample role data:');
      console.log(JSON.stringify(roles[0], null, 2));
    } else {
      log.warn('No roles found in the system yet.');
    }
    
    return true;
  } catch (error) {
    log.error(`Connection error: ${error.message}`);
    log.error('Make sure the backend server is running on the correct port (5000).');
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  log.info('Starting API verification...');
  
  const success = await verifyRolesEndpoint();
  
  if (success) {
    log.success('✅ All checks passed! The roles API endpoint is working correctly.');
  } else {
    log.error('❌ Verification failed. Please check the errors above.');
  }
}

// Run the verification
main().catch((error) => {
  log.error(`Unhandled error: ${error.message}`);
  process.exit(1);
}); 