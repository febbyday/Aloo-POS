import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, PriceHistory, SpecialPrice, CustomerGroup, BulkPriceUpdate } from '../types';
import { Category } from '../types/category';
import { ProductAttribute } from '../types/unified-product.types';
import { apiClient } from '@/lib/api/api-client';
import { formatErrorMessage } from '@/lib/api/utils/api-helpers';
import { categoryService } from '../services/categoryService';

// API endpoints
// Using relative paths that will be handled by the API client's prefix handling
const PRODUCTS_API_ENDPOINT = '/products';
const ATTRIBUTES_API_ENDPOINT = '/products/attributes';

interface ProductContextType {
  products: Product[];
  categories: Category[];
  priceHistory: PriceHistory[];
  specialPrices: SpecialPrice[];
  customerGroups: CustomerGroup[];
  attributes: ProductAttribute[];
  loading: boolean;
  getProduct: (id: string) => Promise<Product | null>;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Product) => void;
  deleteProduct: (id: string) => void;
  bulkUpdatePrices: (update: BulkPriceUpdate) => Promise<void>;
  addSpecialPrice: (specialPrice: Omit<SpecialPrice, 'id'>) => Promise<void>;
  updateSpecialPrice: (id: string, specialPrice: Partial<SpecialPrice>) => Promise<void>;
  deleteSpecialPrice: (id: string) => Promise<void>;
  addCustomerGroup: (group: Omit<CustomerGroup, 'id'>) => Promise<void>;
  updateCustomerGroup: (id: string, group: Partial<CustomerGroup>) => Promise<void>;
  deleteCustomerGroup: (id: string) => Promise<void>;
  saveAttributes: (attributes: ProductAttribute[]) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [specialPrices, setSpecialPrices] = useState<SpecialPrice[]>([]);
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([]);
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch products using apiClient
        const productsResponse = await apiClient.get(PRODUCTS_API_ENDPOINT);
        if (productsResponse.success) {
          setProducts(productsResponse.data || []);
        }

        // Fetch categories using dedicated categoryService
        try {
          const categoriesData = await categoryService.fetchAll();
          setCategories(categoriesData);
        } catch (categoryError) {
          console.error('Error fetching categories:', categoryError);
          // Continue with empty categories array rather than failing entirely
          setCategories([]);
        }

        // Fetch attributes using apiClient
        const attributesResponse = await apiClient.get(ATTRIBUTES_API_ENDPOINT);
        if (attributesResponse.success) {
          setAttributes(attributesResponse.data || []);
        }
      } catch (error) {
        const errorMessage = formatErrorMessage(error);
        console.error('Error fetching product data:', errorMessage, error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = (id: string, product: Product) => {
    setProducts(prev => prev.map(p => p.id === id ? product : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const bulkUpdatePrices = async (update: BulkPriceUpdate) => {
    try {
      const updatedProducts = products.map(product => {
        if (!update.productIds.includes(product.id)) return product;

        let newPrice = product.retailPrice;
        switch (update.updateType) {
          case 'fixed':
            newPrice = update.value;
            break;
          case 'percentage':
            newPrice = product.retailPrice * (1 + update.value / 100);
            break;
          case 'increase':
            newPrice = product.retailPrice + update.value;
            break;
          case 'decrease':
            newPrice = product.retailPrice - update.value;
            break;
        }

        // Add to price history
        const historyEntry: PriceHistory = {
          id: Date.now().toString(),
          productId: product.id,
          price: newPrice,
          date: new Date().toISOString(),
          reason: update.reason || 'Bulk price update', // Provide default reason if undefined
          userId: 'current-user-id' // Replace with actual user ID
        };
        setPriceHistory(prev => [...prev, historyEntry]);

        return {
          ...product,
          retailPrice: newPrice
        };
      });

      setProducts(updatedProducts);
    } catch (error) {
      console.error('Failed to update prices:', error);
      throw error;
    }
  };

  const addSpecialPrice = async (specialPrice: Omit<SpecialPrice, 'id'>) => {
    const newSpecialPrice = {
      ...specialPrice,
      id: Date.now().toString()
    };
    setSpecialPrices(prev => [...prev, newSpecialPrice]);
  };

  const updateSpecialPrice = async (id: string, specialPrice: Partial<SpecialPrice>) => {
    setSpecialPrices(prev =>
      prev.map(sp => sp.id === id ? { ...sp, ...specialPrice } : sp)
    );
  };

  const deleteSpecialPrice = async (id: string) => {
    setSpecialPrices(prev => prev.filter(sp => sp.id !== id));
  };

  const addCustomerGroup = async (group: Omit<CustomerGroup, 'id'>) => {
    const newGroup = {
      ...group,
      id: Date.now().toString()
    };
    setCustomerGroups(prev => [...prev, newGroup]);
  };

  const updateCustomerGroup = async (id: string, group: Partial<CustomerGroup>) => {
    setCustomerGroups(prev =>
      prev.map(g => g.id === id ? { ...g, ...group } : g)
    );
  };

  const deleteCustomerGroup = async (id: string) => {
    setCustomerGroups(prev => prev.filter(g => g.id !== id));
  };

  const getProduct = async (id: string): Promise<Product | null> => {
    const product = products.find(p => p.id === id);
    return product || null;
  };

  const saveAttributes = async (newAttributes: ProductAttribute[]) => {
    setLoading(true);
    try {
      // Call the API to save attributes using apiClient
      const response = await apiClient.post(ATTRIBUTES_API_ENDPOINT, newAttributes);

      if (!response.success) {
        throw new Error(`Failed to save attributes: ${response.error}`);
      }

      setAttributes(newAttributes);
      return Promise.resolve();
    } catch (error) {
      console.error('Error saving attributes:', error);
      return Promise.reject(error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    products,
    categories,
    priceHistory,
    specialPrices,
    customerGroups,
    attributes,
    loading,
    getProduct,
    addProduct,
    updateProduct,
    deleteProduct,
    bulkUpdatePrices,
    addSpecialPrice,
    updateSpecialPrice,
    deleteSpecialPrice,
    addCustomerGroup,
    updateCustomerGroup,
    deleteCustomerGroup,
    saveAttributes
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
