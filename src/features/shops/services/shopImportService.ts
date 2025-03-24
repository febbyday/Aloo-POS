// Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 

import { z } from 'zod';
import { Shop } from '../types/shops.types';

// Define the schema for shop import validation
export const ShopImportSchema = z.object({
  name: z.string().min(1, "Shop name is required"),
  location: z.string().min(1, "Location is required"),
  type: z.enum(["retail", "warehouse", "outlet"], {
    errorMap: () => ({ message: "Type must be one of: retail, warehouse, outlet" })
  }),
  status: z.enum(["active", "inactive", "maintenance"], {
    errorMap: () => ({ message: "Status must be one of: active, inactive, maintenance" })
  }).default("active"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  managerName: z.string().optional(),
  notes: z.string().optional()
});

// Type for imported shop data
export type ShopImportData = z.infer<typeof ShopImportSchema>;

// CSV template headers and example row
export const CSV_HEADERS = [
  'name',
  'location',
  'type',
  'status',
  'phone',
  'email',
  'managerName',
  'notes'
];

export const CSV_EXAMPLE_ROW = [
  'Downtown Store',
  '123 Main St',
  'retail',
  'active',
  '+1-555-1234',
  'store@example.com',
  'John Smith', 
  'Opens at 9am'
];

/**
 * Generate CSV template for shop import
 * @returns CSV string with headers and example row
 */
export function generateShopImportTemplate(): string {
  const header = CSV_HEADERS.join(',');
  const exampleRow = CSV_EXAMPLE_ROW.join(',');
  return `${header}\n${exampleRow}`;
}

/**
 * Utility function to detect delimiter in CSV text
 * Supports comma and tab delimiters
 */
function detectDelimiter(text: string): string {
  // Get first line for detection
  const firstLine = text.split('\n')[0] || '';
  
  // Count occurrences of commas and tabs outside of quotes
  let inQuotes = false;
  let commaCount = 0;
  let tabCount = 0;
  
  for (let i = 0; i < firstLine.length; i++) {
    const char = firstLine[i];
    
    // Toggle quote state (handles both single and double quotes)
    if (char === '"' || char === "'") {
      // Check if escaped quote within quotes
      if (inQuotes && i < firstLine.length - 1 && (firstLine[i+1] === '"' || firstLine[i+1] === "'")) {
        i++; // Skip the escaped quote
        continue;
      }
      inQuotes = !inQuotes;
    }
    
    // Only count delimiters outside of quotes
    if (!inQuotes) {
      if (char === ',') commaCount++;
      if (char === '\t') tabCount++;
    }
  }
  
  console.log(`Delimiter detection: commas=${commaCount}, tabs=${tabCount}`);
  
  // If there are more tabs than commas, use tab as delimiter
  return tabCount > commaCount ? '\t' : ',';
}

/**
 * Parse CSV text into shop import data with validation
 * @param csvText Raw CSV text
 * @returns Array of validated shop import data
 */
export async function parseShopImportCsv(csvText: string): Promise<ShopImportData[]> {
  try {
    // Clean up common CSV issues
    // Remove BOM character if present
    csvText = csvText.replace(/^\uFEFF/, '');
    // Normalize line endings
    csvText = csvText.replace(/\r\n|\r/g, '\n');
    // Trim trailing whitespace/empty lines
    csvText = csvText.trim();
    
    // Detect and use the appropriate delimiter (comma or tab)
    const delimiter = detectDelimiter(csvText);
    console.log('Detected delimiter:', delimiter === '\t' ? 'tab' : 'comma');
    
    // Split into lines and validate
    const lines = csvText.split('\n');
    if (!lines || lines.length === 0 || !lines[0]) {
      throw new Error('CSV file is empty or invalid');
    }
    
    // Pre-process CSV to handle quoted values properly
    const parsedLines: string[][] = [];
    
    for (const line of lines) {
      if (!line.trim()) continue; // Skip empty lines
      
      const values: string[] = [];
      let currentValue = '';
      let inQuotes = false;
      let quoteChar = '';
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        // Handle quotes (both single and double)
        if ((char === '"' || char === "'") && (!quoteChar || quoteChar === char)) {
          // Check for escaped quotes
          if (inQuotes && i < line.length - 1 && line[i+1] === char) {
            currentValue += char;
            i++; // Skip next char
            continue;
          }
          
          // Toggle quote state
          if (!inQuotes) quoteChar = char;
          else quoteChar = '';
          
          inQuotes = !inQuotes;
          continue;
        }
        
        // If we hit a delimiter outside quotes, add the value
        if (!inQuotes && char === delimiter) {
          values.push(currentValue.trim());
          currentValue = '';
          continue;
        }
        
        // Add char to current value
        currentValue += char;
      }
      
      // Add the last value
      values.push(currentValue.trim());
      parsedLines.push(values);
    }
    
    if (parsedLines.length === 0) {
      throw new Error('No data found in CSV file');
    }
    
    // Extract headers from first row
    const headers = parsedLines[0].map(h => h.trim().toLowerCase());
    console.log('CSV Headers:', headers);
    
    // Check for required headers
    const requiredHeaders = ['name', 'location', 'type'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`CSV is missing required headers: ${missingHeaders.join(', ')}`);
    }
    
    // Get column indexes for each field
    const nameIndex = headers.indexOf('name');
    const locationIndex = headers.indexOf('location');
    const typeIndex = headers.indexOf('type');
    const statusIndex = headers.indexOf('status');
    const phoneIndex = headers.indexOf('phone');
    const emailIndex = headers.indexOf('email');
    const managerNameIndex = headers.indexOf('managername') !== -1 ? 
                             headers.indexOf('managername') : 
                             headers.indexOf('manager');
    const notesIndex = headers.indexOf('notes');
    
    console.log('Column Indexes:', { 
      name: nameIndex, 
      location: locationIndex, 
      type: typeIndex, 
      status: statusIndex,
      phone: phoneIndex,
      email: emailIndex,
      managerName: managerNameIndex,
      notes: notesIndex
    });
    
    const results: ShopImportData[] = [];
    const errors: { line: number; errors: string[] }[] = [];
    
    // Process each data row (skip header)
    for (let i = 1; i < parsedLines.length; i++) {
      const values = parsedLines[i];
      if (values.length === 0) continue; // Skip empty rows
      
      // Show debugging info for troubleshooting
      console.log(`Row ${i} raw values:`, values);
      
      // Create data object with type safety
      const rowData: Record<string, string> = {};
      
      // Extract values using column indexes, with bounds checking
      if (nameIndex !== -1 && nameIndex < values.length) {
        rowData.name = values[nameIndex];
      }
      
      if (locationIndex !== -1 && locationIndex < values.length) {
        rowData.location = values[locationIndex];
      }
      
      if (typeIndex !== -1 && typeIndex < values.length) {
        rowData.type = values[typeIndex];
      }
      
      if (statusIndex !== -1 && statusIndex < values.length) {
        rowData.status = values[statusIndex];
      } else {
        // Default to active if status is missing
        rowData.status = 'active';
      }
      
      if (phoneIndex !== -1 && phoneIndex < values.length) {
        rowData.phone = values[phoneIndex];
      }
      
      if (emailIndex !== -1 && emailIndex < values.length) {
        rowData.email = values[emailIndex];
      }
      
      if (managerNameIndex !== -1 && managerNameIndex < values.length) {
        rowData.managerName = values[managerNameIndex];
      }
      
      if (notesIndex !== -1 && notesIndex < values.length) {
        rowData.notes = values[notesIndex];
      }
      
      // For debugging only
      console.log(`Row ${i} processed data:`, rowData);
      
      try {
        // Check required fields
        if (!rowData.name) {
          throw new Error('Name is required');
        }
        if (!rowData.location) {
          throw new Error('Location is required');
        }
        if (!rowData.type) {
          throw new Error('Type is required');
        }
        
        // Pre-validate critical fields before passing to zod
        if (rowData.type) {
          // Normalize type to handle common variations
          if (/^retail$/i.test(String(rowData.type))) {
            rowData.type = 'retail';
          } else if (/^ware?hous[ea]?$/i.test(String(rowData.type))) {
            // Match warehouse, warehous, warhous, warehousa etc.
            rowData.type = 'warehouse';
          } else if (/^outlet$/i.test(String(rowData.type))) {
            rowData.type = 'outlet';
          } else {
            throw new Error(`Type must be one of: retail, warehouse, outlet. Found: "${rowData.type}"`);
          }
        }
        
        if (rowData.status) {
          // Normalize status to handle common variations
          if (/^activ[ea]?$/i.test(String(rowData.status))) {
            rowData.status = 'active';
          } else if (/^inactiv[ea]?$/i.test(String(rowData.status))) {
            rowData.status = 'inactive'; 
          } else if (/^maint(enance)?$/i.test(String(rowData.status))) {
            rowData.status = 'maintenance';
          } else if (!rowData.status.trim()) {
            // If empty, default to active
            rowData.status = 'active';
          } else {
            throw new Error(`Status must be one of: active, inactive, maintenance. Found: "${rowData.status}"`);
          }
        }
        
        if (rowData.email && !rowData.email.includes('@')) {
          throw new Error(`Invalid email format: ${rowData.email}`);
        }
        
        // Validate row data against schema
        const validatedRow = ShopImportSchema.parse(rowData);
        results.push(validatedRow);
      } catch (err) {
        // Collect errors for this row
        if (err instanceof z.ZodError) {
          errors.push({
            line: i,
            errors: err.errors.map(e => `${e.path.join('.')}: ${e.message}`)
          });
        } else if (err instanceof Error) {
          errors.push({
            line: i,
            errors: [err.message]
          });
        }
      }
    }
    
    // After all the parsing and processing is complete, log the final results
    console.log(`CSV import completed with ${results.length} valid shops and ${errors.length} errors`);
    if (results.length > 0) {
      console.log('Valid shops:', results);
    }
    if (errors.length > 0) {
      console.log('Validation errors:', errors);
    }
    
    // Handle validation results
    
    // If we have errors but some rows passed validation
    if (errors.length > 0 && results.length > 0) {
      console.warn(`CSV import had ${errors.length} validation errors:`, errors);
      
      // Continue with valid rows, but only log a warning - don't throw an error
      console.warn(
        `${errors.length} rows had validation errors and were skipped. ` +
        `Common issues: ${errors.slice(0, 3).flatMap(e => e.errors).join('; ')}` +
        (errors.length > 3 ? ' (and more...)' : '')
      );
      
      // Return the valid results even though some rows had errors
      return results;
    }
    
    // If all rows failed validation
    if (errors.length > 0 && results.length === 0) {
      const errorMessages = errors.slice(0, 3).flatMap(e => `Row ${e.line}: ${e.errors.join(', ')}`);
      
      // Show a more helpful error message with formatting guidance
      throw new Error(
        `All rows failed validation. Please check your CSV format. Examples:\n` +
        `${errorMessages.join('\n')}` +
        (errors.length > 3 ? '\n(and more errors...)' : '') +
        `\n\nMake sure your CSV has these exact columns: name,location,type,status,phone,email,managerName,notes` +
        `\n- type must be one of: retail, warehouse, outlet` +
        `\n- status must be one of: active, inactive, maintenance` +
        `\n\nTry downloading the template and following its exact format.`
      );
    }
    
    if (results.length === 0) {
      throw new Error('No valid data found in the CSV file. Please check that your file is formatted correctly and contains valid data.');
    }
    
    return results;
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errorMessage = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new Error(`Validation error: ${errorMessage}`);
    }
    throw err;
  }
}

