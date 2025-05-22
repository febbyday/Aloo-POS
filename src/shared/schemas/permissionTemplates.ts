/**
 * Permission Templates
 * 
 * Standardized permission templates for common roles in the application.
 * These templates are used consistently across frontend and backend.
 */

import { AccessLevel } from './accessLevel';
import { Permissions } from './permissions';

/**
 * Predefined permission templates for common roles
 * These templates provide a starting point for creating new roles
 */
export const permissionTemplates: Record<string, Permissions> = {
  administrator: {
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
      delete: AccessLevel.ALL,
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
      manageCustomerGroups: true,
      viewPurchaseHistory: true,
      manageRewards: true,
      manageCredits: true,
      exportCustomerData: true
    }
  },
  storeManager: {
    sales: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.ALL,
      delete: AccessLevel.DEPARTMENT,
      processRefunds: true,
      applyDiscounts: true,
      voidTransactions: true,
      accessReports: true,
      managePromotions: true,
      viewSalesHistory: AccessLevel.ALL
    },
    shops: {
      view: AccessLevel.ALL,
      create: AccessLevel.DEPARTMENT,
      edit: AccessLevel.DEPARTMENT,
      delete: AccessLevel.NONE,
      manageLocations: false,
      assignStaff: true,
      viewPerformance: true,
      manageInventory: true,
      manageOperations: true
    },
    markets: {
      view: AccessLevel.ALL,
      create: AccessLevel.DEPARTMENT,
      edit: AccessLevel.DEPARTMENT,
      delete: AccessLevel.NONE,
      managePricing: true,
      createPromotions: true,
      manageCompetitors: false,
      viewMarketAnalytics: true,
      manageCampaigns: true
    },
    expenses: {
      view: AccessLevel.DEPARTMENT,
      create: AccessLevel.DEPARTMENT,
      edit: AccessLevel.DEPARTMENT,
      delete: AccessLevel.NONE,
      createExpenses: true,
      approveExpenses: true,
      manageCategories: false,
      viewReports: true,
      manageRecurring: true
    },
    repairs: {
      view: AccessLevel.ALL,
      create: AccessLevel.ALL,
      edit: AccessLevel.ALL,
      delete: AccessLevel.DEPARTMENT,
      createServiceTickets: true,
      assignTechnicians: true,
      orderParts: true,
      viewHistory: true,
      manageWorkflow: true
    },
    suppliers: {
      view: AccessLevel.ALL,
      create: AccessLevel.DEPARTMENT,
      edit: AccessLevel.DEPARTMENT,
      delete: AccessLevel.NONE,
      manageContacts: true,
      createOrders: true,
      manageContracts: false,
      evaluatePerformance: true,
      managePayments: true
    },
    inventory: {
      view: AccessLevel.ALL,
      create: AccessLevel.DEPARTMENT,
      edit: AccessLevel.DEPARTMENT,
      delete: AccessLevel.NONE,
      adjustStock: true,
      orderInventory: true,
      manageSuppliers: true,
      viewStockAlerts: true,
      transferStock: true,
      manageCategories: false
    },
    staff: {
      view: AccessLevel.DEPARTMENT,
      create: AccessLevel.NONE,
      edit: AccessLevel.DEPARTMENT,
      delete: AccessLevel.NONE,
      manageRoles: false,
      assignPermissions: false,
      viewPerformance: AccessLevel.DEPARTMENT,
      manageSchedules: AccessLevel.DEPARTMENT,
      viewSalaries: AccessLevel.NONE,
      manageAttendance: AccessLevel.DEPARTMENT
    },
    reports: {
      view: AccessLevel.DEPARTMENT,
      create: AccessLevel.DEPARTMENT,
      edit: AccessLevel.DEPARTMENT,
      delete: AccessLevel.NONE,
      viewSalesReports: true,
      viewFinancialReports: true,
      viewInventoryReports: true,
      viewStaffReports: true,
      viewCustomReports: false,
      scheduleReports: true
    },
    settings: {
      view: AccessLevel.DEPARTMENT,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      manageSystemConfig: false,
      manageStoreInfo: true,
      manageTaxSettings: false,
      manageIntegrations: false,
      manageBackups: false,
      viewAuditLogs: false
    },
    financial: {
      view: AccessLevel.DEPARTMENT,
      create: AccessLevel.DEPARTMENT,
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
      edit: AccessLevel.DEPARTMENT,
      delete: AccessLevel.NONE,
      manageCustomerGroups: true,
      viewPurchaseHistory: true,
      manageRewards: true,
      manageCredits: true,
      exportCustomerData: false
    }
  },
  cashier: {
    sales: {
      view: AccessLevel.SELF,
      create: AccessLevel.SELF,
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
      view: AccessLevel.SELF,
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
      view: AccessLevel.SELF,
      create: AccessLevel.SELF,
      edit: AccessLevel.SELF,
      delete: AccessLevel.NONE,
      createServiceTickets: true,
      assignTechnicians: false,
      orderParts: false,
      viewHistory: true,
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
      view: AccessLevel.SELF,
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
      view: AccessLevel.NONE,
      create: AccessLevel.NONE,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      manageRoles: false,
      assignPermissions: false,
      viewPerformance: AccessLevel.SELF,
      manageSchedules: AccessLevel.NONE,
      viewSalaries: AccessLevel.SELF,
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
      view: AccessLevel.SELF,
      create: AccessLevel.SELF,
      edit: AccessLevel.NONE,
      delete: AccessLevel.NONE,
      processPayments: true,
      manageAccounts: false,
      reconcileCash: true,
      viewFinancialSummary: false,
      manageExpenses: false,
      approveRefunds: false
    },
    customers: {
      view: AccessLevel.SELF,
      create: AccessLevel.SELF,
      edit: AccessLevel.SELF,
      delete: AccessLevel.NONE,
      manageCustomerGroups: false,
      viewPurchaseHistory: true,
      manageRewards: true,
      manageCredits: false,
      exportCustomerData: false
    }
  }
};
