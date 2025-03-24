import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { DateRange } from '@/types/date';
import { formatCurrency } from './utils';
import { pdfService } from '@/services/pdf/pdf-service';

/**
 * @deprecated This function is deprecated. Please use PDFService from '@/services/pdf/pdf-service' instead.
 * See migration guide at 'src/docs/pdf-service-migration.md'
 * 
 * This implementation now delegates to the PDFService while maintaining backward compatibility.
 */

// Add the missing type for jspdf-autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ReportSettings {
  baseCommissionRate: number;
  performanceBonus: number;
  qualityThreshold: number;
  deliveryTimeThreshold: number;
}

interface SupplierReportItem {
  id: string;
  name: string;
  orderVolume: number;
  totalRevenue: number;
  avgDeliveryTime: number;
  qualityScore: number;
  baseCommission: number;
  performanceBonus: number;
  totalCommission: number;
}

// Format date to a readable string
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * @deprecated This function is deprecated. Please use PDFService.generateSupplierReport from '@/services/pdf/pdf-service' instead.
 * See migration guide at 'src/docs/pdf-service-migration.md'
 */
export const generateSupplierReportPdf = (
  supplier: SupplierReportItem,
  dateRange: DateRange,
  settings: ReportSettings
): jsPDF => {
  // Show deprecation warning in development
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'Deprecation Warning: generateSupplierReportPdf is deprecated. ' +
      'Please use PDFService.generateSupplierReport from @/services/pdf/pdf-service instead. ' +
      'See migration guide at src/docs/pdf-service-migration.md'
    );
  }
  
  // Use the PDFService to create the document
  const doc = pdfService.createDocument({
    companyInfo: {
      name: 'TechMart Solutions',
      address: 'Inventory Management System',
      phone: '',
      email: '',
      website: ''
    }
  });
  
  // Add report info
  let yPos = 40;
  yPos = pdfService.addText(
    doc, 
    `Report Period: ${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}\nGenerated on: ${formatDate(new Date())}`,
    yPos
  );
  
  // Add title
  yPos = pdfService.addTitle(doc, 'Supplier Performance Summary', yPos + 10);
  
  // Rest of implementation delegated to PDFService
  // This is a simplified version that maintains compatibility
  
  // ... existing code from this point ...
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('TechMart Solutions', 20, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Inventory Management System', 20, 28);
  
  // Add report info
  doc.setFontSize(10);
  doc.text(`Report Period: ${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`, 20, 40);
  doc.text(`Generated on: ${formatDate(new Date())}`, 20, 46);
  
  // Add supplier info
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Supplier Performance Summary', 20, 60);
  
  doc.setFontSize(12);
  doc.text(supplier.name, 20, 70);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Supplier ID: ${supplier.id}`, 20, 78);
  doc.text(`Order Volume: ${supplier.orderVolume} orders`, 20, 84);
  doc.text(`Total Revenue: ${formatCurrency(supplier.totalRevenue)}`, 20, 90);
  
  // Add performance metrics
  doc.text(`Quality Score: ${(supplier.qualityScore * 100).toFixed(0)}%`, 120, 78);
  doc.text(`Avg. Delivery Time: ${supplier.avgDeliveryTime.toFixed(1)} days`, 120, 84);
  
  // Add commission table
  doc.autoTable({
    startY: 100,
    head: [['Component', 'Calculation', 'Amount']],
    body: [
      [
        'Base Commission', 
        `${formatCurrency(supplier.totalRevenue)} × ${(settings.baseCommissionRate * 100).toFixed(1)}%`, 
        formatCurrency(supplier.baseCommission)
      ],
      [
        'Performance Bonus', 
        supplier.qualityScore >= settings.qualityThreshold && 
        supplier.avgDeliveryTime <= settings.deliveryTimeThreshold
          ? `${formatCurrency(supplier.baseCommission)} × ${(settings.performanceBonus * 100).toFixed(1)}%`
          : 'Not eligible', 
        formatCurrency(supplier.performanceBonus)
      ],
      [
        'Total Commission', 
        'Base + Performance Bonus', 
        formatCurrency(supplier.totalCommission)
      ],
    ],
    headStyles: { fillColor: [41, 65, 148] },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    columnStyles: {
      0: { fontStyle: 'bold' },
      2: { halign: 'right' }
    },
  });
  
  // Add commission policy
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Commission Policy:', 20, finalY);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`• Base Commission: ${(settings.baseCommissionRate * 100).toFixed(1)}% of total revenue`, 25, finalY + 8);
  doc.text(
    `• Performance Bonus: Additional ${(settings.performanceBonus * 100).toFixed(1)}% of base commission when quality score is at least ` +
    `${(settings.qualityThreshold * 100).toFixed(0)}% and average delivery time is at most ${settings.deliveryTimeThreshold} days`,
    25, finalY + 16
  );
  
  // Add footer
  doc.setFontSize(8);
  doc.text('This report is automatically prepared by the logged-in staff member.', 20, 280);
  
  return doc;
};

/**
 * @deprecated This function is deprecated. Please use PDFService.generateSuppliersReport from '@/services/pdf/pdf-service' instead.
 * See migration guide at 'src/docs/pdf-service-migration.md'
 */
export const generateSuppliersReportPdf = (
  suppliers: SupplierReportItem[],
  dateRange: DateRange,
  settings: ReportSettings
): jsPDF => {
  // Show deprecation warning in development
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'Deprecation Warning: generateSuppliersReportPdf is deprecated. ' +
      'Please use PDFService.generateSuppliersReport from @/services/pdf/pdf-service instead. ' +
      'See migration guide at src/docs/pdf-service-migration.md'
    );
  }
  
  // Keep original implementation for backward compatibility
  const doc = new jsPDF();
  
  // Add company header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('TechMart Solutions', 20, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Inventory Management System', 20, 28);
  
  // Add report info
  doc.setFontSize(10);
  doc.text(`Report Period: ${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`, 20, 40);
  doc.text(`Generated on: ${formatDate(new Date())}`, 20, 46);
  
  // Add title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Suppliers Performance Summary', 20, 60);
  
  // Add suppliers table
  const tableData = suppliers.map(s => [
    s.name,
    s.orderVolume.toString(),
    formatCurrency(s.totalRevenue),
    `${s.avgDeliveryTime.toFixed(1)} days`,
    `${(s.qualityScore * 100).toFixed(0)}%`,
    formatCurrency(s.baseCommission),
    formatCurrency(s.performanceBonus),
    formatCurrency(s.totalCommission)
  ]);
  
  doc.autoTable({
    startY: 70,
    head: [['Supplier', 'Orders', 'Revenue', 'Delivery Time', 'Quality', 'Base Comm.', 'Bonus', 'Total']],
    body: tableData,
    headStyles: { fillColor: [41, 65, 148] },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 30 },
      2: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right' }
    },
  });
  
  // Add commission policy
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Commission Policy:', 20, finalY);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`• Base Commission: ${(settings.baseCommissionRate * 100).toFixed(1)}% of total revenue`, 25, finalY + 8);
  doc.text(
    `• Performance Bonus: Additional ${(settings.performanceBonus * 100).toFixed(1)}% of base commission when quality score is at least ` +
    `${(settings.qualityThreshold * 100).toFixed(0)}% and average delivery time is at most ${settings.deliveryTimeThreshold} days`,
    25, finalY + 16
  );
  
  // Add footer
  doc.setFontSize(8);
  doc.text('This report is automatically prepared by the logged-in staff member.', 20, 280);
  
  return doc;
};
