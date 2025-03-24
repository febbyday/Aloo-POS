export type ExportFormat = 'csv' | 'excel' | 'pdf'

export interface ExportOptions {
  filename: string
  format: ExportFormat
  columns?: string[]
}

export function formatDataForExport(data: any[], columns: string[]) {
  return data.map(item => {
    const formattedRow: Record<string, any> = {}
    columns.forEach(col => {
      if (item[col] !== undefined) {
        // Format dates
        if (item[col] instanceof Date) {
          formattedRow[col] = item[col].toLocaleDateString()
        }
        // Format numbers
        else if (typeof item[col] === 'number') {
          formattedRow[col] = item[col].toString()
        }
        // Format other types
        else {
          formattedRow[col] = item[col]
        }
      } else {
        formattedRow[col] = ''
      }
    })
    return formattedRow
  })
}

export function exportToCSV(data: any[], options: ExportOptions) {
  const { filename, columns = Object.keys(data[0] || {}) } = options
  const formattedData = formatDataForExport(data, columns)
  
  // Create CSV header
  const header = columns.join(',')
  
  // Create CSV rows
  const rows = formattedData.map(row => 
    columns.map(col => {
      const value = row[col]?.toString() || ''
      // Escape quotes and wrap in quotes if contains comma
      return value.includes(',') ? `"${value.replace(/"/g, '""')}"` : value
    }).join(',')
  )
  
  // Combine header and rows
  const csv = [header, ...rows].join('\n')
  
  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

export async function exportToExcel(data: any[], options: ExportOptions) {
  const { filename, columns = Object.keys(data[0] || {}) } = options
  const formattedData = formatDataForExport(data, columns)
  
  try {
    // Dynamically import XLSX
    const XLSX = await import('xlsx/xlsx.mjs')
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(formattedData)
    
    // Create workbook
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    
    // Save file
    XLSX.writeFile(wb, `${filename}.xlsx`)
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    throw new Error('Failed to export to Excel. Please try again.')
  }
}

export async function exportToPDF(data: any[], options: ExportOptions) {
  const { filename, columns = Object.keys(data[0] || {}) } = options
  const formattedData = formatDataForExport(data, columns)
  
  try {
    // Dynamically import jsPDF and autotable
    const { jsPDF } = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default
    
    const doc = new jsPDF()
    
    autoTable(doc, {
      head: [columns],
      body: formattedData.map(row => columns.map(col => row[col])),
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [51, 51, 51],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
      },
    })
    
    doc.save(`${filename}.pdf`)
  } catch (error) {
    console.error('Error exporting to PDF:', error)
    throw new Error('Failed to export to PDF. Please try again.')
  }
}

export async function exportData(data: any[], options: ExportOptions) {
  const { format } = options
  
  switch (format) {
    case 'csv':
      exportToCSV(data, options)
      break
    case 'excel':
      await exportToExcel(data, options)
      break
    case 'pdf':
      await exportToPDF(data, options)
      break
    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
}
