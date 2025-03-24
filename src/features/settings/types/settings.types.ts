export interface AppearanceSettings {
    theme: 'light' | 'dark' | 'system';
    density: 'comfortable' | 'compact' | 'standard';
    fontSize: 'small' | 'medium' | 'large';
    quickActions: {
        [key: string]: boolean;
    };
}

export interface NotificationSettings {
    email: {
        enabled: boolean;
        salesReports: boolean;
        inventoryAlerts: boolean;
        systemAlerts: boolean;
    };
    inventoryAlerts: {
        enabled: boolean;
        threshold: number;
    };
    salesMilestones: {
        enabled: boolean;
        dailyGoal: number;
        weeklyGoal: number;
        monthlyGoal: number;
    };
    securityAlerts: {
        loginAttempts: boolean;
        systemChanges: boolean;
        backupStatus: boolean;
    };
}

export interface BackupSettings {
    automated: {
        enabled: boolean;
        frequency: 'daily' | 'weekly' | 'monthly';
        time: string;
        retentionDays: number;
    };
    export: {
        format: ('csv' | 'pdf')[];
        includeImages: boolean;
        compression: boolean;
    };
}

export interface ReceiptSettings {
    logo: {
        enabled: boolean;
        url: string;
        maxHeight: number;
    };
    customText: {
        header: string;
        footer: string;
        disclaimer: string;
    };
    format: {
        paperSize: string;
        fontSize: number;
        showBarcode: boolean;
    };
    digital: {
        enabled: boolean;
        emailCopy: boolean;
        smsNotification: boolean;
    };
}

export interface TaxSettings {
    rates: {
        id: string;
        name: string;
        rate: number;
        isDefault: boolean;
    }[];
    rules: {
        id: string;
        region: string;
        taxRateId: string;
    }[];
    currency: {
        code: string;
        symbol: string;
        position: 'before' | 'after';
        decimalPlaces: number;
    };
    multipleCurrencies: {
        enabled: boolean;
        currencies: string[];
    };
}

export interface SecuritySettings {
    password: {
        minLength: number;
        requireSpecialChar: boolean;
        requireNumber: boolean;
        requireUppercase: boolean;
        expiryDays: number;
    };
    twoFactor: {
        enabled: boolean;
        method: 'email' | 'authenticator' | 'sms';
    };
    session: {
        timeout: number;
        maxAttempts: number;
        lockoutDuration: number;
    };
}

export interface SystemSettings {
    archiving: {
        enabled: boolean;
        olderThan: number;
        archiveFormat: 'zip' | 'tar';
    };
    cache: {
        enabled: boolean;
        maxSize: number;
        clearInterval: number;
    };
    monitoring: {
        enabled: boolean;
        alertThreshold: number;
        collectMetrics: boolean;
    };
    background: {
        maxJobs: number;
        priority: 'low' | 'medium' | 'high';
    };
}

export interface HardwareSettings {
    printers: {
        id: string;
        name: string;
        type: 'receipt' | 'label' | 'document';
        connection: 'usb' | 'network' | 'bluetooth';
        isDefault: boolean;
    }[];
    cashDrawer: {
        enabled: boolean;
        openTrigger: 'after_sale' | 'manual' | 'both';
        printer: string;
    };
    scanner: {
        enabled: boolean;
        type: 'usb' | 'bluetooth' | 'camera';
        prefix: string;
        suffix: string;
    };
    display: {
        customerDisplay: boolean;
        brightness: number;
        orientation: 'landscape' | 'portrait';
        timeout: number;
    };
}

export interface WooCommerceSettings {
    enabled: boolean;
    storeUrl: string;
    consumerKey: string;
    consumerSecret: string;
    sync: {
        products: boolean;
        inventory: boolean;
        orders: boolean;
        customers: boolean;
        frequency: "realtime" | "hourly" | "daily" | "manual";
    };
    products: {
        overridePrices: boolean;
        syncImages: boolean;
        syncCategories: boolean;
        attributeMapping: boolean;
    };
    orders: {
        defaultStatus: "pending" | "processing" | "completed";
        autoComplete: boolean;
        notifications: boolean;
        customWorkflow: boolean;
    };
}

export interface CompanySettings {
    name: string;
    legalName: string;
    businessType: string;
    description: string;
    foundedYear: string;
    logo: string;
    address: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    contact: {
        phone: string;
        email: string;
        website: string;
        socialMedia: string;
        supportEmail: string;
    };
    taxDetails: {
        taxId: string;
        registrationNumber: string;
        taxJurisdiction: string;
    };
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  systemDefined: boolean;
  settings: Record<string, string | boolean>;
}

export interface PaymentSettings {
  methods: Record<string, PaymentMethod>;
  installment: {
    enabled: boolean;
    minimumAmount: number;
    minimumDownPaymentPercent: number;
    plans: Array<{
      id: string;
      period: {
        frequency: number;
        unit: 'day' | 'week' | 'month' | 'year';
      };
      priceRange: {
        min: number;
        max: number;
      };
      numberOfInstallments: number;
    }>;
  }
}

export interface POSSettings {
    appearance: AppearanceSettings;
    notifications: NotificationSettings;
    backup: BackupSettings;
    receipt: ReceiptSettings;
    tax: TaxSettings;
    security: SecuritySettings;
    system: SystemSettings;
    hardware: HardwareSettings;
    woocommerce: WooCommerceSettings;
    company: CompanySettings;
    payment: PaymentSettings;
}
