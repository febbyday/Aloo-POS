/**
 * Legacy API Migration Helper
 *
 * This script helps migrate legacy API usage to the enhanced API client and endpoint registry.
 * It provides suggestions for how to migrate each file with legacy API usage.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

// Legacy patterns to search for
const LEGACY_PATTERNS = [
  { pattern: /getApiEndpoint\(['"`]([^'"`]+)['"`]\)/g, description: 'Legacy getApiEndpoint function' },
  { pattern: /API_CONFIG\.FULL_API_URL/g, description: 'Direct API_CONFIG.FULL_API_URL usage' },
  { pattern: /import\s+\{\s*([^}]*getApiEndpoint[^}]*)\s*\}\s+from\s+['"]@\/lib\/api\/config['"]/g, description: 'Import from legacy config' },
  { pattern: /import\s+\{\s*([^}]*API_CONFIG[^}]*)\s*\}\s+from\s+['"]@\/lib\/api\/api-config['"]/g, description: 'Import from legacy api-config' },
];

// Legacy endpoint mappings
const LEGACY_MAPPINGS = {
  'products': { module: 'products', endpoint: 'LIST' },
  'products-categories': { module: 'categories', endpoint: 'LIST' },
  'products-variants': { module: 'products', endpoint: 'VARIANTS' },
  'products-attributes': { module: 'products', endpoint: 'ATTRIBUTES' },
  'customers': { module: 'customers', endpoint: 'LIST' },
  'customers-groups': { module: 'customers', endpoint: 'GROUPS' },
  'shops': { module: 'shops', endpoint: 'LIST' },
  'shops-inventory': { module: 'shops', endpoint: 'INVENTORY' },
  'shops-staff': { module: 'shops', endpoint: 'STAFF' },
  'suppliers': { module: 'suppliers', endpoint: 'LIST' },
  'suppliers-orders': { module: 'suppliers', endpoint: 'ORDERS' },
  'auth': { module: 'auth', endpoint: 'LIST' },
  'login': { module: 'auth', endpoint: 'LOGIN' },
  'logout': { module: 'auth', endpoint: 'LOGOUT' },
};

// Files to check
const FILES_TO_CHECK = [
  'src/features/shops/services/shopService.ts',
  'src/features/shops/test-api-connection.ts',
  'src/features/suppliers/services/suppliersConnector.ts',
  'src/lib/auth/authService.ts',
];

// Results tracking
const results = {
  totalFiles: 0,
  filesWithLegacyUsage: [],
};

/**
 * Get the mapping for a legacy endpoint key
 *
 * @param {string} legacyKey - The legacy endpoint key
 * @returns {object|null} The mapping or null if not found
 */
function getLegacyMapping(legacyKey) {
  return LEGACY_MAPPINGS[legacyKey] || null;
}

/**
 * Generate a suggestion for how to migrate a legacy endpoint
 *
 * @param {string} legacyKey - The legacy endpoint key
 * @returns {string} A suggestion for how to migrate
 */
function getSuggestionForLegacyKey(legacyKey) {
  const mapping = getLegacyMapping(legacyKey);

  if (mapping) {
    return `getApiUrl('${mapping.module}', '${mapping.endpoint}')`;
  }

  return `getApiUrl('${legacyKey}', 'LIST')`;
}

/**
 * Scan a file for legacy API usage patterns
 *
 * @param {string} filePath - Path to the file to scan
 */
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    results.totalFiles++;

    let fileHasLegacyUsage = false;
    const findings = [];

    // Check for each legacy pattern
    LEGACY_PATTERNS.forEach(({ pattern, description }) => {
      // Reset the regex lastIndex
      pattern.lastIndex = 0;

      // Find all matches in the content
      let match;
      while ((match = pattern.exec(content)) !== null) {
        fileHasLegacyUsage = true;

        // Generate a suggestion for how to migrate
        let suggestion = '';
        if (pattern.toString().includes('getApiEndpoint')) {
          const legacyKey = match[1];
          suggestion = getSuggestionForLegacyKey(legacyKey);
        } else if (pattern.toString().includes('API_CONFIG.FULL_API_URL')) {
          suggestion = 'getApiUrl()';
        } else if (pattern.toString().includes('from')) {
          suggestion = 'import { getApiUrl } from \'@/lib/api/enhanced-config\'';
        }

        findings.push({
          pattern: description,
          match: match[0],
          suggestion,
        });
      }
    });

    if (fileHasLegacyUsage) {
      results.filesWithLegacyUsage.push({
        path: filePath,
        findings,
      });
    }
  } catch (error) {
    console.error(`Error scanning file ${filePath}:`, error.message);
  }
}

