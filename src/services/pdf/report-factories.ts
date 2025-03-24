import jsPDF from 'jspdf';
import { format } from 'date-fns';
import pdfService from './pdf-service';
import { PDFSettings, PDFMetadata, PDFTableOptions } from './types';

/**
 * Interface for supplier report data
 */
export interface SupplierReportData {
  /** Title of the report */
  title: string;
  
  /** Subtitle or description */
  subtitle?: string;
  
  /** Report date range */
  dateRange: {
    from: Date;
    to: Date;
  };
  
  /** Supplier items data */
  items: Array<{
    id: string;
    name: string;
    orderVolume: number;
    totalRevenue: number;
    avgDeliveryTime: number;
    qualityScore: number;
    baseCommission: number;
    performanceBonus: number;
    totalCommission: number;
    [key: string]: any;
  }>;
  
  /** Performance metrics or summary data */
  summary?: {
    totalOrderVolume: number;
    totalRevenue: number;
    avgDeliveryTime: number;
    avgQualityScore: number;
    totalCommission: number;
    [key: string]: any;
  };
}

/**
 * Interface for sales report data
 */
export interface SalesReportData {
  /** Title of the report */
  title: string;
  
  /** Subtitle or description */
  subtitle?: string;
  
  /** Report date range */
  dateRange: {
    from: Date;
    to: Date;
  };
  
  /** Sales data by product */
  products: Array<{
    id: string;
    name: string;
    sku: string;
    quantitySold: number;
    unitPrice: number;
    totalRevenue: number;
    [key: string]: any;
  }>;
  
  /** Sales data by category */
  categories?: Array<{
    name: string;
    count: number;
    revenue: number;
    percentage: number;
  }>;
  
  /** Summary data */
  summary: {
    totalSales: number;
    totalRevenue: number;
    totalProducts: number;
    avgOrderValue: number;
    [key: string]: any;
  };
}

/**
 * Interface for financial report data
 */
export interface FinancialReportData {
  /** Title of the report */
  title: string;
  
  /** Subtitle or description */
  subtitle?: string;
  
  /** Report date range */
  dateRange: {
    from: Date;
    to: Date;
  };
  
  /** Revenue breakdown */
  revenue: {
    total: number;
    byCategory: Record<string, number>;
    byPaymentMethod: Record<string, number>;
  };
  
  /** Expense breakdown */
  expenses: {
    total: number;
    byCategory: Record<string, number>;
  };
  
  /** Profit calculations */
  profit: {
    gross: number;
    net: number;
    margin: number;
  };
  
  /** Tax information */
  taxes?: {
    collected: number;
    paid: number;
    net: number;
  };
}

/**
 * Interface for inventory report data
 */
export interface InventoryReportData {
  /** Title of the report */
  title: string;
  
  /** Subtitle or description */
  subtitle?: string;
  
  /** Report generation date */
  generatedAt: Date;
  
  /** Inventory items */
  items: Array<{
    id: string;
    name: string;
    sku: string;
    category: string;
    currentStock: number;
    reorderLevel: number;
    costPrice: number;
    retailPrice: number;
    totalValue: number;
    lastRestocked?: Date;
    [key: string]: any;
  }>;
  
  /** Inventory summary */
  summary: {
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    [key: string]: any;
  };
}

/**
 * Generate a supplier performance report PDF
 */
