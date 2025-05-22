/**
 * Identify Deprecated Table Components
 * 
 * This script scans the codebase for deprecated table components that should be removed
 * after the table migration is complete.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const OUTPUT_FILE = path.join(ROOT_DIR, 'src', 'docs', 'deprecated-tables.md');
const EXCLUDE_DIRS = ['node_modules', 'dist', 'build', 'scripts', 'docs', 'examples'];
const FILE_EXTENSIONS = ['.tsx', '.jsx', '.ts', '.js'];

// Patterns to search for
const DEPRECATED_PATTERNS = [
  { 
    pattern: /import\s+\{.*DataTable.*\}\s+from\s+['"]@\/lib\/table['"]/g, 
    description: 'Legacy DataTable import from @/lib/table' 
  },
  { 
    pattern: /import\s+\{.*DataTable.*\}\s+from\s+['"]@\/components\/ui\/data-table['"]/g, 
    description: 'Legacy DataTable import from @/components/ui/data-table' 
  },
  { 
    pattern: /<DataTable/g, 
    description: 'Legacy DataTable component usage' 
  },
  { 
    pattern: /import\s+\{.*CrudTemplate.*\}\s+from\s+['"]@\/lib\/crud-templates['"]/g, 
    description: 'Legacy CrudTemplate import from @/lib/crud-templates' 
  },
  { 
    pattern: /<CrudTemplate/g, 
    description: 'Legacy CrudTemplate component usage' 
  },
  { 
    pattern: /import\s+\{.*SupplierTable.*\}\s+from\s+['"]@\/components\/ui\/table\/SupplierTable['"]/g, 
    description: 'Legacy SupplierTable import' 
  },
  { 
    pattern: /<SupplierTable/g, 
    description: 'Legacy SupplierTable component usage' 
  },
  { 
    pattern: /import\s+\{.*Table.*\}\s+from\s+['"]@\/components\/ui\/table['"]/g, 
    description: 'Basic Table import (may need migration)' 
  },
];

// Results
const results = {
  totalFiles: 0,
  filesWithDeprecatedTables: 0,
  deprecatedTables: [],
};

// Function to scan a file for deprecated patterns
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let fileHasDeprecatedTable = false;
    const fileResults = {
      path: filePath,
      patterns: [],
    };

    DEPRECATED_PATTERNS.forEach(({ pattern, description }) => {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        fileHasDeprecatedTable = true;
        fileResults.patterns.push({
          description,
          count: matches.length,
        });
      }
    });

    if (fileHasDeprecatedTable) {
      results.filesWithDeprecatedTables++;
      results.deprecatedTables.push(fileResults);
    }
  } catch (error) {
    console.error(`Error scanning file ${filePath}:`, error);
  }
}

// Function to scan a directory recursively
function scanDirectory(dirPath) {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        if (!EXCLUDE_DIRS.includes(entry.name)) {
          scanDirectory(fullPath);
        }
      } else if (entry.isFile() && FILE_EXTENSIONS.includes(path.extname(entry.name))) {
        results.totalFiles++;
        scanFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
  }
}

// Function to generate the report
function generateReport() {
  let report = `# Deprecated Table Components\n\n`;
  report += `This report identifies deprecated table components that should be removed after the table migration is complete.\n\n`;
  report += `## Summary\n\n`;
  report += `- Total files scanned: ${results.totalFiles}\n`;
  report += `- Files with deprecated tables: ${results.filesWithDeprecatedTables}\n\n`;
  
  report += `## Files to Update\n\n`;
  
  results.deprecatedTables.forEach(file => {
    report += `### ${file.path.replace(ROOT_DIR, '')}\n\n`;
    report += `Deprecated patterns found:\n\n`;
    
    file.patterns.forEach(pattern => {
      report += `- ${pattern.description} (${pattern.count} occurrences)\n`;
    });
    
    report += `\n`;
  });
  
  report += `## Migration Steps\n\n`;
  report += `1. Replace imports:\n`;
  report += `   - \`import { DataTable } from "@/lib/table"\` → \`import { EnhancedDataTable } from "@/components/ui/enhanced-data-table"\`\n`;
  report += `   - \`import { DataTable } from "@/components/ui/data-table"\` → \`import { EnhancedDataTable } from "@/components/ui/enhanced-data-table"\`\n`;
  report += `   - \`import { CrudTemplate } from "@/lib/crud-templates"\` → \`import { CrudTable } from "@/components/ui/table-variants"\`\n`;
  report += `   - \`import { SupplierTable } from "@/components/ui/table/SupplierTable"\` → \`import { EnhancedDataTable } from "@/components/ui/enhanced-data-table"\`\n\n`;
  
  report += `2. Update component usage:\n`;
  report += `   - \`<DataTable />\` → \`<EnhancedDataTable />\`\n`;
  report += `   - \`<CrudTemplate />\` → \`<CrudTable />\`\n`;
  report += `   - \`<SupplierTable />\` → \`<EnhancedDataTable />\`\n\n`;
  
  report += `3. Update props (see migration guide for details):\n`;
  report += `   - \`searchable\` → \`enableSearch\`\n`;
  report += `   - \`pagination\` → \`enablePagination\`\n`;
  report += `   - \`sortable\` → \`enableSorting\`\n`;
  report += `   - \`primaryKey\` → not needed\n`;
  
  return report;
}

// Main execution
console.log('Scanning for deprecated table components...');
scanDirectory(SRC_DIR);
console.log(`Found ${results.filesWithDeprecatedTables} files with deprecated tables out of ${results.totalFiles} total files.`);

// Write report to file
const report = generateReport();
fs.writeFileSync(OUTPUT_FILE, report);
console.log(`Report written to ${OUTPUT_FILE}`);
