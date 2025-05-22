/**
 * Toast Migration Helper Script
 * 
 * This script helps identify components that are using the old toast system
 * and provides guidance on how to update them to use the standardized ToastService.
 * 
 * Usage:
 * 1. Run this script with Node.js: node scripts/toast-migration-helper.js
 * 2. The script will scan the codebase for components using the old toast system
 * 3. It will output a list of files that need to be updated
 * 4. Follow the migration guide to update each component
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const excludeDirs = ['node_modules', 'dist', 'build', '.git'];

// Patterns to search for
const patterns = [
  { 
    regex: /import\s+{\s*useToast\s*}\s+from\s+['"]@\/components\/ui\/use-toast['"]/g,
    description: 'Importing useToast from @/components/ui/use-toast'
  },
  { 
    regex: /import\s+{\s*useToast\s*}\s+from\s+['"]@\/components\/ui\/use-toast-compat['"]/g,
    description: 'Importing useToast from @/components/ui/use-toast-compat'
  },
  { 
    regex: /import\s+{\s*useToast\s*}\s+from\s+['"]@\/lib\/toast['"]/g,
    description: 'Importing useToast from @/lib/toast'
  },
  { 
    regex: /import\s+{\s*toast\s*}\s+from\s+['"]@\/components\/ui\/use-toast['"]/g,
    description: 'Importing toast from @/components/ui/use-toast'
  },
  { 
    regex: /import\s+{\s*toast\s*}\s+from\s+['"]@\/components\/ui\/use-toast-compat['"]/g,
    description: 'Importing toast from @/components/ui/use-toast-compat'
  },
  { 
    regex: /const\s+{\s*toast\s*}\s+=\s+useToast\(\)/g,
    description: 'Using const { toast } = useToast()'
  },
  { 
    regex: /toast\(\{/g,
    description: 'Using toast({ ... }) pattern'
  }
];

// Function to recursively scan directories
function scanDirectory(dir) {
  const results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!excludeDirs.includes(file)) {
        results.push(...scanDirectory(filePath));
      }
    } else if (stat.isFile() && /\.(js|jsx|ts|tsx)$/.test(file)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const matches = [];
      
      for (const pattern of patterns) {
        if (pattern.regex.test(content)) {
          matches.push(pattern.description);
          // Reset the regex lastIndex
          pattern.regex.lastIndex = 0;
        }
      }
      
      if (matches.length > 0) {
        results.push({
          filePath: filePath.replace(rootDir + path.sep, ''),
          matches
        });
      }
    }
  }
  
  return results;
}

// Main function
function main() {
  console.log('Scanning codebase for components using the old toast system...');
  const results = scanDirectory(srcDir);
  
  console.log(`\nFound ${results.length} files using the old toast system:\n`);
  
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.filePath}`);
    console.log(`   Issues: ${result.matches.join(', ')}`);
    console.log('');
  });
  
  console.log('\nMigration Guide:');
  console.log('1. Replace import statements:');
  console.log('   - FROM: import { useToast } from \'@/components/ui/use-toast\';');
  console.log('   - TO:   import { ToastService } from \'@/lib/toast\';');
  console.log('');
  console.log('2. Remove the useToast hook:');
  console.log('   - FROM: const { toast } = useToast();');
  console.log('   - TO:   [Remove this line]');
  console.log('');
  console.log('3. Update toast calls:');
  console.log('   - FROM: toast({ title: "Success", description: "Operation completed" });');
  console.log('   - TO:   ToastService.success("Success", "Operation completed");');
  console.log('');
  console.log('   - FROM: toast({ title: "Error", description: "Failed", variant: "destructive" });');
  console.log('   - TO:   ToastService.error("Error", "Failed");');
  console.log('');
  console.log('4. For other variants:');
  console.log('   - info: ToastService.info(title, description)');
  console.log('   - warning: ToastService.warning(title, description)');
  console.log('');
}

// Run the script
main();
