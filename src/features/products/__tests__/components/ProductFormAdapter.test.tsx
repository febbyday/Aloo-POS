/**
 * ProductFormAdapter Component Tests
 * 
 * This file contains tests for the ProductFormAdapter component.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductFormAdapter } from '../../components/ProductFormAdapter';
import { ProductForm } from '../../components/ProductForm';

// Mock the ProductForm component
jest.mock('../../components/ProductForm', () => ({
  ProductForm: jest.fn(({ product, onSuccess, onCancel }) => (
    <div data-testid="product-form">
      <div data-testid="product-data">{JSON.stringify(product)}</div>
      <button data-testid="submit-button" onClick={() => onSuccess(product)}>
        Submit
      </button>
      <button data-testid="cancel-button" onClick={onCancel}>
        Cancel
      </button>
    </div>
  )),
}));

describe('ProductFormAdapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the ProductForm component', () => {
    // Arrange
    const product = {
      id: '1',
      name: 'Test Product',
      description: 'Test Description',
      retailPrice: 19.99,
    };

    // Act
    render(<ProductFormAdapter product={product} />);

    // Assert
    expect(screen.getByTestId('product-form')).toBeInTheDocument();
  });

  it('should convert legacy product to unified product format', () => {
    // Arrange
    const legacyProduct = {
      id: '1',
      name: 'Test Product',
      description: 'Test Description',
      shortDescription: 'Short Description',
      category: 'Test Category',
      productType: 'simple',
      status: 'active',
      retailPrice: 19.99,
      salePrice: 14.99,
      costPrice: 9.99,
      stock: 10,
      minStock: 5,
      maxStock: 20,
      sku: 'TEST-001',
      barcode: '123456789',
      trackInventory: true,
      stockStatus: 'in_stock',
      featured: false,
      onSale: true,
      weight: 1.5,
      dimensions: { length: 10, width: 5, height: 2 },
      tags: ['test'],
      images: ['image1.jpg'],
      variants: [],
    };

    // Act
    render(<ProductFormAdapter product={legacyProduct} />);

    // Assert
    const productDataElement = screen.getByTestId('product-data');
    const unifiedProduct = JSON.parse(productDataElement.textContent || '{}');

    expect(unifiedProduct).toEqual({
      id: '1',
      name: 'Test Product',
      description: 'Test Description',
      shortDescription: 'Short Description',
      category: 'Test Category',
      productType: 'simple',
      status: 'active',
      retailPrice: 19.99,
      salePrice: 14.99,
      costPrice: 9.99,
      stock: 10,
      minStock: 5,
      maxStock: 20,
      sku: 'TEST-001',
      barcode: '123456789',
      manageStock: true,
      stockStatus: 'in_stock',
      featured: false,
      onSale: true,
      weight: 1.5,
      dimensions: { length: 10, width: 5, height: 2 },
      tags: ['test'],
      images: ['image1.jpg'],
      variants: [],
    });
  });

  it('should handle form submission and convert back to legacy format', async () => {
    // Arrange
    const legacyProduct = {
      id: '1',
      name: 'Test Product',
      description: 'Test Description',
      retailPrice: 19.99,
    };

    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const onSuccess = jest.fn();

    // Act
    render(
      <ProductFormAdapter
        product={legacyProduct}
        onSubmit={onSubmit}
        onSuccess={onSuccess}
      />
    );

    // Submit the form
    fireEvent.click(screen.getByTestId('submit-button'));

    // Assert
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });

    // Check that the product was converted back to legacy format
    const submittedProduct = onSubmit.mock.calls[0][0];
    expect(submittedProduct).toHaveProperty('id', '1');
    expect(submittedProduct).toHaveProperty('name', 'Test Product');
    expect(submittedProduct).toHaveProperty('description', 'Test Description');
    expect(submittedProduct).toHaveProperty('retailPrice', 19.99);
    expect(submittedProduct).toHaveProperty('trackInventory'); // Converted from manageStock

    // Check that onSuccess was called with the legacy product
    expect(onSuccess).toHaveBeenCalledWith(submittedProduct);
  });

  it('should handle form cancellation', () => {
    // Arrange
    const onCancel = jest.fn();

    // Act
    render(<ProductFormAdapter onCancel={onCancel} />);

    // Cancel the form
    fireEvent.click(screen.getByTestId('cancel-button'));

    // Assert
    expect(onCancel).toHaveBeenCalled();
  });

  it('should update unified product when legacy product changes', () => {
    // Arrange
    const initialProduct = {
      id: '1',
      name: 'Initial Product',
      description: 'Initial Description',
      retailPrice: 19.99,
    };

    const { rerender } = render(<ProductFormAdapter product={initialProduct} />);

    // Get the initial unified product
    const initialUnifiedProduct = JSON.parse(
      screen.getByTestId('product-data').textContent || '{}'
    );

    // Update the product
    const updatedProduct = {
      id: '1',
      name: 'Updated Product',
      description: 'Updated Description',
      retailPrice: 29.99,
    };

    // Act
    rerender(<ProductFormAdapter product={updatedProduct} />);

    // Assert
    const updatedUnifiedProduct = JSON.parse(
      screen.getByTestId('product-data').textContent || '{}'
    );

    expect(updatedUnifiedProduct).not.toEqual(initialUnifiedProduct);
    expect(updatedUnifiedProduct.name).toBe('Updated Product');
    expect(updatedUnifiedProduct.description).toBe('Updated Description');
    expect(updatedUnifiedProduct.retailPrice).toBe(29.99);
  });

  it('should handle form submission without onSubmit prop', async () => {
    // Arrange
    const product = {
      id: '1',
      name: 'Test Product',
      description: 'Test Description',
      retailPrice: 19.99,
    };

    // Act
    render(<ProductFormAdapter product={product} />);

    // Submit the form
    fireEvent.click(screen.getByTestId('submit-button'));

    // Assert - no error should be thrown
    await waitFor(() => {
      // This test passes if no error is thrown
    });
  });

  it('should pass className prop to ProductForm', () => {
    // Arrange & Act
    render(<ProductFormAdapter className="custom-class" />);

    // Assert
    expect(ProductForm).toHaveBeenCalledWith(
      expect.objectContaining({
        className: 'custom-class',
      }),
      expect.anything()
    );
  });
}); 