/**
 * Generate a migration plan for a file
 *
 * @param {string} filePath - Path to the file
 * @param {Array} findings - Findings for the file
 * @returns {string} Migration plan
 */
function generateMigrationPlan(filePath, findings) {
  const fileName = path.basename(filePath);
  const dirName = path.dirname(filePath);
  const moduleName = dirName.split(path.sep).slice(-2)[0];
  const serviceName = fileName.replace('.ts', '');

  let plan = `## Migration Plan for ${filePath}\n\n`;

  // Add findings
  plan += `### Legacy API Usage Found\n\n`;
  findings.forEach((finding, index) => {
    plan += `${index + 1}. **${finding.pattern}**\n`;
    plan += `   - Match: \`${finding.match}\`\n`;
    plan += `   - Suggestion: \`${finding.suggestion}\`\n\n`;
  });

  // Add migration steps
  plan += `### Migration Steps\n\n`;

  // Step 1: Register endpoints
  plan += `1. **Register Endpoints**\n\n`;
  plan += `   ```typescript\n`;
  plan += `   // Register ${moduleName} endpoints\n`;
  plan += `   export const ${moduleName.toUpperCase()}_ENDPOINTS = registerEndpoints('${moduleName}', {\n`;
  plan += `     LIST: { path: '${moduleName}', requiresAuth: true, description: 'Get all ${moduleName}' },\n`;
  plan += `     DETAIL: { path: '${moduleName}/:id', requiresAuth: true, description: 'Get ${moduleName} by ID' },\n`;
  plan += `     CREATE: { path: '${moduleName}', requiresAuth: true, description: 'Create a new ${moduleName}' },\n`;
  plan += `     UPDATE: { path: '${moduleName}/:id', requiresAuth: true, description: 'Update ${moduleName} by ID' },\n`;
  plan += `     DELETE: { path: '${moduleName}/:id', requiresAuth: true, description: 'Delete ${moduleName} by ID' },\n`;
  plan += `     // Add more endpoints as needed\n`;
  plan += `   });\n`;
  plan += `   ```\n\n`;

  // Step 2: Create factory-based service
  plan += `2. **Create Factory-Based Service**\n\n`;
  plan += `   Create a new file \`factory-${serviceName}.ts\` with the following content:\n\n`;
  plan += `   ```typescript\n`;
  plan += `   /**\n`;
  plan += `    * Factory-Based ${serviceName}\n`;
  plan += `    *\n`;
  plan += `    * This service uses the centralized service factory and endpoint registry to provide\n`;
  plan += `    * a consistent implementation of ${moduleName}-related operations with minimal duplication.\n`;
  plan += `    */\n\n`;
  plan += `   import { ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1).replace(/s$/, '')} } from '../types';\n`;
  plan += `   import { createServiceMethod, createStandardService } from '@/lib/api/service-endpoint-factory';\n`;
  plan += `   import { ${moduleName.toUpperCase()}_ENDPOINTS } from '@/lib/api/endpoint-registry';\n`;
  plan += `   import { ApiErrorType } from '@/lib/api/error-handler';\n\n`;
  plan += `   // Define retry configuration if needed\n`;
  plan += `   const RETRY_CONFIG = {\n`;
  plan += `     maxRetries: 3,\n`;
  plan += `     retryDelay: 1000,\n`;
  plan += `     shouldRetry: (error: any) => error.type !== ApiErrorType.VALIDATION\n`;
  plan += `   };\n\n`;
  plan += `   /**\n`;
  plan += `    * ${serviceName} with standardized endpoint handling\n`;
  plan += `    */\n`;
  plan += `   export const ${serviceName} = {\n`;
  plan += `     // Basic CRUD operations from the standard service factory\n`;
  plan += `     ...createStandardService<${moduleName.charAt(0).toUpperCase() + moduleName.slice(1).replace(/s$/, '')}>('${moduleName}', {\n`;
  plan += `       useEnhancedClient: true,\n`;
  plan += `       withRetry: RETRY_CONFIG,\n`;
  plan += `       cacheResponse: true,\n`;
  plan += `       // Custom response mapping if needed\n`;
  plan += `       mapResponse: (data: any) => {\n`;
  plan += `         // Transform response data if needed\n`;
  plan += `         return data;\n`;
  plan += `       }\n`;
  plan += `     }),\n\n`;
  plan += `     // Custom methods for specialized operations\n`;
  plan += `     // Add custom methods as needed\n`;
  plan += `   };\n\n`;
  plan += `   export default ${serviceName};\n`;
  plan += `   ```\n\n`;

  // Step 3: Update service index
  plan += `3. **Update Service Index**\n\n`;
  plan += `   Update the service index file to export the new factory-based service:\n\n`;
  plan += `   ```typescript\n`;
  plan += `   // Export the factory-based service\n`;
  plan += `   export { default as ${serviceName} } from './factory-${serviceName}';\n\n`;
  plan += `   // Export the legacy service with deprecation warning\n`;
  plan += `   import { ${serviceName} as legacy${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)} } from './${serviceName}';\n`;
  plan += `   /**\n`;
  plan += `    * @deprecated Use the factory-based ${serviceName} instead\n`;
  plan += `    */\n`;
  plan += `   export const ${serviceName}Legacy = legacy${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)};\n`;
  plan += `   ```\n\n`;

  // Step 4: Add deprecation warning
  plan += `4. **Add Deprecation Warning**\n\n`;
  plan += `   Add a deprecation warning to the legacy service:\n\n`;
  plan += `   ```typescript\n`;
  plan += `   /**\n`;
  plan += `    * @deprecated Use the factory-based ${serviceName} instead\n`;
  plan += `    */\n`;
  plan += `   export const ${serviceName} = {\n`;
  plan += `     // Existing methods...\n`;
  plan += `   };\n`;
  plan += `   ```\n\n`;

  return plan;
}

/**
 * Generate a migration report
 */
function generateMigrationReport() {
  console.log('Generating migration report...');

  let report = '# Legacy API Migration Report\n\n';
  report += '## Overview\n\n';
  report += 'This report provides a detailed migration plan for files that still use legacy API patterns.\n\n';

  if (results.filesWithLegacyUsage.length > 0) {
    report += '## Files to Migrate\n\n';
    results.filesWithLegacyUsage.forEach((file, index) => {
      report += `${index + 1}. [${file.path}](#migration-plan-for-${file.path.replace(/\//g, '').replace(/\./g, '')})\n`;
    });

    report += '\n';

    // Add migration plans
    results.filesWithLegacyUsage.forEach(file => {
      report += generateMigrationPlan(file.path, file.findings);
      report += '\n---\n\n';
    });
  } else {
    report += '✅ No files need to be migrated! The codebase has been fully migrated to the enhanced API client and endpoint registry.\n';
  }

  // Write the report to a file
  fs.writeFileSync(path.join(ROOT_DIR, 'legacy-api-migration-report.md'), report);

  console.log(`Migration report generated: ${path.join(ROOT_DIR, 'legacy-api-migration-report.md')}`);
}

/**
 * Main execution
 */
function main() {
  console.log('Scanning files for legacy API usage...');
  console.log('Files to check:', FILES_TO_CHECK);

  // Scan each file
  FILES_TO_CHECK.forEach(filePath => {
    const fullPath = path.join(ROOT_DIR, filePath);
    console.log(`Checking file: ${fullPath}`);

    if (fs.existsSync(fullPath)) {
      console.log(`File exists: ${fullPath}`);
      scanFile(fullPath);
    } else {
      console.warn(`File not found: ${fullPath}`);
    }
  });

  console.log('Scan results:', JSON.stringify(results, null, 2));

  // Generate migration report
  generateMigrationReport();
}

// Run the script
console.log('Starting migration helper script...');
main();
console.log('Migration helper script completed.');
