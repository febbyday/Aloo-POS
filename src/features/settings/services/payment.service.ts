import { createSettingsService } from '@/lib/settings';
import { paymentSettingsSchema, PaymentSettings, PaymentMethod } from '../schemas/payment-settings.schema';

// Default payment methods
const defaultPaymentMethods: PaymentMethod[] = [
  {
    id: 'cash',
    name: 'Cash',
    enabled: true,
    isDefault: true,
    requiresApproval: false,
    allowPartialPayment: true,
    allowRefund: true,
    processingFee: 0,
    processingFeeType: 'fixed',
    icon: 'cash',
  },
  {
    id: 'credit_card',
    name: 'Credit Card',
    enabled: true,
    isDefault: false,
    requiresApproval: false,
    allowPartialPayment: true,
    allowRefund: true,
    processingFee: 2.9,
    processingFeeType: 'percentage',
    icon: 'credit-card',
  },
  {
    id: 'debit_card',
    name: 'Debit Card',
    enabled: true,
    isDefault: false,
    requiresApproval: false,
    allowPartialPayment: true,
    allowRefund: true,
    processingFee: 1.5,
    processingFeeType: 'percentage',
    icon: 'credit-card',
  },
  {
    id: 'gift_card',
    name: 'Gift Card',
    enabled: true,
    isDefault: false,
    requiresApproval: false,
    allowPartialPayment: true,
    allowRefund: false,
    processingFee: 0,
    processingFeeType: 'fixed',
    icon: 'gift',
  },
];

// Default payment settings
const defaultSettings: PaymentSettings = {
  methods: defaultPaymentMethods,
  allowMultiplePaymentMethods: true,
  requirePaymentForOrders: true,
  defaultPaymentMethod: 'cash',
  showPaymentMethodIcons: true,
  roundingMethod: 'nearest',
  roundingPrecision: 2,
  currency: {
    code: 'USD',
    symbol: '$',
    position: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
};

/**
 * Payment settings service
 * Uses the unified settings architecture
 */
export const SettingsService = createSettingsService<PaymentSettings>('payment', {
  defaultSettings,
  schema: paymentSettingsSchema,
  apiEndpoint: 'settings/payment',
  cacheable: true,
});

export default SettingsService;
