/**
 * Service Migration Script
 * 
 * This script automates the migration of service files to the standardized factory pattern.
 * It identifies service files that need to be updated, analyzes their structure,
 * and creates standardized versions using the factory pattern.
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// Promisify fs functions
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);

// Configuration
const CONFIG = {
  rootDir: path.resolve(__dirname, '..'),
  featuresDir: path.resolve(__dirname, '../src/features'),
  backupDir: path.resolve(__dirname, '../src/features/backups'),
  servicePattern: /Service\.ts$/,
  excludePattern: /factory-|mock-|test-|spec-|\.test\.|\.spec\./,
  dryRun: false, // Set to true to preview changes without writing files
  createBackups: true,
  verbose: true,
};

// Template for standardized service file
const createServiceTemplate = (moduleName, entityName, imports, customMethods) => `/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * 
 * Factory-Based ${entityName} Service
 * 
 * This service uses the centralized service factory and endpoint registry to provide
 * a consistent implementation of ${moduleName.toLowerCase()}-related operations with minimal duplication.
 */

${imports}
import { createServiceMethod, createStandardService } from '@/lib/api/service-endpoint-factory';
import { ApiErrorType, createErrorHandler } from '@/lib/api/error-handler';

// Create a module-specific error handler
const ${moduleName.toLowerCase()}ErrorHandler = createErrorHandler('${moduleName.toLowerCase()}');

// Define retry configuration
const ${moduleName.toUpperCase()}_RETRY_CONFIG = {
  maxRetries: 2,
  initialDelay: 500,
  maxDelay: 5000,
  backoffFactor: 2,
  shouldRetry: (error: any) => {
    return ![
      ApiErrorType.VALIDATION, 
      ApiErrorType.CONFLICT,
      ApiErrorType.AUTHORIZATION
    ].includes(error.type);
  }
};

/**
 * ${entityName} service with standardized endpoint handling
 */
export const ${moduleName.toLowerCase()}Service = {
  // Basic CRUD operations from the standard service factory
  ...createStandardService<${entityName}>('${moduleName.toLowerCase()}', {
    useEnhancedClient: true,
    withRetry: ${moduleName.toUpperCase()}_RETRY_CONFIG,
    cacheResponse: true,
    // Custom response mapping if needed
    mapResponse: (data: any) => {
      if (Array.isArray(data)) {
        return data.map(item => ({
          ...item,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
        }));
      }
      return {
        ...data,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      };
    }
  }),
  
  // Custom methods for ${moduleName.toLowerCase()}-specific operations
${customMethods}
};

