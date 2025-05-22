import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface ReportOptions {
  title: string;
  subtitle?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'a4' | 'letter';
  showFooter?: boolean;
  showPageNumbers?: boolean;
}

interface TableColumn {
  header: string;
  dataKey: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => string;
}

/**
 * Creates a new PDF document with standard report formatting
 */
function createPDFDocument(options: ReportOptions): jsPDF {
  const doc = new jsPDF({
    orientation: options.orientation || 'portrait',
    unit: 'mm',
    format: options.pageSize || 'a4'
  });

  // Add header
  const pageWidth = doc.internal.pageSize.width;
  doc.setFontSize(20);
  doc.text(options.title, pageWidth / 2, 20, { align: 'center' });

  // Add subtitle if provided
  if (options.subtitle) {
    doc.setFontSize(12);
    doc.text(options.subtitle, pageWidth / 2, 30, { align: 'center' });
  }

  // Add date range if provided
  if (options.dateRange) {
    doc.setFontSize(10);
    const dateText = `${format(options.dateRange.from, 'MMM d, yyyy')} - ${format(options.dateRange.to, 'MMM d, yyyy')}`;
    doc.text(dateText, pageWidth / 2, options.subtitle ? 40 : 30, { align: 'center' });
  }

  // Add footer if enabled
  if (options.showFooter) {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.text(
      `Generated on ${format(new Date(), 'PPpp')}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  return doc;
}

/**
 * Exports data as a PDF report with a table format
 */
export function exportTableReport<T extends Record<string, any>>(
  data: T[],
  columns: TableColumn[],
  options: ReportOptions
): jsPDF {
  const doc = createPDFDocument(options);

  // Calculate starting Y position based on header content
  let startY = options.dateRange ? 50 : (options.subtitle ? 40 : 30);

  // Prepare table data
  const tableData = data.map(item => 
    columns.map(col => {
      const value = item[col.dataKey];
      return col.format ? col.format(value) : value;
    })
  );

  // Configure table
  autoTable(doc, {
    head: [columns.map(col => col.header)],
    body: tableData,
    startY,
    headStyles: {
      fillColor: [51, 51, 51],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: columns.reduce((styles, col, index) => {
      if (col.align) {
        styles[index] = { halign: col.align };
      }
      return styles;
    }, {} as Record<number, any>),
    didDrawPage: (data) => {
      // Add page numbers if enabled
      if (options.showPageNumbers) {
        doc.setFontSize(8);
        doc.text(
          `Page ${data.pageNumber} of ${data.pageCount}`,
          doc.internal.pageSize.width - 20,
          doc.internal.pageSize.height - 10,
          { align: 'right' }
        );
      }
    }
  });

  return doc;
}

/**
 * Exports data as a PDF report with a summary format
 */
export function exportSummaryReport<T extends Record<string, any>>(
  data: {
    summary: Record<string, any>;
    details?: T[];
  },
  options: ReportOptions
): jsPDF {
  const doc = createPDFDocument(options);
  let yPos = options.dateRange ? 50 : (options.subtitle ? 40 : 30);

  // Add summary section
  doc.setFontSize(14);
  doc.text('Summary', 20, yPos);
  yPos += 10;

  doc.setFontSize(10);
  Object.entries(data.summary).forEach(([key, value]) => {
    doc.text(`${key}:`, 25, yPos);
    doc.text(value.toString(), 100, yPos);
    yPos += 7;
  });

  // Add details section if provided
  if (data.details && data.details.length > 0) {
    yPos += 10;
    doc.setFontSize(14);
    doc.text('Details', 20, yPos);
    yPos += 10;

    // Create a table for details
    const columns = Object.keys(data.details[0]).map(key => ({
      header: key.charAt(0).toUpperCase() + key.slice(1),
      dataKey: key
    }));

    autoTable(doc, {
      head: [columns.map(col => col.header)],
      body: data.details.map(item => columns.map(col => item[col.dataKey])),
      startY: yPos,
      headStyles: {
        fillColor: [51, 51, 51],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      }
    });
  }

  return doc;
}

/**
 * Exports data as a PDF report with charts and visualizations
 */
export function exportChartReport(
  data: {
    charts: Array<{
      title: string;
      type: 'bar' | 'line' | 'pie';
      data: number[];
      labels: string[];
    }>;
    summary?: Record<string, any>;
  },
  options: ReportOptions
): jsPDF {
  const doc = createPDFDocument(options);
  let yPos = options.dateRange ? 50 : (options.subtitle ? 40 : 30);

  // Add summary if provided
  if (data.summary) {
    doc.setFontSize(14);
    doc.text('Summary', 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    Object.entries(data.summary).forEach(([key, value]) => {
      doc.text(`${key}:`, 25, yPos);
      doc.text(value.toString(), 100, yPos);
      yPos += 7;
    });
    yPos += 10;
  }

  // Add charts
  data.charts.forEach(chart => {
    // Add chart title
    doc.setFontSize(12);
    doc.text(chart.title, 20, yPos);
    yPos += 10;

    // Create table representation of chart data
    autoTable(doc, {
      head: [['Label', 'Value']],
      body: chart.labels.map((label, index) => [
        label,
        chart.data[index].toString()
      ]),
      startY: yPos,
      margin: { left: 40 },
      tableWidth: 100,
      headStyles: {
        fillColor: [51, 51, 51],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 20;

    // Add new page if needed
    if (yPos > doc.internal.pageSize.height - 20) {
      doc.addPage();
      yPos = 20;
    }
  });

  return doc;
}

/**
 * Downloads a PDF document with a generated filename
 */
export function downloadPDF(doc: jsPDF, prefix: string): void {
  const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
  const filename = `${prefix}_${timestamp}.pdf`;
  doc.save(filename);
} 