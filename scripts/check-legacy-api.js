/**
 * Simple Legacy API Usage Checker
 *
 * This script scans the codebase for legacy API usage patterns.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

// Simple patterns to check for legacy API usage
const LEGACY_PATTERNS = [
  'getApiEndpoint(',
  'API_CONFIG.FULL_API_URL',
  'from \'@/lib/api/config\'',
  'from "@/lib/api/config"',
  'from \'@/lib/api/api-config\'',
  'from "@/lib/api/api-config"',
];

// Results tracking
const results = {
  totalFiles: 0,
  filesWithLegacyUsage: [],
};

// Check a single file for legacy API usage
function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    results.totalFiles++;

    for (const pattern of LEGACY_PATTERNS) {
      if (content.includes(pattern)) {
        const relativePath = filePath.replace(ROOT_DIR + path.sep, '');
        results.filesWithLegacyUsage.push({
          path: relativePath,
          pattern,
        });
      }
    }
  } catch (error) {
    console.error(`Error checking file ${filePath}:`, error.message);
  }
}

// Process all TypeScript/JavaScript files in the src directory
function processFiles() {
  console.log('Scanning for legacy API usage...');

  // Get all TypeScript/JavaScript files
  const getAllFiles = function(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
      if (fs.statSync(dirPath + "/" + file).isDirectory()) {
        if (file !== 'node_modules' && file !== 'dist' && file !== 'build') {
          arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        }
      } else {
        if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
          arrayOfFiles.push(path.join(dirPath, file));
        }
      }
    });

    return arrayOfFiles;
  };

  const allFiles = getAllFiles(SRC_DIR);

  // Check each file
  allFiles.forEach(checkFile);

  // Generate report
  console.log('\n=== Legacy API Usage Check Report ===\n');
  console.log(`Total files scanned: ${results.totalFiles}`);

  // Group by file path
  const fileGroups = {};
  for (const result of results.filesWithLegacyUsage) {
    if (!fileGroups[result.path]) {
      fileGroups[result.path] = [];
    }
    fileGroups[result.path].push(result.pattern);
  }

  console.log(`Files with legacy API usage: ${Object.keys(fileGroups).length}`);

  if (Object.keys(fileGroups).length > 0) {
    console.log('\nFiles with legacy API usage:');

    // Print grouped results
    let index = 1;
    for (const [filePath, patterns] of Object.entries(fileGroups)) {
      console.log(`\n${index++}. ${filePath}`);
      console.log('   Legacy patterns found:');
      const uniquePatterns = [...new Set(patterns)];
      uniquePatterns.forEach(pattern => {
        console.log(`   - ${pattern}`);
      });
    }

    console.log('\nRecommendation:');
    console.log('Migrate these files to use the enhanced API client and endpoint registry.');
    console.log('See src/docs/legacy-api-migration-guide.md for migration instructions.');
  } else {
    console.log('\n✅ No legacy API usage detected! The codebase has been fully migrated.');
  }

  console.log('\n=====================================');
}

// Debug log
console.log('Script starting...');

// Run the script
processFiles();

// Debug log
console.log('Script completed.');
