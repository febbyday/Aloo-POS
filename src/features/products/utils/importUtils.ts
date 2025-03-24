import * as XLSX from 'xlsx';
import { ProductVariant } from '../types';

export interface ProductImportData {
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  retailPrice?: number;
  costPrice?: number;
  supplier?: string;
  stock?: number;
  minStock?: number;
  status?: 'active' | 'inactive';
  description?: string;
  hasVariants?: boolean;
  variantAttributes?: string;
}

export interface VariantImportData {
  productSku: string;
  sku: string;
  barcode?: string;
  size?: string;
  color?: string;
  style?: string;
  retailPrice?: number;
  costPrice?: number;
  stock?: number;
  minStock?: number;
  status?: 'active' | 'inactive';
}

export interface ValidationError {
  row: number;
  field: string;
  value: any;
  error: string;
}

const BATCH_SIZE = 100;
const REQUIRED_FIELDS = ['name', 'sku', 'category'] as const;
const NUMERIC_FIELDS = ['retailPrice', 'costPrice', 'stock', 'minStock'] as const;
const STATUS_VALUES = ['active', 'inactive'] as const;
const BOOLEAN_FIELDS = ['hasVariants'] as const;

export function generateTemplateWorkbook(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  
  const productsTemplate: Partial<ProductImportData>[] = [{
    name: 'Example Product',
    sku: 'SKU123',
    barcode: '123456789',
    category: 'Category Name',
    retailPrice: 99.99,
    costPrice: 49.99,
    supplier: 'Supplier Name',
    stock: 100,
    minStock: 10,
    status: 'active',
    description: 'Product description',
    hasVariants: true,
    variantAttributes: 'size,color'
  }];

  const productsWs = XLSX.utils.json_to_sheet(productsTemplate);
  
  const productsValidationNotes = [
    ['Required Fields:', 'name, sku, category'],
    ['Numeric Fields:', 'retailPrice, costPrice, stock, minStock'],
    ['Status Values:', 'active, inactive'],
    ['Boolean Fields:', 'hasVariants (true/false)'],
    ['Variant Attributes:', 'Comma-separated list (e.g., "size,color")']
  ];
  
  XLSX.utils.sheet_add_aoa(productsWs, productsValidationNotes, { origin: { r: 3, c: 0 } });
  XLSX.utils.book_append_sheet(wb, productsWs, 'Products');
  
  const variantsTemplate: Partial<VariantImportData>[] = [{
    productSku: 'SKU123',
    sku: 'SKU123-L-RED',
    barcode: '123456789001',
    size: 'L',
    color: 'Red',
    style: 'Style1',
    retailPrice: 99.99,
    costPrice: 49.99,
    stock: 25,
    minStock: 5,
    status: 'active'
  }];
  
  const variantsWs = XLSX.utils.json_to_sheet(variantsTemplate);
  
  const variantsValidationNotes = [
    ['Required Fields:', 'productSku, sku'],
    ['Numeric Fields:', 'retailPrice, costPrice, stock, minStock'],
    ['Status Values:', 'active, inactive'],
    ['Note:', 'productSku must match a product in the Products sheet']
  ];
  
  XLSX.utils.sheet_add_aoa(variantsWs, variantsValidationNotes, { origin: { r: 3, c: 0 } });
  XLSX.utils.book_append_sheet(wb, variantsWs, 'Variants');
  
  return wb;
}

export function downloadTemplate(filename: string = 'products_import_template.xlsx') {
  const wb = generateTemplateWorkbook();
  XLSX.writeFile(wb, filename);
}

export async function validateAndProcessImport(
  data: any[],
  sheetName: 'Products' | 'Variants' = 'Products',
  onProgress?: (progress: number) => void
): Promise<{ 
  validData: ProductImportData[] | VariantImportData[], 
  errors: ValidationError[],
  stats: { total: number, valid: number, invalid: number }
}> {
  const total = data.length;
  let validData: (ProductImportData | VariantImportData)[] = [];
  let errors: ValidationError[] = [];
  let processed = 0;
  
  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    
    for (const [index, row] of batch.entries()) {
      const rowNum = i + index + 2;
      
      const validation = sheetName === 'Products' 
        ? validateProductRow(row, rowNum)
        : validateVariantRow(row, rowNum);
      
      if (validation.errors.length === 0) {
        validData.push(validation.data);
      } else {
        errors = [...errors, ...validation.errors];
      }
    }
    
    processed += batch.length;
    if (onProgress) {
      onProgress(Math.round((processed / total) * 100));
    }
    
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  
  return {
    validData,
    errors,
    stats: {
      total,
      valid: validData.length,
      invalid: total - validData.length
    }
  };
}

