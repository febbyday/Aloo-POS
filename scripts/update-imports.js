/**
 * Import Statement Updater for POS System
 * 
 * This script helps update import statements across the codebase after files have been renamed.
 * It scans all TypeScript/TSX files and updates import paths based on a mapping of old to new file names.
 * 
 * Usage:
 * 1. Run in dry-run mode: node update-imports.js --dry-run
 * 2. Run to apply changes: node update-imports.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const DRY_RUN = process.argv.includes('--dry-run');

// Define the mapping of old to new file names
// This should be updated based on the files that were renamed
const fileRenameMap = {
  // Example mappings - update these with actual renamed files
  // Format: 'oldPath': 'newPath'
  '@/features/settings/services/payment-service': '@/features/settings/services/paymentService',
  '@/features/settings/services/woocommerce.service': '@/features/settings/services/woocommerceService',
  '@/features/auth/services/authservice': '@/features/auth/services/authService',
  // Add more mappings as needed
};

// Track files that were updated
const updatedFiles = [];

// Process a single file to update imports
function updateImportsInFile(filePath) {
  try {
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let hasChanges = false;
    
    // Check for each mapping and replace if found
    Object.entries(fileRenameMap).forEach(([oldPath, newPath]) => {
      // Create regex to match import statements for this path
      // This handles various import formats:
      // import X from 'path'
      // import { X } from 'path'
      // import * as X from 'path'
      const importRegex = new RegExp(`(import\\s+(?:{[^}]*}|\\*\\s+as\\s+[^\\s;]+|[^\\s;]+)\\s+from\\s+['"])${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"])`, 'g');
      
      // Replace matches with updated path
      const updatedContent = content.replace(importRegex, `$1${newPath}$2`);
      
      if (updatedContent !== content) {
        content = updatedContent;
        hasChanges = true;
      }
    });
    
    // If changes were made, write back to file
    if (hasChanges) {
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
      updatedFiles.push({
        path: filePath,
        oldContent: originalContent,
        newContent: content
      });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

// Recursively scan directory for TypeScript/TSX files
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
      updateImportsInFile(filePath);
    }
  });
}

// Main execution
function main() {
  console.log('Scanning for import statements to update...');
  scanDirectory(SRC_DIR);

  // Report results
  if (updatedFiles.length === 0) {
    console.log('No import statements needed updating.');
  } else {
    console.log(`Updated import statements in ${updatedFiles.length} files:`);
    
    updatedFiles.forEach((file, index) => {
      console.log(`${index + 1}. ${file.path}`);
    });
    
    if (DRY_RUN) {
      console.log('\nThis was a dry run. No files were actually modified.');
      console.log('Run without --dry-run to apply changes.');
    } else {
      console.log('\nImport statements updated successfully.');
    }
  }

  // Instructions for manual verification
  console.log('\nIMPORTANT: It is recommended to:');
  console.log('1. Run tests to verify the application still works correctly');
  console.log('2. Check for any TypeScript errors that may have been introduced');
  console.log('3. Manually verify the changes in key files');
}

// Run the main function
main();
