import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { 
  CompanyInfo, 
  PDFSettings, 
  PDFMetadata, 
  PDFTableOptions, 
  PDFTextOptions,
  DEFAULT_PDF_SETTINGS 
} from './types';

// Add the missing type for jspdf-autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

/**
 * PDFService class
 * 
 * A unified service for generating PDF documents with consistent styling and structure.
 * This service consolidates functionality from multiple PDF generation utilities.
 */
export class PDFService {
  /**
   * Create a new PDF document
   * @param settings PDF generation settings
   * @param metadata Document metadata
   * @returns A new jsPDF document instance
   */
  createDocument(
    settings: Partial<PDFSettings> = {}, 
    metadata: PDFMetadata = { title: 'Generated Document' }
  ): jsPDF {
    // Merge settings with defaults
    const mergedSettings: PDFSettings = {
      ...DEFAULT_PDF_SETTINGS,
      ...settings,
      companyInfo: {
        ...DEFAULT_PDF_SETTINGS.companyInfo,
        ...settings.companyInfo
      }
    };
    
    // Create document with correct orientation
    const doc = new jsPDF({
      orientation: mergedSettings.pageOrientation || 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    // Set document properties
    doc.setProperties({
      title: metadata.title,
      author: metadata.author || mergedSettings.companyInfo.name,
      subject: metadata.subject || `${metadata.title} - Generated on ${format(new Date(), 'yyyy-MM-dd')}`,
      keywords: metadata.keywords?.join(', ') || '',
      creator: 'PDF Service',
    });
    
    return doc;
  }
  
  /**
   * Add company header to the document
   * @param doc PDF document
   * @param settings PDF settings
   * @returns The y-coordinate after the header
   */
  addCompanyHeader(
    doc: jsPDF, 
    settings: Partial<PDFSettings> = {}
  ): number {
    // Merge settings with defaults
    const mergedSettings: PDFSettings = {
      ...DEFAULT_PDF_SETTINGS,
      ...settings,
      companyInfo: {
        ...DEFAULT_PDF_SETTINGS.companyInfo,
        ...settings.companyInfo
      }
    };
    
    const { companyInfo, margin = 15 } = mergedSettings;
    let yPos = margin;
    
    // Add logo if available and showLogo is true
    if (companyInfo.logoUrl && mergedSettings.showLogo) {
      try {
        // This is a placeholder - actual logo loading would need to be async
        // For demonstration purposes, we'll skip the actual logo insertion
        // doc.addImage(companyInfo.logoUrl, 'PNG', margin, yPos, 40, 15);
        yPos += 20; // Logo height + spacing
      } catch (error) {
        console.error('Failed to load company logo:', error);
      }
    }
    
    // Add company name and details
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(companyInfo.name, margin, yPos);
    yPos += 7;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(companyInfo.address, margin, yPos);
    yPos += 5;
    
    doc.text(`Phone: ${companyInfo.phone}`, margin, yPos);
    yPos += 4;
    
    doc.text(`Email: ${companyInfo.email}`, margin, yPos);
    yPos += 4;
    
    if (companyInfo.website) {
      doc.text(`Website: ${companyInfo.website}`, margin, yPos);
      yPos += 4;
    }
    
    // Add horizontal line
    yPos += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, doc.internal.pageSize.width - margin, yPos);
    yPos += 10;
    
    return yPos;
  }
  
  /**
   * Add a document title
   * @param doc PDF document
   * @param title Document title
   * @param yPos Y-coordinate to start at
   * @param settings PDF settings
   * @returns The y-coordinate after the title
   */
  addTitle(
    doc: jsPDF, 
    title: string, 
    yPos: number, 
    settings: Partial<PDFSettings> = {}
  ): number {
    const mergedSettings: PDFSettings = {
      ...DEFAULT_PDF_SETTINGS,
      ...settings
    };
    
    const { margin = 15, headingFontSize = 14 } = mergedSettings;
    
    doc.setFontSize(headingFontSize);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, yPos);
    
    return yPos + 10;
  }
  
  /**
   * Add a table to the document
   * @param doc PDF document
   * @param headers Table header columns
   * @param data Table data (array of arrays or array of objects)
   * @param yPos Y-coordinate to start at (if null, will be automatically positioned)
   * @param tableOptions Table formatting options
   * @param settings PDF settings
   * @returns The y-coordinate after the table
   */
  addTable(
    doc: jsPDF, 
    headers: string[], 
    data: any[], 
    yPos: number | null = null, 
    tableOptions: PDFTableOptions = {},
    settings: Partial<PDFSettings> = {}
  ): number {
    const mergedSettings: PDFSettings = {
      ...DEFAULT_PDF_SETTINGS,
      ...settings
    };
    
    const { margin = 15, accentColor = '#3B82F6' } = mergedSettings;
    
    // Format table headers
    const tableHeaders = headers.map(header => ({
      content: header,
      styles: {
        fillColor: tableOptions.headerBackgroundColor || accentColor,
        textColor: tableOptions.headerTextColor || '#FFFFFF',
        fontStyle: 'bold',
        fontSize: tableOptions.headerFontSize || 10,
        cellPadding: tableOptions.cellPadding || 5,
      }
    }));
    
    // Convert data to array of arrays if it's an array of objects
    const tableData = data.map(row => {
      if (Array.isArray(row)) return row;
      return headers.map(header => row[header] || '');
    });
    
    // Build table configuration
    const tableConfig = {
      head: [tableHeaders],
      body: tableData,
      startY: yPos !== null ? yPos : undefined,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: tableOptions.dataFontSize || 9,
        cellPadding: tableOptions.cellPadding || 5,
      },
      headStyles: {
        fillColor: tableOptions.headerBackgroundColor || accentColor,
        textColor: tableOptions.headerTextColor || '#FFFFFF',
        fontStyle: 'bold',
      },
      alternateRowStyles: tableOptions.alternateRowColors 
        ? { fillColor: '#F9FAFB' } // light gray for alternate rows
        : {},
      tableLineColor: '#E5E7EB', // light gray for borders
      tableLineWidth: 0.1,
    };
    
