/**
 * Check Formatter Imports Script
 * 
 * This script checks for any remaining formatter imports from @/lib/utils
 * to verify our standardization was complete.
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// List of formatting functions to check
const formatterFunctions = [
  'formatCurrency',
  'formatDate',
  'formatNumber',
  'formatPercentage',
  'formatRelativeTime',
  'truncate',
  'formatFileSize',
  'formatPhoneNumber'
];

// Main function
async function main() {
  console.log('Checking for remaining formatter imports...');
  
  // Use full absolute path
  const rootDir = path.resolve('../');
  console.log(`Project root directory: ${rootDir}`);
  
  // Find all TypeScript/TSX files in the src directory
  const pattern = 'src/**/*.{ts,tsx}';
  
  const files = await glob(pattern, {
    ignore: ['**/node_modules/**', '**/*.d.ts'],
    cwd: rootDir,
    absolute: true
  });
  
  console.log(`Found ${files.length} files to scan`);
  
  let remainingImports = [];
  
  // Check each file
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Look for imports from @/lib/utils
    if (content.includes("from '@/lib/utils'") || content.includes('from "@/lib/utils"')) {
      const importMatches = content.match(/import\s*{([^}]*)}\s*from\s*['"]@\/lib\/utils['"]/g);
      
      if (importMatches) {
        for (const match of importMatches) {
          // Check if any formatter functions are imported
          for (const func of formatterFunctions) {
            if (match.includes(func)) {
              // Found a formatter import from @/lib/utils
              const relativePath = path.relative(rootDir, file);
              remainingImports.push({
                file: relativePath,
                import: match,
                function: func
              });
              break;
            }
          }
        }
      }
    }
  }
  
  // Print results
  if (remainingImports.length === 0) {
    console.log('\n✅ No remaining formatter imports found from @/lib/utils!');
    console.log('The migration is complete.');
  } else {
    console.log(`\n⚠️ Found ${remainingImports.length} remaining formatter imports that need updating:`);
    
    remainingImports.forEach(({ file, function: func, import: importStatement }) => {
      console.log(`\nFile: ${file}`);
      console.log(`Function: ${func}`);
      console.log(`Import: ${importStatement}`);
    });
    
    console.log('\nThese files should be manually reviewed and updated.');
  }
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
