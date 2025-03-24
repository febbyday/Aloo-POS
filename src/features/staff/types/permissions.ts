/**
 * Comprehensive permissions system for POS application
 * Supports granular access control with action-based permissions
 */

// Permission actions available for resources
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export';

// Permission access levels
export enum AccessLevel {
  NONE = 'none',         // No access
  SELF = 'self',         // Access to own resources only
  DEPARTMENT = 'dept',   // Access to department resources
  ALL = 'all'            // Access to all resources
}

// Base permission structure
export interface PermissionItem {
  view: AccessLevel;
  create: AccessLevel;
  edit: AccessLevel;
  delete: AccessLevel;
  export?: AccessLevel;  // Optional permissions
  approve?: AccessLevel; // Optional permissions
}

// Sales module permissions
export interface SalesPermissions extends PermissionItem {
  processRefunds: boolean;
  applyDiscounts: boolean;
  voidTransactions: boolean;
  accessReports: boolean;
  managePromotions: boolean;
  viewSalesHistory: AccessLevel;
}

// Shops module permissions
export interface ShopsPermissions extends PermissionItem {
  manageLocations: boolean;
  assignStaff: boolean;
  viewPerformance: boolean;
  manageInventory: boolean;
  manageOperations: boolean;
}

// Markets module permissions
export interface MarketsPermissions extends PermissionItem {
  managePricing: boolean;
  createPromotions: boolean;
  manageCompetitors: boolean;
  viewMarketAnalytics: boolean;
  manageCampaigns: boolean;
}

// Expenses module permissions
export interface ExpensesPermissions extends PermissionItem {
  createExpenses: boolean;
  approveExpenses: boolean;
  manageCategories: boolean;
  viewReports: boolean;
  manageRecurring: boolean;
}

// Repairs module permissions
export interface RepairsPermissions extends PermissionItem {
  createServiceTickets: boolean;
  assignTechnicians: boolean;
  orderParts: boolean;
  viewHistory: boolean;
  manageWorkflow: boolean;
}

// Suppliers module permissions
export interface SuppliersPermissions extends PermissionItem {
  manageContacts: boolean;
  createOrders: boolean;
  manageContracts: boolean;
  evaluatePerformance: boolean;
  managePayments: boolean;
}

// Inventory module permissions
export interface InventoryPermissions extends PermissionItem {
  adjustStock: boolean;
  orderInventory: boolean;
  manageSuppliers: boolean;
  viewStockAlerts: boolean;
  transferStock: boolean;
  manageCategories: boolean;
}

// Staff module permissions
export interface StaffPermissions extends PermissionItem {
  manageRoles: boolean;
  assignPermissions: boolean;
  viewPerformance: AccessLevel;
  manageSchedules: AccessLevel;
  viewSalaries: AccessLevel;
  manageAttendance: AccessLevel;
}

// Reports module permissions
export interface ReportsPermissions extends PermissionItem {
  viewSalesReports: boolean;
  viewFinancialReports: boolean;
  viewInventoryReports: boolean;
  viewStaffReports: boolean;
  viewCustomReports: boolean;
  scheduleReports: boolean;
}

// Settings module permissions
export interface SettingsPermissions extends PermissionItem {
  manageSystemConfig: boolean;
  manageStoreInfo: boolean;
  manageTaxSettings: boolean;
  manageIntegrations: boolean;
  manageBackups: boolean;
  viewAuditLogs: boolean;
}

// Financial module permissions
export interface FinancialPermissions extends PermissionItem {
  processPayments: boolean;
  manageAccounts: boolean;
  reconcileCash: boolean;
  viewFinancialSummary: boolean;
  manageExpenses: boolean;
  approveRefunds: boolean;
}

// Customer module permissions
export interface CustomerPermissions extends PermissionItem {
  manageCustomerGroups: boolean;
  viewPurchaseHistory: boolean;
  manageRewards: boolean;
  manageCredits: boolean;
  exportCustomerData: boolean;
}

// Complete permissions object structure
export interface Permissions {
  sales: SalesPermissions;
  shops: ShopsPermissions;
  markets: MarketsPermissions;
  expenses: ExpensesPermissions;
  repairs: RepairsPermissions;
  suppliers: SuppliersPermissions;
  inventory: InventoryPermissions;
  staff: StaffPermissions;
  reports: ReportsPermissions;
  settings: SettingsPermissions;
  financial: FinancialPermissions;
  customers: CustomerPermissions;
  // Add other modules as needed
}

