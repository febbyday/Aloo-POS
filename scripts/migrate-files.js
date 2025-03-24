/**
 * File Migration Script for POS System
 * 
 * This script helps migrate existing files to the standardized directory structure.
 * It identifies files that need to be moved to their proper directories and moves them.
 * 
 * Usage:
 * 1. Run in dry-run mode: node migrate-files.js --dry-run
 * 2. Run to apply changes: node migrate-files.js
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

// File patterns to identify file types
const FILE_PATTERNS = [
  {
    type: 'component',
    pattern: /^([A-Z][a-zA-Z0-9]+)\.tsx$/,
    targetDir: 'components'
  },
  {
    type: 'hook',
    pattern: /^use([A-Z][a-zA-Z0-9]+)\.tsx$/,
    targetDir: 'hooks'
  },
  {
    type: 'service',
    pattern: /^([a-z][a-zA-Z0-9]+)Service\.ts$/,
    targetDir: 'services'
  },
  {
    type: 'context',
    pattern: /^([A-Z][a-zA-Z0-9]+)Context\.tsx$/,
    targetDir: 'context'
  },
  {
    type: 'type',
    pattern: /^([a-z][a-zA-Z0-9]+)(\.types)?\.ts$/,
    targetDir: 'types'
  },
  {
    type: 'page',
    pattern: /^([A-Z][a-zA-Z0-9]+Page)\.tsx$/,
    targetDir: 'pages'
  },
  {
    type: 'util',
    pattern: /^([a-z][a-zA-Z0-9]+)\.ts$/,
    targetDir: 'utils'
  }
];

// Track files to migrate
const filesToMigrate = [];

// Helper function to ensure a directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    if (!DRY_RUN) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return true;
  }
  return false;
}

// Process a feature module
function processFeatureModule(featurePath) {
  const featureName = path.basename(featurePath);
  console.log(`Processing feature: ${featureName}`);
  
  // Get all files in the feature root directory
  const files = fs.readdirSync(featurePath);
  
  files.forEach(file => {
    const filePath = path.join(featurePath, file);
    const stats = fs.statSync(filePath);
    
    // Only process files, not directories
    if (!stats.isDirectory() && file !== 'index.ts') {
      // Check if the file matches any of our patterns
      for (const { type, pattern, targetDir } of FILE_PATTERNS) {
        const match = file.match(pattern);
        
        if (match) {
          const targetDirPath = path.join(featurePath, targetDir);
          const targetFilePath = path.join(targetDirPath, file);
          
          // Ensure the target directory exists
          ensureDirectoryExists(targetDirPath);
          
          // Check if the file already exists in the target directory
          if (!fs.existsSync(targetFilePath)) {
            filesToMigrate.push({
              type,
              oldPath: filePath,
              newPath: targetFilePath,
              featureName
            });
          }
          
          // Break out of the loop once we've found a match
          break;
        }
      }
    }
  });
  
  // Also check for misplaced files in subdirectories
  const subdirs = files.filter(file => {
    const filePath = path.join(featurePath, file);
    return fs.statSync(filePath).isDirectory();
  });
  
  subdirs.forEach(subdir => {
    const subdirPath = path.join(featurePath, subdir);
    
    // Skip standard directories
    if (['components', 'hooks', 'services', 'context', 'types', 'utils', 'pages'].includes(subdir)) {
      return;
    }
    
    // Process files in this subdirectory
    const subdirFiles = fs.readdirSync(subdirPath);
    
    subdirFiles.forEach(file => {
      const filePath = path.join(subdirPath, file);
      const stats = fs.statSync(filePath);
      
      if (!stats.isDirectory()) {
        // Check if the file matches any of our patterns
        for (const { type, pattern, targetDir } of FILE_PATTERNS) {
          const match = file.match(pattern);
          
          if (match) {
            const targetDirPath = path.join(featurePath, targetDir);
            const targetFilePath = path.join(targetDirPath, file);
            
            // Ensure the target directory exists
            ensureDirectoryExists(targetDirPath);
            
            // Check if the file already exists in the target directory
            if (!fs.existsSync(targetFilePath)) {
              filesToMigrate.push({
                type,
                oldPath: filePath,
                newPath: targetFilePath,
                featureName
              });
            }
            
            // Break out of the loop once we've found a match
            break;
          }
        }
      }
    });
  });
}

// Migrate files
async function migrateFiles() {
  if (filesToMigrate.length === 0) {
    console.log('No files need migration!');
    return;
  }
  
  console.log(`\nFound ${filesToMigrate.length} files to migrate:`);
  
  // Group by feature
  const groupedByFeature = filesToMigrate.reduce((acc, file) => {
    if (!acc[file.featureName]) {
      acc[file.featureName] = [];
    }
    acc[file.featureName].push(file);
    return acc;
  }, {});
  
  // Display files to migrate by feature
  for (const [feature, files] of Object.entries(groupedByFeature)) {
    console.log(`\n${feature}:`);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`  ${i + 1}. [${file.type}] ${path.basename(file.oldPath)} -> ${path.relative(FEATURES_DIR, file.newPath)}`);
      
      if (!DRY_RUN) {
        try {
          // Use git mv if possible to track the file move
          try {
            await execAsync(`git mv "${file.oldPath}" "${file.newPath}"`);
          } catch (e) {
            // Fall back to regular fs rename if git mv fails
            fs.renameSync(file.oldPath, file.newPath);
          }
          console.log(`     Migrated successfully`);
        } catch (error) {
          console.error(`     Error migrating: ${error.message}`);
        }
      }
    }
  }
  
  if (DRY_RUN) {
    console.log('\nThis was a dry run. No files were actually migrated.');
    console.log('Run without --dry-run to apply changes.');
  } else {
    console.log('\nFiles migrated successfully.');
    console.log('Remember to update import statements in files that reference these migrated files.');
  }
}

// Main function
async function main() {
  console.log('Scanning POS codebase for files to migrate...');
  
  // Get all feature modules
  const features = fs.readdirSync(FEATURES_DIR);
  
  features.forEach(feature => {
    const featurePath = path.join(FEATURES_DIR, feature);
    const stats = fs.statSync(featurePath);
    
    if (stats.isDirectory()) {
      processFeatureModule(featurePath);
    }
  });
  
  await migrateFiles();
}

// Run the main function
main();
