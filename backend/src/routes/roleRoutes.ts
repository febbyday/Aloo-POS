import express from 'express';
import { 
  getAllRoles, 
  getRoleById, 
  createRole, 
  updateRole, 
  deleteRole 
} from '../controllers/roleController';

const router = express.Router();

// Helper to create default permissions object
const createDefaultPermissions = () => {
  const defaultAccessLevel = 'none'; // Default access level for all permissions
  
  // Base permission item with CRUD operations
  const defaultItem = {
    view: defaultAccessLevel,
    create: defaultAccessLevel,
    edit: defaultAccessLevel,
    delete: defaultAccessLevel
  };
  
  // Return full permissions object structure
  return {
    sales: {
      ...defaultItem,
      processRefunds: false,
      applyDiscounts: false,
      voidTransactions: false,
      accessReports: false,
      managePromotions: false,
      viewSalesHistory: defaultAccessLevel
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
      viewPerformance: defaultAccessLevel,
      manageSchedules: defaultAccessLevel,
      viewSalaries: defaultAccessLevel,
      manageAttendance: defaultAccessLevel
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
};

// Create predefined role templates with comprehensive permissions
const createRoleTemplate = (roleName: string) => {
  // Base permissions for all roles (no permissions)
  const permissions = createDefaultPermissions();
  
  switch (roleName) {
    case 'Administrator': {
      // Administrator gets full access to everything
      Object.keys(permissions).forEach(module => {
        const modulePermissions = permissions[module];
        
        // Set all boolean flags to true
        Object.keys(modulePermissions).forEach(permission => {
          const value = modulePermissions[permission];
          if (typeof value === 'boolean') {
            modulePermissions[permission] = true;
          } else if (typeof value === 'string') {
            modulePermissions[permission] = 'all'; // Full access to all access level permissions
          }
        });
      });
      break;
    }
    
    case 'Store Manager': {
      // Store manager gets full access to most areas except some settings
      
      // Sales permissions
      permissions.sales.view = 'all';
      permissions.sales.create = 'all';
      permissions.sales.edit = 'all';
      permissions.sales.delete = 'all';
      permissions.sales.processRefunds = true;
      permissions.sales.applyDiscounts = true;
      permissions.sales.voidTransactions = true;
      permissions.sales.accessReports = true;
      permissions.sales.managePromotions = true;
      permissions.sales.viewSalesHistory = 'all';
      
      // Inventory permissions
      permissions.inventory.view = 'all';
      permissions.inventory.create = 'all';
      permissions.inventory.edit = 'all';
      permissions.inventory.delete = 'all';
      permissions.inventory.adjustStock = true;
      permissions.inventory.orderInventory = true;
      permissions.inventory.manageSuppliers = true;
      permissions.inventory.viewStockAlerts = true;
      permissions.inventory.transferStock = true;
      permissions.inventory.manageCategories = true;
      
      // Staff permissions
      permissions.staff.view = 'all';
      permissions.staff.create = 'all';
      permissions.staff.edit = 'all';
      permissions.staff.delete = 'dept';
      permissions.staff.manageRoles = false; // Can't manage roles
      permissions.staff.assignPermissions = false; // Can't assign permissions
      permissions.staff.viewPerformance = 'all';
      permissions.staff.manageSchedules = 'all';
      permissions.staff.viewSalaries = 'dept';
      permissions.staff.manageAttendance = 'all';
      
      // Reports permissions
      permissions.reports.view = 'all';
      permissions.reports.create = 'all';
      permissions.reports.edit = 'dept';
      permissions.reports.delete = 'dept';
      permissions.reports.viewSalesReports = true;
      permissions.reports.viewFinancialReports = true;
      permissions.reports.viewInventoryReports = true;
      permissions.reports.viewStaffReports = true;
      permissions.reports.viewCustomReports = true;
      permissions.reports.scheduleReports = true;
      
      // Settings permissions - limited
      permissions.settings.view = 'all';
      permissions.settings.create = 'none';
      permissions.settings.edit = 'none';
      permissions.settings.delete = 'none';
      permissions.settings.manageStoreInfo = true;
      permissions.settings.viewAuditLogs = true;
      
      // Financial permissions
      permissions.financial.view = 'all';
      permissions.financial.create = 'all';
      permissions.financial.edit = 'dept';
      permissions.financial.delete = 'none';
      permissions.financial.processPayments = true;
      permissions.financial.reconcileCash = true;
      permissions.financial.viewFinancialSummary = true;
      permissions.financial.manageExpenses = true;
      permissions.financial.approveRefunds = true;
      
      // Customer permissions
      permissions.customers.view = 'all';
      permissions.customers.create = 'all';
      permissions.customers.edit = 'all';
      permissions.customers.delete = 'dept';
      permissions.customers.manageCustomerGroups = true;
      permissions.customers.viewPurchaseHistory = true;
      permissions.customers.manageRewards = true;
      permissions.customers.manageCredits = true;
      permissions.customers.exportCustomerData = true;
      break;
    }
    
    case 'Cashier': {
      // Cashier gets focused permissions for sales operations
      
      // Sales permissions
      permissions.sales.view = 'all';
      permissions.sales.create = 'all';
      permissions.sales.edit = 'self';
      permissions.sales.delete = 'none';
      permissions.sales.processRefunds = false; // Needs manager approval
      permissions.sales.applyDiscounts = true;
      permissions.sales.voidTransactions = false; // Needs manager approval
      permissions.sales.accessReports = false;
      permissions.sales.managePromotions = false;
      permissions.sales.viewSalesHistory = 'self';
      
      // Inventory permissions - limited view only
      permissions.inventory.view = 'all';
      permissions.inventory.viewStockAlerts = true;
      
      // Customers permissions - focused on serving customers
      permissions.customers.view = 'all';
      permissions.customers.create = 'all';
      permissions.customers.edit = 'none';
      permissions.customers.viewPurchaseHistory = true;
      permissions.customers.manageRewards = true;
      
      // Financial permissions - limited to processing payments
      permissions.financial.processPayments = true;
      break;
    }
    
    case 'Inventory Manager': {
      // Inventory manager gets full access to inventory
      
      // Inventory permissions - full control
      permissions.inventory.view = 'all';
      permissions.inventory.create = 'all';
      permissions.inventory.edit = 'all';
      permissions.inventory.delete = 'all';
      permissions.inventory.adjustStock = true;
      permissions.inventory.orderInventory = true;
      permissions.inventory.manageSuppliers = true;
      permissions.inventory.viewStockAlerts = true;
      permissions.inventory.transferStock = true;
      permissions.inventory.manageCategories = true;
      
      // Reports permissions - inventory focused
      permissions.reports.view = 'all';
      permissions.reports.viewInventoryReports = true;
      
      // Sales permissions - limited view for context
      permissions.sales.view = 'all';
      
      // Suppliers related permissions
      permissions.staff.view = 'all'; // To see who's responsible for inventory
      break;
    }
    
    case 'Finance Manager': {
      // Finance manager gets full financial access
      
      // Financial permissions - full control
      permissions.financial.view = 'all';
      permissions.financial.create = 'all';
      permissions.financial.edit = 'all';
      permissions.financial.delete = 'all';
      permissions.financial.processPayments = true;
      permissions.financial.manageAccounts = true;
      permissions.financial.reconcileCash = true;
      permissions.financial.viewFinancialSummary = true;
      permissions.financial.manageExpenses = true;
      permissions.financial.approveRefunds = true;
      
      // Sales permissions - view for financial context
      permissions.sales.view = 'all';
      permissions.sales.viewSalesHistory = 'all';
      permissions.sales.processRefunds = true;
      
      // Reports permissions - finance focused
      permissions.reports.view = 'all';
      permissions.reports.viewFinancialReports = true;
      permissions.reports.viewSalesReports = true;
      
      // Settings permissions - tax related
      permissions.settings.view = 'all';
      permissions.settings.manageTaxSettings = true;
      break;
    }
    
    case 'Staff Manager': {
      // Staff/HR manager permissions
      
      // Staff permissions - full control
      permissions.staff.view = 'all';
      permissions.staff.create = 'all';
      permissions.staff.edit = 'all';
      permissions.staff.delete = 'all';
      permissions.staff.manageRoles = false; // Can't manage roles
      permissions.staff.assignPermissions = false; // Can't assign permissions
      permissions.staff.viewPerformance = 'all';
      permissions.staff.manageSchedules = 'all';
      permissions.staff.viewSalaries = 'all';
      permissions.staff.manageAttendance = 'all';
      
      // Reports permissions - staff focused
      permissions.reports.view = 'all';
      permissions.reports.viewStaffReports = true;
      
      // Settings permissions - limited
      permissions.settings.view = 'all';
      break;
    }
    
    case 'Reports Analyst': {
      // Reports analyst gets read-only access to all data for analysis
      
      // All modules get read-only access
      Object.keys(permissions).forEach(module => {
        permissions[module].view = 'all';
      });
      
      // Reports permissions - full access
      permissions.reports.view = 'all';
      permissions.reports.create = 'all';
      permissions.reports.edit = 'all';
      permissions.reports.delete = 'all';
      permissions.reports.viewSalesReports = true;
      permissions.reports.viewFinancialReports = true;
      permissions.reports.viewInventoryReports = true;
      permissions.reports.viewStaffReports = true;
      permissions.reports.viewCustomReports = true;
      permissions.reports.scheduleReports = true;
      
      // Export permissions for all modules
      Object.keys(permissions).forEach(module => {
        if (permissions[module].export !== undefined) {
          permissions[module].export = 'all';
        }
      });
      
      // Customer data export
      permissions.customers.exportCustomerData = true;
      break;
    }
    
    case 'Sales Associate': {
      // Sales associate gets limited access focused on sales and customers
      permissions.sales.view = 'all';
      permissions.sales.create = 'all';
      permissions.sales.edit = 'self';
      permissions.sales.delete = 'none';
      permissions.sales.applyDiscounts = true;
      permissions.sales.viewSalesHistory = 'self';
      
      permissions.inventory.view = 'all'; // Can view products
      
      permissions.customers.view = 'all';
      permissions.customers.create = 'all';
      permissions.customers.edit = 'all';
      permissions.customers.viewPurchaseHistory = true;
      permissions.customers.manageRewards = true;
      
      permissions.financial.processPayments = true;
      break;
    }
    
    default:
      // Default case handles unknown roles by returning basic permissions
      break;
  }
  
  return permissions;
};

// Enhanced mock roles data with comprehensive permissions
const mockRoles = [
  {
    id: "1",
    name: "Administrator",
    description: "Full system access with ability to configure all settings and manage roles",
    staffCount: 1,
    permissions: createRoleTemplate('Administrator'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "2",
    name: "Store Manager",
    description: "Full access to store operations and management features",
    staffCount: 2,
    permissions: createRoleTemplate('Store Manager'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "3",
    name: "Cashier",
    description: "Processes sales transactions and basic customer service",
    staffCount: 8,
    permissions: createRoleTemplate('Cashier'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "4",
    name: "Inventory Manager",
    description: "Manages inventory, stock operations, and suppliers",
    staffCount: 3,
    permissions: createRoleTemplate('Inventory Manager'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "5",
    name: "Finance Manager",
    description: "Oversees financial operations, expenses, and reconciliation",
    staffCount: 2,
    permissions: createRoleTemplate('Finance Manager'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "6",
    name: "Staff Manager",
    description: "Manages staff schedules, performance, and HR functions",
    staffCount: 1,
    permissions: createRoleTemplate('Staff Manager'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "7",
    name: "Reports Analyst",
    description: "Analyzes data and generates reports across all business areas",
    staffCount: 1,
    permissions: createRoleTemplate('Reports Analyst'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "8",
    name: "Sales Associate",
    description: "Handles sales operations and basic customer service",
    staffCount: 5,
    permissions: createRoleTemplate('Sales Associate'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

/**
 * @route   GET /api/v1/roles
 * @desc    Get all roles
 * @access  Public
 */
router.get('/', getAllRoles);

/**
 * @route   GET /api/v1/roles/:id
 * @desc    Get a role by ID
 * @access  Public
 */
router.get('/:id', getRoleById);

/**
 * @route   POST /api/v1/roles
 * @desc    Create a new role
 * @access  Public
 */
router.post('/', createRole);

/**
 * @route   PATCH /api/v1/roles/:id
 * @desc    Update a role
 * @access  Public
 */
router.patch('/:id', updateRole);

/**
 * @route   DELETE /api/v1/roles/:id
 * @desc    Delete a role
 * @access  Public
 */
router.delete('/:id', deleteRole);

export default router;