    // Add the table to the document using the correct function call format
    doc.autoTable(tableConfig);
    
    // Get the final Y position after the table
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    return finalY;
  }
  
  /**
   * Add a text paragraph to the document
   * @param doc PDF document
   * @param text Text content (can include \n for line breaks)
   * @param yPos Y-coordinate to start at
   * @param options Text formatting options
   * @param settings PDF settings
   * @returns The y-coordinate after the text
   */
  addText(
    doc: jsPDF, 
    text: string, 
    yPos: number, 
    options: PDFTextOptions = {},
    settings: Partial<PDFSettings> = {}
  ): number {
    const mergedSettings: PDFSettings = {
      ...DEFAULT_PDF_SETTINGS,
      ...settings
    };
    
    const { 
      margin = 15, 
      bodyFontSize = 10 
    } = mergedSettings;
    
    const {
      fontSize = bodyFontSize,
      color = '#000000',
      fontStyle = 'normal',
      align = 'left',
      lineHeight = 1.2
    } = options;
    
    // Set text properties
    doc.setFontSize(fontSize);
    doc.setTextColor(color);
    
    // Set font style
    switch (fontStyle) {
      case 'bold':
        doc.setFont('helvetica', 'bold');
        break;
      case 'italic':
        doc.setFont('helvetica', 'italic');
        break;
      case 'bolditalic':
        doc.setFont('helvetica', 'bolditalic');
        break;
      default:
        doc.setFont('helvetica', 'normal');
    }
    
    // Split text into lines if it contains line breaks
    const lines = text.split('\n');
    let currentY = yPos;
    
    lines.forEach(line => {
      doc.text(line, align === 'left' ? margin : align === 'right' ? doc.internal.pageSize.width - margin : doc.internal.pageSize.width / 2, currentY, { align });
      currentY += fontSize * lineHeight;
    });
    
    return currentY;
  }
  
  /**
   * Add a footer to the document
   * @param doc PDF document
   * @param settings PDF settings
   */
  addFooter(doc: jsPDF, settings: Partial<PDFSettings> = {}): void {
    const mergedSettings: PDFSettings = {
      ...DEFAULT_PDF_SETTINGS,
      ...settings,
      companyInfo: {
        ...DEFAULT_PDF_SETTINGS.companyInfo,
        ...settings.companyInfo
      }
    };
    
    const { companyInfo, confidentiality = 'public', margin = 15 } = mergedSettings;
    
    const pageCount = doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      const pageSize = doc.internal.pageSize;
      const pageWidth = pageSize.width;
      const pageHeight = pageSize.height;
      
      // Add footer with page number
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      
      // Add confidentiality notice
      let confidentialityText = '';
      if (confidentiality === 'confidential') {
        confidentialityText = 'CONFIDENTIAL - NOT FOR DISTRIBUTION';
      } else if (confidentiality === 'internal') {
        confidentialityText = 'INTERNAL USE ONLY';
      }
      
      if (confidentialityText) {
        doc.text(confidentialityText, pageWidth / 2, pageHeight - margin / 2, { align: 'center' });
      }
      
      // Add page number
      doc.text(
        `Page ${i} of ${pageCount}`, 
        pageWidth - margin, 
        pageHeight - margin, 
        { align: 'right' }
      );
      
      // Add company name
      doc.text(
        companyInfo.name, 
        margin, 
        pageHeight - margin, 
        { align: 'left' }
      );
      
      // Add generation date
      doc.text(
        `Generated on ${format(new Date(), 'yyyy-MM-dd')}`, 
        pageWidth / 2, 
        pageHeight - margin, 
        { align: 'center' }
      );
    }
  }
  
  /**
   * Generate a PDF and return it as a Blob
   * @param generator A function that uses the document to add content
   * @param settings PDF settings
   * @param metadata Document metadata
   * @returns Promise resolving to a Blob containing the PDF
   */
  async generatePDF(
    generator: (doc: jsPDF, service: PDFService) => Promise<void> | void,
    settings: Partial<PDFSettings> = {},
    metadata: PDFMetadata = { title: 'Generated Document' }
  ): Promise<Blob> {
    // Create PDF document
    const doc = this.createDocument(settings, metadata);
    
    // Let the generator function add content
    await generator(doc, this);
    
    // Add footer
    this.addFooter(doc, settings);
    
    // Return as blob
    return doc.output('blob');
  }
  
  /**
   * Download a PDF file
   * @param blob PDF blob
   * @param filename Filename for the download
   */
  downloadPDF(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Export a default instance of the service
export const pdfService = new PDFService();

export default pdfService; 