/**
 * Checks if a shop with the same name and location already exists
 */
export function checkDuplicateShop(newShop: ShopImportData, existingShops: { name: string; location: string }[]): boolean {
  const normalizedName = newShop.name.toLowerCase().trim();
  const normalizedLocation = newShop.location.toLowerCase().trim();
  
  return existingShops.some(shop => 
    shop.name.toLowerCase().trim() === normalizedName && 
    shop.location.toLowerCase().trim() === normalizedLocation
  );
}

/**
 * Convert shop import data to API format
 * @param importData Validated import data
 * @returns Shop data ready for API
 */
export function convertImportDataToShop(importData: ShopImportData): Omit<Shop, 'id'> {
  // Create Date objects for timestamps
  const now = new Date();
  
  // Because of TypeScript's strict null checking, we need to create a shop object
  // that meets all requirements for the Shop interface
  const shop = {
    name: importData.name,
    location: importData.location,
    type: importData.type as Shop['type'],
    status: importData.status as Shop['status'],
    staffCount: 0,
    lastSync: now,
    createdAt: now,
  } as Omit<Shop, 'id'>;
  
  // Now add the optional fields if they exist
  if (importData.phone) shop.phone = importData.phone;
  if (importData.email) shop.email = importData.email;
  if (importData.managerName) shop.manager = importData.managerName;
  
  return shop;
}