export async function generateSupplierReport(
  data: SupplierReportData,
  settings: Partial<PDFSettings> = {},
  metadata: Partial<PDFMetadata> = {}
): Promise<Blob> {
  return pdfService.generatePDF(
    async (doc, service) => {
      // Add company header
      let yPos = service.addCompanyHeader(doc, settings);
      
      // Add report title
      yPos = service.addTitle(doc, data.title, yPos, settings);
      
      // Add subtitle if present
      if (data.subtitle) {
        yPos = service.addText(doc, data.subtitle, yPos, { fontStyle: 'italic' }, settings);
        yPos += 5;
      }
      
      // Add date range
      const dateRangeText = `Report Period: ${format(data.dateRange.from, 'MMM d, yyyy')} - ${format(data.dateRange.to, 'MMM d, yyyy')}`;
      yPos = service.addText(doc, dateRangeText, yPos, { fontStyle: 'bold' }, settings);
      yPos += 10;
      
      // Add supplier performance table
      const headers = [
        'Supplier', 
        'Order Volume', 
        'Total Revenue', 
        'Avg. Delivery Time', 
        'Quality Score', 
        'Base Commission', 
        'Performance Bonus', 
        'Total Commission'
      ];
      
      const tableData = data.items.map(item => [
        item.name,
        item.orderVolume.toString(),
        `$${item.totalRevenue.toFixed(2)}`,
        `${item.avgDeliveryTime.toFixed(1)} days`,
        `${(item.qualityScore * 100).toFixed(0)}%`,
        `$${item.baseCommission.toFixed(2)}`,
        `$${item.performanceBonus.toFixed(2)}`,
        `$${item.totalCommission.toFixed(2)}`
      ]);
      
      yPos = service.addTable(doc, headers, tableData, yPos, {
        alternateRowColors: true,
        headerBackgroundColor: '#2563EB', // blue-600
      }, settings);
      
      // Add summary section if present
      if (data.summary) {
        yPos += 10;
        yPos = service.addTitle(doc, 'Summary', yPos, settings);
        
        const summaryText = [
          `Total Order Volume: ${data.summary.totalOrderVolume}`,
          `Total Revenue: $${data.summary.totalRevenue.toFixed(2)}`,
          `Average Delivery Time: ${data.summary.avgDeliveryTime.toFixed(1)} days`,
          `Average Quality Score: ${(data.summary.avgQualityScore * 100).toFixed(0)}%`,
          `Total Commission Paid: $${data.summary.totalCommission.toFixed(2)}`
        ].join('\n');
        
        yPos = service.addText(doc, summaryText, yPos, {
          fontSize: 10,
          lineHeight: 1.5
        }, settings);
      }
    },
    settings,
    {
      title: data.title,
      subject: data.subtitle,
      ...metadata
    }
  );
}

/**
 * Generate a sales report PDF
 */
export async function generateSalesReport(
  data: SalesReportData,
  settings: Partial<PDFSettings> = {},
  metadata: Partial<PDFMetadata> = {}
): Promise<Blob> {
  return pdfService.generatePDF(
    async (doc, service) => {
      // Add company header
      let yPos = service.addCompanyHeader(doc, settings);
      
      // Add report title
      yPos = service.addTitle(doc, data.title, yPos, settings);
      
      // Add subtitle if present
      if (data.subtitle) {
        yPos = service.addText(doc, data.subtitle, yPos, { fontStyle: 'italic' }, settings);
        yPos += 5;
      }
      
      // Add date range
      const dateRangeText = `Report Period: ${format(data.dateRange.from, 'MMM d, yyyy')} - ${format(data.dateRange.to, 'MMM d, yyyy')}`;
      yPos = service.addText(doc, dateRangeText, yPos, { fontStyle: 'bold' }, settings);
      yPos += 10;
      
      // Add summary section
      yPos = service.addTitle(doc, 'Summary', yPos, settings);
      
      const summaryText = [
        `Total Sales: ${data.summary.totalSales}`,
        `Total Revenue: $${data.summary.totalRevenue.toFixed(2)}`,
        `Total Products Sold: ${data.summary.totalProducts}`,
        `Average Order Value: $${data.summary.avgOrderValue.toFixed(2)}`
      ].join('\n');
      
      yPos = service.addText(doc, summaryText, yPos, {
        fontSize: 10,
        lineHeight: 1.5
      }, settings);
      yPos += 10;
      
      // Add product sales table
      yPos = service.addTitle(doc, 'Product Sales', yPos, settings);
      
      const headers = [
        'Product', 
        'SKU', 
        'Quantity Sold', 
        'Unit Price', 
        'Total Revenue'
      ];
      
      const tableData = data.products.map(product => [
        product.name,
        product.sku,
        product.quantitySold.toString(),
        `$${product.unitPrice.toFixed(2)}`,
        `$${product.totalRevenue.toFixed(2)}`
      ]);
      
      yPos = service.addTable(doc, headers, tableData, yPos, {
        alternateRowColors: true,
        headerBackgroundColor: '#059669', // emerald-600
      }, settings);
      
      // Add category breakdown if present
      if (data.categories && data.categories.length > 0) {
        yPos += 10;
        yPos = service.addTitle(doc, 'Sales by Category', yPos, settings);
        
        const categoryHeaders = [
          'Category', 
          'Products Sold', 
          'Revenue', 
          'Percentage'
        ];
        
        const categoryData = data.categories.map(category => [
          category.name,
          category.count.toString(),
          `$${category.revenue.toFixed(2)}`,
          `${category.percentage.toFixed(1)}%`
        ]);
        
        yPos = service.addTable(doc, categoryHeaders, categoryData, yPos, {
          alternateRowColors: true,
          headerBackgroundColor: '#7C3AED', // violet-600
        }, settings);
      }
    },
    settings,
    {
      title: data.title,
      subject: data.subtitle,
      ...metadata
    }
  );
}

