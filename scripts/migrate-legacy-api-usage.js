/**
 * Legacy API Migration Script
 *
 * This script scans the codebase for legacy API usage patterns and migrates them
 * to use the enhanced API client and endpoint registry.
 *
 * Usage:
 *   node scripts/migrate-legacy-api-usage.js [--dry-run] [--file=path/to/file.ts]
 *
 * Options:
 *   --dry-run: Show what would be changed without making actual changes
 *   --file: Process only the specified file instead of the entire codebase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const DRY_RUN = process.argv.includes('--dry-run');
const SINGLE_FILE = process.argv.find(arg => arg.startsWith('--file='))?.split('=')[1];

// Legacy patterns to search for and their replacements
const LEGACY_PATTERNS = [
  {
    // Replace imports from legacy config
    pattern: /import\s+\{\s*getApiEndpoint\s*\}\s+from\s+['"]@\/lib\/api\/config['"]/g,
    replacement: `import { getApiUrl } from '@/lib/api/enhanced-config'`
  },
  {
    // Replace imports from legacy api-config
    pattern: /import\s+\{\s*API_CONFIG\s*\}\s+from\s+['"]@\/lib\/api\/api-config['"]/g,
    replacement: `import { getApiUrl } from '@/lib/api/enhanced-config'`
  },
  {
    // Replace getApiEndpoint function calls
    pattern: /getApiEndpoint\(['"]([^'"]+)['"]\)/g,
    replacement: (match, endpoint) => {
      // Map common endpoints to their enhanced equivalents
      const endpointMap = {
        'products': 'getApiUrl(\'products\', \'LIST\')',
        'shops': 'getApiUrl(\'shops\', \'LIST\')',
        'markets': 'getApiUrl(\'markets\', \'LIST\')',
        'suppliers': 'getApiUrl(\'suppliers\', \'LIST\')',
        'customers': 'getApiUrl(\'customers\', \'LIST\')',
        'auth': 'getApiUrl(\'auth\', \'LIST\')',
        'login': 'getApiUrl(\'auth\', \'LOGIN\')',
        'logout': 'getApiUrl(\'auth\', \'LOGOUT\')',
        'users': 'getApiUrl(\'users\', \'LIST\')',
        'roles': 'getApiUrl(\'roles\', \'LIST\')',
        'categories': 'getApiUrl(\'categories\', \'LIST\')',
        'gift-cards': 'getApiUrl(\'gift-cards\', \'LIST\')',
        'templates': 'getApiUrl(\'gift-cards\', \'TEMPLATES\')',
      };

      return endpointMap[endpoint] || `getApiUrl('${endpoint}', 'LIST')`;
    }
  },
  {
    // Replace API_CONFIG.FULL_API_URL usage
    pattern: /API_CONFIG\.FULL_API_URL/g,
    replacement: 'getApiUrl()'
  },
  {
    // Replace direct apiClient usage with enhancedApiClient
    pattern: /import\s+\{\s*apiClient\s*\}\s+from\s+['"]@\/lib\/api\/api-client['"]/g,
    replacement: `import { enhancedApiClient } from '@/lib/api/enhanced-api-client'`
  },
  {
    // Replace apiClient.get calls
    pattern: /apiClient\.get\(['"]([^'"\/]+)['"]([^)]*)\)/g,
    replacement: (match, endpoint, options) => {
      return `enhancedApiClient.get('${endpoint}/LIST'${options})`;
    }
  },
  {
    // Replace apiClient.post calls
    pattern: /apiClient\.post\(['"]([^'"\/]+)['"],\s*([^)]+)\)/g,
    replacement: (match, endpoint, rest) => {
      return `enhancedApiClient.post('${endpoint}/CREATE', ${rest})`;
    }
  },
  {
    // Replace apiClient.put calls
    pattern: /apiClient\.put\(['"]([^'"\/]+)\/([^'"\/]+)['"],\s*([^)]+)\)/g,
    replacement: (match, endpoint, id, rest) => {
      return `enhancedApiClient.put('${endpoint}/UPDATE', ${rest}, { id: '${id}' })`;
    }
  },
  {
    // Replace apiClient.delete calls
    pattern: /apiClient\.delete\(['"]([^'"\/]+)\/([^'"\/]+)['"]\)/g,
    replacement: (match, endpoint, id) => {
      return `enhancedApiClient.delete('${endpoint}/DELETE', { id: '${id}' })`;
    }
  },
  {
    // Replace URL construction with getApiEndpoint
    pattern: /\`\$\{getApiEndpoint\(['"]([^'"]+)['"]\)\}\/([^$\`]+)\`/g,
    replacement: (match, endpoint, param) => {
      if (param.includes('${')) {
        // Extract the parameter name from the template string
        const paramName = param.match(/\$\{([^}]+)\}/)[1];
        return `getApiUrl('${endpoint}', 'DETAIL', { id: ${paramName} })`;
      }
      return `getApiUrl('${endpoint}', 'DETAIL', { id: '${param}' })`;
    }
  }
];

// Results tracking
const results = {
  totalFiles: 0,
  filesWithLegacyUsage: 0,
  filesModified: 0,
  patternsReplaced: 0,
  modifiedFiles: []
};

/**
 * Process a file to replace legacy API patterns
 *
 * @param {string} filePath - Path to the file to process
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    results.totalFiles++;

    let modifiedContent = content;
    let fileHasLegacyUsage = false;
    let fileModified = false;

    // Apply each pattern replacement
    LEGACY_PATTERNS.forEach(({ pattern, replacement }) => {
      // Reset the regex lastIndex
      pattern.lastIndex = 0;

      // Check if the pattern exists in the file
      if (pattern.test(modifiedContent)) {
        fileHasLegacyUsage = true;

        // Reset the regex lastIndex again for the replacement
        pattern.lastIndex = 0;

        // Count the number of matches
        const matches = modifiedContent.match(pattern);
        const matchCount = matches ? matches.length : 0;

        // Replace the pattern
        const newContent = modifiedContent.replace(pattern, replacement);

        // Check if the content was actually modified
        if (newContent !== modifiedContent) {
          modifiedContent = newContent;
          fileModified = true;
          results.patternsReplaced += matchCount;
        }
      }
    });

    if (fileHasLegacyUsage) {
      results.filesWithLegacyUsage++;

      if (fileModified) {
        results.filesModified++;
        results.modifiedFiles.push(filePath);

        // Write the modified content back to the file if not in dry run mode
        if (!DRY_RUN) {
          fs.writeFileSync(filePath, modifiedContent, 'utf8');
        }
      }
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
  }
}

/**
 * Recursively scan a directory for TypeScript/TSX files
 *
 * @param {string} dir - Directory to scan
 */