export default ${moduleName.toLowerCase()}Service;
`;

// Helper to create custom method template
const createCustomMethodTemplate = (methodName, returnType, paramType = '') => {
  const typeParams = paramType ? `<${returnType}, ${paramType}>` : `<${returnType}>`;
  
  return `
  /**
   * ${methodName.charAt(0).toUpperCase() + methodName.slice(1).replace(/([A-Z])/g, ' $1').toLowerCase()}
   */
  ${methodName}: createServiceMethod${typeParams}(
    '${methodName.toLowerCase()}', '${methodName.toUpperCase()}', 'get',
    { 
      withRetry: true,
      cacheResponse: true 
    }
  )`;
};

// Helper to extract imports from a file
const extractImports = (content) => {
  const importLines = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (line.trim().startsWith('import ')) {
      // Skip imports of api-client and similar utilities that will be replaced
      if (!line.includes('api-client') && 
          !line.includes('api-transition') && 
          !line.includes('endpoint-registry') &&
          !line.includes('service-endpoint-factory')) {
        importLines.push(line);
      }
    }
  }
  
  return importLines.join('\n');
};

// Helper to extract entity name from imports or content
const extractEntityName = (content, fileName) => {
  // Try to find type imports
  const typeImportMatch = content.match(/import\s+{\s*([A-Z][a-zA-Z0-9]+).*}\s+from\s+['"]\.\.\/types/);
  if (typeImportMatch && typeImportMatch[1]) {
    return typeImportMatch[1];
  }
  
  // Try to find interface definitions
  const interfaceMatch = content.match(/interface\s+([A-Z][a-zA-Z0-9]+)/);
  if (interfaceMatch && interfaceMatch[1]) {
    return interfaceMatch[1];
  }
  
  // Fallback to filename-based guess
  const fileNameMatch = fileName.match(/([a-z]+)Service\.ts$/i);
  if (fileNameMatch && fileNameMatch[1]) {
    return fileNameMatch[1].charAt(0).toUpperCase() + fileNameMatch[1].slice(1);
  }
  
  return 'Entity';
};

// Helper to extract module name from file path
const extractModuleName = (filePath) => {
  const parts = filePath.split(path.sep);
  const featureIndex = parts.indexOf('features');
  
  if (featureIndex >= 0 && featureIndex + 1 < parts.length) {
    return parts[featureIndex + 1];
  }
  
  return 'module';
};

// Helper to extract method names from content
const extractMethodNames = (content) => {
  const methods = [];
  
  // Look for method definitions in the service object
  const serviceObjMatch = content.match(/export\s+const\s+\w+Service\s*=\s*{([^}]*)}/s);
  if (serviceObjMatch && serviceObjMatch[1]) {
    const methodsContent = serviceObjMatch[1];
    const methodMatches = methodsContent.matchAll(/\s+([a-zA-Z][a-zA-Z0-9]+):\s*(async)?\s*(\([^)]*\))?/g);
    
    for (const match of methodMatches) {
      if (match[1] && !['fetchAll', 'fetchById', 'create', 'update', 'delete'].includes(match[1])) {
        methods.push(match[1]);
      }
    }
  }
  
  return methods;
};

// Helper to generate custom methods based on extracted method names
const generateCustomMethods = (methodNames) => {
  if (!methodNames.length) {
    return '  // No custom methods identified';
  }
  
  return methodNames.map(name => createCustomMethodTemplate(name, 'any')).join(',');
};

// Helper to create backup of a file
const createBackup = async (filePath) => {
  if (!CONFIG.createBackups) return;
  
  const backupDir = CONFIG.backupDir;
  const fileName = path.basename(filePath);
  const relativePath = path.relative(CONFIG.featuresDir, path.dirname(filePath));
  const backupPath = path.join(backupDir, relativePath);
  
  try {
    // Create backup directory if it doesn't exist
    await mkdir(backupPath, { recursive: true });
    
    // Read the original file
    const content = await readFile(filePath, 'utf8');
    
    // Write to backup location with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilePath = path.join(backupPath, `${fileName}.${timestamp}.bak`);
    
    await writeFile(backupFilePath, content);
    
    if (CONFIG.verbose) {
      console.log(`Created backup: ${backupFilePath}`);
    }
  } catch (error) {
    console.error(`Error creating backup for ${filePath}:`, error);
  }
};

// Helper to check if a file is already using the factory pattern
const isUsingFactoryPattern = (content) => {
  return content.includes('createStandardService') || 
         content.includes('createServiceMethod') ||
         content.includes('factory-') ||
         content.includes('Factory-');
};

// Helper to find all service files recursively
const findServiceFiles = async (dir) => {
  const results = [];
  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      const subResults = await findServiceFiles(fullPath);
      results.push(...subResults);
    } else if (
      CONFIG.servicePattern.test(entry.name) && 
      !CONFIG.excludePattern.test(entry.name)
    ) {
      results.push(fullPath);
    }
  }
  
  return results;
};

// Helper to create a factory service file
const createFactoryServiceFile = async (filePath) => {
  try {
    // Read the original file
    const content = await readFile(filePath, 'utf8');
    
    // Skip if already using factory pattern
    if (isUsingFactoryPattern(content)) {
      if (CONFIG.verbose) {
        console.log(`Skipping (already using factory pattern): ${filePath}`);
      }
      return false;
    }
    
    // Extract necessary information
    const imports = extractImports(content);
    const moduleName = extractModuleName(filePath);
    const entityName = extractEntityName(content, path.basename(filePath));
    const methodNames = extractMethodNames(content);
    const customMethods = generateCustomMethods(methodNames);
    
    // Generate new content
    const newContent = createServiceTemplate(moduleName, entityName, imports, customMethods);
    
    // Create backup of original file
    await createBackup(filePath);
    
    // Determine the new file path
    const dir = path.dirname(filePath);
    const baseName = path.basename(filePath);
    const newFileName = `factory-${moduleName.toLowerCase()}-service.ts`;
    const newFilePath = path.join(dir, newFileName);
    
    // Write the new file
    if (!CONFIG.dryRun) {
      await writeFile(newFilePath, newContent);
      console.log(`Created factory service: ${newFilePath}`);
    } else {
      console.log(`[DRY RUN] Would create: ${newFilePath}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
};

// Main function
async function main() {
  console.log('Service Migration Script');
  console.log('=======================');
  console.log(`Mode: ${CONFIG.dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE RUN'}`);
  console.log(`Create backups: ${CONFIG.createBackups ? 'Yes' : 'No'}`);
  console.log('');
  
  try {
    // Create backup directory if needed
    if (CONFIG.createBackups) {
      await mkdir(CONFIG.backupDir, { recursive: true });
    }
    
    // Find all service files
    console.log('Finding service files...');
    const serviceFiles = await findServiceFiles(CONFIG.featuresDir);
    console.log(`Found ${serviceFiles.length} service files`);
    
    // Process each file
    console.log('\nProcessing files:');
    let processed = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const filePath of serviceFiles) {
      try {
        const result = await createFactoryServiceFile(filePath);
        if (result) {
          processed++;
        } else {
          skipped++;
        }
      } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
        errors++;
      }
    }
    
    // Print summary
    console.log('\nSummary:');
    console.log(`Total files found: ${serviceFiles.length}`);
    console.log(`Files processed: ${processed}`);
    console.log(`Files skipped: ${skipped}`);
    console.log(`Errors: ${errors}`);
    
    if (CONFIG.dryRun) {
      console.log('\nThis was a DRY RUN. No files were actually modified.');
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
