import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { Supplier, SupplierPerformanceMetrics } from '@/features/suppliers/types'

export interface ReportSettings {
  companyInfo: CompanyInfo
  showLogo: boolean
  accentColor: string
  preparedBy: string
  includeCharts: boolean
  template?: 'standard' | 'modern' | 'minimal'
  pageOrientation?: 'portrait' | 'landscape'
  confidentiality?: 'public' | 'confidential' | 'internal'
}

export interface CompanyInfo {
  name: string
  address: string
  phone: string
  email: string
  website: string
  logoUrl?: string
}

export interface ProductData {
  name: string
  sku: string
  quantitySold: number
  unitPrice: number
  totalSales: number
  contribution: number
  category?: string
  margin?: number
  stockLevel: number
  reorderPoint: number
  turnoverRate: number
  lastRestockDate?: Date
  targetSales?: number
}

export interface SupplierSalesData extends SupplierReference {
  totalSales: number
  performance: {
    previousPeriodSales: number
    percentChange: number
    targetAchievement?: number
    inventoryMetrics: {
      totalStockValue: number
      averageTurnoverRate: number
      lowStockCount: number
      overstockCount: number
    }
  }
  products: Array<{
    name: string
    sku: string
    sales: number
    stock: number
    status: 'In Stock' | 'Low Stock' | 'Out of Stock'
  }>
}

