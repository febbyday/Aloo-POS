import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductVariantsManager } from './ProductVariantsManager';
import type { ProductVariant, ProductVariantOption } from '../types/product.types';
import { vi } from 'vitest';

// Mock data
const mockVariantOptions: ProductVariantOption[] = [
  {
    id: 'opt_1',
    name: 'Size',
    values: ['S', 'M', 'L']
  },
  {
    id: 'opt_2',
    name: 'Color',
    values: ['Red', 'Blue']
  }
];

const mockVariants: ProductVariant[] = [
  {
    id: 'var_1',
    sku: 'SHIRT-S-RED',
    price: 29.99,
    quantity: 10,
    optionValues: ['S', 'Red'],
    isActive: true
  },
  {
    id: 'var_2',
    sku: 'SHIRT-M-BLUE',
    price: 29.99,
    quantity: 15,
    optionValues: ['M', 'Blue'],
    isActive: true
  }
];

describe('ProductVariantsManager', () => {
  const mockOnVariantsChange = vi.fn();
  const mockOnOptionsChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders variant options and variants table', () => {
    render(
      <ProductVariantsManager
        variants={mockVariants}
        variantOptions={mockVariantOptions}
        onVariantsChange={mockOnVariantsChange}
        onOptionsChange={mockOnOptionsChange}
      />
    );

    // Check if variant options are rendered
    expect(screen.getByText('Variant Options')).toBeInTheDocument();
    expect(screen.getByText('Size')).toBeInTheDocument();
    expect(screen.getByText('Color')).toBeInTheDocument();

    // Check if variants table is rendered
    expect(screen.getByText('SKU')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Quantity')).toBeInTheDocument();
  });

  it('adds a new variant option', async () => {
    render(
      <ProductVariantsManager
        variants={mockVariants}
        variantOptions={mockVariantOptions}
        onVariantsChange={mockOnVariantsChange}
        onOptionsChange={mockOnOptionsChange}
      />
    );

    // Click add option button
    fireEvent.click(screen.getByText('Add Option'));

    // Check if onOptionsChange was called with new option
    await waitFor(() => {
      expect(mockOnOptionsChange).toHaveBeenCalledWith([
        ...mockVariantOptions,
        expect.objectContaining({
          name: '',
          values: ['']
        })
      ]);
    });
  });

  it('removes a variant option', async () => {
    render(
      <ProductVariantsManager
        variants={mockVariants}
        variantOptions={mockVariantOptions}
        onVariantsChange={mockOnVariantsChange}
        onOptionsChange={mockOnOptionsChange}
      />
    );

    // Click remove button on first option
    const removeButtons = screen.getAllByRole('button', { name: /trash/i });
    fireEvent.click(removeButtons[0]);

    // Check if onOptionsChange was called with updated options
    await waitFor(() => {
      expect(mockOnOptionsChange).toHaveBeenCalledWith(
        mockVariantOptions.filter(opt => opt.id !== 'opt_1')
      );
    });
  });

  it('updates variant option name', async () => {
    render(
      <ProductVariantsManager
        variants={mockVariants}
        variantOptions={mockVariantOptions}
        onVariantsChange={mockOnVariantsChange}
        onOptionsChange={mockOnOptionsChange}
      />
    );

    // Find and update the first option name input
    const optionNameInputs = screen.getAllByPlaceholderText('e.g., Size, Color, Material');
    fireEvent.change(optionNameInputs[0], { target: { value: 'New Size' } });

    // Check if onOptionsChange was called with updated name
    await waitFor(() => {
      expect(mockOnOptionsChange).toHaveBeenCalledWith(
        mockVariantOptions.map(opt =>
          opt.id === 'opt_1' ? { ...opt, name: 'New Size' } : opt
        )
      );
    });
  });

  it('adds a new option value', async () => {
    render(
      <ProductVariantsManager
        variants={mockVariants}
        variantOptions={mockVariantOptions}
        onVariantsChange={mockOnVariantsChange}
        onOptionsChange={mockOnOptionsChange}
      />
    );

    // Click add value button for first option
    const addValueButtons = screen.getAllByText('Add Value');
    fireEvent.click(addValueButtons[0]);

    // Check if onOptionsChange was called with new value
    await waitFor(() => {
      expect(mockOnOptionsChange).toHaveBeenCalledWith(
        mockVariantOptions.map(opt =>
          opt.id === 'opt_1' ? { ...opt, values: [...opt.values, ''] } : opt
        )
      );
    });
  });

  it('updates variant data', async () => {
    render(
      <ProductVariantsManager
        variants={mockVariants}
        variantOptions={mockVariantOptions}
        onVariantsChange={mockOnVariantsChange}
        onOptionsChange={mockOnOptionsChange}
      />
    );

    // Find and update the first SKU input
    const skuInputs = screen.getAllByPlaceholderText('SKU');
    fireEvent.change(skuInputs[0], { target: { value: 'NEW-SKU' } });

    // Check if onVariantsChange was called with updated SKU
    await waitFor(() => {
      expect(mockOnVariantsChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'var_1',
            sku: 'NEW-SKU'
          })
        ])
      );
    });
  });

  it('toggles variant status', async () => {
    render(
      <ProductVariantsManager
        variants={mockVariants}
        variantOptions={mockVariantOptions}
        onVariantsChange={mockOnVariantsChange}
        onOptionsChange={mockOnOptionsChange}
      />
    );

    // Click the first status badge
    const statusBadges = screen.getAllByText('Active');
    fireEvent.click(statusBadges[0]);

    // Check if onVariantsChange was called with updated status
    await waitFor(() => {
      expect(mockOnVariantsChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'var_1',
            isActive: false
          })
        ])
      );
    });
  });
}); 