/**
 * Utility to download the CSV template
 */
export function downloadShopImportTemplate(): void {
  const template = generateShopImportTemplate();
  const blob = new Blob([template], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'shop_import_template.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export shops data to CSV format
 * @param shops Array of shop data to export
 * @returns CSV content as string
 */
export function exportShopsToCSV(shops: { 
  name: string; 
  location: string; 
  type: string; 
  status: string;
  phone?: string;
  email?: string;
  managerName?: string;
  notes?: string;
}[]): string {
  // Define headers with the exact expected format
  const headers = ['name', 'location', 'type', 'status', 'phone', 'email', 'managerName', 'notes'];
  
  // Create CSV header row
  let csv = headers.join(',') + '\n';
  
  // Add each shop as a row
  shops.forEach(shop => {
    const row = headers.map(header => {
      // Get the value for this header, or empty string if undefined
      const value = shop[header as keyof typeof shop] || '';
      
      // Properly escape values with quotes if needed
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        // Double any existing quotes and wrap in quotes
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    
    csv += row.join(',') + '\n';
  });
  
  return csv;
}

/**
 * Download the exported shops data as a CSV file
 * @param shops Array of shop data to export
 * @param filename Optional custom filename (defaults to 'shops_export_YYYY-MM-DD.csv')
 */
export function downloadShopsExport(shops: { 
  name: string; 
  location: string; 
  type: string; 
  status: string;
  phone?: string;
  email?: string;
  managerName?: string;
  notes?: string;
}[], filename?: string): void {
  // Generate CSV content
  const csvContent = exportShopsToCSV(shops);
  
  // Create default filename with date if not provided
  if (!filename) {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    filename = `shops_export_${date}.csv`;
  }
  
  // Create a blob with the CSV data
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a temporary URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a link element to trigger the download
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';
  
  // Add the link to the document, click it, and remove it
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}
