# PDF Service Migration Guide

## Overview

This guide provides instructions for migrating from the existing PDF generation utilities (`pdf-export.ts`, `generate-pdf.ts`, and `generate-repair-invoice.ts`) to the new unified PDF service. This migration is part of our effort to standardize PDF generation across the application.

## Why Migrate?

- **Consistent PDF Styling:** The new PDF service ensures all generated PDFs have a consistent look and feel.
- **Reduced Code Duplication:** The service consolidates functionality that was duplicated across multiple files.
- **Type Safety:** Better TypeScript interfaces for all PDF-related operations.
- **Extensibility:** Easily add new PDF generation capabilities without duplicating boilerplate code.
- **Simplified API:** Consistent API for all PDF generation needs.

## Before and After

### Before (Multiple Implementations)

```typescript
// Using pdf-export.ts
import { generateSupplierReport } from '@/lib/pdf-export';

const pdfBlob = await generateSupplierReport(suppliers, settings);
```

```typescript
// Using generate-pdf.ts
import { generateSalesReport } from '@/lib/generate-pdf';

const pdfBlob = await generateSalesReport(salesData, { 
  companyInfo: myCompanyInfo 
});
```

```typescript
// Using generate-repair-invoice.ts
import { generateRepairInvoicePDF } from '@/lib/generate-repair-invoice';

const pdfBlob = await generateRepairInvoicePDF(repair, { 
  name: 'Company Name',
  address: '123 Street',
  phone: '555-1234',
  email: 'info@company.com'
});
```

### After (Unified Implementation)

```typescript
// Using the new PDF service
import { pdfService } from '@/services/pdf/pdf-service';
import { generateSalesReport } from '@/services/pdf/report-factories';

// Option 1: Using factory functions
const pdfBlob = await generateSalesReport(salesData, { 
  companyInfo: {
    name: 'Company Name',
    address: '123 Street',
    phone: '555-1234',
    email: 'info@company.com'
  }
});

// Option 2: Using the service directly
const pdfBlob = await pdfService.generatePDF(
  async (doc, service) => {
    let yPos = service.addCompanyHeader(doc);
    yPos = service.addTitle(doc, 'My Custom Report', yPos);
    // Add more content...
  },
  {
    companyInfo: {
      name: 'Company Name',
      address: '123 Street',
      phone: '555-1234',
      email: 'info@company.com'
    }
  }
);

// Download the PDF
pdfService.downloadPDF(pdfBlob, 'report.pdf');
```

## Migration Steps

### Step 1: Update Imports

Change your imports from:

```typescript
import { generateSupplierReport } from '@/lib/pdf-export';
// or
import { generateSalesReport } from '@/lib/generate-pdf';
// or
import { generateRepairInvoicePDF } from '@/lib/generate-repair-invoice';
```

To:

```typescript
import { pdfService } from '@/services/pdf/pdf-service';
import { 
  generateSupplierReport, 
  generateSalesReport,
  generateFinancialReport,
  generateInventoryReport
} from '@/services/pdf/report-factories';
```

### Step 2: Update Method Calls

Most report generation functions have similar parameters to the old ones but use a more consistent interface:

#### Supplier Reports

```typescript
// Before
const pdfBlob = await generateSupplierReport(suppliers, settings);

// After
const pdfBlob = await generateSupplierReport({
  title: 'Supplier Performance Report',
  dateRange: { from: startDate, to: endDate },
  items: suppliers,
  summary: {
    totalOrderVolume: 1500,
    totalRevenue: 75000,
    avgDeliveryTime: 3.5,
    avgQualityScore: 0.92,
    totalCommission: 6000
  }
}, 
{
  companyInfo: myCompanyInfo,
  accentColor: '#2563EB'
});
```

#### Sales Reports

```typescript
// Before
const pdfBlob = await generateSalesReport(salesData, settings);

// After
const pdfBlob = await generateSalesReport({
  title: 'Sales Report',
  dateRange: { from: startDate, to: endDate },
  products: salesProducts,
  categories: salesCategories,
  summary: {
    totalSales: 350,
    totalRevenue: 15000,
    totalProducts: 500,
    avgOrderValue: 42.85
  }
}, 
{
  companyInfo: myCompanyInfo,
  accentColor: '#059669'
});
```

### Step 3: Update Company Info Format

The new PDF service uses a standardized `CompanyInfo` interface:

