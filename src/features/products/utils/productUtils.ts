/**
 * Generates a SKU based on product details
 * Format: CAT-NAME-RAND
 * Example: DRS-SUMMERV-8X4
 */
export function generateSKU(category: string, name: string): string {
  const catPrefix = category.substring(0, 3).toUpperCase()
  const nameSection = name.substring(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, '')
  const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase()
  
  return `${catPrefix}-${nameSection}-${randomPart}`
}

/**
 * Generates a unique barcode (EAN-13 format)
 * Note: This is a simplified version for demo purposes
 * In production, you'd want to ensure uniqueness and proper checksum
 */
export function generateBarcode(): string {
  const prefix = "200" // Company prefix
  const middle = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')
  const barcode = prefix + middle
  
  // Calculate checksum digit (simplified)
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(barcode[i]) * (i % 2 === 0 ? 1 : 3)
  }
  const checksum = (10 - (sum % 10)) % 10
  
  return barcode + checksum
}

/**
 * Generates a variant SKU based on the parent SKU and variant details
 */
export function generateVariantSKU(parentSKU: string, size?: string, color?: string): string {
  const variantParts = [parentSKU]
  
  if (size) variantParts.push(size)
  if (color) variantParts.push(color.substring(0, 3).toUpperCase())
  
  return variantParts.join('-')
}
