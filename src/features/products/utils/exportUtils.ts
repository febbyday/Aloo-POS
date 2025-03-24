import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { Product, ProductVariant } from '../types'

interface TransferItem {
  name: string
  sku: string
  quantity: number
  unitPrice: number
  category: string
  unit: string
}

interface Transfer {
  id: string
  source: string
  destination: string
  status: string
  createdAt: string
  createdBy: string
  items: TransferItem[]
  notes?: string
}

export const exportTransferToPDF = (transfer: Transfer) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 20
  
  // Header
  doc.setFontSize(20)
  doc.text('Stock Transfer Details', pageWidth / 2, margin, { align: 'center' })
  
  // Company Info
  doc.setFontSize(12)
  doc.text('Your Company Name', margin, margin + 10)
  doc.setFontSize(10)
  doc.text('123 Business Street', margin, margin + 15)
  doc.text('City, Country', margin, margin + 20)
  
  // Transfer Info
  doc.setFontSize(11)
  const transferInfo = [
    ['Transfer ID:', transfer.id],
    ['Status:', transfer.status],
    ['From:', transfer.source],
    ['To:', transfer.destination],
    ['Created By:', transfer.createdBy],
    ['Date:', format(new Date(transfer.createdAt), 'PPp')],
  ]
  
  let yPos = margin + 30
  transferInfo.forEach(([label, value]) => {
    doc.text(`${label}`, margin, yPos)
    doc.text(`${value}`, margin + 50, yPos)
    yPos += 7
  })
  
  // Items Table
  const tableHeaders = [['SKU', 'Item', 'Category', 'Quantity', 'Unit', 'Unit Price', 'Total']]
  const tableData = transfer.items.map(item => [
    item.sku,
    item.name,
    item.category,
    item.quantity.toString(),
    item.unit,
    `$${item.unitPrice.toFixed(2)}`,
    `$${(item.quantity * item.unitPrice).toFixed(2)}`
  ])
  
  const totalValue = transfer.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const totalItems = transfer.items.reduce((sum, item) => sum + item.quantity, 0)
  
  autoTable(doc, {
    head: tableHeaders,
    body: tableData,
    startY: yPos + 10,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [51, 51, 51] },
  })
  
  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10
  doc.text(`Total Items: ${totalItems}`, margin, finalY)
  doc.text(`Total Value: $${totalValue.toFixed(2)}`, pageWidth - margin - 40, finalY)
  
  // Notes
  if (transfer.notes) {
    doc.setFontSize(10)
    doc.text('Notes:', margin, finalY + 15)
    doc.setFontSize(9)
    const splitNotes = doc.splitTextToSize(transfer.notes, pageWidth - (2 * margin))
    doc.text(splitNotes, margin, finalY + 22)
  }
  
  // Footer
  doc.setFontSize(8)
  doc.text(
    `Generated on ${format(new Date(), 'PPp')}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  )
  
  // Save the PDF
  doc.save(`transfer-${transfer.id}.pdf`)
}

export const exportTransferToExcel = (transfer: Transfer) => {
  // Prepare worksheet data
  const wsData = [
    ['Stock Transfer Details'],
    [],
    ['Transfer ID', transfer.id],
    ['Status', transfer.status],
    ['From', transfer.source],
    ['To', transfer.destination],
    ['Created By', transfer.createdBy],
    ['Date', format(new Date(transfer.createdAt), 'PPp')],
    [],
    ['Items'],
    ['SKU', 'Item', 'Category', 'Quantity', 'Unit', 'Unit Price', 'Total'],
    ...transfer.items.map(item => [
      item.sku,
      item.name,
      item.category,
      item.quantity,
      item.unit,
      item.unitPrice,
      item.quantity * item.unitPrice
    ]),
    [],
    ['Total Items', transfer.items.reduce((sum, item) => sum + item.quantity, 0)],
    ['Total Value', transfer.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)],
  ]

  if (transfer.notes) {
    wsData.push([], ['Notes'], [transfer.notes])
  }

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Style the worksheet
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
  const headerStyle = { font: { bold: true }, fill: { fgColor: { rgb: "CCCCCC" } } }
  
  // Apply styles to headers
  for (let C = range.s.c; C <= range.e.c; C++) {
    const headerAddress = XLSX.utils.encode_cell({ r: 10, c: C })
    if (!ws[headerAddress]) continue
    ws[headerAddress].s = headerStyle
  }

  // Set column widths
  ws['!cols'] = [
    { wch: 15 }, // SKU
    { wch: 30 }, // Item
    { wch: 15 }, // Category
    { wch: 10 }, // Quantity
    { wch: 10 }, // Unit
    { wch: 12 }, // Unit Price
    { wch: 12 }, // Total
  ]

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Transfer Details')

  // Save the file
  XLSX.writeFile(wb, `transfer-${transfer.id}.xlsx`)
}

export const exportTransferListToExcel = (transfers: Transfer[]) => {
  // Prepare worksheet data
  const wsData = [
    ['Stock Transfers List'],
    [],
    ['ID', 'Status', 'From', 'To', 'Created By', 'Date', 'Total Items', 'Total Value'],
    ...transfers.map(transfer => {
      const totalItems = transfer.items.reduce((sum, item) => sum + item.quantity, 0)
      const totalValue = transfer.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
      return [
        transfer.id,
        transfer.status,
        transfer.source,
        transfer.destination,
        transfer.createdBy,
        format(new Date(transfer.createdAt), 'PPp'),
        totalItems,
        totalValue
      ]
    })
  ]

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Style the worksheet
  const headerStyle = { font: { bold: true }, fill: { fgColor: { rgb: "CCCCCC" } } }
  
  // Apply styles to headers
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
  for (let C = range.s.c; C <= range.e.c; C++) {
    const headerAddress = XLSX.utils.encode_cell({ r: 2, c: C })
    if (!ws[headerAddress]) continue
    ws[headerAddress].s = headerStyle
  }

  // Set column widths
  ws['!cols'] = [
    { wch: 12 }, // ID
    { wch: 12 }, // Status
    { wch: 20 }, // From
    { wch: 20 }, // To
    { wch: 15 }, // Created By
    { wch: 20 }, // Date
    { wch: 12 }, // Total Items
    { wch: 12 }, // Total Value
  ]

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Transfers List')

  // Save the file
  XLSX.writeFile(wb, `transfers-list-${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
}

export const exportTransferListToPDF = (transfers: Transfer[]) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 20
  
  // Header
  doc.setFontSize(20)
  doc.text('Stock Transfers List', pageWidth / 2, margin, { align: 'center' })
  
  // Company Info
  doc.setFontSize(12)
  doc.text('Your Company Name', margin, margin + 10)
  doc.setFontSize(10)
  doc.text('123 Business Street', margin, margin + 15)
  doc.text('City, Country', margin, margin + 20)
  
  // Date Range
  doc.setFontSize(11)
  doc.text(`Generated on: ${format(new Date(), 'PPp')}`, margin, margin + 30)
  
  // Transfers Table
  const tableHeaders = [['ID', 'Status', 'From', 'To', 'Created By', 'Date', 'Items', 'Value']]
  const tableData = transfers.map(transfer => {
    const totalItems = transfer.items.reduce((sum, item) => sum + item.quantity, 0)
    const totalValue = transfer.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    return [
      transfer.id,
      transfer.status,
      transfer.source,
      transfer.destination,
      transfer.createdBy,
      format(new Date(transfer.createdAt), 'PP'),
      totalItems.toString(),
      `$${totalValue.toFixed(2)}`
    ]
  })
  
  // Calculate totals
  const totalTransfers = transfers.length
  const totalItems = transfers.reduce((sum, transfer) => 
    sum + transfer.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0)
  const totalValue = transfers.reduce((sum, transfer) => 
    sum + transfer.items.reduce((itemSum, item) => itemSum + (item.quantity * item.unitPrice), 0), 0)
  
  autoTable(doc, {
    head: tableHeaders,
    body: tableData,
    startY: margin + 40,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [51, 51, 51] },
    columnStyles: {
      0: { cellWidth: 20 }, // ID
      1: { cellWidth: 20 }, // Status
      2: { cellWidth: 25 }, // From
      3: { cellWidth: 25 }, // To
      4: { cellWidth: 25 }, // Created By
      5: { cellWidth: 25 }, // Date
      6: { cellWidth: 15 }, // Items
      7: { cellWidth: 20 }, // Value
    }
  })
  
  // Summary
  const finalY = (doc as any).lastAutoTable.finalY + 10
  doc.setFontSize(10)
  doc.text(`Total Transfers: ${totalTransfers}`, margin, finalY)
  doc.text(`Total Items: ${totalItems}`, margin + 80, finalY)
  doc.text(`Total Value: $${totalValue.toFixed(2)}`, margin + 160, finalY)
  
  // Footer
  doc.setFontSize(8)
  doc.text(
    `Generated on ${format(new Date(), 'PPp')}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  )
  
  // Save the PDF
  doc.save(`transfers-list-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
}