/**
 * Generate a financial report PDF
 */
export async function generateFinancialReport(
  data: FinancialReportData,
  settings: Partial<PDFSettings> = {},
  metadata: Partial<PDFMetadata> = {}
): Promise<Blob> {
  return pdfService.generatePDF(
    async (doc, service) => {
      // Add company header
      let yPos = service.addCompanyHeader(doc, settings);
      
      // Add report title
      yPos = service.addTitle(doc, data.title, yPos, settings);
      
      // Add subtitle if present
      if (data.subtitle) {
        yPos = service.addText(doc, data.subtitle, yPos, { fontStyle: 'italic' }, settings);
        yPos += 5;
      }
      
      // Add date range
      const dateRangeText = `Report Period: ${format(data.dateRange.from, 'MMM d, yyyy')} - ${format(data.dateRange.to, 'MMM d, yyyy')}`;
      yPos = service.addText(doc, dateRangeText, yPos, { fontStyle: 'bold' }, settings);
      yPos += 10;
      
      // Add financial summary
      yPos = service.addTitle(doc, 'Financial Summary', yPos, settings);
      
      const summaryText = [
        `Total Revenue: $${data.revenue.total.toFixed(2)}`,
        `Total Expenses: $${data.expenses.total.toFixed(2)}`,
        `Gross Profit: $${data.profit.gross.toFixed(2)}`,
        `Net Profit: $${data.profit.net.toFixed(2)}`,
        `Profit Margin: ${data.profit.margin.toFixed(2)}%`
      ];
      
      if (data.taxes) {
        summaryText.push(
          `Taxes Collected: $${data.taxes.collected.toFixed(2)}`,
          `Taxes Paid: $${data.taxes.paid.toFixed(2)}`,
          `Net Tax: $${data.taxes.net.toFixed(2)}`
        );
      }
      
      yPos = service.addText(doc, summaryText.join('\n'), yPos, {
        fontSize: 10,
        lineHeight: 1.5
      }, settings);
      yPos += 10;
      
      // Add revenue breakdown
      yPos = service.addTitle(doc, 'Revenue Breakdown', yPos, settings);
      
      const revenueHeaders = ['Category', 'Amount', 'Percentage'];
      const revenueData = Object.entries(data.revenue.byCategory).map(([category, amount]) => [
        category,
        `$${amount.toFixed(2)}`,
        `${((amount / data.revenue.total) * 100).toFixed(1)}%`
      ]);
      
      yPos = service.addTable(doc, revenueHeaders, revenueData, yPos, {
        alternateRowColors: true,
        headerBackgroundColor: '#059669', // emerald-600
      }, settings);
      yPos += 10;
      
      // Add expense breakdown
      yPos = service.addTitle(doc, 'Expense Breakdown', yPos, settings);
      
      const expenseHeaders = ['Category', 'Amount', 'Percentage'];
      const expenseData = Object.entries(data.expenses.byCategory).map(([category, amount]) => [
        category,
        `$${amount.toFixed(2)}`,
        `${((amount / data.expenses.total) * 100).toFixed(1)}%`
      ]);
      
      yPos = service.addTable(doc, expenseHeaders, expenseData, yPos, {
        alternateRowColors: true,
        headerBackgroundColor: '#DC2626', // red-600
      }, settings);
      
      // Add payment method breakdown if available
      if (data.revenue.byPaymentMethod && Object.keys(data.revenue.byPaymentMethod).length > 0) {
        yPos += 10;
        yPos = service.addTitle(doc, 'Revenue by Payment Method', yPos, settings);
        
        const paymentHeaders = ['Payment Method', 'Amount', 'Percentage'];
        const paymentData = Object.entries(data.revenue.byPaymentMethod).map(([method, amount]) => [
          method,
          `$${amount.toFixed(2)}`,
          `${((amount / data.revenue.total) * 100).toFixed(1)}%`
        ]);
        
        yPos = service.addTable(doc, paymentHeaders, paymentData, yPos, {
          alternateRowColors: true,
          headerBackgroundColor: '#2563EB', // blue-600
        }, settings);
      }
    },
    settings,
    {
      title: data.title,
      subject: data.subtitle,
      ...metadata
    }
  );
}

