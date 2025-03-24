import { PaymentSettings, PaymentMethod } from "../types/settings.types";

// Default payment settings
export const defaultPaymentSettings: PaymentSettings = {
  methods: {
    "method_installment": {
      id: "method_installment",
      name: "Installment",
      icon: "credit-card",
      enabled: true,
      systemDefined: true,
      settings: {}
    }
  },
  installment: {
    enabled: true,
    minimumAmount: 100,
    minimumDownPaymentPercent: 10,
    plans: [
      {
        id: "plan_1",
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
        id: "plan_2",
        period: {
          frequency: 2,
          unit: 'month'
        },
        priceRange: {
          min: 1000,
          max: 5000
        },
        numberOfInstallments: 6
      },
      {
        id: "plan_3",
        period: {
          frequency: 3,
          unit: 'month'
        },
        priceRange: {
          min: 5000,
          max: 10000
        },
        numberOfInstallments: 12
      }
    ]
  }
};

// Available payment method icons
export const paymentMethodIcons = [
  { value: "credit-card", label: "Credit Card" },
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank Transfer" },
  { value: "mobile", label: "Mobile Payment" },
  { value: "wallet", label: "Digital Wallet" },
  { value: "gift-card", label: "Gift Card" },
  { value: "check", label: "Check" }
];

// Service functions for payment methods
export const paymentService = {
  // Get all payment methods
  getPaymentMethods(settings: PaymentSettings): PaymentMethod[] {
    return Object.values(settings.methods);
  },

  // Add a new payment method
  addPaymentMethod(settings: PaymentSettings, method: Omit<PaymentMethod, 'id'>): PaymentSettings {
    const methodId = `method_${Date.now()}`;
    const newMethod = {
      ...method,
      id: methodId
    };

    return {
      ...settings,
      methods: {
        ...settings.methods,
        [methodId]: newMethod
      }
    };
  },

  // Update an existing payment method
  updatePaymentMethod(settings: PaymentSettings, method: PaymentMethod): PaymentSettings {
    return {
      ...settings,
      methods: {
        ...settings.methods,
        [method.id]: method
      }
    };
  },

  // Delete a payment method
  deletePaymentMethod(settings: PaymentSettings, methodId: string): PaymentSettings {
    // Don't allow deletion of system-defined methods
    if (settings.methods[methodId]?.systemDefined) {
      return settings;
    }

    const updatedMethods = { ...settings.methods };
    delete updatedMethods[methodId];

    return {
      ...settings,
      methods: updatedMethods
    };
  },

  // Toggle payment method enabled status
  togglePaymentMethodStatus(settings: PaymentSettings, methodId: string): PaymentSettings {
    const method = settings.methods[methodId];
    if (!method) return settings;

    return {
      ...settings,
      methods: {
        ...settings.methods,
        [methodId]: {
          ...method,
          enabled: !method.enabled
        }
      }
    };
  },

  // Add a new installment plan
  addInstallmentPlan(
    settings: PaymentSettings, 
    plan: Omit<PaymentSettings['installment']['plans'][0], 'id'>
  ): PaymentSettings {
    const planId = `plan_${Date.now()}`;
    const newPlan = {
      ...plan,
      id: planId
    };

    return {
      ...settings,
      installment: {
        ...settings.installment,
        plans: [...settings.installment.plans, newPlan]
      }
    };
  },

  // Delete an installment plan
  deleteInstallmentPlan(settings: PaymentSettings, planId: string): PaymentSettings {
    return {
      ...settings,
      installment: {
        ...settings.installment,
        plans: settings.installment.plans.filter(plan => plan.id !== planId)
      }
    };
  },

  // Update installment settings
  updateInstallmentSettings(
    settings: PaymentSettings,
    installmentSettings: Omit<PaymentSettings['installment'], 'plans'>
  ): PaymentSettings {
    return {
      ...settings,
      installment: {
        ...settings.installment,
        ...installmentSettings
      }
    };
  },

  // Fetch payment settings from API
  fetchPaymentSettings: async (): Promise<PaymentSettings> => {
    // This would be an API call in a real application
    // For now, return default settings with a delay to simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(defaultPaymentSettings);
      }, 500);
    });
  },

  // Save payment settings to API
  savePaymentSettings: async (settings: PaymentSettings): Promise<PaymentSettings> => {
    // This would be an API call in a real application
    // For now, return the settings with a delay to simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(settings);
      }, 500);
    });
  }
};