/**
 * Exports products to CSV format
 */
export const exportProductsToCSV = (products: Product[], includeVariants: boolean = false): string => {
  // Headers
  let headers = ['SKU', 'Name', 'Description', 'Category', 'Price', 'Cost', 'Stock', 'Status'];
  let csvContent = headers.join(',') + '\n';

  // Products
  products.forEach(product => {
    const row = [
      product.sku,
      `"${product.name}"`,
      `"${product.description || ''}"`,
      product.category,
      product.retailPrice,
      product.costPrice,
      product.locations?.reduce((total, loc) => total + (loc.stock || 0), 0) || 0,
      product.status
    ];
    csvContent += row.join(',') + '\n';

    // Add variants if requested
    if (includeVariants && product.variants?.length) {
      product.variants.forEach(variant => {
        const variantRow = [
          variant.sku,
          `"${product.name} - ${variant.name}"`,
          `"${variant.description || ''}"`,
          product.category,
          variant.retailPrice,
          variant.costPrice,
          variant.stock || 0,
          variant.status
        ];
        csvContent += variantRow.join(',') + '\n';
      });
    }
  });

  return csvContent;
};

/**
 * Exports products to Excel format
 */
export const exportProductsToExcel = (products: Product[], includeVariants: boolean = false): XLSX.WorkBook => {
  // Prepare data for products sheet
  const productData = products.map(product => ({
    SKU: product.sku,
    Name: product.name,
    Description: product.description || '',
    Category: product.category,
    'Retail Price': product.retailPrice,
    'Cost Price': product.costPrice,
    Stock: product.locations?.reduce((total, loc) => total + (loc.stock || 0), 0) || 0,
    Status: product.status
  }));

  // Create workbook and add products sheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(productData);
  XLSX.utils.book_append_sheet(wb, ws, 'Products');

  // Add variants sheet if requested
  if (includeVariants) {
    const variantData: any[] = [];
    products.forEach(product => {
      if (product.variants?.length) {
        product.variants.forEach(variant => {
          variantData.push({
            'Parent SKU': product.sku,
            'Variant SKU': variant.sku,
            'Parent Name': product.name,
            'Variant Name': variant.name,
            Description: variant.description || '',
            Category: product.category,
            'Retail Price': variant.retailPrice,
            'Cost Price': variant.costPrice,
            Stock: variant.stock || 0,
            Status: variant.status
          });
        });
      }
    });

    if (variantData.length > 0) {
      const wsVariants = XLSX.utils.json_to_sheet(variantData);
      XLSX.utils.book_append_sheet(wb, wsVariants, 'Variants');
    }
  }

  return wb;
};

