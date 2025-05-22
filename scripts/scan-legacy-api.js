/**
 * Legacy API Usage Scanner
 * 
 * This script scans the codebase for legacy API usage patterns and reports any findings.
 * It helps identify code that needs to be migrated to the enhanced API client.
 * 
 * Usage:
 *   node scripts/scan-legacy-api.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const LEGACY_PATTERNS = [
  { pattern: /getApiEndpoint\(/g, description: 'Legacy getApiEndpoint function' },
  { pattern: /API_CONFIG\.FULL_API_URL/g, description: 'Direct API_CONFIG.FULL_API_URL usage' },
  { pattern: /import.*from ['"]@\/lib\/api\/config['"]/g, description: 'Import from legacy config' },
  { pattern: /import.*from ['"]@\/lib\/api\/api-config['"]/g, description: 'Import from legacy api-config' },
  { pattern: /apiClient\.(get|post|put|delete|patch)\(['"`]([^\/])/g, description: 'Direct apiClient usage without endpoint registry' },
];

// Results tracking
const results = {
  totalFiles: 0,
  filesWithLegacyUsage: [],
  legacyUsageCount: 0,
};

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
    let fileFindings = [];
    
    // Check for each legacy pattern
    LEGACY_PATTERNS.forEach(({ pattern, description }) => {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        fileHasLegacyUsage = true;
        results.legacyUsageCount += matches.length;
        fileFindings.push({
          pattern: description,
          count: matches.length,
        });
      }
    });
    
    if (fileHasLegacyUsage) {
      results.filesWithLegacyUsage.push({
        path: filePath.replace(ROOT_DIR + path.sep, ''),
        findings: fileFindings,
      });
    }
  } catch (error) {
    console.error(`Error scanning file ${filePath}:`, error.message);
  }
}

/**
 * Recursively scan a directory for TypeScript/TSX files
 * 
 * @param {string} dir - Directory to scan
 */
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      // Skip node_modules and other non-source directories
      if (file !== 'node_modules' && file !== 'dist' && file !== 'build') {
        scanDirectory(filePath);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      // Process TypeScript/TSX files
      scanFile(filePath);
    }
  });
}

/**
 * Generate a report of the scan results
 */
function generateReport() {
  console.log('\n=== Legacy API Usage Scan Report ===\n');
  console.log(`Total files scanned: ${results.totalFiles}`);
  console.log(`Files with legacy API usage: ${results.filesWithLegacyUsage.length}`);
  console.log(`Total legacy API usage instances: ${results.legacyUsageCount}`);
  
  if (results.filesWithLegacyUsage.length > 0) {
    console.log('\nFiles with legacy API usage:');
    results.filesWithLegacyUsage.forEach((file, index) => {
      console.log(`\n${index + 1}. ${file.path}`);
      file.findings.forEach(finding => {
        console.log(`   - ${finding.pattern}: ${finding.count} instances`);
      });
    });
    
    console.log('\nRecommendation:');
    console.log('Migrate these files to use the enhanced API client and endpoint registry.');
    console.log('See src/docs/legacy-api-migration-guide.md for migration instructions.');
  } else {
    console.log('\n✅ No legacy API usage detected! The codebase has been fully migrated.');
  }
  
  console.log('\n=====================================');
}

// Main execution
function main() {
  console.log('Scanning codebase for legacy API usage...');
  scanDirectory(SRC_DIR);
  generateReport();
}

main();