function validateProductRow(row: any, rowNum: number): { 
  data: ProductImportData; 
  errors: ValidationError[] 
} {
  const errors: ValidationError[] = [];
  const data: Partial<ProductImportData> = {};
  
  for (const field of REQUIRED_FIELDS) {
    if (!row[field] && row[field] !== 0) {
      errors.push({
        row: rowNum,
        field,
        value: row[field],
        error: `Missing required field: ${field}`
      });
    } else {
      data[field] = row[field];
    }
  }
  
  for (const field of NUMERIC_FIELDS) {
    if (row[field] !== undefined && row[field] !== '') {
      const num = Number(row[field]);
      if (isNaN(num)) {
        errors.push({
          row: rowNum,
          field,
          value: row[field],
          error: `Field ${field} must be a number`
        });
      } else {
        data[field] = num;
      }
    }
  }
  
  if (row.status !== undefined && row.status !== '') {
    if (!STATUS_VALUES.includes(row.status)) {
      errors.push({
        row: rowNum,
        field: 'status',
        value: row.status,
        error: `Status must be one of: ${STATUS_VALUES.join(', ')}`
      });
    } else {
      data.status = row.status;
    }
  }
  
  for (const field of BOOLEAN_FIELDS) {
    if (row[field] !== undefined && row[field] !== '') {
      const value = String(row[field]).toLowerCase();
      if (value === 'true' || value === '1' || value === 'yes') {
        data[field] = true;
      } else if (value === 'false' || value === '0' || value === 'no') {
        data[field] = false;
      } else {
        errors.push({
          row: rowNum,
          field,
          value: row[field],
          error: `Field ${field} must be a boolean (true/false)`
        });
      }
    }
  }
  
  for (const key in row) {
    if (
      !REQUIRED_FIELDS.includes(key as any) && 
      !NUMERIC_FIELDS.includes(key as any) &&
      key !== 'status' &&
      !BOOLEAN_FIELDS.includes(key as any) &&
      row[key] !== undefined && 
      row[key] !== ''
    ) {
      data[key] = row[key];
    }
  }
  
  return {
    data: data as ProductImportData,
    errors
  };
}

function validateVariantRow(row: any, rowNum: number): { 
  data: VariantImportData; 
  errors: ValidationError[] 
} {
  const errors: ValidationError[] = [];
  const data: Partial<VariantImportData> = {};
  
  const requiredVariantFields = ['productSku', 'sku'];
  for (const field of requiredVariantFields) {
    if (!row[field] && row[field] !== 0) {
      errors.push({
        row: rowNum,
        field,
        value: row[field],
        error: `Missing required field: ${field}`
      });
    } else {
      data[field] = row[field];
    }
  }
  
  for (const field of NUMERIC_FIELDS) {
    if (row[field] !== undefined && row[field] !== '') {
      const num = Number(row[field]);
      if (isNaN(num)) {
        errors.push({
          row: rowNum,
          field,
          value: row[field],
          error: `Field ${field} must be a number`
        });
      } else {
        data[field] = num;
      }
    }
  }
  
  if (row.status !== undefined && row.status !== '') {
    if (!STATUS_VALUES.includes(row.status)) {
      errors.push({
        row: rowNum,
        field: 'status',
        value: row.status,
        error: `Status must be one of: ${STATUS_VALUES.join(', ')}`
      });
    } else {
      data.status = row.status;
    }
  }
  
  for (const key in row) {
    if (
      !requiredVariantFields.includes(key) && 
      !NUMERIC_FIELDS.includes(key as any) &&
      key !== 'status' &&
      row[key] !== undefined && 
      row[key] !== ''
    ) {
      data[key] = row[key];
    }
  }
  
  return {
    data: data as VariantImportData,
    errors
  };
}