/**
 * Generate an inventory report PDF
 */
export async function generateInventoryReport(
  data: InventoryReportData,
  settings: Partial<PDFSettings> = {},
  metadata: Partial<PDFMetadata> = {}
): Promise<Blob> {
  return pdfService.generatePDF(
    async (doc, service) => {
      // Add company header
      let yPos = service.addCompanyHeader(doc, settings);
      
      // Add report title
      yPos = service.addTitle(doc, data.title, yPos, settings);
      
      // Add subtitle if present
      if (data.subtitle) {
        yPos = service.addText(doc, data.subtitle, yPos, { fontStyle: 'italic' }, settings);
        yPos += 5;
      }
      
      // Add generation date
      const dateText = `Generated on: ${format(data.generatedAt, 'MMM d, yyyy')}`;
      yPos = service.addText(doc, dateText, yPos, { fontStyle: 'bold' }, settings);
      yPos += 10;
      
      // Add inventory summary
      yPos = service.addTitle(doc, 'Inventory Summary', yPos, settings);
      
      const summaryText = [
        `Total Items: ${data.summary.totalItems}`,
        `Total Inventory Value: $${data.summary.totalValue.toFixed(2)}`,
        `Low Stock Items: ${data.summary.lowStockItems}`,
        `Out of Stock Items: ${data.summary.outOfStockItems}`
      ].join('\n');
      
      yPos = service.addText(doc, summaryText, yPos, {
        fontSize: 10,
        lineHeight: 1.5
      }, settings);
      yPos += 10;
      
      // Add inventory items table
      yPos = service.addTitle(doc, 'Inventory Items', yPos, settings);
      
      const headers = [
        'Item', 
        'SKU', 
        'Category', 
        'Current Stock', 
        'Reorder Level', 
        'Cost Price', 
        'Retail Price', 
        'Total Value'
      ];
      
      const tableData = data.items.map(item => [
        item.name,
        item.sku,
        item.category,
        item.currentStock.toString(),
        item.reorderLevel.toString(),
        `$${item.costPrice.toFixed(2)}`,
        `$${item.retailPrice.toFixed(2)}`,
        `$${item.totalValue.toFixed(2)}`
      ]);
      
      // Add the inventory table with custom formatting to highlight low stock
      service.addTable(doc, headers, tableData, yPos, {
        alternateRowColors: true,
        headerBackgroundColor: '#4338CA', // indigo-700
      }, settings);
    },
    settings,
    {
      title: data.title,
      subject: data.subtitle,
      ...metadata
    }
  );
} 