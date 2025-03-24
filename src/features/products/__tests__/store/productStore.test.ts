/**
 * Product Store Tests
 * 
 * This file contains tests for the product store functionality.
 */

import { useProductStore } from '../../store';
import { UnifiedProduct } from '../../types/unified-product.types';
import { selectProductById, selectAllProducts, selectFilteredProducts } from '../../store/selectors';

// Reset the store before each test
beforeEach(() => {
  const { resetState } = useProductStore.getState();
  resetState();
});

describe('Product Store', () => {
  describe('Product Actions', () => {
    it('should add a product to the store', () => {
      // Arrange
      const { addProduct } = useProductStore.getState();
      const product: UnifiedProduct = {
        id: '1',
        name: 'Test Product',
        description: 'Test Description',
        shortDescription: 'Test Short Description',
        category: 'Test Category',
        productType: 'simple',
        status: 'active',
        retailPrice: 19.99,
        stock: 10,
        minStock: 5,
        maxStock: 20,
        sku: 'TEST-001',
        barcode: '123456789',
        manageStock: true,
        stockStatus: 'in_stock',
        featured: false,
        onSale: false,
        tags: ['test'],
        images: [],
        variants: [],
      };

      // Act
      addProduct(product);

      // Assert
      const state = useProductStore.getState();
      expect(state.products['1']).toEqual(product);
      expect(state.productIds).toContain('1');
    });

    it('should update a product in the store', () => {
      // Arrange
      const { addProduct, updateProduct } = useProductStore.getState();
      const product: UnifiedProduct = {
        id: '1',
        name: 'Test Product',
        description: 'Test Description',
        shortDescription: 'Test Short Description',
        category: 'Test Category',
        productType: 'simple',
        status: 'active',
        retailPrice: 19.99,
        stock: 10,
        minStock: 5,
        maxStock: 20,
        sku: 'TEST-001',
        barcode: '123456789',
        manageStock: true,
        stockStatus: 'in_stock',
        featured: false,
        onSale: false,
        tags: ['test'],
        images: [],
        variants: [],
      };
      addProduct(product);

      // Act
      updateProduct('1', { name: 'Updated Product', retailPrice: 29.99 });

      // Assert
      const state = useProductStore.getState();
      expect(state.products['1'].name).toBe('Updated Product');
      expect(state.products['1'].retailPrice).toBe(29.99);
    });

    it('should remove a product from the store', () => {
      // Arrange
      const { addProduct, removeProduct } = useProductStore.getState();
      const product: UnifiedProduct = {
        id: '1',
        name: 'Test Product',
        description: 'Test Description',
        shortDescription: 'Test Short Description',
        category: 'Test Category',
        productType: 'simple',
        status: 'active',
        retailPrice: 19.99,
        stock: 10,
        minStock: 5,
        maxStock: 20,
        sku: 'TEST-001',
        barcode: '123456789',
        manageStock: true,
        stockStatus: 'in_stock',
        featured: false,
        onSale: false,
        tags: ['test'],
        images: [],
        variants: [],
      };
      addProduct(product);

      // Act
      removeProduct('1');

      // Assert
      const state = useProductStore.getState();
      expect(state.products['1']).toBeUndefined();
      expect(state.productIds).not.toContain('1');
    });

    it('should fetch products and add them to the store', async () => {
      // Arrange
      const { fetchProducts } = useProductStore.getState();
      
      // Mock the API response
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue([
          {
            id: '1',
            name: 'Test Product 1',
            description: 'Test Description 1',
            retailPrice: 19.99,
            // ... other fields
          },
          {
            id: '2',
            name: 'Test Product 2',
            description: 'Test Description 2',
            retailPrice: 29.99,
            // ... other fields
          },
        ]),
      });

      // Act
      await fetchProducts();

      // Assert
      const state = useProductStore.getState();
      expect(Object.keys(state.products).length).toBe(2);
      expect(state.productIds).toContain('1');
      expect(state.productIds).toContain('2');
      expect(state.loading).toBe(false);
    });

    it('should handle fetch errors', async () => {
      // Arrange
      const { fetchProducts } = useProductStore.getState();
      
      // Mock the API response
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      // Act
      await fetchProducts();

      // Assert
      const state = useProductStore.getState();
      expect(state.error).toBe('Failed to fetch products: Network error');
      expect(state.loading).toBe(false);
    });
  });

  describe('Product Selectors', () => {
    it('should select a product by ID', () => {
      // Arrange
      const { addProduct } = useProductStore.getState();
      const product: UnifiedProduct = {
        id: '1',
        name: 'Test Product',
        description: 'Test Description',
        shortDescription: 'Test Short Description',
        category: 'Test Category',
        productType: 'simple',
        status: 'active',
        retailPrice: 19.99,
        stock: 10,
        minStock: 5,
        maxStock: 20,
        sku: 'TEST-001',
        barcode: '123456789',
        manageStock: true,
        stockStatus: 'in_stock',
        featured: false,
        onSale: false,
        tags: ['test'],
        images: [],
        variants: [],
      };
      addProduct(product);

      // Act
      const selectedProduct = selectProductById(useProductStore.getState(), '1');

      // Assert
      expect(selectedProduct).toEqual(product);
    });

    it('should select all products', () => {
      // Arrange
      const { addProduct } = useProductStore.getState();
      const product1: UnifiedProduct = {
        id: '1',
        name: 'Test Product 1',
        description: 'Test Description 1',
        shortDescription: 'Test Short Description 1',
        category: 'Test Category',
        productType: 'simple',
        status: 'active',
        retailPrice: 19.99,
        stock: 10,
        minStock: 5,
        maxStock: 20,
        sku: 'TEST-001',
        barcode: '123456789',
        manageStock: true,
        stockStatus: 'in_stock',
        featured: false,
        onSale: false,
        tags: ['test'],
        images: [],
        variants: [],
      };
      const product2: UnifiedProduct = {
        id: '2',
        name: 'Test Product 2',
        description: 'Test Description 2',
        shortDescription: 'Test Short Description 2',
        category: 'Test Category',
        productType: 'simple',
        status: 'active',
        retailPrice: 29.99,
        stock: 20,
        minStock: 10,
        maxStock: 30,
        sku: 'TEST-002',
        barcode: '987654321',
        manageStock: true,
        stockStatus: 'in_stock',
        featured: false,
        onSale: false,
        tags: ['test'],
        images: [],
        variants: [],
      };
      addProduct(product1);
      addProduct(product2);

      // Act
      const allProducts = selectAllProducts(useProductStore.getState());

      // Assert
      expect(allProducts.length).toBe(2);
      expect(allProducts).toContainEqual(product1);
      expect(allProducts).toContainEqual(product2);
    });

    it('should select filtered products', () => {
      // Arrange
      const { addProduct, setFilters } = useProductStore.getState();
      const product1: UnifiedProduct = {
        id: '1',
        name: 'Test Product 1',
        description: 'Test Description 1',
        shortDescription: 'Test Short Description 1',
        category: 'Category A',
        productType: 'simple',
        status: 'active',
        retailPrice: 19.99,
        stock: 10,
        minStock: 5,
        maxStock: 20,
        sku: 'TEST-001',
        barcode: '123456789',
        manageStock: true,
        stockStatus: 'in_stock',
        featured: false,
        onSale: false,
        tags: ['test'],
        images: [],
        variants: [],
      };
      const product2: UnifiedProduct = {
        id: '2',
        name: 'Test Product 2',
        description: 'Test Description 2',
        shortDescription: 'Test Short Description 2',
        category: 'Category B',
        productType: 'simple',
        status: 'active',
        retailPrice: 29.99,
        stock: 20,
        minStock: 10,
        maxStock: 30,
        sku: 'TEST-002',
        barcode: '987654321',
        manageStock: true,
        stockStatus: 'in_stock',
        featured: false,
        onSale: false,
        tags: ['test'],
        images: [],
        variants: [],
      };
      addProduct(product1);
      addProduct(product2);

      // Act
      setFilters({ category: 'Category A' });
      const filteredProducts = selectFilteredProducts(useProductStore.getState());

      // Assert
      expect(filteredProducts.length).toBe(1);
      expect(filteredProducts[0]).toEqual(product1);
    });
  });

  describe('Filter Actions', () => {
    it('should set filters', () => {
      // Arrange
      const { setFilters } = useProductStore.getState();
      
      // Act
      setFilters({ category: 'Test Category', search: 'test' });
      
      // Assert
      const state = useProductStore.getState();
      expect(state.filters.category).toBe('Test Category');
      expect(state.filters.search).toBe('test');
    });

    it('should clear filters', () => {
      // Arrange
      const { setFilters, clearFilters } = useProductStore.getState();
      setFilters({ category: 'Test Category', search: 'test' });
      
      // Act
      clearFilters();
      
      // Assert
      const state = useProductStore.getState();
      expect(state.filters.category).toBeUndefined();
      expect(state.filters.search).toBeUndefined();
    });
  });

  describe('UI State Actions', () => {
    it('should set the selected product ID', () => {
      // Arrange
      const { setSelectedProductId } = useProductStore.getState();
      
      // Act
      setSelectedProductId('1');
      
      // Assert
      const state = useProductStore.getState();
      expect(state.ui.selectedProductId).toBe('1');
    });

    it('should set the view mode', () => {
      // Arrange
      const { setViewMode } = useProductStore.getState();
      
      // Act
      setViewMode('grid');
      
      // Assert
      const state = useProductStore.getState();
      expect(state.ui.viewMode).toBe('grid');
    });
  });
}); 