// Generate default permissions with no access
export function getDefaultPermissions(): Permissions {
  const defaultItem: PermissionItem = {
    view: AccessLevel.NONE,
    create: AccessLevel.NONE,
    edit: AccessLevel.NONE,
    delete: AccessLevel.NONE
  };
  
  return {
    sales: {
      ...defaultItem,
      processRefunds: false,
      applyDiscounts: false,
      voidTransactions: false,
      accessReports: false,
      managePromotions: false,
      viewSalesHistory: AccessLevel.NONE
    },
    shops: {
      ...defaultItem,
      manageLocations: false,
      assignStaff: false,
      viewPerformance: false,
      manageInventory: false,
      manageOperations: false
    },
    markets: {
      ...defaultItem,
      managePricing: false,
      createPromotions: false,
      manageCompetitors: false,
      viewMarketAnalytics: false,
      manageCampaigns: false
    },
    expenses: {
      ...defaultItem,
      createExpenses: false,
      approveExpenses: false,
      manageCategories: false,
      viewReports: false,
      manageRecurring: false
    },
    repairs: {
      ...defaultItem,
      createServiceTickets: false,
      assignTechnicians: false,
      orderParts: false,
      viewHistory: false,
      manageWorkflow: false
    },
    suppliers: {
      ...defaultItem,
      manageContacts: false,
      createOrders: false,
      manageContracts: false,
      evaluatePerformance: false,
      managePayments: false
    },
    inventory: {
      ...defaultItem,
      adjustStock: false,
      orderInventory: false,
      manageSuppliers: false,
      viewStockAlerts: false,
      transferStock: false,
      manageCategories: false
    },
    staff: {
      ...defaultItem,
      manageRoles: false,
      assignPermissions: false,
      viewPerformance: AccessLevel.NONE,
      manageSchedules: AccessLevel.NONE,
      viewSalaries: AccessLevel.NONE,
      manageAttendance: AccessLevel.NONE
    },
    reports: {
      ...defaultItem,
      viewSalesReports: false,
      viewFinancialReports: false,
      viewInventoryReports: false,
      viewStaffReports: false,
      viewCustomReports: false,
      scheduleReports: false
    },
    settings: {
      ...defaultItem,
      manageSystemConfig: false,
      manageStoreInfo: false,
      manageTaxSettings: false,
      manageIntegrations: false,
      manageBackups: false,
      viewAuditLogs: false
    },
    financial: {
      ...defaultItem,
      processPayments: false,
      manageAccounts: false,
      reconcileCash: false,
      viewFinancialSummary: false,
      manageExpenses: false,
      approveRefunds: false
    },
    customers: {
      ...defaultItem,
      manageCustomerGroups: false,
      viewPurchaseHistory: false,
      manageRewards: false,
      manageCredits: false,
      exportCustomerData: false
    }
  };
}

