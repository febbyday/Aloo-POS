/* 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤 */

/**
 * Update Formatter Imports Script
 * 
 * This script automatically updates imports of formatting utilities from @/lib/utils
 * to their standardized location in @/lib/utils/formatters.
 * 
 * Usage:
 * node scripts/update-formatter-imports.js
 * 
 * Options:
 * --dry-run   Preview changes without applying them
 * --verbose   Show detailed information about each file
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Check if running in dry-run mode
const isDryRun = process.argv.includes('--dry-run');
const isVerbose = process.argv.includes('--verbose');

// Statistics
const stats = {
  filesScanned: 0,
  filesModified: 0,
  importsUpdated: 0,
  errors: []
};

// List of formatting functions to migrate
const formatterFunctions = [
  'formatCurrency',
  'formatDate',
  'formatNumber',
  'formatPercentage',
  'formatRelativeTime',
  'truncate', // Note: This becomes truncateText in the new import
  'formatFileSize',
  'formatPhoneNumber'
];

// Function to check if a file contains imports from "@/lib/utils"
function containsUtilsImport(content) {
  return content.includes("from '@/lib/utils'") || content.includes('from "@/lib/utils"');
}

// Function to update a single import statement
function updateImportStatement(importStatement) {
  // Skip statements that don't import from @/lib/utils
  if (!importStatement.includes('@/lib/utils')) {
    return importStatement;
  }

  // Extract the imported items
  const importMatch = importStatement.match(/import\s*{([^}]*)}\s*from\s*['"]@\/lib\/utils['"]/);
  if (!importMatch) return importStatement;

  const importedItems = importMatch[1].split(',').map(item => item.trim());
  
  // Separate formatter functions from other utilities
  const formatterImports = [];
  const otherImports = [];
  
  importedItems.forEach(item => {
    // Handle aliased imports like "truncate as truncateText"
    const itemName = item.split(' as ')[0].trim();
    
    if (formatterFunctions.includes(itemName)) {
      // Handle the special case of truncate -> truncateText
      if (itemName === 'truncate' && !item.includes(' as ')) {
        formatterImports.push(item + ' as truncateText');
      } else {
        formatterImports.push(item);
      }
    } else {
      otherImports.push(item);
    }
  });

  // Construct the new import statements
  let result = '';
  
  // Add formatter imports if any
  if (formatterImports.length > 0) {
    // Change truncate to truncateText if not aliased
    const formattedImports = formatterImports.map(item => {
      if (item === 'truncate') return 'truncateText';
      if (item.startsWith('truncate as')) return 'truncateText';
      return item;
    });
    
    result += `import { ${formattedImports.join(', ')} } from '@/lib/utils/formatters';\n`;
    stats.importsUpdated += formatterImports.length;
  }
  
  // Keep the original import for other utilities if needed
  if (otherImports.length > 0) {
    result += `import { ${otherImports.join(', ')} } from '@/lib/utils';\n`;
  }
  
  return result.trim();
}

// Function to update imports in a file
function updateFileImports(filePath) {
  try {
    // Read the file content
    const content = fs.readFileSync(filePath, 'utf8');
    stats.filesScanned++;

    // Skip files that don't import from @/lib/utils
    if (!containsUtilsImport(content)) {
      if (isVerbose) {
        console.log(`Skipping ${filePath} - No imports from @/lib/utils`);
      }
      return;
    }

    // Split by lines to process import statements
    const lines = content.split('\n');
    const importLineRegex = /^import\s*{[^}]*}\s*from\s*['"]@\/lib\/utils['"];?$/;
    
    let modified = false;
    let newLines = [];
    let inMultilineImport = false;
    let currentMultilineImport = '';
    
    // Process each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if we're in a multiline import
      if (inMultilineImport) {
        currentMultilineImport += ' ' + line.trim();
        
        // If the import statement is complete
        if (line.includes('}') && line.includes('from')) {
          const updatedImport = updateImportStatement(currentMultilineImport);
          if (updatedImport !== currentMultilineImport) {
            newLines.push(updatedImport);
            modified = true;
          } else {
            newLines.push(currentMultilineImport);
          }
          
          inMultilineImport = false;
          currentMultilineImport = '';
        }
        continue;
      }
      
      // Check for import from @/lib/utils
      if (importLineRegex.test(line)) {
        const updatedImport = updateImportStatement(line);
        if (updatedImport !== line) {
          newLines.push(updatedImport);
          modified = true;
        } else {
          newLines.push(line);
        }
      } 
      // Check for start of multiline import
      else if (line.trim().startsWith('import {') && line.includes('@/lib/utils')) {
        if (line.includes('}') && line.includes('from')) {
          // Single line import
          const updatedImport = updateImportStatement(line);
          if (updatedImport !== line) {
            newLines.push(updatedImport);
            modified = true;
          } else {
            newLines.push(line);
          }
        } else {
          // Start of multiline import
          inMultilineImport = true;
          currentMultilineImport = line.trim();
        }
      } else {
        // Not an import line, keep as is
        newLines.push(line);
      }
    }
    
    // Update the file if modified
    if (modified) {
      if (isDryRun) {
        console.log(`Would modify: ${filePath}`);
      } else {
        fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
        console.log(`Updated: ${filePath}`);
      }
      stats.filesModified++;
    } else if (isVerbose) {
      console.log(`No changes needed: ${filePath}`);
    }
  } catch (error) {
    stats.errors.push({ file: filePath, error: error.message });
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Main function
async function main() {
  console.log(`${isDryRun ? '[DRY RUN] ' : ''}Starting formatter imports update...`);
  
  // Use full absolute path to ensure we're scanning the right directory
  const rootDir = path.resolve('../');
  const srcDir = path.join(rootDir, 'src');
  console.log(`Project root directory: ${rootDir}`);
  console.log(`Source directory: ${srcDir}`);
  
  // Find all TypeScript/TSX files in the src directory
  // Use forward slashes for glob patterns even on Windows
  const pattern = 'src/**/*.{ts,tsx}';
  console.log(`Using glob pattern: ${pattern}`);
  
  const files = await glob(pattern, {
    ignore: ['**/node_modules/**', '**/*.d.ts'],
    cwd: rootDir,
    absolute: true
  });
  
  console.log(`Found ${files.length} files to scan`);
  
  // Update imports in each file
  for (const file of files) {
    updateFileImports(file);
  }
  
  // Print summary
  console.log('\n--- Summary ---');
  console.log(`Files scanned: ${stats.filesScanned}`);
  console.log(`Files modified: ${stats.filesModified}`);
  console.log(`Imports updated: ${stats.importsUpdated}`);
  
  if (stats.errors.length > 0) {
    console.log(`\nErrors encountered: ${stats.errors.length}`);
    if (isVerbose) {
      stats.errors.forEach(({ file, error }) => {
        console.log(`- ${file}: ${error}`);
      });
    }
  }
  
  if (isDryRun) {
    console.log('\nThis was a dry run. No files were actually modified.');
    console.log('Run without --dry-run to apply these changes.');
  }
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
