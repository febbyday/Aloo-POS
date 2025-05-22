/**
 * Table Analysis Script
 * 
 * This script analyzes the codebase to identify tables that need to be migrated
 * to the standardized EnhancedDataTable component.
 * 
 * Usage:
 * node src/scripts/analyze-tables.js
 */

const fs = require('fs');
const path = require('path');
const { analyzeComponentForTableMigration } = require('../utils/table-migration-utils');

// Configuration
const rootDir = path.resolve(__dirname, '../../src');
const outputFile = path.resolve(__dirname, '../docs/table-migration-analysis.md');
const excludeDirs = ['node_modules', 'dist', 'build', 'scripts', 'docs', 'examples'];
const fileExtensions = ['.tsx', '.jsx'];

// Results
const results = {
  totalFiles: 0,
  filesWithTables: 0,
  tableTypes: {
    custom: 0,
    dataTable: 0,
    tanstack: 0,
    unknown: 0,
  },
  tables: [],
};

/**
 * Recursively scan directory for React component files
 */
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !excludeDirs.includes(file)) {
      scanDirectory(filePath);
    } else if (stat.isFile() && fileExtensions.includes(path.extname(file))) {
      analyzeFile(filePath);
    }
  }
}

/**
 * Analyze a file for tables
 */
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    results.totalFiles++;
    
    const analysis = analyzeComponentForTableMigration(content);
    
    if (analysis.containsTable) {
      results.filesWithTables++;
      results.tableTypes[analysis.tableType]++;
      
      results.tables.push({
        filePath: path.relative(rootDir, filePath),
        tableType: analysis.tableType,
        recommendations: analysis.recommendations,
      });
    }
  } catch (error) {
    console.error(`Error analyzing file ${filePath}:`, error.message);
  }
}

/**
 * Generate markdown report
 */
function generateReport() {
  let report = `# Table Migration Analysis\n\n`;
  report += `Generated on: ${new Date().toLocaleString()}\n\n`;
  
  report += `## Summary\n\n`;
  report += `- Total files analyzed: ${results.totalFiles}\n`;
  report += `- Files containing tables: ${results.filesWithTables}\n`;
  report += `- Custom table implementations: ${results.tableTypes.custom}\n`;
  report += `- DataTable implementations: ${results.tableTypes.dataTable}\n`;
  report += `- TanStack Table implementations: ${results.tableTypes.tanstack}\n`;
  report += `- Unknown table implementations: ${results.tableTypes.unknown}\n\n`;
  
  report += `## Migration Priority\n\n`;
  report += `| Priority | File | Table Type | Recommendations |\n`;
  report += `|----------|------|------------|----------------|\n`;
  
  // Sort tables by priority (custom > dataTable > tanstack)
  const prioritizedTables = [...results.tables].sort((a, b) => {
    const priorityMap = { custom: 3, dataTable: 2, tanstack: 1, unknown: 0 };
    return priorityMap[b.tableType] - priorityMap[a.tableType];
  });
  
  prioritizedTables.forEach((table, index) => {
    const priority = table.tableType === 'custom' ? 'High' : 
                     table.tableType === 'dataTable' ? 'Medium' : 'Low';
    
    report += `| ${priority} | \`${table.filePath}\` | ${table.tableType} | ${table.recommendations.join('<br>')} |\n`;
  });
  
  report += `\n## Migration Plan\n\n`;
  report += `Based on the analysis, we recommend the following migration plan:\n\n`;
  
  report += `### Phase 1: High Priority (Custom Tables)\n\n`;
  const highPriority = prioritizedTables.filter(t => t.tableType === 'custom');
  highPriority.forEach(table => {
    report += `- [ ] Migrate \`${table.filePath}\`\n`;
  });
  
  report += `\n### Phase 2: Medium Priority (DataTable)\n\n`;
  const mediumPriority = prioritizedTables.filter(t => t.tableType === 'dataTable');
  mediumPriority.forEach(table => {
    report += `- [ ] Migrate \`${table.filePath}\`\n`;
  });
  
  report += `\n### Phase 3: Low Priority (TanStack Table)\n\n`;
  const lowPriority = prioritizedTables.filter(t => t.tableType === 'tanstack');
  lowPriority.forEach(table => {
    report += `- [ ] Migrate \`${table.filePath}\`\n`;
  });
  
  return report;
}

// Main execution
console.log('Analyzing codebase for tables...');
scanDirectory(rootDir);
console.log(`Found ${results.filesWithTables} files with tables out of ${results.totalFiles} total files.`);

const report = generateReport();
fs.writeFileSync(outputFile, report);
console.log(`Report generated at ${outputFile}`);

// Output summary to console
console.log('\nSummary:');
console.log(`- Custom table implementations: ${results.tableTypes.custom}`);
console.log(`- DataTable implementations: ${results.tableTypes.dataTable}`);
console.log(`- TanStack Table implementations: ${results.tableTypes.tanstack}`);
console.log(`- Unknown table implementations: ${results.tableTypes.unknown}`);
