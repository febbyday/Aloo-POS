/**
 * Gift Card data models
 * Implements the core data structures for gift cards and templates
 */

// Gift card status types
export type GiftCardStatus = 'active' | 'used' | 'expired' | 'disabled';

// Gift card transaction types
export type TransactionType = 'issue' | 'redeem' | 'adjustment' | 'expire' | 'reactivate';

// Gift card data model
export interface GiftCard {
  id: string;
  code: string; // Unique code for the gift card
  initialValue: number;
  balance: number;
  expirationDate: Date | null;
  issueDate: Date;
  lastUsedDate: Date | null;
  status: GiftCardStatus;
  recipient: {
    name: string | null;
    email: string | null;
  };
  sender: {
    name: string | null;
    email: string | null;
  };
  message: string | null;
  designTemplateId: string | null;
  metadata: Record<string, any>;
}

// Transaction history for gift cards
export interface GiftCardTransaction {
  id: string;
  giftCardId: string;
  type: TransactionType;
  amount: number;
  date: Date;
  notes: string | null;
  performedBy: string; // User ID who performed the transaction
  balanceAfter: number;
  orderId?: string; // Associated order if applicable
}

// Gift card design element types
export type ElementType = 
  | 'title' 
  | 'amount' 
  | 'cardNumber' 
  | 'barcode' 
  | 'qrCode' 
  | 'text' 
  | 'image' 
  | 'terms' 
  | 'expiration' 
  | 'redemptionButton';

// Position information for design elements
export interface ElementPosition {
  x: number; // x position as percentage (0-100)
  y: number; // y position as percentage (0-100)
  width: number; // width as percentage (0-100)
  height: number; // height as percentage (0-100)
  zIndex: number; // layering order
}

// Styles for design elements
export interface ElementStyles {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  backgroundColor?: string;
  borderRadius?: string;
  padding?: string;
  opacity?: number;
  // Additional style properties
  [key: string]: any;
}

// Gift card design element
export interface DesignElement {
  id: string;
  type: ElementType;
  position: ElementPosition;
  content?: string;
  styles: ElementStyles;
  properties: Record<string, any>; // Element-specific properties
}

// Gift card design template
export interface DesignTemplate {
  id: string;
  name: string;
  description: string | null;
  category: 'occasion' | 'seasonal' | 'default';
  occasion?: string; // For occasion-based templates
  season?: string; // For seasonal templates
  isActive: boolean;
  isDefault: boolean;
  version: string;
  thumbnail: string;
  elements: DesignElement[];
  styles: {
    backgroundColor: string;
    backgroundImage?: string;
    width: number; // In pixels
    height: number; // In pixels
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID
}

// Settings for gift card customization
export interface GiftCardSettings {
  enableEmailDelivery: boolean;
  enablePrintFormat: boolean;
  enableDigitalWallet: boolean;
  defaultExpirationPeriod: number; // In days, 0 = never expires
  defaultTemplate: string; // Template ID
  codePrefix: string;
  codeLength: number;
  allowManualCodes: boolean;
} 