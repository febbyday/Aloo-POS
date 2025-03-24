// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import type { Customer } from '@/lib/api/mock-data/customers';

/**
 * Exports customers to CSV format
 * @param customers - Array of customers to export
 * @returns CSV string
 */
export const exportCustomersToCSV = (customers: Customer[]): string => {
  // Headers
  const headers = [
    'ID', 
    'First Name', 
    'Last Name', 
    'Email', 
    'Phone', 
    'Address', 
    'City', 
    'State', 
    'Postal Code',
    'Country',
    'Date of Birth',
    'Membership Level',
    'Loyalty Points',
    'Total Spent',
    'Total Orders',
    'Status',
    'Created At',
    'Updated At',
    'Notes',
    'Tags'
  ];
  
  let csvContent = headers.join(',') + '\n';

  // Customers
  customers.forEach(customer => {
    const row = [
      customer.id,
      `"${customer.firstName}"`,
      `"${customer.lastName}"`,
      `"${customer.email}"`,
      customer.phone ? `"${customer.phone}"` : '',
      customer.address ? `"${customer.address.street}"` : '',
      customer.address ? `"${customer.address.city}"` : '',
      customer.address ? `"${customer.address.state}"` : '',
      customer.address ? `"${customer.address.postalCode}"` : '',
      customer.address ? `"${customer.address.country}"` : '',
      customer.dateOfBirth ? format(new Date(customer.dateOfBirth), 'yyyy-MM-dd') : '',
      customer.membershipLevel || '',
      customer.loyaltyPoints,
      customer.totalSpent,
      customer.totalOrders,
      customer.isActive ? 'Active' : 'Inactive',
      format(new Date(customer.createdAt), 'yyyy-MM-dd'),
      format(new Date(customer.updatedAt), 'yyyy-MM-dd'),
      customer.notes ? `"${customer.notes}"` : '',
      customer.tags ? `"${customer.tags.join(', ')}"` : ''
    ];
    
    csvContent += row.join(',') + '\n';
  });

  return csvContent;
};

/**
 * Exports customers to Excel format
 * @param customers - Array of customers to export
 * @returns XLSX workbook
 */
export const exportCustomersToExcel = (customers: Customer[]): XLSX.WorkBook => {
  // Prepare data for customers sheet
  const customerData = customers.map(customer => ({
    'ID': customer.id,
    'First Name': customer.firstName,
    'Last Name': customer.lastName,
    'Email': customer.email,
    'Phone': customer.phone || '',
    'Address': customer.address ? customer.address.street : '',
    'City': customer.address ? customer.address.city : '',
    'State': customer.address ? customer.address.state : '',
    'Postal Code': customer.address ? customer.address.postalCode : '',
    'Country': customer.address ? customer.address.country : '',
    'Date of Birth': customer.dateOfBirth ? format(new Date(customer.dateOfBirth), 'yyyy-MM-dd') : '',
    'Membership Level': customer.membershipLevel || '',
    'Loyalty Points': customer.loyaltyPoints,
    'Total Spent': customer.totalSpent,
    'Total Orders': customer.totalOrders,
    'Status': customer.isActive ? 'Active' : 'Inactive',
    'Created At': format(new Date(customer.createdAt), 'yyyy-MM-dd'),
    'Updated At': format(new Date(customer.updatedAt), 'yyyy-MM-dd'),
    'Notes': customer.notes || '',
    'Tags': customer.tags ? customer.tags.join(', ') : ''
  }));

  // Create workbook and add customers sheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(customerData);
  
  // Set column widths
  const colWidths = [
    { wch: 10 }, // ID
    { wch: 15 }, // First Name
    { wch: 15 }, // Last Name
    { wch: 25 }, // Email
    { wch: 15 }, // Phone
    { wch: 30 }, // Address
    { wch: 15 }, // City
    { wch: 10 }, // State
    { wch: 12 }, // Postal Code
    { wch: 15 }, // Country
    { wch: 12 }, // Date of Birth
    { wch: 15 }, // Membership Level
    { wch: 12 }, // Loyalty Points
    { wch: 12 }, // Total Spent
    { wch: 12 }, // Total Orders
    { wch: 10 }, // Status
    { wch: 12 }, // Created At
    { wch: 12 }, // Updated At
    { wch: 30 }, // Notes
    { wch: 20 }  // Tags
  ];
  
  ws['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(wb, ws, 'Customers');

  return wb;
};

/**
 * Exports customers to PDF format
 * @param customers - Array of customers to export
 * @returns jsPDF document
 */
export const exportCustomersToPDF = (customers: Customer[]): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Title
  doc.setFontSize(20);
  doc.text('Customers List', pageWidth / 2, 20, { align: 'center' });
  
  // Date
  doc.setFontSize(10);
  doc.text(`Generated on ${format(new Date(), 'PPP')}`, pageWidth / 2, 30, { align: 'center' });
  
  // Customers table
  const headers = [['ID', 'Name', 'Email', 'Phone', 'Membership', 'Loyalty Points', 'Total Spent', 'Status']];
  const data = customers.map(customer => [
    customer.id,
    `${customer.firstName} ${customer.lastName}`,
    customer.email,
    customer.phone || '',
    customer.membershipLevel || '',
    customer.loyaltyPoints.toString(),
    `$${customer.totalSpent.toFixed(2)}`,
    customer.isActive ? 'Active' : 'Inactive'
  ]);

  autoTable(doc, {
    head: headers,
    body: data,
    startY: 40,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [51, 51, 51] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 30 },
      2: { cellWidth: 40 },
      3: { cellWidth: 25 },
      4: { cellWidth: 20 },
      5: { cellWidth: 15 },
      6: { cellWidth: 20 },
      7: { cellWidth: 15 }
    }
  });

  return doc;
};