// Predefined permission templates for common roles
export const permissionTemplates = {
  administrator: {
    // Full system access with ability to configure all settings and manage roles
    sales: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.ALL,
      delete: AccessLevel.ALL,
      export: AccessLevel.ALL,
      approve: AccessLevel.ALL,
      processRefunds: true,
      applyDiscounts: true,
      voidTransactions: true,
      accessReports: true,
      managePromotions: true,
      viewSalesHistory: AccessLevel.ALL
    },
    shops: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.ALL,
      delete: AccessLevel.ALL,
      export: AccessLevel.ALL,
      approve: AccessLevel.ALL,
      manageLocations: true,
      assignStaff: true,
      viewPerformance: true,
      manageInventory: true,
      manageOperations: true
    },
    markets: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.ALL,
      delete: AccessLevel.ALL,
      export: AccessLevel.ALL,
      approve: AccessLevel.ALL,
      managePricing: true,
      createPromotions: true,
      manageCompetitors: true,
      viewMarketAnalytics: true,
      manageCampaigns: true
    },
    expenses: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.ALL,
      delete: AccessLevel.ALL,
      export: AccessLevel.ALL,
      approve: AccessLevel.ALL,
      createExpenses: true,
      approveExpenses: true,
      manageCategories: true,
      viewReports: true,
      manageRecurring: true
    },
    repairs: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.ALL,
      delete: AccessLevel.ALL,
      export: AccessLevel.ALL,
      approve: AccessLevel.ALL,
      createServiceTickets: true,
      assignTechnicians: true,
      orderParts: true,
      viewHistory: true,
      manageWorkflow: true
    },
    suppliers: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.ALL,
      delete: AccessLevel.ALL,
      export: AccessLevel.ALL,
      approve: AccessLevel.ALL,
      manageContacts: true,
      createOrders: true,
      manageContracts: true,
      evaluatePerformance: true,
      managePayments: true
    },
    inventory: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.ALL,
      delete: AccessLevel.ALL,
      export: AccessLevel.ALL,
      approve: AccessLevel.ALL,
      adjustStock: true,
      orderInventory: true,
      manageSuppliers: true,
      viewStockAlerts: true,
      transferStock: true,
      manageCategories: true
    },
    staff: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.ALL,
      delete: AccessLevel.ALL,
      export: AccessLevel.ALL,
      approve: AccessLevel.ALL,
      manageRoles: true,
      assignPermissions: true,
      viewPerformance: AccessLevel.ALL,
      manageSchedules: AccessLevel.ALL,
      viewSalaries: AccessLevel.ALL,
      manageAttendance: AccessLevel.ALL
    },
    reports: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.ALL,
      delete: AccessLevel.ALL,
      export: AccessLevel.ALL,
      approve: AccessLevel.ALL,
      viewSalesReports: true,
      viewFinancialReports: true,
      viewInventoryReports: true,
      viewStaffReports: true,
      viewCustomReports: true,
      scheduleReports: true
    },
    settings: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.ALL,
      delete: AccessLevel.ALL,
      export: AccessLevel.ALL,
      approve: AccessLevel.ALL,
      manageSystemConfig: true,
      manageStoreInfo: true,
      manageTaxSettings: true,
      manageIntegrations: true,
      manageBackups: true,
      viewAuditLogs: true
    },
    financial: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.ALL,
      delete: AccessLevel.ALL,
      export: AccessLevel.ALL,
      approve: AccessLevel.ALL,
      processPayments: true,
      manageAccounts: true,
      reconcileCash: true,
      viewFinancialSummary: true,
      manageExpenses: true,
      approveRefunds: true
    },
    customers: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.ALL,
      delete: AccessLevel.ALL,
      export: AccessLevel.ALL,
      approve: AccessLevel.ALL,
      manageCustomerGroups: true,
      viewPurchaseHistory: true,
      manageRewards: true,
      manageCredits: true,
      exportCustomerData: true
    }
  },
  
  storeManager: {
    // Full access to store operations with some limitations on system settings
    sales: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.ALL,
      delete: AccessLevel.ALL,
      processRefunds: true,
      applyDiscounts: true,
      voidTransactions: true,
      accessReports: true,
      managePromotions: true,
      viewSalesHistory: AccessLevel.ALL
    },
    shops: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.ALL,
      delete: AccessLevel.ALL,
      manageLocations: true,
      assignStaff: true,
      viewPerformance: true,
      manageInventory: true,
      manageOperations: true
    },
    markets: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.ALL,
      delete: AccessLevel.ALL,
      managePricing: true,
      createPromotions: true,
      manageCompetitors: true,
      viewMarketAnalytics: true,
      manageCampaigns: true
    },
    expenses: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.ALL,
      delete: AccessLevel.ALL,
      createExpenses: true,
      approveExpenses: true,
      manageCategories: true,
      viewReports: true,
      manageRecurring: true
    },
    repairs: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.ALL,
      delete: AccessLevel.ALL,
      createServiceTickets: true,
      assignTechnicians: true,
      orderParts: true,
      viewHistory: true,
      manageWorkflow: true
    },
    suppliers: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.ALL,
      delete: AccessLevel.ALL,
      manageContacts: true,
      createOrders: true,
      manageContracts: true,
      evaluatePerformance: true,
      managePayments: true
    },
    inventory: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.ALL,
      delete: AccessLevel.ALL,
      adjustStock: true,
      orderInventory: true,
      manageSuppliers: true,
      viewStockAlerts: true,
      transferStock: true,
      manageCategories: true
    },
    staff: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.ALL,
      delete: AccessLevel.DEPARTMENT,
      manageRoles: false,
      assignPermissions: false,
      viewPerformance: AccessLevel.ALL,
      manageSchedules: AccessLevel.ALL,
      viewSalaries: AccessLevel.DEPARTMENT,
      manageAttendance: AccessLevel.ALL
    },
    reports: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.DEPARTMENT,
      delete: AccessLevel.DEPARTMENT,
      viewSalesReports: true,
      viewFinancialReports: true,
      viewInventoryReports: true,
      viewStaffReports: true,
      viewCustomReports: true,
      scheduleReports: true
    },
    settings: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      manageSystemConfig: false,
      manageStoreInfo: true,
      manageTaxSettings: false,
      manageIntegrations: false,
      manageBackups: false,
      viewAuditLogs: true
    },
    financial: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.DEPARTMENT,
      delete: AccessLevel.NONE,
      processPayments: true,
      manageAccounts: false,
      reconcileCash: true,
      viewFinancialSummary: true,
      manageExpenses: true,
      approveRefunds: true
    },
    customers: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.ALL,
      delete: AccessLevel.DEPARTMENT,
      manageCustomerGroups: true,
      viewPurchaseHistory: true,
      manageRewards: true,
      manageCredits: true,
      exportCustomerData: true
    }
  },
  
  cashier: {
    // Focused on sales operations and customer service
    sales: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.SELF,
      delete: AccessLevel.NONE,
      processRefunds: false,
      applyDiscounts: true,
      voidTransactions: false,
      accessReports: false,
      managePromotions: false,
      viewSalesHistory: AccessLevel.SELF
    },
    shops: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      manageLocations: false,
      assignStaff: false,
      viewPerformance: false,
      manageInventory: false,
      manageOperations: false
    },
    markets: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      managePricing: false,
      createPromotions: false,
      manageCompetitors: false,
      viewMarketAnalytics: false,
      manageCampaigns: false
    },
    expenses: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      createExpenses: false,
      approveExpenses: false,
      manageCategories: false,
      viewReports: false,
      manageRecurring: false
    },
    repairs: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      createServiceTickets: false,
      assignTechnicians: false,
      orderParts: false,
      viewHistory: false,
      manageWorkflow: false
    },
    suppliers: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      manageContacts: false,
      createOrders: false,
      manageContracts: false,
      evaluatePerformance: false,
      managePayments: false
    },
    inventory: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      adjustStock: false,
      orderInventory: false,
      manageSuppliers: false,
      viewStockAlerts: true,
      transferStock: false,
      manageCategories: false
    },
    staff: {
      view: AccessLevel.SELF,
      create: AccessLevel.NONE,
      edit: AccessLevel.SELF,
      delete: AccessLevel.NONE,
      manageRoles: false,
      assignPermissions: false,
      viewPerformance: AccessLevel.SELF,
      manageSchedules: AccessLevel.NONE,
      viewSalaries: AccessLevel.NONE,
      manageAttendance: AccessLevel.SELF
    },
    reports: {
      view: AccessLevel.NONE,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      viewSalesReports: false,
      viewFinancialReports: false,
      viewInventoryReports: false,
      viewStaffReports: false,
      viewCustomReports: false,
      scheduleReports: false
    },
    settings: {
      view: AccessLevel.NONE,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      manageSystemConfig: false,
      manageStoreInfo: false,
      manageTaxSettings: false,
      manageIntegrations: false,
      manageBackups: false,
      viewAuditLogs: false
    },
    financial: {
      view: AccessLevel.NONE,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      processPayments: true,
      manageAccounts: false,
      reconcileCash: false,
      viewFinancialSummary: false,
      manageExpenses: false,
      approveRefunds: false
    },
    customers: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      manageCustomerGroups: false,
      viewPurchaseHistory: true,
      manageRewards: true,
      manageCredits: false,
      exportCustomerData: false
    }
  },
  
  inventoryManager: {
    // Specialized in inventory management
    sales: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      processRefunds: false,
      applyDiscounts: false,
      voidTransactions: false,
      accessReports: false,
      managePromotions: false,
      viewSalesHistory: AccessLevel.NONE
    },
    shops: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      manageLocations: false,
      assignStaff: false,
      viewPerformance: false,
      manageInventory: false,
      manageOperations: false
    },
    markets: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      managePricing: false,
      createPromotions: false,
      manageCompetitors: false,
      viewMarketAnalytics: false,
      manageCampaigns: false
    },
    expenses: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      createExpenses: false,
      approveExpenses: false,
      manageCategories: false,
      viewReports: false,
      manageRecurring: false
    },
    repairs: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      createServiceTickets: false,
      assignTechnicians: false,
      orderParts: false,
      viewHistory: false,
      manageWorkflow: false
    },
    suppliers: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      manageContacts: false,
      createOrders: false,
      manageContracts: false,
      evaluatePerformance: false,
      managePayments: false
    },
    inventory: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.ALL,
      delete: AccessLevel.ALL,
      adjustStock: true,
      orderInventory: true,
      manageSuppliers: true,
      viewStockAlerts: true,
      transferStock: true,
      manageCategories: true
    },
    staff: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      manageRoles: false,
      assignPermissions: false,
      viewPerformance: AccessLevel.NONE,
      manageSchedules: AccessLevel.NONE,
      viewSalaries: AccessLevel.NONE,
      manageAttendance: AccessLevel.NONE
    },
    reports: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      viewSalesReports: false,
      viewFinancialReports: false,
      viewInventoryReports: true,
      viewStaffReports: false,
      viewCustomReports: false,
      scheduleReports: false
    },
    settings: {
      view: AccessLevel.NONE,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      manageSystemConfig: false,
      manageStoreInfo: false,
      manageTaxSettings: false,
      manageIntegrations: false,
      manageBackups: false,
      viewAuditLogs: false
    },
    financial: {
      view: AccessLevel.NONE,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      processPayments: false,
      manageAccounts: false,
      reconcileCash: false,
      viewFinancialSummary: false,
      manageExpenses: false,
      approveRefunds: false
    },
    customers: {
      view: AccessLevel.NONE,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      manageCustomerGroups: false,
      viewPurchaseHistory: false,
      manageRewards: false,
      manageCredits: false,
      exportCustomerData: false
    }
  },
  
  financeManager: {
    // Financial operations and management
    sales: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      processRefunds: true,
      applyDiscounts: false,
      voidTransactions: false,
      accessReports: true,
      managePromotions: false,
      viewSalesHistory: AccessLevel.ALL
    },
    shops: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      manageLocations: false,
      assignStaff: false,
      viewPerformance: false,
      manageInventory: false,
      manageOperations: false
    },
    markets: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      managePricing: false,
      createPromotions: false,
      manageCompetitors: false,
      viewMarketAnalytics: false,
      manageCampaigns: false
    },
    expenses: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.ALL,
      delete: AccessLevel.ALL,
      createExpenses: true,
      approveExpenses: true,
      manageCategories: true,
      viewReports: true,
      manageRecurring: true
    },
    repairs: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      createServiceTickets: false,
      assignTechnicians: false,
      orderParts: false,
      viewHistory: false,
      manageWorkflow: false
    },
    suppliers: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      manageContacts: false,
      createOrders: false,
      manageContracts: false,
      evaluatePerformance: false,
      managePayments: false
    },
    inventory: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      adjustStock: false,
      orderInventory: false,
      manageSuppliers: false,
      viewStockAlerts: false,
      transferStock: false,
      manageCategories: false
    },
    staff: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      manageRoles: false,
      assignPermissions: false,
      viewPerformance: AccessLevel.NONE,
      manageSchedules: AccessLevel.NONE,
      viewSalaries: AccessLevel.ALL,
      manageAttendance: AccessLevel.NONE
    },
    reports: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.ALL,
      delete: AccessLevel.ALL,
      viewSalesReports: true,
      viewFinancialReports: true,
      viewInventoryReports: false,
      viewStaffReports: false,
      viewCustomReports: true,
      scheduleReports: true
    },
    settings: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      manageSystemConfig: false,
      manageStoreInfo: false,
      manageTaxSettings: true,
      manageIntegrations: false,
      manageBackups: false,
      viewAuditLogs: true
    },
    financial: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.ALL,
      delete: AccessLevel.ALL,
      processPayments: true,
      manageAccounts: true,
      reconcileCash: true,
      viewFinancialSummary: true,
      manageExpenses: true,
      approveRefunds: true
    },
    customers: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      manageCustomerGroups: false,
      viewPurchaseHistory: true,
      manageRewards: false,
      manageCredits: true,
      exportCustomerData: false
    }
  },
  
  staffManager: {
    // HR and staff management
    sales: {
      view: AccessLevel.NONE,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      processRefunds: false,
      applyDiscounts: false,
      voidTransactions: false,
      accessReports: false,
      managePromotions: false,
      viewSalesHistory: AccessLevel.NONE
    },
    shops: {
      view: AccessLevel.NONE,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      manageLocations: false,
      assignStaff: false,
      viewPerformance: false,
      manageInventory: false,
      manageOperations: false
    },
    markets: {
      view: AccessLevel.NONE,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      managePricing: false,
      createPromotions: false,
      manageCompetitors: false,
      viewMarketAnalytics: false,
      manageCampaigns: false
    },
    expenses: {
      view: AccessLevel.NONE,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      createExpenses: false,
      approveExpenses: false,
      manageCategories: false,
      viewReports: false,
      manageRecurring: false
    },
    repairs: {
      view: AccessLevel.NONE,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      createServiceTickets: false,
      assignTechnicians: false,
      orderParts: false,
      viewHistory: false,
      manageWorkflow: false
    },
    suppliers: {
      view: AccessLevel.NONE,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      manageContacts: false,
      createOrders: false,
      manageContracts: false,
      evaluatePerformance: false,
      managePayments: false
    },
    inventory: {
      view: AccessLevel.NONE,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      adjustStock: false,
      orderInventory: false,
      manageSuppliers: false,
      viewStockAlerts: false,
      transferStock: false,
      manageCategories: false
    },
    staff: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.ALL,
      delete: AccessLevel.ALL,
      manageRoles: false,
      assignPermissions: false,
      viewPerformance: AccessLevel.ALL,
      manageSchedules: AccessLevel.ALL,
      viewSalaries: AccessLevel.ALL,
      manageAttendance: AccessLevel.ALL
    },
    reports: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.ALL,
      delete: AccessLevel.ALL,
      viewSalesReports: false,
      viewFinancialReports: false,
      viewInventoryReports: false,
      viewStaffReports: true,
      viewCustomReports: false,
      scheduleReports: true
    },
    settings: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      manageSystemConfig: false,
      manageStoreInfo: false,
      manageTaxSettings: false,
      manageIntegrations: false,
      manageBackups: false,
      viewAuditLogs: false
    },
    financial: {
      view: AccessLevel.NONE,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      processPayments: false,
      manageAccounts: false,
      reconcileCash: false,
      viewFinancialSummary: false,
      manageExpenses: false,
      approveRefunds: false
    },
    customers: {
      view: AccessLevel.NONE,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      manageCustomerGroups: false,
      viewPurchaseHistory: false,
      manageRewards: false,
      manageCredits: false,
      exportCustomerData: false
    }
  },
  
  reportsAnalyst: {
    // Data analysis and reporting specialist
    sales: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      export: AccessLevel.ALL,
      processRefunds: false,
      applyDiscounts: false,
      voidTransactions: false,
      accessReports: true,
      managePromotions: false,
      viewSalesHistory: AccessLevel.ALL
    },
    shops: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      export: AccessLevel.ALL,
      manageLocations: false,
      assignStaff: false,
      viewPerformance: false,
      manageInventory: false,
      manageOperations: false
    },
    markets: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      export: AccessLevel.ALL,
      managePricing: false,
      createPromotions: false,
      manageCompetitors: false,
      viewMarketAnalytics: false,
      manageCampaigns: false
    },
    expenses: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      export: AccessLevel.ALL,
      createExpenses: false,
      approveExpenses: false,
      manageCategories: false,
      viewReports: true,
      manageRecurring: false
    },
    repairs: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      export: AccessLevel.ALL,
      createServiceTickets: false,
      assignTechnicians: false,
      orderParts: false,
      viewHistory: true,
      manageWorkflow: false
    },
    suppliers: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      export: AccessLevel.ALL,
      manageContacts: false,
      createOrders: false,
      manageContracts: false,
      evaluatePerformance: true,
      managePayments: false
    },
    inventory: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      export: AccessLevel.ALL,
      adjustStock: false,
      orderInventory: false,
      manageSuppliers: false,
      viewStockAlerts: true,
      transferStock: false,
      manageCategories: false
    },
    staff: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      export: AccessLevel.ALL,
      manageRoles: false,
      assignPermissions: false,
      viewPerformance: AccessLevel.ALL,
      manageSchedules: AccessLevel.NONE,
      viewSalaries: AccessLevel.NONE,
      manageAttendance: AccessLevel.NONE
    },
    reports: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.ALL,
      delete: AccessLevel.ALL,
      export: AccessLevel.ALL,
      viewSalesReports: true,
      viewFinancialReports: true,
      viewInventoryReports: true,
      viewStaffReports: true,
      viewCustomReports: true,
      scheduleReports: true
    },
    settings: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      export: AccessLevel.NONE,
      manageSystemConfig: false,
      manageStoreInfo: false,
      manageTaxSettings: false,
      manageIntegrations: false,
      manageBackups: false,
      viewAuditLogs: false
    },
    financial: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      export: AccessLevel.ALL,
      processPayments: false,
      manageAccounts: false,
      reconcileCash: false,
      viewFinancialSummary: true,
      manageExpenses: false,
      approveRefunds: false
    },
    customers: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      export: AccessLevel.ALL,
      manageCustomerGroups: false,
      viewPurchaseHistory: true,
      manageRewards: false,
      manageCredits: false,
      exportCustomerData: true
    }
  },
  
  salesAssociate: {
    // Focused on sales and customer service
    sales: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.SELF,
      delete: AccessLevel.NONE,
      processRefunds: false,
      applyDiscounts: true,
      voidTransactions: false,
      accessReports: false,
      managePromotions: false,
      viewSalesHistory: AccessLevel.SELF
    },
    shops: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      manageLocations: false,
      assignStaff: false,
      viewPerformance: false,
      manageInventory: false,
      manageOperations: false
    },
    markets: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      managePricing: false,
      createPromotions: false,
      manageCompetitors: false,
      viewMarketAnalytics: false,
      manageCampaigns: false
    },
    expenses: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      createExpenses: false,
      approveExpenses: false,
      manageCategories: false,
      viewReports: false,
      manageRecurring: false
    },
    repairs: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      createServiceTickets: false,
      assignTechnicians: false,
      orderParts: false,
      viewHistory: false,
      manageWorkflow: false
    },
    suppliers: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      manageContacts: false,
      createOrders: false,
      manageContracts: false,
      evaluatePerformance: false,
      managePayments: false
    },
    inventory: {
      view: AccessLevel.ALL,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      adjustStock: false,
      orderInventory: false,
      manageSuppliers: false,
      viewStockAlerts: false,
      transferStock: false,
      manageCategories: false
    },
    staff: {
      view: AccessLevel.NONE,
      create: AccessLevel.NONE,
      edit: AccessLevel.SELF,
      delete: AccessLevel.NONE,
      manageRoles: false,
      assignPermissions: false,
      viewPerformance: AccessLevel.SELF,
      manageSchedules: AccessLevel.NONE,
      viewSalaries: AccessLevel.NONE,
      manageAttendance: AccessLevel.SELF
    },
    reports: {
      view: AccessLevel.NONE,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      viewSalesReports: false,
      viewFinancialReports: false,
      viewInventoryReports: false,
      viewStaffReports: false,
      viewCustomReports: false,
      scheduleReports: false
    },
    settings: {
      view: AccessLevel.NONE,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      manageSystemConfig: false,
      manageStoreInfo: false,
      manageTaxSettings: false,
      manageIntegrations: false,
      manageBackups: false,
      viewAuditLogs: false
    },
    financial: {
      view: AccessLevel.NONE,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      processPayments: true,
      manageAccounts: false,
      reconcileCash: false,
      viewFinancialSummary: false,
      manageExpenses: false,
      approveRefunds: false
    },
    customers: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.ALL,
      delete: AccessLevel.NONE,
      manageCustomerGroups: false,
      viewPurchaseHistory: true,
      manageRewards: true,
      manageCredits: false,
      exportCustomerData: false
    }
  }
};

// Check if a user has permission for a specific action
export function hasPermission(
  permissions: Permissions, 
  module: keyof Permissions, 
  action: keyof PermissionItem,
  requiredLevel: AccessLevel = AccessLevel.ALL
): boolean {
  const modulePermissions = permissions[module] as PermissionItem;
  const userLevel = modulePermissions[action];
  
  // Map access levels to numeric values for comparison
  const levels = {
    [AccessLevel.NONE]: 0,
    [AccessLevel.SELF]: 1,
    [AccessLevel.DEPARTMENT]: 2,
    [AccessLevel.ALL]: 3
  };
  
  return levels[userLevel] >= levels[requiredLevel];
}

// Helper to check specific boolean permissions
export function hasSpecificPermission(
  permissions: Permissions,
  module: keyof Permissions,
  permission: string
): boolean {
  const modulePermissions = permissions[module] as any;
  return !!modulePermissions[permission];
} 