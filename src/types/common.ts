/**
 * Common Type Definitions
 * 
 * This file contains shared types that are used across multiple modules.
 * Centralizing these types helps eliminate duplication and maintains consistency.
 */

/**
 * Standard company information interface used throughout the application
 * 
 * This replaces the multiple CompanyInfo interfaces previously defined in:
 * - src/services/pdf/types.ts
 * - src/lib/generate-repair-invoice.ts
 * - src/lib/generate-pdf.ts
 * - src/features/suppliers/components/ReportSettingsDialog.tsx
 * - src/features/store/context/CompanyContext.tsx
 */
export interface CompanyInfo {
  /** The name of the company */
  name: string;
  
  /** The physical address of the company */
  address: string;
  
  /** The company's phone number */
  phone: string;
  
  /** The company's email address */
  email: string;
  
  /** The company's website URL */
  website: string;
  
  /** Optional URL to the company logo image */
  logoUrl?: string;
  
  /** Optional tax identification number */
  taxId?: string;
  
  /** Optional registration or business license number */
  registrationNumber?: string;
  
  /** Optional company slogan or tagline */
  slogan?: string;
  
  /** Optional social media handles */
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

/**
 * Date range type used in reports and data filtering
 */
export interface DateRange {
  /** Start date of the range */
  from: Date;
  
  /** End date of the range */
  to: Date;
}

/**
 * Standard address structure
 */
export interface Address {
  /** Street address line 1 */
  line1: string;
  
  /** Optional street address line 2 */
  line2?: string;
  
  /** City name */
  city: string;
  
  /** State or province name */
  state: string;
  
  /** Postal or ZIP code */
  postalCode: string;
  
  /** Country name */
  country: string;
}

/**
 * Contact information structure
 */
export interface ContactInfo {
  /** Primary phone number */
  phoneNumber: string;
  
  /** Optional secondary/alternate phone number */
  alternatePhone?: string;
  
  /** Email address */
  email: string;
  
  /** Optional website URL */
  website?: string;
  
  /** Optional fax number */
  fax?: string;
} 