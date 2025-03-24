import jsPDF from 'jspdf'
import { format } from 'date-fns'
import { Repair } from '@/features/repairs/types'

interface CompanyInfo {
  name: string
  address: string
  phone: string
  email: string
  website?: string
  logo?: string
  taxId?: string
}

export async function generateRepairInvoicePDF(repair: Repair, companyInfo: CompanyInfo): Promise<Blob> {
  const doc = new jsPDF()
  
  // Helper functions
  const addText = (text: string, x: number, y: number, options: any = {}) => {
    const { fontSize = 12, align = 'left', font = 'helvetica' } = options
    doc.setFontSize(fontSize)
    doc.setFont(font)
    doc.text(text, x, y, { align })
  }

  const addLine = (startX: number, startY: number, endX: number, endY: number) => {
    doc.line(startX, startY, endX, endY)
  }

  // Add company logo if provided
  if (companyInfo.logo) {
    try {
      const img = new Image()
      img.src = companyInfo.logo
      await new Promise((resolve) => {
        img.onload = resolve
      })
      doc.addImage(img, 'PNG', 20, 20, 40, 40)
    } catch (error) {
      console.error('Failed to load company logo:', error)
    }
  }

  // Company Info
  addText(companyInfo.name, 20, 30, { fontSize: 20, font: 'helvetica-bold' })
  addText(companyInfo.address, 20, 40)
  addText(companyInfo.phone, 20, 45)
  addText(companyInfo.email, 20, 50)
  if (companyInfo.website) {
    addText(companyInfo.website, 20, 55)
  }

  // Invoice Header
  addText('INVOICE', 170, 30, { fontSize: 16, font: 'helvetica-bold', align: 'right' })
  addText(`Date: ${format(new Date(), 'PPP')}`, 170, 40, { align: 'right' })
  addText(`Invoice #: ${repair.ticketNumber}`, 170, 45, { align: 'right' })
  if (companyInfo.taxId) {
    addText(`Tax ID: ${companyInfo.taxId}`, 170, 50, { align: 'right' })
  }

  // Separator
  addLine(20, 65, 190, 65)

  // Customer Info
  addText('Bill To:', 20, 80, { fontSize: 12, font: 'helvetica-bold' })
  addText(repair.customerName, 20, 90)
  addText(repair.customerPhone, 20, 95)
  if (repair.customerEmail) {
    addText(repair.customerEmail, 20, 100)
  }

  // Repair Details
  addText('Repair Details:', 120, 80, { fontSize: 12, font: 'helvetica-bold' })
  addText(`Product: ${repair.productType}`, 120, 90)
  addText(`Status: ${repair.status}`, 120, 95)
  addText(`Created: ${format(repair.createdAt, 'PPP')}`, 120, 100)
  if (repair.completedAt) {
    addText(`Completed: ${format(repair.completedAt, 'PPP')}`, 120, 105)
  }

  // Items Table
  let yPos = 120
  
  // Table Header
  addText('Description', 20, yPos, { fontSize: 10, font: 'helvetica-bold' })
  addText('Qty', 130, yPos, { fontSize: 10, font: 'helvetica-bold', align: 'right' })
  addText('Price', 150, yPos, { fontSize: 10, font: 'helvetica-bold', align: 'right' })
  addText('Amount', 190, yPos, { fontSize: 10, font: 'helvetica-bold', align: 'right' })
  
  yPos += 5
  addLine(20, yPos, 190, yPos)
  yPos += 10

  // Table Items
  repair.items.forEach((item) => {
    addText(item.name, 20, yPos, { fontSize: 10 })
    if (item.description) {
      yPos += 5
      addText(item.description, 20, yPos, { fontSize: 8 })
    }
    addText(item.quantity.toString(), 130, yPos, { fontSize: 10, align: 'right' })
    addText(`$${item.unitPrice.toFixed(2)}`, 150, yPos, { fontSize: 10, align: 'right' })
    addText(`$${(item.quantity * item.unitPrice).toFixed(2)}`, 190, yPos, { fontSize: 10, align: 'right' })
    yPos += 10
  })

  // Calculate totals
  const subtotal = repair.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const balanceDue = subtotal - repair.depositAmount

  // Summary
  yPos += 5
  addLine(20, yPos, 190, yPos)
  yPos += 10

  addText('Subtotal:', 150, yPos, { fontSize: 10, font: 'helvetica-bold' })
  addText(`$${subtotal.toFixed(2)}`, 190, yPos, { fontSize: 10, align: 'right' })
  yPos += 5

  addText('Deposit Paid:', 150, yPos, { fontSize: 10, font: 'helvetica-bold' })
  addText(`$${repair.depositAmount.toFixed(2)}`, 190, yPos, { fontSize: 10, align: 'right' })
  yPos += 5

  addText('Balance Due:', 150, yPos, { fontSize: 10, font: 'helvetica-bold' })
  addText(`$${balanceDue.toFixed(2)}`, 190, yPos, { fontSize: 10, align: 'right' })

  // Notes
  yPos += 20
  addText('Repair Notes:', 20, yPos, { fontSize: 10, font: 'helvetica-bold' })
  yPos += 5
  addText(repair.issueDescription, 20, yPos, { fontSize: 8 })
  if (repair.additionalNotes) {
    yPos += 5
    addText(repair.additionalNotes, 20, yPos, { fontSize: 8 })
  }

  // Terms & Conditions
  yPos += 15
  addText('Terms & Conditions:', 20, yPos, { fontSize: 10, font: 'helvetica-bold' })
  yPos += 5
  addText('• Payment is due upon completion of repair', 20, yPos, { fontSize: 8 })
  yPos += 5
  addText('• Warranty claims must be made within 30 days of repair', 20, yPos, { fontSize: 8 })
  yPos += 5
  addText('• Items left over 90 days will be considered abandoned', 20, yPos, { fontSize: 8 })

  // Footer
  yPos = 280
  addText('Thank you for your business!', 105, yPos, { fontSize: 10, align: 'center' })
  if (companyInfo.website) {
    yPos += 5
    addText(`Visit us at: ${companyInfo.website}`, 105, yPos, { fontSize: 8, align: 'center' })
  }

  return doc.output('blob')
}