export const generateSupplierSalesReport = async (
  suppliers: SupplierSalesData[],
  dateRange: { from?: Date; to?: Date },
  settings: ReportSettings
): Promise<jsPDF> => {
  if (!suppliers || suppliers.length === 0) {
    throw new Error('No supplier data provided')
  }

  const mergedSettings = {
    companyInfo: {
      name: 'Company Name',
      address: 'Company Address',
      phone: 'Phone Number',
      email: 'Email',
      website: 'Website',
      ...settings.companyInfo
    },
    showLogo: settings.showLogo !== undefined ? settings.showLogo : true,
    accentColor: settings.accentColor || '#336699',
    preparedBy: settings.preparedBy || 'System',
    includeCharts: settings.includeCharts !== undefined ? settings.includeCharts : true,
    template: settings.template || 'standard',
    pageOrientation: settings.pageOrientation || 'portrait',
    confidentiality: settings.confidentiality || 'internal'
  }

  // Initialize PDF document
  const doc = new jsPDF({
    orientation: mergedSettings.pageOrientation,
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true,
    floatPrecision: 16
  }).setProperties({ title: 'Supplier Performance Report' })

  // Set up page dimensions and styling
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 20
  const accentColor = mergedSettings.accentColor
  const rgb = {
    r: parseInt(accentColor.slice(1, 3), 16),
    g: parseInt(accentColor.slice(3, 5), 16),
    b: parseInt(accentColor.slice(5, 7), 16)
  }
  let yPos = margin

  // Helper functions
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0)
  }

  const formatPercentage = (value: number): string => {
    return `${(value || 0).toFixed(1)}%`
  }

  const addSectionTitle = (title: string, y: number): number => {
    // Add colored rectangle behind the title
    doc.setFillColor(rgb.r, rgb.g, rgb.b, 0.1)
    doc.rect(margin - 5, y - 5, pageWidth - 2 * (margin - 5), 12, 'F')
    
    // Add title text
    doc.setFontSize(14)
    doc.setTextColor(rgb.r, rgb.g, rgb.b)
    doc.text(title, margin, y + 3)
    doc.setTextColor(0, 0, 0) // Reset text color
    return y + 15
  }

  // Helper functions for drawing
  const drawIcon = (type: 'up' | 'down' | 'warning' | 'info' | 'check', x: number, y: number, size: number = 5) => {
    switch (type) {
      case 'up':
        doc.setFillColor(39, 174, 96) // green
        doc.triangle(x, y + size, x + size, y, x + size * 2, y + size, 'F')
        break
      case 'down':
        doc.setFillColor(231, 76, 60) // red
        doc.triangle(x, y, x + size, y + size, x + size * 2, y, 'F')
        break
      case 'warning':
        doc.setFillColor(241, 196, 15) // yellow
        doc.triangle(x, y + size, x + size, y, x + size * 2, y + size, 'F')
        doc.setFillColor(0, 0, 0)
        doc.circle(x + size, y + size - 2, 0.5, 'F')
        break
      case 'info':
        doc.setFillColor(52, 152, 219) // blue
        doc.circle(x + size, y + size/2, size/2, 'F')
        break
      case 'check':
        doc.setFillColor(39, 174, 96) // green
        doc.circle(x + size, y + size/2, size/2, 'F')
        doc.setDrawColor(255, 255, 255)
        doc.setLineWidth(0.5)
        doc.line(x + size - 2, y + size/2, x + size, y + size/2 + 2)
        doc.line(x + size, y + size/2 + 2, x + size + 3, y + size/2 - 2)
        break
    }
    doc.setDrawColor(0, 0, 0)
    doc.setFillColor(0, 0, 0)
  }

  const drawBarChart = (data: { label: string; value: number }[], x: number, y: number, width: number, height: number) => {
    const maxValue = Math.max(...data.map(d => d.value))
    const barWidth = width / data.length - 2
    const scale = height / maxValue

    // Draw axis
    doc.setDrawColor(200, 200, 200)
    doc.line(x, y, x, y - height) // Y axis
    doc.line(x, y, x + width, y) // X axis

    // Draw bars
    data.forEach((item, index) => {
      const barHeight = item.value * scale
      const barX = x + (index * (barWidth + 2))
      
      // Draw bar
      doc.setFillColor(rgb.r, rgb.g, rgb.b, 0.7)
      doc.rect(barX, y - barHeight, barWidth, barHeight, 'F')
      
      // Draw label
      doc.setFontSize(6)
      doc.setTextColor(100, 100, 100)
      doc.text(item.label, barX, y + 5, { angle: 45 })
      
      // Draw value
      doc.setFontSize(7)
      doc.setTextColor(0, 0, 0)
      doc.text(item.value.toFixed(0), barX, y - barHeight - 2)
    })
  }

  const drawTrendLine = (data: { label: string; value: number }[], x: number, y: number, width: number, height: number) => {
    const maxValue = Math.max(...data.map(d => d.value))
    const minValue = Math.min(...data.map(d => d.value))
    const range = maxValue - minValue
    const xStep = width / (data.length - 1)
    const scale = height / range

    // Draw axis
    doc.setDrawColor(200, 200, 200)
    doc.line(x, y, x, y - height) // Y axis
    doc.line(x, y, x + width, y) // X axis

    // Draw trend line
    doc.setDrawColor(rgb.r, rgb.g, rgb.b)
    doc.setLineWidth(0.5)

    let points: [number, number][] = data.map((item, index) => [
      x + (index * xStep),
      y - ((item.value - minValue) * scale)
    ])

    // Draw line
    points.forEach((point, index) => {
      if (index === 0) return
      doc.line(points[index-1][0], points[index-1][1], point[0], point[1])
    })

    // Draw points
    points.forEach(point => {
      doc.setFillColor(255, 255, 255)
      doc.circle(point[0], point[1], 1, 'F')
      doc.setFillColor(rgb.r, rgb.g, rgb.b)
      doc.circle(point[0], point[1], 0.7, 'F')
    })

    // Draw labels
    doc.setFontSize(6)
    doc.setTextColor(100, 100, 100)
    data.forEach((item, index) => {
      doc.text(item.label, x + (index * xStep), y + 5, { angle: 45 })
    })
  }

  // Add header with company logo and report title
  doc.setFillColor(rgb.r, rgb.g, rgb.b)
  doc.rect(0, 0, pageWidth, 40, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.text('Supplier Performance Report', margin, 25)
  
  doc.setFontSize(12)
  doc.text(`Period: ${format(dateRange.from || new Date(), 'MMM dd, yyyy')} - ${format(dateRange.to || new Date(), 'MMM dd, yyyy')}`, margin, 35)
  doc.setTextColor(0, 0, 0)
  yPos = 50

  // Add company info in a box
  doc.setFillColor(245, 245, 245)
  doc.rect(margin - 5, yPos - 5, pageWidth - 2 * (margin - 5), 30, 'F')
  
  doc.setFontSize(10)
  doc.text(mergedSettings.companyInfo.name, margin, yPos + 5)
  doc.text(mergedSettings.companyInfo.address, margin, yPos + 12)
  doc.text(mergedSettings.companyInfo.phone, margin, yPos + 19)
  doc.text(mergedSettings.companyInfo.email, margin + 120, yPos + 19)
  yPos += 35

  // Process each supplier
  for (const supplier of suppliers) {
    // Supplier name as a subheader
    doc.setFillColor(rgb.r, rgb.g, rgb.b, 0.05)
    doc.rect(margin - 5, yPos - 5, pageWidth - 2 * (margin - 5), 12, 'F')
    doc.setFontSize(16)
    doc.setTextColor(rgb.r, rgb.g, rgb.b)
    doc.text(supplier.name, margin, yPos + 3)
    doc.setTextColor(0, 0, 0)
    yPos += 15

    // Sales Performance Summary with Chart
    yPos = addSectionTitle('Sales Performance Summary', yPos)

    // Add trend line chart for sales
    const salesTrendData = [
      { label: 'Jan', value: supplier.performance.previousPeriodSales * 0.9 },
      { label: 'Feb', value: supplier.performance.previousPeriodSales },
      { label: 'Mar', value: supplier.performance.previousPeriodSales * 1.05 },
      { label: 'Apr', value: supplier.totalSales }
    ]
    drawTrendLine(salesTrendData, margin + 100, yPos + 40, 80, 30)
    
    // Add performance metrics with icons
    const performanceData = [
      ['Total Sales', formatCurrency(supplier.totalSales), supplier.performance.percentChange >= 0 ? 'up' : 'down'],
      ['Previous Period', formatCurrency(supplier.performance.previousPeriodSales), 'info'],
      ['Growth Rate', `${supplier.performance.percentChange >= 0 ? '+' : ''}${supplier.performance.percentChange.toFixed(1)}%`, 
        supplier.performance.percentChange >= 0 ? 'up' : 'down'],
      ['Target Achievement', 
        supplier.performance.targetAchievement ? `${supplier.performance.targetAchievement.toFixed(1)}%` : 'N/A',
        supplier.performance.targetAchievement && supplier.performance.targetAchievement >= 100 ? 'check' : 'info']
    ]

    autoTable(doc, {
      body: performanceData,
      startY: yPos,
      theme: 'plain',
      styles: { 
        fontSize: 10,
        cellPadding: 4
      },
      columnStyles: {
        0: { 
          fontStyle: 'bold',
          cellWidth: 80,
          fillColor: [245, 245, 245]
        },
        1: { 
          cellWidth: 60,
          halign: 'right'
        }
      },
      didDrawCell: (data) => {
        if (data.column.index === 1 && performanceData[data.row.index]) {
          const icon = performanceData[data.row.index][2] as 'up' | 'down' | 'warning' | 'info' | 'check'
          drawIcon(icon, data.cell.x + data.cell.width + 2, data.cell.y + 2)
        }
      }
    })

    yPos = (doc.lastAutoTable?.finalY || yPos) + 15

    // Product Performance with Chart
    yPos = addSectionTitle('Product Performance', yPos)

    // Add bar chart for top products
    const topProducts = [...supplier.products]
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)
      .map(p => ({ label: p.name.slice(0, 6), value: p.sales }))
    
    drawBarChart(topProducts, margin, yPos + 40, 100, 40)
    yPos += 50

    // Inventory Status with Visual Indicators
    yPos = addSectionTitle('Inventory Status', yPos)

    // Summary metrics in a grid layout with icons
    const inventoryMetrics = [
      [
        { 
          title: 'Total Stock Value',
          value: formatCurrency(supplier.performance.inventoryMetrics.totalStockValue),
          icon: 'info'
        },
        {
          title: 'Average Turnover Rate',
          value: supplier.performance.inventoryMetrics.averageTurnoverRate.toFixed(2),
          icon: supplier.performance.inventoryMetrics.averageTurnoverRate > 3 ? 'check' : 'info'
        }
      ],
      [
        {
          title: 'Low Stock Items',
          value: supplier.performance.inventoryMetrics.lowStockCount.toString(),
          icon: supplier.performance.inventoryMetrics.lowStockCount > 0 ? 'warning' : 'check',
          alert: supplier.performance.inventoryMetrics.lowStockCount > 0
        },
        {
          title: 'Overstock Items',
          value: supplier.performance.inventoryMetrics.overstockCount.toString(),
          icon: supplier.performance.inventoryMetrics.overstockCount > 0 ? 'warning' : 'check',
          alert: supplier.performance.inventoryMetrics.overstockCount > 0
        }
      ]
    ]

    // Create a custom grid for inventory metrics with icons
    inventoryMetrics.forEach((row, rowIndex) => {
      row.forEach((metric, colIndex) => {
        const xPos = margin + (colIndex * ((pageWidth - 2 * margin) / 2))
        const metricYPos = yPos + (rowIndex * 25)
        
        // Add background
        doc.setFillColor(245, 245, 245)
        doc.rect(xPos, metricYPos, (pageWidth - 2 * margin) / 2 - 5, 20, 'F')
        
        // Add icon
        drawIcon(metric.icon as 'up' | 'down' | 'warning' | 'info' | 'check', xPos + 5, metricYPos + 5)
        
        // Add title
        doc.setFontSize(8)
        doc.setTextColor(100, 100, 100)
        doc.text(metric.title, xPos + 15, metricYPos + 7)
        
        // Add value
        doc.setFontSize(12)
        doc.setTextColor(metric.alert ? 200 : 0, 0, 0)
        doc.text(metric.value, xPos + 15, metricYPos + 17)
      })
    })

    yPos += 60

    // Stock Level Details
    const stockData = supplier.products.map(product => [
      product.name,
      product.sku,
      product.stock.toString(),
      product.status
    ])

    autoTable(doc, {
      head: [['Product', 'SKU', 'Current Stock', 'Status']],
      body: stockData,
      startY: yPos,
      theme: 'grid',
      headStyles: { 
        fillColor: [rgb.r, rgb.g, rgb.b],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 8,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25, halign: 'right' },
        3: { cellWidth: 30 }
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    })

    // Add a new page if there are more suppliers
    if (suppliers.indexOf(supplier) < suppliers.length - 1) {
      doc.addPage()
      yPos = margin
    }
  }

  // Add footer with page numbers
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    
    // Add footer line
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15)
    
    // Add footer text
    const footerText = `Generated on ${format(new Date(), 'MMM dd, yyyy')} by ${mergedSettings.preparedBy}`
    doc.text(footerText, margin, pageHeight - 10)
    
    // Add page numbers
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10)
  }

  return doc
}