/**
 * Type Migration Script
 * 
 * This script helps migrate existing types to the new standardized type system.
 * It scans the codebase for type definitions that can be replaced with the standard types.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);

interface FileReplacementPattern {
  pattern: RegExp;
  replacement: string;
  description: string;
}

// Define replacement patterns for common types
const replacementPatterns: FileReplacementPattern[] = [
  {
    pattern: /interface\s+(\w+)\s*\{\s*id:\s*(string|number);\s*createdAt:\s*Date;\s*updatedAt:\s*Date;/g,
    replacement: 'interface $1 extends BaseEntity {',
    description: 'Replace id/createdAt/updatedAt with BaseEntity'
  },
  {
    pattern: /type\s+(\w+)ID\s*=\s*(string|number);/g,
    replacement: 'type $1ID = ID;',
    description: 'Replace custom ID types with standard ID type'
  },
  {
    pattern: /interface\s+(\w+)Response\s*\{\s*success:\s*boolean;\s*data(\?)?:\s*([^;]+);\s*error(\?)?:\s*\{[^}]+\};\s*\}/g,
    replacement: 'interface $1Response extends ApiResponse<$3> {}',
    description: 'Replace custom response types with ApiResponse'
  },
  {
    pattern: /interface\s+Paginated(\w+)\s*\{\s*data:\s*(\w+)\[\];\s*meta:\s*\{[^}]+\};\s*\}/g,
    replacement: 'type Paginated$1 = PaginatedResponse<$2>;',
    description: 'Replace custom pagination types with PaginatedResponse'
  }
];

// File extensions to process
const extensions = ['.ts', '.tsx'];

// Directories to ignore
const ignoreDirs = ['node_modules', 'dist', 'build', '.git'];

// Main function to process a file
async function processFile(filePath: string): Promise<boolean> {
  try {
    // Read file content
    const content = await readFile(filePath, 'utf8');
    let newContent = content;
    let hasChanges = false;

    // Check if file imports from types already
    const hasBaseImport = /import.*from\s+['"]\.\.\/types\/base['"]/.test(content);
    const needsBaseImport = false;

    // Apply replacement patterns
    for (const { pattern, replacement } of replacementPatterns) {
      if (pattern.test(newContent)) {
        newContent = newContent.replace(pattern, replacement);
        hasChanges = true;

        // Check if we need to import base types
        if (replacement.includes('BaseEntity') || 
            replacement.includes('ID') || 
            replacement.includes('ApiResponse') ||
            replacement.includes('PaginatedResponse')) {
          needsBaseImport = true;
        }
      }
    }

    // Add import statement if needed
    if (needsBaseImport && !hasBaseImport && hasChanges) {
      newContent = `import { BaseEntity, ID, ApiResponse, PaginatedResponse } from '../types/base';\n${newContent}`;
    }

    // Write changes back to file if needed
    if (hasChanges) {
      await writeFile(filePath, newContent, 'utf8');
      console.log(`Updated: ${filePath}`);
    }

    return hasChanges;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

// Function to walk directory tree
async function walkDir(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir);

  for (const entry of entries) {
    if (ignoreDirs.includes(entry)) continue;

    const entryPath = path.join(dir, entry);
    const entryStat = await stat(entryPath);

    if (entryStat.isDirectory()) {
      const subFiles = await walkDir(entryPath);
      files.push(...subFiles);
    } else if (entryStat.isFile() && extensions.includes(path.extname(entry))) {
      files.push(entryPath);
    }
  }

  return files;
}

// Main execution function
async function migrateTypes(rootDir: string = 'src'): Promise<void> {
  try {
    console.log('Starting type migration...');
    
    // Get all TypeScript files
    const files = await walkDir(rootDir);
    console.log(`Found ${files.length} TypeScript files to process.`);
    
    // Process each file
    let changedFilesCount = 0;
    for (const file of files) {
      const changed = await processFile(file);
      if (changed) changedFilesCount++;
    }
    
    console.log(`Migration complete! Updated ${changedFilesCount} files.`);
    
    if (changedFilesCount > 0) {
      console.log('\nNote: Please review the changes to ensure correctness.');
      console.log('Some types may need manual adjustments for proper integration.');
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Check if script is run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const rootDir = args[0] || 'src';
  
  migrateTypes(rootDir).catch(console.error);
}

export { migrateTypes }; 