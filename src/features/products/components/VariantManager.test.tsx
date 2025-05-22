import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VariantManager } from './VariantManager'
import { ProductVariant } from '../types'

// Mock the utility functions
jest.mock('../utils/productUtils', () => ({
  generateVariantSKU: jest.fn().mockImplementation((sku, size, color) => {
    return `${sku}-${size || ''}-${color || ''}`.replace(/--/g, '-')
  })
}))

jest.mock('../utils/barcodeValidation', () => ({
  generateBarcode: jest.fn().mockReturnValue('123456789012')
}))

describe('VariantManager', () => {
  // Test data
  const productSku = 'TEST-SKU'
  const mockVariants: ProductVariant[] = [
    {
      id: '1',
      productId: 'product-1',
      sku: 'TEST-SKU-L-RED',
      barcode: '123456789001',
      size: 'L',
      color: 'Red',
      costPrice: 10,
      retailPrice: 19.99,
      stock: 5,
      isActive: true
    }
  ]
  
  const mockOnVariantsChange = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
  })
  
  it('renders correctly with existing variants', () => {
    render(
      <VariantManager
        productSku={productSku}
        variants={mockVariants}
        onVariantsChange={mockOnVariantsChange}
      />
    )
    
    // Check if the component renders with the correct tabs
    expect(screen.getByRole('tab', { name: /manual entry/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /bulk generate/i })).toBeInTheDocument()
    
    // Check if the existing variant is displayed
    expect(screen.getByDisplayValue('TEST-SKU-L-RED')).toBeInTheDocument()
    expect(screen.getByDisplayValue('L')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Red')).toBeInTheDocument()
    expect(screen.getByDisplayValue('19.99')).toBeInTheDocument()
    expect(screen.getByDisplayValue('5')).toBeInTheDocument()
  })
  
  it('allows adding a new variant manually', async () => {
    const user = userEvent.setup()
    
    render(
      <VariantManager
        productSku={productSku}
        variants={[]}
        onVariantsChange={mockOnVariantsChange}
      />
    )
    
    // Click the "Add Variant" button
    await user.click(screen.getByRole('button', { name: /add variant/i }))
    
    // Check if a new variant row is added
    const skuInput = screen.getByDisplayValue(productSku)
    expect(skuInput).toBeInTheDocument()
    
    // Fill in the variant details
    await user.clear(skuInput)
    await user.type(skuInput, 'TEST-SKU-XL-BLUE')
    
    const sizeInput = screen.getByPlaceholderText('Size')
    await user.type(sizeInput, 'XL')
    
    const colorInput = screen.getByPlaceholderText('Color')
    await user.type(colorInput, 'Blue')
    
    const priceInput = screen.getByDisplayValue('0')
    await user.clear(priceInput)
    await user.type(priceInput, '29.99')
    
    // Save the variants
    await user.click(screen.getByRole('button', { name: /save variants/i }))
    
    // Check if onVariantsChange was called with the correct data
    expect(mockOnVariantsChange).toHaveBeenCalledTimes(1)
    expect(mockOnVariantsChange).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({
        sku: 'TEST-SKU-XL-BLUE',
        size: 'XL',
        color: 'Blue',
        retailPrice: 29.99
      })
    ]))
  })
  
  it('allows removing a variant', async () => {
    const user = userEvent.setup()
    
    render(
      <VariantManager
        productSku={productSku}
        variants={mockVariants}
        onVariantsChange={mockOnVariantsChange}
      />
    )
    
    // Find and click the delete button
    const deleteButton = screen.getByRole('button', { name: '' })
    await user.click(deleteButton)
    
    // Check if onVariantsChange was called with an empty array
    expect(mockOnVariantsChange).toHaveBeenCalledWith([])
  })
  
  it('switches to bulk generation tab', async () => {
    const user = userEvent.setup()
    
    render(
      <VariantManager
        productSku={productSku}
        variants={[]}
        onVariantsChange={mockOnVariantsChange}
      />
    )
    
    // Click the "Bulk Generate" tab
    await user.click(screen.getByRole('tab', { name: /bulk generate/i }))
    
    // Check if the bulk generation UI is displayed
    expect(screen.getByText(/bulk generate variants/i)).toBeInTheDocument()
    expect(screen.getByText(/this will generate all possible combinations/i)).toBeInTheDocument()
  })
  
  it('generates variants from attribute combinations', async () => {
    const user = userEvent.setup()
    
    render(
      <VariantManager
        productSku={productSku}
        variants={[]}
        onVariantsChange={mockOnVariantsChange}
      />
    )
    
    // Switch to bulk generation tab
    await user.click(screen.getByRole('tab', { name: /bulk generate/i }))
    
    // Add values to the size attribute
    const sizeInput = screen.getAllByPlaceholderText(/add size value/i)[0]
    await user.type(sizeInput, 'S')
    await user.click(screen.getAllByRole('button', { name: /add/i })[0])
    
    await user.type(sizeInput, 'M')
    await user.click(screen.getAllByRole('button', { name: /add/i })[0])
    
    // Add values to the color attribute
    const colorInput = screen.getAllByPlaceholderText(/add color value/i)[0]
    await user.type(colorInput, 'Red')
    await user.click(screen.getAllByRole('button', { name: /add/i })[1])
    
    await user.type(colorInput, 'Blue')
    await user.click(screen.getAllByRole('button', { name: /add/i })[1])
    
    // Generate variants
    await user.click(screen.getByRole('button', { name: /generate variants/i }))
    
    // Should switch back to manual tab and show 4 variants (2 sizes × 2 colors)
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /manual entry/i })).toHaveAttribute('data-state', 'active')
    })
    
    // Check if the variants were generated
    const skuInputs = screen.getAllByDisplayValue(/TEST-SKU/)
    expect(skuInputs.length).toBe(4) // 2 sizes × 2 colors = 4 variants
  })
})