/**
 * Exports products to PDF format
 */
export const exportProductsToPDF = (products: Product[], includeVariants: boolean = false): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Title
  doc.setFontSize(20);
  doc.text('Products List', pageWidth / 2, 20, { align: 'center' });
  
  // Products table
  const productHeaders = [['SKU', 'Name', 'Category', 'Price', 'Stock', 'Status']];
  const productData = products.map(product => [
    product.sku,
    product.name,
    product.category,
    product.retailPrice.toFixed(2),
    product.locations?.reduce((total, loc) => total + (loc.stock || 0), 0) || 0,
    product.status
  ]);

  autoTable(doc, {
    head: productHeaders,
    body: productData,
    startY: 30,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [51, 51, 51] }
  });

  // Add variants if requested
  if (includeVariants) {
    const variantData: any[] = [];
    products.forEach(product => {
      if (product.variants?.length) {
        product.variants.forEach(variant => {
          variantData.push([
            variant.sku,
            `${product.name} - ${variant.name}`,
            product.category,
            variant.retailPrice.toFixed(2),
            variant.stock || 0,
            variant.status
          ]);
        });
      }
    });

    if (variantData.length > 0) {
      doc.addPage();
      doc.setFontSize(20);
      doc.text('Product Variants', pageWidth / 2, 20, { align: 'center' });

      autoTable(doc, {
        head: [['SKU', 'Name', 'Category', 'Price', 'Stock', 'Status']],
        body: variantData,
        startY: 30,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [51, 51, 51] }
      });
    }
  }

  return doc;
};