```typescript
// Before (multiple formats)
const companyInfo1 = {
  name: 'Company Name',
  address: '123 Street',
  phone: '555-1234',
  email: 'info@company.com'
};

// Or another format
const companyInfo2 = {
  companyName: 'Company Name',
  companyAddress: '123 Street',
  companyPhone: '555-1234',
  companyEmail: 'info@company.com'
};

// After (standardized format)
import { CompanyInfo } from '@/services/pdf/types';

const companyInfo: CompanyInfo = {
  name: 'Company Name',
  address: '123 Street',
  phone: '555-1234',
  email: 'info@company.com',
  website: 'www.company.com', // optional
  logoUrl: '/logo.png', // optional
  taxId: '123-45-6789' // optional
};
```

### Step 4: For Custom PDFs, Use the Service Directly

If you need to create a custom PDF that doesn't fit one of the factory functions:

```typescript
import { pdfService } from '@/services/pdf/pdf-service';

const pdfBlob = await pdfService.generatePDF(
  async (doc, service) => {
    // Add company header
    let yPos = service.addCompanyHeader(doc);
    
    // Add title
    yPos = service.addTitle(doc, 'Custom Report', yPos);
    
    // Add text
    yPos = service.addText(doc, 'This is a custom report with some text.', yPos);
    
    // Add a table
    const headers = ['Column 1', 'Column 2', 'Column 3'];
    const data = [
      ['Value 1', 'Value 2', 'Value 3'],
      ['Value 4', 'Value 5', 'Value 6']
    ];
    
    yPos = service.addTable(doc, headers, data, yPos);
  },
  {
    companyInfo: myCompanyInfo,
    accentColor: '#3B82F6'
  },
  {
    title: 'Custom Report',
    author: 'Report Generator'
  }
);

// Download the PDF
pdfService.downloadPDF(pdfBlob, 'custom-report.pdf');
```

## Common Migration Scenarios

### Repair Invoices

```typescript
// Before
import { generateRepairInvoicePDF } from '@/lib/generate-repair-invoice';

const pdfBlob = await generateRepairInvoicePDF(repair, companyInfo);

// After
import { pdfService } from '@/services/pdf/pdf-service';

const pdfBlob = await pdfService.generatePDF(
  async (doc, service) => {
    let yPos = service.addCompanyHeader(doc);
    
    yPos = service.addTitle(doc, 'Repair Invoice', yPos);
    
    yPos = service.addText(doc, `Invoice #: ${repair.invoiceNumber}`, yPos, { fontStyle: 'bold' });
    yPos = service.addText(doc, `Date: ${format(repair.date, 'MMM d, yyyy')}`, yPos);
    yPos = service.addText(doc, `Customer: ${repair.customer.name}`, yPos);
    
    yPos += 10;
    
    // Add repair details table
    const headers = ['Item', 'Description', 'Price'];
    const data = [
      [repair.item, repair.description, `$${repair.price.toFixed(2)}`],
      // Add more rows as needed
    ];
    
    service.addTable(doc, headers, data, yPos);
  },
  {
    companyInfo: companyInfo,
    template: 'modern'
  }
);
```

### Financial Reports

```typescript
// Before (using custom implementation)
import { generateFinancialPDF } from '@/features/finance/utils/pdf-utils';

const pdfBlob = await generateFinancialPDF(financialData);

// After
import { generateFinancialReport } from '@/services/pdf/report-factories';

const pdfBlob = await generateFinancialReport({
  title: 'Financial Report',
  dateRange: { from: startDate, to: endDate },
  revenue: {
    total: 50000,
    byCategory: {
      'Product Sales': 30000,
      'Service Fees': 15000,
      'Other': 5000
    },
    byPaymentMethod: {
      'Credit Card': 25000,
      'Cash': 15000,
      'Bank Transfer': 10000
    }
  },
  expenses: {
    total: 30000,
    byCategory: {
      'Salaries': 15000,
      'Rent': 5000,
      'Inventory': 7000,
      'Other': 3000
    }
  },
  profit: {
    gross: 20000,
    net: 17000,
    margin: 34
  }
});
```

## Handling Custom PDF Needs

If you have special PDF generation needs that aren't covered by the existing factory functions:

1. First, try using the direct `pdfService.generatePDF()` method with a custom generator function.

2. If you find yourself repeating the same PDF generation pattern across multiple components, consider adding a new factory function to `report-factories.ts`.

3. For truly custom PDF layouts that don't fit the standard patterns, you can still use jsPDF directly, but consider wrapping it in a service that follows the pattern of the PDF service.

## Timeline for Deprecation

The old PDF generation utilities will be deprecated according to the following timeline:

1. **Phase 1 (Immediate):** New code should use the new PDF service
2. **Phase 2 (2 weeks):** Existing code should be migrated
3. **Phase 3 (4 weeks):** Old utilities will emit console warnings
4. **Phase 4 (8 weeks):** Old utilities will be removed 