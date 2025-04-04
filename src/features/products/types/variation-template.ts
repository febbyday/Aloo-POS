import { ProductAttribute } from './unified-product.types';

/**
 * Represents a template for product variations that can be reused across products
 */
export interface VariationTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'clothing' | 'electronics' | 'food' | 'general' | 'custom';
  attributes: ProductAttribute[];
  pricingStrategy: 'fixed' | 'increment' | 'percentage';
  pricingValue: number;
  generateSKUs: boolean;
  generateBarcodes: boolean;
  stockStrategy: 'distribute' | 'duplicate' | 'zero';
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  lastUsed?: string;
}

/**
 * Data required to create a new variation template
 */
export interface VariationTemplateFormData {
  name: string;
  description?: string;
  category: 'clothing' | 'electronics' | 'food' | 'general' | 'custom';
  attributes: ProductAttribute[];
  pricingStrategy: 'fixed' | 'increment' | 'percentage';
  pricingValue: number;
  generateSKUs: boolean;
  generateBarcodes: boolean;
  stockStrategy: 'distribute' | 'duplicate' | 'zero';
  isDefault?: boolean;
}

/**
 * Filter options for variation templates
 */
export interface VariationTemplateFilter {
  search?: string;
  category?: 'clothing' | 'electronics' | 'food' | 'general' | 'custom' | 'all';
}

/**
 * Sort options for variation templates
 */
export interface VariationTemplateSort {
  field: 'name' | 'category' | 'createdAt' | 'updatedAt' | 'usageCount' | 'lastUsed';
  direction: 'asc' | 'desc';
}

/**
 * Predefined variation templates for common product types
 */
export const PREDEFINED_VARIATION_TEMPLATES: VariationTemplateFormData[] = [
  {
    name: 'Clothing - Size & Color',
    description: 'Standard template for clothing items with size and color variations',
    category: 'clothing',
    attributes: [
      {
        id: 'size',
        name: 'Size',
        options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        isVisibleOnProductPage: true,
        isUsedForVariations: true,
      },
      {
        id: 'color',
        name: 'Color',
        options: ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow'],
        isVisibleOnProductPage: true,
        isUsedForVariations: true,
      }
    ],
    pricingStrategy: 'fixed',
    pricingValue: 0,
    generateSKUs: true,
    generateBarcodes: true,
    stockStrategy: 'duplicate',
  },
  {
    name: 'Electronics - Storage & Color',
    description: 'Template for electronic devices with storage capacity and color options',
    category: 'electronics',
    attributes: [
      {
        id: 'storage',
        name: 'Storage',
        options: ['64GB', '128GB', '256GB', '512GB', '1TB'],
        isVisibleOnProductPage: true,
        isUsedForVariations: true,
      },
      {
        id: 'color',
        name: 'Color',
        options: ['Black', 'White', 'Silver', 'Gold', 'Blue'],
        isVisibleOnProductPage: true,
        isUsedForVariations: true,
      }
    ],
    pricingStrategy: 'increment',
    pricingValue: 50,
    generateSKUs: true,
    generateBarcodes: true,
    stockStrategy: 'distribute',
  },
  {
    name: 'Food - Size & Options',
    description: 'Template for food items with size and customization options',
    category: 'food',
    attributes: [
      {
        id: 'size',
        name: 'Size',
        options: ['Small', 'Medium', 'Large'],
        isVisibleOnProductPage: true,
        isUsedForVariations: true,
      },
      {
        id: 'options',
        name: 'Options',
        options: ['Regular', 'No Sugar', 'Extra Spicy', 'Vegetarian'],
        isVisibleOnProductPage: true,
        isUsedForVariations: true,
      }
    ],
    pricingStrategy: 'percentage',
    pricingValue: 15,
    generateSKUs: true,
    generateBarcodes: false,
    stockStrategy: 'zero',
  },
  {
    name: 'General - Size Only',
    description: 'Simple template with only size variations',
    category: 'general',
    attributes: [
      {
        id: 'size',
        name: 'Size',
        options: ['Small', 'Medium', 'Large'],
        isVisibleOnProductPage: true,
        isUsedForVariations: true,
      }
    ],
    pricingStrategy: 'fixed',
    pricingValue: 0,
    generateSKUs: true,
    generateBarcodes: false,
    stockStrategy: 'duplicate',
  }
];
