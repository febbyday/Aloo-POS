import { useState } from "react"
import { useLocation, Outlet, Navigate } from "react-router-dom"
import { POSSettings } from "../types/settings.types"
import { SettingsLayout } from "../components/SettingsLayout"

// Default settings configuration
const defaultSettings: POSSettings = {
  appearance: {
    theme: 'light',
    density: 'comfortable',
    fontSize: 'medium',
    quickActions: {
      new_sale: true,
      quick_product: true,
      refund: true,
      reports: true
    }
  },
  notifications: {
    email: {
      enabled: true,
      salesReports: true,
      inventoryAlerts: true,
      systemAlerts: true
    },
    inventoryAlerts: {
      enabled: true,
      threshold: 10
    },
    salesMilestones: {
      enabled: true,
      dailyGoal: 1000,
      weeklyGoal: 5000,
      monthlyGoal: 20000
    },
    securityAlerts: {
      loginAttempts: true,
      systemChanges: true,
      backupStatus: true
    }
  },
  backup: {
    automated: {
      enabled: true,
      frequency: 'daily',
      time: '00:00',
      retentionDays: 30
    },
    export: {
      format: ['csv', 'pdf'],
      includeImages: true,
      compression: true
    }
  },
  receipt: {
    logo: {
      enabled: true,
      url: '',
      maxHeight: 100
    },
    customText: {
      header: '',
      footer: 'Thank you for your purchase!',
      disclaimer: 'All sales are final. Returns accepted within 30 days with receipt.'
    },
    format: {
      paperSize: 'A4',
      fontSize: 12,
      showBarcode: true
    },
    digital: {
      enabled: true,
      emailCopy: true,
      smsNotification: false
    }
  },
  tax: {
    rates: [
      {
        id: '1',
        name: 'Standard',
        rate: 20,
        isDefault: true
      },
      {
        id: '2',
        name: 'Reduced',
        rate: 5,
        isDefault: false
      },
      {
        id: '3',
        name: 'Zero',
        rate: 0,
        isDefault: false
      }
    ],
    rules: [
      {
        id: '1',
        region: 'Default',
        taxRateId: '1'
      }
    ],
    currency: {
      code: 'USD',
      symbol: '$',
      position: 'before',
      decimalPlaces: 2
    },
    multipleCurrencies: {
      enabled: false,
      currencies: ['USD']
    }
  },
  security: {
    password: {
      minLength: 8,
      requireSpecialChar: true,
      requireNumber: true,
      requireUppercase: true,
      expiryDays: 90
    },
    twoFactor: {
      enabled: false,
      method: 'email'
    },
    session: {
      timeout: 30,
      maxAttempts: 5,
      lockoutDuration: 15
    }
  },
  system: {
    archiving: {
      enabled: true,
      olderThan: 90,
      archiveFormat: 'zip'
    },
    cache: {
      enabled: true,
      maxSize: 100,
      clearInterval: 24
    },
    monitoring: {
      enabled: true,
      alertThreshold: 90,
      collectMetrics: true
    },
    background: {
      maxJobs: 5,
      priority: 'medium'
    }
  },
  hardware: {
    printers: [
      {
        id: '1',
        name: 'Receipt Printer',
        type: 'receipt',
        connection: 'usb',
        isDefault: true
      },
      {
        id: '2',
        name: 'Label Printer',
        type: 'label',
        connection: 'usb',
        isDefault: false
      }
    ],
    cashDrawer: {
      enabled: true,
      openTrigger: 'after_sale',
      printer: '1'
    },
    scanner: {
      enabled: true,
      type: 'usb',
      prefix: '',
      suffix: ''
    },
    display: {
      customerDisplay: true,
      brightness: 80,
      orientation: 'landscape',
      timeout: 300
    }
  },
  woocommerce: {
    enabled: true,
    storeUrl: 'https://example.com',
    consumerKey: '',
    consumerSecret: '',
    sync: {
      products: true,
      inventory: true,
      orders: true,
      customers: true,
      frequency: 'hourly'
    },
    products: {
      overridePrices: false,
      syncImages: true,
      syncCategories: true,
      attributeMapping: true
    },
    orders: {
      defaultStatus: 'processing',
      autoComplete: false,
      notifications: true,
      customWorkflow: false
    }
  },
  company: {
    name: 'My Store',
    legalName: 'My Store LLC',
    businessType: 'Retail',
    description: 'A modern retail store',
    foundedYear: '2023',
    logo: '/assets/logo.png',
    address: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      postalCode: '12345',
      country: 'USA'
    },
    contact: {
      phone: '555-123-4567',
      email: 'contact@mystore.com',
      website: 'https://mystore.com',
      socialMedia: '@mystore',
      supportEmail: 'support@mystore.com'
    },
    taxDetails: {
      taxId: '12-3456789',
      registrationNumber: 'REG123456',
      taxJurisdiction: 'California'
    }
  },
  payment: {
    methods: {
      cash: {
        id: 'cash',
        name: 'Cash',
        icon: 'dollar-sign',
        enabled: true,
        systemDefined: true,
        settings: {}
      },
      card: {
        id: 'card',
        name: 'Credit/Debit Card',
        icon: 'credit-card',
        enabled: true,
        systemDefined: true,
        settings: {}
      },
      bank: {
        id: 'bank',
        name: 'Bank Transfer',
        icon: 'building-bank',
        enabled: true,
        systemDefined: true,
        settings: {}
      },
      mobile: {
        id: 'mobile',
        name: 'Mobile Payment',
        icon: 'smartphone',
        enabled: true,
        systemDefined: true,
        settings: {}
      }
    },
    installment: {
      enabled: true,
      minimumAmount: 100,
      minimumDownPaymentPercent: 20,
      plans: [
        {
          id: '1',
          period: {
            frequency: 1,
            unit: 'month'
          },
          priceRange: {
            min: 100,
            max: 1000
          },
          numberOfInstallments: 3
        },
        {
          id: '2',
          period: {
            frequency: 1,
            unit: 'month'
          },
          priceRange: {
            min: 500,
            max: 5000
          },
          numberOfInstallments: 6
        }
      ]
    }
  }
};

/**
 * Main settings page component
 * Handles routing to specific settings panels
 */
export function SettingsPage() {
  const [settings, setSettings] = useState<POSSettings>(defaultSettings);
  const location = useLocation();

  // Handle settings update from child components
  const handleSettingsUpdate = (section: keyof POSSettings, newSettings: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: newSettings
    }));
  };

  // Render default content when accessing /settings directly
  const renderDefaultContent = () => {
    // If we're at exactly /settings, redirect to /settings/appearance
    if (location.pathname === '/settings') {
      return <Navigate to="/settings/appearance" replace />;
    }
    
    // Otherwise, render the outlet (child routes)
    return <Outlet context={{ settings, handleSettingsUpdate }} />;
  };

  return (
    <SettingsLayout>
      {renderDefaultContent()}
    </SettingsLayout>
  );
}
