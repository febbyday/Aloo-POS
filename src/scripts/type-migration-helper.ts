/**
 * Type Migration Helper Script
 * 
 * This script helps identify type definitions across the codebase
 * and suggests migrations to match the established standards.
 * 
 * Usage:
 *   ts-node src/scripts/type-migration-helper.ts [--fix]
 */

import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import * as ts from 'typescript';

// Configuration
const CODEBASE_ROOT = path.resolve(__dirname, '../..');
const IS_FIX_MODE = process.argv.includes('--fix');
const FILE_EXTENSIONS = ['.ts', '.tsx'];

// Type definition patterns
const TYPE_PATTERNS = {
  NON_STANDARD_TYPE_FILES: /\/types\.ts$|(?<!\.types)\.d\.ts$/,
  TYPES_WITHOUT_EXTENSION: /\/types\/[^\/]+\.ts$/,
  INCONSISTENT_LOCATION: /\/(?!types\/)[^\/]+\/[^\/]+\.types\.ts$/,
};

// Results tracking
const results = {
  totalFiles: 0,
  typesFiles: 0,
  nonStandardFiles: 0,
  fixableFiles: 0,
  fixedFiles: 0,
};

// Find all TypeScript files
const allFiles = FILE_EXTENSIONS.flatMap(ext => 
  glob.sync(`${CODEBASE_ROOT}/src/**/*${ext}`, { nodir: true })
);
results.totalFiles = allFiles.length;

console.log(`\n🔍 Scanning ${results.totalFiles} TypeScript files for type definitions...\n`);

// Process each file
allFiles.forEach(filePath => {
  const relativePath = path.relative(CODEBASE_ROOT, filePath);
  
  // Check if it's a type definition file
  if (relativePath.includes('/types/') || relativePath.includes('.types.ts')) {
    results.typesFiles++;
    
    // Check for non-standard patterns
    if (TYPE_PATTERNS.NON_STANDARD_TYPE_FILES.test(relativePath)) {
      results.nonStandardFiles++;
      console.log(`❌ Non-standard type file: ${relativePath}`);
      
      // Suggest fix
      const suggestedPath = relativePath.replace(
        /\/types\.ts$/,
        '/types/index.types.ts'
      ).replace(
        /\.d\.ts$/,
        '.types.ts'
      );
      
      console.log(`   Suggestion: Rename to ${suggestedPath}`);
      
      if (IS_FIX_MODE) {
        // TODO: Implement automatic fixes
      }
    }
    
    // Check for types without .types extension
    if (TYPE_PATTERNS.TYPES_WITHOUT_EXTENSION.test(relativePath)) {
      results.nonStandardFiles++;
      console.log(`❌ Missing .types extension: ${relativePath}`);
      
      // Suggest fix
      const suggestedPath = relativePath.replace(
        /\/types\/([^\/]+)\.ts$/,
        '/types/$1.types.ts'
      );
      
      console.log(`   Suggestion: Rename to ${suggestedPath}`);
      
      if (IS_FIX_MODE) {
        // TODO: Implement automatic fixes
      }
    }
    
    // Check for inconsistent location
    if (TYPE_PATTERNS.INCONSISTENT_LOCATION.test(relativePath)) {
      results.nonStandardFiles++;
      console.log(`❌ Inconsistent location: ${relativePath}`);
      
      // Suggest fix
      const suggestedPath = relativePath.replace(
        /\/([^\/]+)\/([^\/]+)\.types\.ts$/,
        '/$1/types/$2.types.ts'
      );
      
      console.log(`   Suggestion: Move to ${suggestedPath}`);
      
      if (IS_FIX_MODE) {
        // TODO: Implement automatic fixes
      }
    }
  } else {
    // Check non-type files for type definitions that should be extracted
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Check for type definitions in non-type files
    const hasExportedTypes = /export (type|interface) [A-Z][a-zA-Z0-9_]*/.test(fileContent);
    
    if (hasExportedTypes) {
      // Create AST to analyze the file more precisely
      const sourceFile = ts.createSourceFile(
        filePath,
        fileContent,
        ts.ScriptTarget.Latest,
        true
      );
      
      // Count exported type definitions
      let exportedTypeCount = 0;
      ts.forEachChild(sourceFile, node => {
        if (
          (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) &&
          node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)
        ) {
          exportedTypeCount++;
        }
      });
      
      if (exportedTypeCount > 2) {
        results.fixableFiles++;
        console.log(`⚠️ Non-type file with ${exportedTypeCount} exported types: ${relativePath}`);
        
        // Suggest creating a new types file
        const baseDir = path.dirname(relativePath);
        const baseName = path.basename(relativePath, path.extname(relativePath));
        const suggestedPath = `${baseDir}/types/${baseName}.types.ts`;
        
        console.log(`   Suggestion: Extract types to ${suggestedPath}`);
      }
    }
  }
});

// Report summary
console.log('\n📊 Summary:');
console.log(`Total TypeScript files: ${results.totalFiles}`);
console.log(`Type definition files: ${results.typesFiles}`);
console.log(`Non-standard type files: ${results.nonStandardFiles}`);
console.log(`Files with extractable types: ${results.fixableFiles}`);

if (IS_FIX_MODE) {
  console.log(`Files automatically fixed: ${results.fixedFiles}`);
} else {
  console.log('\n💡 Run with --fix to attempt automatic fixes');
}

console.log('\n✅ Type definition scanning complete!');
console.log('   Review the documentation at src/docs/type-definition-standards.md for more details.');

/**
 * Helper functions for the migration tool
 */

/**
 * Extracts type definitions from a TypeScript file
 */
function extractTypeDefinitions(filePath: string): { 
  typeNodes: ts.Node[],
  imports: ts.ImportDeclaration[]
} {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    fileContent,
    ts.ScriptTarget.Latest,
    true
  );

  const typeNodes: ts.Node[] = [];
  const imports: ts.ImportDeclaration[] = [];

  ts.forEachChild(sourceFile, node => {
    if (ts.isImportDeclaration(node)) {
      imports.push(node);
    }
    
    if (
      (ts.isTypeAliasDeclaration(node) || 
       ts.isInterfaceDeclaration(node) ||
       ts.isEnumDeclaration(node)) &&
      node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      typeNodes.push(node);
    }
  });

  return { typeNodes, imports };
}

/**
 * Creates a .types.ts file from extracted type definitions
 */
function createTypesFile(
  sourcePath: string, 
  targetPath: string, 
  types: ts.Node[], 
  imports: ts.ImportDeclaration[]
): void {
  // Ensure target directory exists
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Get printer to convert nodes to strings
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  
  // Create new source file for the types
  const sourceFile = ts.createSourceFile(
    targetPath,
    '',
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS
  );
  
  // Generate imports
  const importsText = imports
    .map(imp => printer.printNode(ts.EmitHint.Unspecified, imp, sourceFile))
    .join('\n');
  
  // Generate type definitions
  const typesText = types
    .map(type => printer.printNode(ts.EmitHint.Unspecified, type, sourceFile))
    .join('\n\n');
  
  // Create the file content
  const fileContent = `/**
 * Type definitions extracted from ${path.basename(sourcePath)}
 * 
 * Generated by type-migration-helper.ts
 */

${importsText}

${typesText}
`;

  // Write the file
  fs.writeFileSync(targetPath, fileContent);
  console.log(`   ✓ Created ${targetPath}`);
} 