import { CompanyInfo } from '@/types/common';

// Re-export the CompanyInfo type to maintain backward compatibility
export type { CompanyInfo };

/**
 * Standard company information interface for PDF generation
 */
// export interface CompanyInfo {
//   /** Company name */
//   name: string;
//   
//   /** Company address */
//   address: string;
//   
//   /** Company phone number */
//   phone: string;
//   
//   /** Company email */
//   email: string;
//   
//   /** Company website (optional) */
//   website?: string;
//   
//   /** URL to company logo (optional) */
//   logoUrl?: string;
//   
//   /** Tax identification number (optional) */
//   taxId?: string;
// }

/**
 * PDF generation settings interface
 */
export interface PDFSettings {
  /** Company information */
  companyInfo: CompanyInfo;
  
  /** Whether to show the logo */
  showLogo?: boolean;
  
  /** Accent color for the PDF */
  accentColor?: string;
  
  /** Who prepared the document */
  preparedBy?: string;
  
  /** Whether to include charts */
  includeCharts?: boolean;
  
  /** PDF template style */
  template?: 'standard' | 'modern' | 'minimal';
  
  /** Page orientation */
  pageOrientation?: 'portrait' | 'landscape';
  
  /** Document confidentiality level */
  confidentiality?: 'public' | 'confidential' | 'internal';
  
  /** Font size for body text */
  bodyFontSize?: number;
  
  /** Font size for headings */
  headingFontSize?: number;
  
  /** Document margin in mm */
  margin?: number;
}

/**
 * PDF document metadata
 */
export interface PDFMetadata {
  /** Document title */
  title: string;
  
  /** Document author */
  author?: string;
  
  /** Document subject */
  subject?: string;
  
  /** Document keywords */
  keywords?: string[];
  
  /** Document creation date */
  creationDate?: Date;
}

/**
 * Table options for PDF tables
 */
export interface PDFTableOptions {
  /** Table header background color */
  headerBackgroundColor?: string;
  
  /** Table header text color */
  headerTextColor?: string;
  
  /** Table cell padding */
  cellPadding?: number;
  
  /** Whether to include row borders */
  showRowBorders?: boolean;
  
  /** Whether to include column borders */
  showColumnBorders?: boolean;
  
  /** Whether to alternate row colors */
  alternateRowColors?: boolean;
  
  /** Font size for header cells */
  headerFontSize?: number;
  
  /** Font size for data cells */
  dataFontSize?: number;
}

/**
 * Text style options for PDF text
 */
export interface PDFTextOptions {
  /** Font size */
  fontSize?: number;
  
  /** Font color */
  color?: string;
  
  /** Font style */
  fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic';
  
  /** Text alignment */
  align?: 'left' | 'center' | 'right' | 'justify';
  
  /** Line height */
  lineHeight?: number;
}

/**
 * Default company info to use when none is provided
 */
export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: 'Company Name',
  address: '123 Business St, Suite 101, Business City, BC 12345',
  phone: '(555) 123-4567',
  email: 'info@company.com',
  website: 'https://www.company.com',
  logoUrl: undefined,
  taxId: undefined,
  registrationNumber: undefined,
  slogan: undefined,
  socialMedia: undefined
};

/**
 * Default PDF settings
 */
export const DEFAULT_PDF_SETTINGS: PDFSettings = {
  companyInfo: DEFAULT_COMPANY_INFO,
  showLogo: true,
  accentColor: '#3B82F6', // blue-500
  template: 'standard',
  pageOrientation: 'portrait',
  confidentiality: 'public',
  bodyFontSize: 10,
  headingFontSize: 12,
  margin: 15,
}; 