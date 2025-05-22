import { createSettingsService } from '@/lib/settings';
import { companySettingsSchema, CompanySettings } from '../schemas/company-settings.schema';

// Default company settings
const defaultSettings: CompanySettings = {
  name: 'My Company',
  legalName: '',
  taxId: '',
  logo: '',
  contact: {
    email: '',
    phone: '',
    website: '',
    socialMedia: '',
    supportEmail: '',
  },
  address: {
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  },
  business: {
    type: 'Retail',
    registrationNumber: '',
    description: '',
    taxId: '',
    foundedYear: null,
    fiscalYear: {
      startMonth: 1,
      startDay: 1,
    },
  },
  branding: {
    primaryColor: '#0284c7',
    secondaryColor: '#f59e0b',
    fontFamily: 'Inter',
  },
};

/**
 * Company settings service
 * Uses the unified settings architecture
 */
export const SettingsService = createSettingsService<CompanySettings>('company', {
  defaultSettings,
  schema: companySettingsSchema,
  apiEndpoint: 'settings/company',
  cacheable: true,
});

/**
 * Helper functions for company operations
 */
export const companyService = {
  /**
   * Get company name
   */
  getCompanyName: async (): Promise<string> => {
    const settings = await SettingsService.getSettings();
    return settings.name;
  },

  /**
   * Get company logo
   */
  getCompanyLogo: async (): Promise<string> => {
    const settings = await SettingsService.getSettings();
    return settings.logo;
  },

  /**
   * Get company contact information
   */
  getContactInfo: async (): Promise<CompanySettings['contact']> => {
    const settings = await SettingsService.getSettings();
    return settings.contact;
  },

  /**
   * Get company address
   */
  getAddress: async (): Promise<CompanySettings['address']> => {
    const settings = await SettingsService.getSettings();
    return settings.address;
  },

  /**
   * Get company branding
   */
  getBranding: async (): Promise<CompanySettings['branding']> => {
    const settings = await SettingsService.getSettings();
    return settings.branding;
  },

  /**
   * Get formatted company address
   */
  getFormattedAddress: async (): Promise<string> => {
    const settings = await SettingsService.getSettings();
    const address = settings.address;

    const parts = [
      address.street,
      address.city,
      address.state,
      address.postalCode,
      address.country,
    ].filter(Boolean);

    return parts.join(', ');
  },
};

export default SettingsService;
