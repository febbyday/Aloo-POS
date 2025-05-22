/**
 * Fix Backend Imports Script
 * 
 * This script helps fix module compatibility issues between the frontend (ES modules)
 * and backend (CommonJS) by updating imports to use ES modules consistently.
 */

import * as fs from 'fs';
import * as path from 'path';

// Function to check if a file exists
function fileExists(filePath: string): boolean {
  try {
    return fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
}

// Function to find all files that import from shared/schemas/shopSchema
function findFilesWithShopSchemaImport(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively search directories
      findFilesWithShopSchemaImport(filePath, fileList);
    } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.js'))) {
      // Check if file imports shopSchema
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('from \'../../../shared/schemas/shopSchema\'') || 
          content.includes('from \'../../shared/schemas/shopSchema\'') ||
          content.includes('from \'../shared/schemas/shopSchema\'') ||
          content.includes('from \'./shared/schemas/shopSchema\'') ||
          content.includes('require(\'../../../shared/schemas/shopSchema\')') ||
          content.includes('require(\'../../shared/schemas/shopSchema\')') ||
          content.includes('require(\'../shared/schemas/shopSchema\')') ||
          content.includes('require(\'./shared/schemas/shopSchema\')')) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

// Function to fix imports in a file
function fixImportsInFile(filePath: string): void {
  console.log(`Fixing imports in ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace CommonJS requires with ES module imports
  content = content.replace(
    /const\s+\{([^}]+)\}\s+=\s+require\(['"]\.\.\/\.\.\/\.\.\/shared\/schemas\/shopSchema(?:\.cjs)?['"]\);/g,
    'import {\n  $1\n} from \'../../../shared/schemas/shopSchema\';'
  );
  
  content = content.replace(
    /const\s+\{([^}]+)\}\s+=\s+require\(['"]\.\.\/\.\.\/shared\/schemas\/shopSchema(?:\.cjs)?['"]\);/g,
    'import {\n  $1\n} from \'../../shared/schemas/shopSchema\';'
  );
  
  content = content.replace(
    /const\s+\{([^}]+)\}\s+=\s+require\(['"]\.\.\/shared\/schemas\/shopSchema(?:\.cjs)?['"]\);/g,
    'import {\n  $1\n} from \'../shared/schemas/shopSchema\';'
  );
  
  content = content.replace(
    /const\s+\{([^}]+)\}\s+=\s+require\(['"]\.\/shared\/schemas\/shopSchema(?:\.cjs)?['"]\);/g,
    'import {\n  $1\n} from \'./shared/schemas/shopSchema\';'
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed imports in ${filePath}`);
}

// Main function
function main(): void {
  console.log('Fixing backend imports for shared schemas...');
  
  // Find all files with shopSchema imports in the backend directory
  const backendDir = path.join(__dirname, '../backend');
  const filesToFix = findFilesWithShopSchemaImport(backendDir);
  
  console.log(`Found ${filesToFix.length} files with shopSchema imports:`);
  filesToFix.forEach(file => console.log(`- ${file}`));
  
  // Fix imports in each file
  filesToFix.forEach(fixImportsInFile);
  
  console.log('\nImport fixes completed!');
  console.log('\nPlease restart your backend server to apply the changes.');
}

// Run the script
main();
