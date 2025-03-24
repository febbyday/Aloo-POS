import React, { createContext, useContext, useState } from 'react';
import type { Product, Category, PriceHistory, SpecialPrice, CustomerGroup, BulkPriceUpdate } from '../types';
import { getSampleProductImages } from '../data/sampleProductImages';

// Mock data - replace with actual API call
const initialProducts: Product[] = [
  {
    id: '1',
    name: 'CURVED WOOD ONE (45) - MAN',
    category: 'Audio',
    description: 'Professional curved wood audio console',
    sku: 'AUD-CURV-45M',
    barcode: '200123456789',
    costPrice: 55.00,
    retailPrice: 75.00,
    supplier: {
      id: 'sup1',
      name: 'Audio Supplies Co.'
    },
    minStock: 5,
    maxStock: 20,
    locations: [
      {
        locationId: 'loc1',
        stock: 10,
        minStock: 5,
        maxStock: 15
      }
    ],
    variants: [],
    createdAt: '2024-01-15',
    updatedAt: '2024-02-17',
    images: getSampleProductImages('electronics', 4),
    status: 'active'
  },
  {
    id: '2',
    name: 'CURVED WOOD TWO FACE MAN',
    category: 'Audio',
    description: 'Dual-sided curved wood audio console',
    sku: 'AUD-CURV-2FM',
    barcode: '200987654321',
    costPrice: 45.00,
    retailPrice: 65.00,
    supplier: {
      id: 'sup1',
      name: 'Audio Supplies Co.'
    },
    minStock: 5,
    maxStock: 15,
    locations: [
      {
        locationId: 'loc1',
        stock: 5,
        minStock: 5,
        maxStock: 10
      }
    ],
    variants: [],
    createdAt: '2024-01-20',
    updatedAt: '2024-02-17',
    images: getSampleProductImages('electronics', 3),
    status: 'active'
  },
  {
    id: '3',
    name: 'PREMIUM HEADPHONES',
    category: 'Audio',
    description: 'High-end professional headphones',
    sku: 'AUD-HEAD-PRE',
    barcode: '200987654322',
    costPrice: 85.00,
    retailPrice: 129.99,
    supplier: {
      id: 'sup1',
      name: 'Audio Supplies Co.'
    },
    minStock: 10,
    maxStock: 30,
    locations: [
      {
        locationId: 'loc1',
        stock: 3,
        minStock: 10,
        maxStock: 20
      }
    ],
    variants: [],
    createdAt: '2024-01-25',
    updatedAt: '2024-02-17',
    images: getSampleProductImages('electronics', 2),
    status: 'active'
  }
];

const initialCategories: Category[] = [
  {
    id: '1',
    name: 'Audio',
    description: 'Audio equipment and accessories'
  },
  {
    id: '2',
    name: 'Video',
    description: 'Video equipment and accessories'
  },
  {
    id: '3',
    name: 'Lighting',
    description: 'Lighting equipment and accessories'
  }
];

interface ProductContextType {
  products: Product[];
  categories: Category[];
  priceHistory: PriceHistory[];
  specialPrices: SpecialPrice[];
  customerGroups: CustomerGroup[];
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
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [specialPrices, setSpecialPrices] = useState<SpecialPrice[]>([]);
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([]);

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
          reason: update.reason,
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

  const value = {
    products,
    categories,
    priceHistory,
    specialPrices,
    customerGroups,
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