function scanDirectory(dir) {
  try {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);

      try {
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
          // Skip node_modules and other non-source directories
          if (file !== 'node_modules' && file !== 'dist' && file !== 'build') {
            scanDirectory(filePath);
          }
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          // Process TypeScript/TSX files
          processFile(filePath);
        }
      } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
      }
    });
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error.message);
  }
}

/**
 * Generate a report of the migration results
 */
function generateReport() {
  console.log('\n=== Legacy API Migration Report ===\n');
  console.log(`Total files scanned: ${results.totalFiles}`);
  console.log(`Files with legacy API usage: ${results.filesWithLegacyUsage}`);
  console.log(`Files modified: ${results.filesModified}`);
  console.log(`Patterns replaced: ${results.patternsReplaced}`);

  if (results.modifiedFiles.length > 0) {
    console.log('\nModified files:');
    results.modifiedFiles.forEach((file, index) => {
      console.log(`${index + 1}. ${file.replace(ROOT_DIR + path.sep, '')}`);
    });
  }

  if (DRY_RUN) {
    console.log('\nThis was a dry run. No files were actually modified.');
    console.log('Run without --dry-run to apply changes.');
  } else if (results.filesModified > 0) {
    console.log('\nFiles have been modified. Please review the changes before committing.');
  }

  console.log('\n=====================================');
}

/**
 * Main execution function
 */
function main() {
  console.log('Legacy API Migration Script');
  console.log('==========================');
  console.log(`Mode: ${DRY_RUN ? 'Dry Run' : 'Live'}`);

  if (SINGLE_FILE) {
    const filePath = path.resolve(ROOT_DIR, SINGLE_FILE);
    console.log(`Processing single file: ${SINGLE_FILE}`);
    processFile(filePath);
  } else {
    console.log('Scanning codebase for legacy API usage...');
    scanDirectory(SRC_DIR);
  }

  generateReport();
}

// Run the script
main();
