import * as XLSX from 'xlsx';
import { 
  generateTemplateWorkbook, 
  downloadTemplate, 
  validateAndProcessImport,
  ProductImportData,
  VariantImportData
} from './importUtils';

// Mock XLSX
jest.mock('xlsx', () => ({
  utils: {
    book_new: jest.fn().mockReturnValue({}),
    json_to_sheet: jest.fn().mockReturnValue({}),
    sheet_add_aoa: jest.fn(),
    book_append_sheet: jest.fn(),
    aoa_to_sheet: jest.fn().mockReturnValue({})
  },
  writeFile: jest.fn()
}));

describe('importUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTemplateWorkbook', () => {
    it('should create a workbook with Products and Variants sheets', () => {
      const workbook = generateTemplateWorkbook();
      
      // Check if book_new was called
      expect(XLSX.utils.book_new).toHaveBeenCalled();
      
      // Check if json_to_sheet was called twice (once for products, once for variants)
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledTimes(2);
      
      // Check if book_append_sheet was called twice
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledTimes(2);
      
      // Check if the sheets were named correctly
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        'Products'
      );
      
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        'Variants'
      );
    });
  });

  describe('downloadTemplate', () => {
    it('should call writeFile with the generated workbook', () => {
      downloadTemplate('test.xlsx');
      
      expect(XLSX.writeFile).toHaveBeenCalledWith(
        expect.anything(),
        'test.xlsx'
      );
    });
    
    it('should use default filename if none provided', () => {
      downloadTemplate();
      
      expect(XLSX.writeFile).toHaveBeenCalledWith(
        expect.anything(),
        'products_import_template.xlsx'
      );
    });
  });

  describe('validateAndProcessImport', () => {
    const mockProductData = [
      {
        name: 'Test Product',
        sku: 'TEST-123',
        category: 'Test Category',
        retailPrice: '19.99',
        costPrice: '9.99',
        stock: '100',
        minStock: '10',
        status: 'active',
        hasVariants: 'true',
        variantAttributes: 'size,color'
      },
      {
        // Missing required field 'category'
        name: 'Invalid Product',
        sku: 'INVALID-123',
        retailPrice: '29.99'
      },
      {
        name: 'Another Product',
        sku: 'PROD-456',
        category: 'Another Category',
        retailPrice: 'not-a-number', // Invalid number
        status: 'invalid-status' // Invalid status
      }
    ];
    
    const mockVariantData = [
      {
        productSku: 'TEST-123',
        sku: 'TEST-123-L-RED',
        size: 'L',
        color: 'Red',
        retailPrice: '24.99',
        stock: '25',
        status: 'active'
      },
      {
        // Missing required field 'sku'
        productSku: 'TEST-123',
        size: 'M',
        color: 'Blue'
      }
    ];
    
    it('should validate product data correctly', async () => {
      const mockProgressCallback = jest.fn();
      
      const result = await validateAndProcessImport(
        mockProductData,
        'Products',
        mockProgressCallback
      );
      
      // Should have 1 valid product and 2 invalid products
      expect(result.validData.length).toBe(1);
      expect(result.errors.length).toBe(3); // 1 missing category, 1 invalid number, 1 invalid status
      
      // Check stats
      expect(result.stats).toEqual({
        total: 3,
        valid: 1,
        invalid: 2
      });
      
      // Check progress callback
      expect(mockProgressCallback).toHaveBeenCalled();
      
      // Check valid data
      expect(result.validData[0]).toMatchObject({
        name: 'Test Product',
        sku: 'TEST-123',
        category: 'Test Category',
        retailPrice: 19.99, // Converted to number
        costPrice: 9.99, // Converted to number
        stock: 100, // Converted to number
        minStock: 10, // Converted to number
        status: 'active',
        hasVariants: true // Converted to boolean
      });
    });
    
    it('should validate variant data correctly', async () => {
      const result = await validateAndProcessImport(
        mockVariantData,
        'Variants'
      );
      
      // Should have 1 valid variant and 1 invalid variant
      expect(result.validData.length).toBe(1);
      expect(result.errors.length).toBe(1); // 1 missing sku
      
      // Check stats
      expect(result.stats).toEqual({
        total: 2,
        valid: 1,
        invalid: 1
      });
      
      // Check valid data
      expect(result.validData[0]).toMatchObject({
        productSku: 'TEST-123',
        sku: 'TEST-123-L-RED',
        size: 'L',
        color: 'Red',
        retailPrice: 24.99, // Converted to number
        stock: 25, // Converted to number
        status: 'active'
      });
    });
  });
});