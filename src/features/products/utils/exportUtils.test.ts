// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { 
  exportProductsToCSV,
  exportProductsToExcel,
  exportProductsToPDF
} from './exportUtils';
import { Product, ProductVariant } from '../types';

// Mock dependencies
jest.mock('xlsx', () => ({
  utils: {
    book_new: jest.fn().mockReturnValue({}),
    json_to_sheet: jest.fn().mockReturnValue({}),
    book_append_sheet: jest.fn()
  }
}));

jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    setFontSize: jest.fn(),
    text: jest.fn(),
    addPage: jest.fn(),
    internal: {
      pageSize: {
        width: 210,
        height: 297
      },
      getCurrentPageInfo: jest.fn().mockReturnValue({ pageNumber: 1 })
    }
  }));
});

jest.mock('jspdf-autotable', () => {
  return jest.fn();
});

jest.mock('date-fns', () => ({
  format: jest.fn().mockReturnValue('2023-01-01')
}));

describe('exportUtils', () => {
  // Test data
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Test Product',
      sku: 'TEST-123',
      barcode: '123456789012',
      category: 'Test Category',
      description: 'Test description',
      costPrice: 9.99,
      retailPrice: 19.99,
      supplier: {
        id: 'supplier-1',
        name: 'Test Supplier'
      },
      minStock: 10,
      maxStock: 100,
      locations: [
        {
          locationId: 'loc-1',
          stock: 50,
          minStock: 5,
          maxStock: 50
        }
      ],
      variants: [
        {
          id: 'variant-1',
          productId: '1',
          sku: 'TEST-123-L-RED',
          barcode: '123456789013',
          size: 'L',
          color: 'Red',
          costPrice: 9.99,
          retailPrice: 19.99,
          stock: 25,
          isActive: true
        },
        {
          id: 'variant-2',
          productId: '1',
          sku: 'TEST-123-M-BLUE',
          barcode: '123456789014',
          size: 'M',
          color: 'Blue',
          costPrice: 8.99,
          retailPrice: 18.99,
          stock: 15,
          isActive: true
        }
      ],
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exportProductsToCSV', () => {
    it('should export products to CSV without variants', () => {
      const csv = exportProductsToCSV(mockProducts, false);
      
      // Check if CSV contains product data
      expect(csv).toContain('ID,Name,SKU,Barcode,Category');
      expect(csv).toContain('Test Product');
      expect(csv).toContain('TEST-123');
      
      // Should not contain variant data
      expect(csv).not.toContain('Parent Product');
      expect(csv).not.toContain('TEST-123-L-RED');
    });
    
    it('should export products to CSV with variants', () => {
      const csv = exportProductsToCSV(mockProducts, true);
      
      // Check if CSV contains product data
      expect(csv).toContain('ID,Name,SKU,Barcode,Category');
      expect(csv).toContain('Test Product');
      expect(csv).toContain('TEST-123');
      
      // Should contain variant data
      expect(csv).toContain('Variants');
      expect(csv).toContain('Parent Product');
      expect(csv).toContain('TEST-123-L-RED');
      expect(csv).toContain('TEST-123-M-BLUE');
    });
  });

  describe('exportProductsToExcel', () => {
    it('should export products to Excel without variants', () => {
      const workbook = exportProductsToExcel(mockProducts, false);
      
      // Check if book_new was called
      expect(XLSX.utils.book_new).toHaveBeenCalled();
      
      // Check if json_to_sheet was called once (only for products)
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledTimes(1);
      
      // Check if book_append_sheet was called once
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledTimes(1);
      
      // Check if the sheet was named correctly
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        'Products'
      );
    });
    
    it('should export products to Excel with variants', () => {
      const workbook = exportProductsToExcel(mockProducts, true);
      
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

  describe('exportProductsToPDF', () => {
    it('should export products to PDF without variants', () => {
      const pdf = exportProductsToPDF(mockProducts, false);
      
      // Check if jsPDF constructor was called
      expect(jsPDF).toHaveBeenCalled();
      
      // Check if text was called for the title
      expect(pdf.text).toHaveBeenCalledWith('Products Report', expect.any(Number), expect.any(Number));
      
      // Check if autoTable was called once
      expect(autoTable).toHaveBeenCalledTimes(1);
      
      // Should not add a new page for variants
      expect(pdf.addPage).not.toHaveBeenCalled();
    });
    
    it('should export products to PDF with variants', () => {
      const pdf = exportProductsToPDF(mockProducts, true);
      
      // Check if jsPDF constructor was called
      expect(jsPDF).toHaveBeenCalled();
      
      // Check if text was called for the title
      expect(pdf.text).toHaveBeenCalledWith('Products Report', expect.any(Number), expect.any(Number));
      
      // Check if addPage was called for variants
      expect(pdf.addPage).toHaveBeenCalled();
      
      // Check if text was called for the variants title
      expect(pdf.text).toHaveBeenCalledWith('Product Variants', expect.any(Number), expect.any(Number));
      
      // Check if autoTable was called twice (once for products, once for variants)
      expect(autoTable).toHaveBeenCalledTimes(2);
    });
  });
}); 