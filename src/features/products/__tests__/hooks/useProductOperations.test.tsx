/**
 * useProductOperations Hook Tests
 * 
 * This file contains tests for the useProductOperations hook.
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useProductOperations } from '../../hooks/useProductOperations';
import { useProductStore } from '../../store';
import { productService } from '../../services/productService';

// Mock the product service
jest.mock('../../services/productService', () => ({
  productService: {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getById: jest.fn(),
    getAll: jest.fn(),
  },
}));

// Reset the store before each test
beforeEach(() => {
  const { resetState } = useProductStore.getState();
  resetState();
  jest.clearAllMocks();
});

describe('useProductOperations', () => {
  describe('createProduct', () => {
    it('should create a product and add it to the store', async () => {
      // Arrange
      const newProduct = {
        name: 'Test Product',
        description: 'Test Description',
        retailPrice: 19.99,
      };
      
      const createdProduct = {
        id: '1',
        name: 'Test Product',
        description: 'Test Description',
        retailPrice: 19.99,
        createdAt: '2023-01-01T00:00:00.000Z',
      };
      
      (productService.create as jest.Mock).mockResolvedValue(createdProduct);
      
      // Act
      const { result } = renderHook(() => useProductOperations());
      
      let returnedProduct;
      await act(async () => {
        returnedProduct = await result.current.createProduct(newProduct);
      });
      
      // Assert
      expect(productService.create).toHaveBeenCalledWith(newProduct);
      expect(returnedProduct).toEqual(createdProduct);
      
      // Verify the product was added to the store
      const state = useProductStore.getState();
      expect(state.products['1']).toEqual(createdProduct);
    });
    
    it('should handle errors when creating a product', async () => {
      // Arrange
      const newProduct = {
        name: 'Test Product',
        description: 'Test Description',
        retailPrice: 19.99,
      };
      
      const error = new Error('Failed to create product');
      (productService.create as jest.Mock).mockRejectedValue(error);
      
      // Act
      const { result } = renderHook(() => useProductOperations());
      
      // Assert
      await expect(result.current.createProduct(newProduct)).rejects.toThrow('Failed to create product');
      
      // Verify the error was set in the store
      const state = useProductStore.getState();
      expect(state.error).toBe('Failed to create product: Failed to create product');
    });
  });
  
  describe('updateProduct', () => {
    it('should update a product in the store', async () => {
      // Arrange
      const existingProduct = {
        id: '1',
        name: 'Test Product',
        description: 'Test Description',
        retailPrice: 19.99,
      };
      
      const updatedProduct = {
        id: '1',
        name: 'Updated Product',
        description: 'Updated Description',
        retailPrice: 29.99,
      };
      
      // Add the existing product to the store
      const { addProduct } = useProductStore.getState();
      addProduct(existingProduct);
      
      (productService.update as jest.Mock).mockResolvedValue(updatedProduct);
      
      // Act
      const { result } = renderHook(() => useProductOperations());
      
      let returnedProduct;
      await act(async () => {
        returnedProduct = await result.current.updateProduct('1', {
          name: 'Updated Product',
          description: 'Updated Description',
          retailPrice: 29.99,
        });
      });
      
      // Assert
      expect(productService.update).toHaveBeenCalledWith('1', {
        name: 'Updated Product',
        description: 'Updated Description',
        retailPrice: 29.99,
      });
      expect(returnedProduct).toEqual(updatedProduct);
      
      // Verify the product was updated in the store
      const state = useProductStore.getState();
      expect(state.products['1']).toEqual(updatedProduct);
    });
    
    it('should handle errors when updating a product', async () => {
      // Arrange
      const existingProduct = {
        id: '1',
        name: 'Test Product',
        description: 'Test Description',
        retailPrice: 19.99,
      };
      
      // Add the existing product to the store
      const { addProduct } = useProductStore.getState();
      addProduct(existingProduct);
      
      const error = new Error('Failed to update product');
      (productService.update as jest.Mock).mockRejectedValue(error);
      
      // Act
      const { result } = renderHook(() => useProductOperations());
      
      // Assert
      await expect(result.current.updateProduct('1', {
        name: 'Updated Product',
      })).rejects.toThrow('Failed to update product');
      
      // Verify the error was set in the store
      const state = useProductStore.getState();
      expect(state.error).toBe('Failed to update product: Failed to update product');
      
      // Verify the product was not updated in the store
      expect(state.products['1']).toEqual(existingProduct);
    });
  });
  
  describe('deleteProduct', () => {
    it('should delete a product from the store', async () => {
      // Arrange
      const existingProduct = {
        id: '1',
        name: 'Test Product',
        description: 'Test Description',
        retailPrice: 19.99,
      };
      
      // Add the existing product to the store
      const { addProduct } = useProductStore.getState();
      addProduct(existingProduct);
      
      (productService.delete as jest.Mock).mockResolvedValue({ success: true });
      
      // Act
      const { result } = renderHook(() => useProductOperations());
      
      let returnedResult;
      await act(async () => {
        returnedResult = await result.current.deleteProduct('1');
      });
      
      // Assert
      expect(productService.delete).toHaveBeenCalledWith('1');
      expect(returnedResult).toEqual({ success: true });
      
      // Verify the product was removed from the store
      const state = useProductStore.getState();
      expect(state.products['1']).toBeUndefined();
      expect(state.productIds).not.toContain('1');
    });
    
    it('should handle errors when deleting a product', async () => {
      // Arrange
      const existingProduct = {
        id: '1',
        name: 'Test Product',
        description: 'Test Description',
        retailPrice: 19.99,
      };
      
      // Add the existing product to the store
      const { addProduct } = useProductStore.getState();
      addProduct(existingProduct);
      
      const error = new Error('Failed to delete product');
      (productService.delete as jest.Mock).mockRejectedValue(error);
      
      // Act
      const { result } = renderHook(() => useProductOperations());
      
      // Assert
      await expect(result.current.deleteProduct('1')).rejects.toThrow('Failed to delete product');
      
      // Verify the error was set in the store
      const state = useProductStore.getState();
      expect(state.error).toBe('Failed to delete product: Failed to delete product');
      
      // Verify the product was not removed from the store
      expect(state.products['1']).toEqual(existingProduct);
      expect(state.productIds).toContain('1');
    });
  });
  
  describe('getProduct', () => {
    it('should get a product from the store if it exists', async () => {
      // Arrange
      const existingProduct = {
        id: '1',
        name: 'Test Product',
        description: 'Test Description',
        retailPrice: 19.99,
      };
      
      // Add the existing product to the store
      const { addProduct } = useProductStore.getState();
      addProduct(existingProduct);
      
      // Act
      const { result } = renderHook(() => useProductOperations());
      
      let returnedProduct;
      await act(async () => {
        returnedProduct = await result.current.getProduct('1');
      });
      
      // Assert
      expect(productService.getById).not.toHaveBeenCalled();
      expect(returnedProduct).toEqual(existingProduct);
    });
    
    it('should fetch a product from the API if it does not exist in the store', async () => {
      // Arrange
      const product = {
        id: '1',
        name: 'Test Product',
        description: 'Test Description',
        retailPrice: 19.99,
      };
      
      (productService.getById as jest.Mock).mockResolvedValue(product);
      
      // Act
      const { result } = renderHook(() => useProductOperations());
      
      let returnedProduct;
      await act(async () => {
        returnedProduct = await result.current.getProduct('1');
      });
      
      // Assert
      expect(productService.getById).toHaveBeenCalledWith('1');
      expect(returnedProduct).toEqual(product);
      
      // Verify the product was added to the store
      const state = useProductStore.getState();
      expect(state.products['1']).toEqual(product);
    });
    
    it('should handle errors when fetching a product', async () => {
      // Arrange
      const error = new Error('Failed to fetch product');
      (productService.getById as jest.Mock).mockRejectedValue(error);
      
      // Act
      const { result } = renderHook(() => useProductOperations());
      
      // Assert
      await expect(result.current.getProduct('1')).rejects.toThrow('Failed to fetch product');
      
      // Verify the error was set in the store
      const state = useProductStore.getState();
      expect(state.error).toBe('Failed to fetch product: Failed to fetch product');
    });
  });
}); 