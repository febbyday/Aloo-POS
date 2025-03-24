import { Alert } from "../types"

export const exportToPdf = (alerts: Alert[]) => {
  // TODO: Implement PDF export using a library like jsPDF
  const data = formatAlertsForExport(alerts)
  console.log('Exporting alerts to PDF:', data)
}

export const exportToExcel = (alerts: Alert[]) => {
  // TODO: Implement Excel export using a library like xlsx
  const data = formatAlertsForExport(alerts)
  console.log('Exporting alerts to Excel:', data)
}

export const exportToCsv = (alerts: Alert[]) => {
  const data = formatAlertsForExport(alerts)
  const headers = [
    'Product',
    'Store',
    'Type',
    'Current Stock',
    'Min Stock',
    'Status',
    'Created At',
    'Resolved At',
    'Notes'
  ]

  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      [
        row.productName,
        row.storeName,
        row.type,
        row.currentStock,
        row.minStock,
        row.status,
        row.createdAt,
        row.resolvedAt || '',
        row.notes || ''
      ].map(cell => `"${cell}"`).join(',')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `stock_alerts_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const printAlerts = (alerts: Alert[]) => {
  const data = formatAlertsForExport(alerts)
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Stock Alerts</title>
        <style>
          body { font-family: system-ui, sans-serif; }
          table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
          th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
          th { background-color: #f5f5f5; }
          .alert-header { margin-bottom: 1rem; }
          .alert-date { color: #666; }
        </style>
      </head>
      <body>
        <div class="alert-header">
          <h1>Stock Alerts</h1>
          <p class="alert-date">Generated on: ${new Date().toLocaleString()}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Store</th>
              <th>Type</th>
              <th>Current Stock</th>
              <th>Min Stock</th>
              <th>Status</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(alert => `
              <tr>
                <td>${alert.productName}</td>
                <td>${alert.storeName}</td>
                <td>${alert.type}</td>
                <td>${alert.currentStock}</td>
                <td>${alert.minStock}</td>
                <td>${alert.status}</td>
                <td>${new Date(alert.createdAt).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.print()
}

// Helper function to format alerts data for export
function formatAlertsForExport(alerts: Alert[]) {
  return alerts.map(alert => ({
    ...alert,
    type: alert.type === 'out_of_stock' ? 'Out of Stock' : 'Low Stock',
    createdAt: new Date(alert.createdAt).toLocaleString(),
    resolvedAt: alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleString() : '',
    status: alert.status.charAt(0).toUpperCase() + alert.status.slice(1)
  }))
}
