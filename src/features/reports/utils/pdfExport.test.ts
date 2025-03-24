// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { exportTableReport, exportSummaryReport, exportChartReport, downloadPDF } from './pdfExport';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

// Mock jsPDF and autoTable
vi.mock('jspdf', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      internal: {
        pageSize: {
          width: 210,
          height: 297
        }
      },
      setFontSize: vi.fn(),
      text: vi.fn(),
      addPage: vi.fn(),
      save: vi.fn()
    }))
  };
});

vi.mock('jspdf-autotable', () => ({
  default: vi.fn()
}));

describe('PDF Export Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('exportTableReport', () => {
    it('creates a PDF document with table data', () => {
      const data = [
        { id: 1, name: 'Product 1', price: 10 },
        { id: 2, name: 'Product 2', price: 20 }
      ];

      const columns = [
        { header: 'ID', dataKey: 'id' },
        { header: 'Name', dataKey: 'name' },
        { header: 'Price', dataKey: 'price', align: 'right' }
      ];

      const options = {
        title: 'Products Report',
        subtitle: 'Sales Overview',
        showPageNumbers: true
      };

      const doc = exportTableReport(data, columns, options);

      expect(jsPDF).toHaveBeenCalledWith({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      expect(autoTable).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          head: [['ID', 'Name', 'Price']],
          body: [
            [1, 'Product 1', 10],
            [2, 'Product 2', 20]
          ]
        })
      );
    });

    it('handles date ranges correctly', () => {
      const data = [{ id: 1, name: 'Test' }];
      const columns = [{ header: 'ID', dataKey: 'id' }];
      const dateRange = {
        from: new Date(2024, 0, 1),
        to: new Date(2024, 0, 31)
      };

      const options = {
        title: 'Test Report',
        dateRange
      };

      const doc = exportTableReport(data, columns, options);

      expect(doc.text).toHaveBeenCalledWith(
        `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`,
        expect.any(Number),
        expect.any(Number),
        expect.any(Object)
      );
    });
  });

  describe('exportSummaryReport', () => {
    it('creates a PDF document with summary data', () => {
      const data = {
        summary: {
          'Total Sales': 1000,
          'Average Order Value': 50
        },
        details: [
          { date: '2024-01-01', sales: 500 },
          { date: '2024-01-02', sales: 500 }
        ]
      };

      const options = {
        title: 'Sales Summary Report'
      };

      const doc = exportSummaryReport(data, options);

      expect(jsPDF).toHaveBeenCalled();
      expect(doc.text).toHaveBeenCalledWith('Summary', expect.any(Number), expect.any(Number));
      expect(autoTable).toHaveBeenCalled();
    });

    it('handles summary-only reports', () => {
      const data = {
        summary: {
          'Total Items': 100,
          'Total Value': 5000
        }
      };

      const options = {
        title: 'Inventory Summary'
      };

      const doc = exportSummaryReport(data, options);

      expect(jsPDF).toHaveBeenCalled();
      expect(doc.text).toHaveBeenCalledWith('Summary', expect.any(Number), expect.any(Number));
      expect(autoTable).not.toHaveBeenCalled();
    });
  });

  describe('exportChartReport', () => {
    it('creates a PDF document with chart data', () => {
      const data = {
        charts: [
          {
            title: 'Sales by Category',
            type: 'bar',
            data: [100, 200, 300],
            labels: ['Category A', 'Category B', 'Category C']
          }
        ],
        summary: {
          'Total Sales': 600
        }
      };

      const options = {
        title: 'Sales Analysis Report'
      };

      const doc = exportChartReport(data, options);

      expect(jsPDF).toHaveBeenCalled();
      expect(doc.text).toHaveBeenCalledWith('Sales Analysis Report', expect.any(Number), expect.any(Number), expect.any(Object));
      expect(autoTable).toHaveBeenCalled();
    });

    it('handles multiple charts with page breaks', () => {
      const data = {
        charts: Array(5).fill({
          title: 'Test Chart',
          type: 'bar',
          data: [1, 2, 3],
          labels: ['A', 'B', 'C']
        })
      };

      const options = {
        title: 'Multi-Chart Report'
      };

      const doc = exportChartReport(data, options);

      expect(jsPDF).toHaveBeenCalled();
      expect(doc.addPage).toHaveBeenCalled();
      expect(autoTable).toHaveBeenCalledTimes(5);
    });
  });

  describe('downloadPDF', () => {
    it('saves the PDF with correct filename format', () => {
      const mockDoc = new jsPDF();
      const prefix = 'sales_report';
      
      downloadPDF(mockDoc, prefix);

      expect(mockDoc.save).toHaveBeenCalledWith(
        expect.stringMatching(/^sales_report_\d{8}_\d{6}\.pdf$/)
      );
    });
  });
}); 