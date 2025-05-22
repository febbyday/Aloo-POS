/**
 * Permissions Schema
 * 
 * Standardized permission interfaces for the application.
 * These interfaces are used consistently across frontend and backend.
 */

import { AccessLevel } from './accessLevel';
import { z } from 'zod';

// Base permission structure for all modules
export interface PermissionItem {
  view: AccessLevel;
  create: AccessLevel;
  edit: AccessLevel;
  delete: AccessLevel;
  export?: AccessLevel;
  approve?: AccessLevel;
}

// Module-specific permission interfaces
export interface SalesPermissions extends PermissionItem {
  processRefunds: boolean;
  applyDiscounts: boolean;
  voidTransactions: boolean;
  accessReports: boolean;
  managePromotions: boolean;
  viewSalesHistory: AccessLevel;
}

export interface InventoryPermissions extends PermissionItem {
  adjustStock: boolean;
  orderInventory: boolean;
  manageSuppliers: boolean;
  viewStockAlerts: boolean;
  transferStock: boolean;
  manageCategories: boolean;
}

export interface StaffPermissions extends PermissionItem {
  manageRoles: boolean;
  assignPermissions: boolean;
  viewPerformance: AccessLevel;
  manageSchedules: AccessLevel;
  viewSalaries: AccessLevel;
  manageAttendance: AccessLevel;
}

export interface ReportsPermissions extends PermissionItem {
  viewSalesReports: boolean;
  viewFinancialReports: boolean;
  viewInventoryReports: boolean;
  viewStaffReports: boolean;
  viewCustomReports: boolean;
  scheduleReports: boolean;
}

export interface SettingsPermissions extends PermissionItem {
  manageSystemConfig: boolean;
  manageStoreInfo: boolean;
  manageTaxSettings: boolean;
  manageIntegrations: boolean;
  manageBackups: boolean;
  viewAuditLogs: boolean;
}

export interface FinancialPermissions extends PermissionItem {
  processPayments: boolean;
  manageAccounts: boolean;
  reconcileCash: boolean;
  viewFinancialSummary: boolean;
  manageExpenses: boolean;
  approveRefunds: boolean;
}

export interface CustomerPermissions extends PermissionItem {
  manageCustomerGroups: boolean;
  viewPurchaseHistory: boolean;
  manageRewards: boolean;
  manageCredits: boolean;
  exportCustomerData: boolean;
}

export interface ShopsPermissions extends PermissionItem {
  manageLocations: boolean;
  assignStaff: boolean;
  viewPerformance: boolean;
  manageInventory: boolean;
  manageOperations: boolean;
}

export interface MarketsPermissions extends PermissionItem {
  managePricing: boolean;
  createPromotions: boolean;
  manageCompetitors: boolean;
  viewMarketAnalytics: boolean;
  manageCampaigns: boolean;
}

export interface ExpensesPermissions extends PermissionItem {
  createExpenses: boolean;
  approveExpenses: boolean;
  manageCategories: boolean;
  viewReports: boolean;
  manageRecurring: boolean;
}

export interface RepairsPermissions extends PermissionItem {
  createServiceTickets: boolean;
  assignTechnicians: boolean;
  orderParts: boolean;
  viewHistory: boolean;
  manageWorkflow: boolean;
}

export interface SuppliersPermissions extends PermissionItem {
  manageContacts: boolean;
  createOrders: boolean;
  manageContracts: boolean;
  evaluatePerformance: boolean;
  managePayments: boolean;
}

// Combined permissions interface
export interface Permissions {
  sales: SalesPermissions;
  inventory: InventoryPermissions;
  staff: StaffPermissions;
  reports: ReportsPermissions;
  settings: SettingsPermissions;
  financial: FinancialPermissions;
  customers: CustomerPermissions;
  shops: ShopsPermissions;
  markets: MarketsPermissions;
  expenses: ExpensesPermissions;
  repairs: RepairsPermissions;
  suppliers: SuppliersPermissions;
}

// Generate default permissions with no access
export function getDefaultPermissions(): Permissions {
  const defaultItem: PermissionItem = {
    view: AccessLevel.NONE,
    create: AccessLevel.NONE,
    edit: AccessLevel.NONE,
    delete: AccessLevel.NONE,
  };

  return {
    sales: {
      ...defaultItem,
      processRefunds: false,
      applyDiscounts: false,
      voidTransactions: false,
      accessReports: false,
      managePromotions: false,
      viewSalesHistory: AccessLevel.NONE,
    },
    inventory: {
      ...defaultItem,
      adjustStock: false,
      orderInventory: false,
      manageSuppliers: false,
      viewStockAlerts: false,
      transferStock: false,
      manageCategories: false,
    },
    staff: {
      ...defaultItem,
      manageRoles: false,
      assignPermissions: false,
      viewPerformance: AccessLevel.NONE,
      manageSchedules: AccessLevel.NONE,
      viewSalaries: AccessLevel.NONE,
      manageAttendance: AccessLevel.NONE,
    },
    reports: {
      ...defaultItem,
      viewSalesReports: false,
      viewFinancialReports: false,
      viewInventoryReports: false,
      viewStaffReports: false,
      viewCustomReports: false,
      scheduleReports: false,
    },
    settings: {
      ...defaultItem,
      manageSystemConfig: false,
      manageStoreInfo: false,
      manageTaxSettings: false,
      manageIntegrations: false,
      manageBackups: false,
      viewAuditLogs: false,
    },
    financial: {
      ...defaultItem,
      processPayments: false,
      manageAccounts: false,
      reconcileCash: false,
      viewFinancialSummary: false,
      manageExpenses: false,
      approveRefunds: false,
    },
    customers: {
      ...defaultItem,
      manageCustomerGroups: false,
      viewPurchaseHistory: false,
      manageRewards: false,
      manageCredits: false,
      exportCustomerData: false,
    },
    shops: {
      ...defaultItem,
      manageLocations: false,
      assignStaff: false,
      viewPerformance: false,
      manageInventory: false,
      manageOperations: false,
    },
    markets: {
      ...defaultItem,
      managePricing: false,
      createPromotions: false,
      manageCompetitors: false,
      viewMarketAnalytics: false,
      manageCampaigns: false,
    },
    expenses: {
      ...defaultItem,
      createExpenses: false,
      approveExpenses: false,
      manageCategories: false,
      viewReports: false,
      manageRecurring: false,
    },
    repairs: {
      ...defaultItem,
      createServiceTickets: false,
      assignTechnicians: false,
      orderParts: false,
      viewHistory: false,
      manageWorkflow: false,
    },
    suppliers: {
      ...defaultItem,
      manageContacts: false,
      createOrders: false,
      manageContracts: false,
      evaluatePerformance: false,
      managePayments: false,
    },
  };
}
