// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
import React, { createContext, useContext, useState } from 'react';
import type { Product } from '@/features/products/types';

export interface CartItem {
  product: Product;
  quantity: number;
  price: number;
  discount?: number;
  notes?: string;
}

export interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, notes?: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyDiscount: (productId: string, discount: number) => Promise<void>;
  addNotes: (productId: string, notes: string) => Promise<void>;
  subtotal: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const calculateSubtotal = (cartItems: CartItem[]): number => {
    return cartItems.reduce((sum, item) => {
      const itemPrice = item.price * item.quantity;
      const discountAmount = item.discount ? (itemPrice * item.discount / 100) : 0;
      return sum + (itemPrice - discountAmount);
    }, 0);
  };

  const calculateTotal = (cartItems: CartItem[]): number => {
    // In a real app, you would add tax, shipping, etc.
    return calculateSubtotal(cartItems);
  };

  const addToCart = async (product: Product, quantity: number, notes?: string): Promise<void> => {
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.product.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
          notes: notes || updatedItems[existingItemIndex].notes
        };
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, {
          product,
          quantity,
          price: product.retailPrice,
          notes
        }];
      }
    });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
  };

  const updateQuantity = async (productId: string, quantity: number): Promise<void> => {
    if (quantity <= 0) {
      return removeItem(productId);
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.product.id === productId 
          ? { ...item, quantity } 
          : item
      )
    );
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
  };

  const removeItem = async (productId: string): Promise<void> => {
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
  };

  const clearCart = async (): Promise<void> => {
    setItems([]);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
  };

  const applyDiscount = async (productId: string, discount: number): Promise<void> => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.product.id === productId 
          ? { ...item, discount } 
          : item
      )
    );
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
  };

  const addNotes = async (productId: string, notes: string): Promise<void> => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.product.id === productId 
          ? { ...item, notes } 
          : item
      )
    );
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
  };

  const subtotal = calculateSubtotal(items);
  const total = calculateTotal(items);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      applyDiscount,
      addNotes,
      subtotal,
      total,
      itemCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    console.warn("useCart must be used within a CartProvider");
  }
  return context;
}