/**
 * Creates a template for customer import
 * @returns XLSX workbook with template
 */
export const createCustomerImportTemplate = (): XLSX.WorkBook => {
  const wb = XLSX.utils.book_new();
  
  // Create template headers
  const headers = [
    'First Name*', 
    'Last Name*', 
    'Email*', 
    'Phone', 
    'Street Address', 
    'City', 
    'State', 
    'Postal Code',
    'Country',
    'Date of Birth (YYYY-MM-DD)',
    'Membership Level',
    'Loyalty Points',
    'Notes',
    'Tags (comma separated)'
  ];
  
  // Add example row
  const exampleRow = [
    'John',
    'Doe',
    'john.doe@example.com',
    '555-123-4567',
    '123 Main St',
    'Anytown',
    'CA',
    '12345',
    'USA',
    '1985-06-15',
    'Gold',
    '100',
    'Prefers email communication',
    'loyal, tech-enthusiast'
  ];
  
  // Create worksheet with headers and example
  const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
  
  // Set column widths
  const colWidths = headers.map((header) => {
    return { wch: Math.max(header.length, 15) };
  });
  
  ws['!cols'] = colWidths;
  
  // Add comments to headers for instructions
  const instructions = {
    'First Name*': 'Required. Customer\'s first name.',
    'Last Name*': 'Required. Customer\'s last name.',
    'Email*': 'Required. Must be a valid email address.',
    'Phone': 'Optional. Customer\'s phone number.',
    'Street Address': 'Optional. Street address including apartment/unit number.',
    'City': 'Optional. City name.',
    'State': 'Optional. State/province code.',
    'Postal Code': 'Optional. ZIP or postal code.',
    'Country': 'Optional. Country name.',
    'Date of Birth (YYYY-MM-DD)': 'Optional. Format: YYYY-MM-DD',
    'Membership Level': 'Optional. E.g., Bronze, Silver, Gold, Platinum',
    'Loyalty Points': 'Optional. Numeric value.',
    'Notes': 'Optional. Additional information about the customer.',
    'Tags (comma separated)': 'Optional. Tags separated by commas.'
  };
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Customer Import Template');
  
  return wb;
};

/**
 * Validates and processes imported customer data
 * @param data - Raw data from imported file
 * @returns Object containing valid data and errors
 */
export const validateAndProcessCustomerImport = (data: any[]): { 
  validData: Partial<Customer>[], 
  errors: { row: number; message: string }[] 
} => {
  const validData: Partial<Customer>[] = [];
  const errors: { row: number; message: string }[] = [];
  
  // Process each row
  data.forEach((row, index) => {
    // Skip empty rows
    if (!row || Object.keys(row).length === 0) {
      return;
    }
    
    const rowNumber = index + 2; // +2 because of 0-indexing and header row
    const validationErrors: string[] = [];
    
    // Required fields validation
    if (!row['First Name*'] && !row['First Name']) {
      validationErrors.push('First Name is required');
    }
    
    if (!row['Last Name*'] && !row['Last Name']) {
      validationErrors.push('Last Name is required');
    }
    
    if (!row['Email*'] && !row['Email']) {
      validationErrors.push('Email is required');
    } else {
      const email = row['Email*'] || row['Email'];
      // Simple email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        validationErrors.push('Email is invalid');
      }
    }
    
    // If there are validation errors, add them to the errors array
    if (validationErrors.length > 0) {
      errors.push({
        row: rowNumber,
        message: `Row ${rowNumber}: ${validationErrors.join(', ')}`
      });
      return;
    }
    
    // Process valid data
    try {
      const customer: Partial<Customer> = {
        firstName: row['First Name*'] || row['First Name'],
        lastName: row['Last Name*'] || row['Last Name'],
        email: row['Email*'] || row['Email'],
        phone: row['Phone'] || undefined,
        address: (row['Street Address'] || row['City'] || row['State'] || row['Postal Code'] || row['Country']) 
          ? {
              street: row['Street Address'] || '',
              city: row['City'] || '',
              state: row['State'] || '',
              postalCode: row['Postal Code'] || '',
              country: row['Country'] || '',
              isDefault: true
            }
          : undefined,
        dateOfBirth: row['Date of Birth (YYYY-MM-DD)'] 
          ? new Date(row['Date of Birth (YYYY-MM-DD)']).toISOString() 
          : undefined,
        membershipLevel: row['Membership Level'] || undefined,
        loyaltyPoints: row['Loyalty Points'] ? parseInt(row['Loyalty Points'], 10) : 0,
        notes: row['Notes'] || undefined,
        tags: row['Tags (comma separated)'] 
          ? row['Tags (comma separated)'].split(',').map((tag: string) => tag.trim()) 
          : undefined,
        isActive: true,
        totalSpent: 0,
        totalOrders: 0
      };
      
      validData.push(customer);
    } catch (error) {
      errors.push({
        row: rowNumber,
        message: `Row ${rowNumber}: Error processing data - ${(error as Error).message}`
      });
    }
  });
  
  return { validData, errors };
}; 