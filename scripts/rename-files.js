/**
 * File Renaming Script for POS System
 * 
 * This script helps standardize file naming conventions across the POS codebase.
 * It identifies files that don't follow the naming conventions and suggests renames.
 * 
 * Usage:
 * 1. Run in dry-run mode: node rename-files.js --dry-run
 * 2. Run to apply changes: node rename-files.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

// Convert exec to Promise-based
const execAsync = promisify(exec);

// Get current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const FEATURES_DIR = path.join(ROOT_DIR, 'src', 'features');
const DRY_RUN = process.argv.includes('--dry-run');

// Patterns to identify file types
const patterns = {
  // Service files should be camelCase with Service suffix
  services: {
    dir: 'services',
    pattern: /^([a-z][a-zA-Z0-9]+)[-.]?([a-zA-Z0-9]+)?\.ts$/,
    rename: (match) => {
      // Extract the base name and any suffix
      const baseName = match[1];
      const suffix = match[2] || '';
      
      // If already has 'Service' suffix, keep it, otherwise add it
      if (suffix.toLowerCase() === 'service') {
        return `${baseName}Service.ts`;
      } else if (suffix) {
        return `${baseName}${suffix}Service.ts`;
      } else {
        return `${baseName}Service.ts`;
      }
    }
  },
  
  // Component files should be PascalCase with .tsx extension
  components: {
    dir: 'components',
    pattern: /^([A-Za-z][a-zA-Z0-9]+)\.tsx?$/,
    rename: (match) => {
      // Ensure first letter is uppercase (PascalCase)
      const componentName = match[1];
      const pascalCaseName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
      return `${pascalCaseName}.tsx`;
    }
  },
  
  // Hook files should be camelCase with 'use' prefix and .tsx extension
  hooks: {
    dir: 'hooks',
    pattern: /^([a-zA-Z][a-zA-Z0-9]+)\.tsx?$/,
    rename: (match) => {
      // If doesn't start with 'use', add it
      const hookName = match[1];
      if (!hookName.startsWith('use')) {
        return `use${hookName.charAt(0).toUpperCase() + hookName.slice(1)}.tsx`;
      } else {
        return `${hookName}.tsx`;
      }
    }
  },
  
  // Type files should have .types.ts extension
  types: {
    dir: 'types',
    pattern: /^([a-zA-Z][a-zA-Z0-9]+)\.ts$/,
    rename: (match) => {
      // If doesn't end with .types.ts, rename it
      const typeName = match[1];
      if (typeName.endsWith('.types')) {
        return `${typeName}.ts`;
      } else {
        return `${typeName}.types.ts`;
      }
    }
  }
};

// Track files to rename
const filesToRename = [];

// Process a directory based on pattern configuration
function processDirectory(dir, patternConfig) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      // Recursively process subdirectories
      processDirectory(path.join(dir, file), patternConfig);
    } else {
      // Check if file matches the pattern
      const match = file.match(patternConfig.pattern);
      if (match) {
        const newName = patternConfig.rename(match);
        if (newName !== file) {
          filesToRename.push({
            oldPath: filePath,
            newPath: path.join(dir, newName),
            oldName: file,
            newName: newName
          });
        }
      }
    }
  });
}

// Process all feature modules
function processFeatureModules() {
  const features = fs.readdirSync(FEATURES_DIR);
  
  features.forEach(feature => {
    const featurePath = path.join(FEATURES_DIR, feature);
    const stats = fs.statSync(featurePath);
    
    if (stats.isDirectory()) {
      // Process each pattern type for this feature
      Object.values(patterns).forEach(patternConfig => {
        const typeDir = path.join(featurePath, patternConfig.dir);
        processDirectory(typeDir, patternConfig);
      });
    }
  });
}

// Rename files
async function renameFiles() {
  if (filesToRename.length === 0) {
    console.log('All files already follow naming conventions!');
    return;
  }
  
  console.log(`Found ${filesToRename.length} files to rename:`);
  
  for (let i = 0; i < filesToRename.length; i++) {
    const file = filesToRename[i];
    console.log(`${i + 1}. ${file.oldPath} -> ${file.newPath}`);
    
    if (!DRY_RUN) {
      try {
        // Use git mv to rename files if in a git repository
        try {
          await execAsync(`git mv "${file.oldPath}" "${file.newPath}"`);
        } catch (e) {
          // Fall back to regular fs rename if git mv fails
          fs.renameSync(file.oldPath, file.newPath);
        }
        console.log(`   Renamed successfully`);
      } catch (error) {
        console.error(`   Error renaming: ${error.message}`);
      }
    }
  }
  
  if (DRY_RUN) {
    console.log('\nThis was a dry run. No files were actually renamed.');
    console.log('Run without --dry-run to apply changes.');
  } else {
    console.log('\nFiles renamed successfully.');
    console.log('Remember to update import statements in files that reference these renamed files.');
  }
}

// Main execution
async function main() {
  console.log('Scanning POS codebase for files to rename...');
  processFeatureModules();
  await renameFiles();
}

main();
