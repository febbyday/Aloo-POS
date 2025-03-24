// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

// Type definitions for strong typing
interface Permission {
  view: string;
  create: string;
  edit: string;
  delete: string;
  [key: string]: string | boolean;
}

interface PermissionsObject {
  sales: Permission;
  inventory: Permission;
  staff: Permission;
  reports: Permission;
  settings: Permission;
  financial: Permission;
  customers: Permission;
  [key: string]: Permission;
}

// Helper to create default permissions object
const createDefaultPermissions = (): PermissionsObject => {
  const defaultAccessLevel = 'none'; // Default access level for all permissions
  
  // Base permission item with CRUD operations
  const defaultItem: Permission = {
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
const createRoleTemplate = (roleName: string): PermissionsObject => {
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
      permissions.sales.processRefunds = false;
      permissions.sales.applyDiscounts = true;
      permissions.sales.voidTransactions = false;
      
      // Limited permissions in other areas
      permissions.inventory.view = 'all';
      permissions.customers.view = 'all';
      permissions.customers.create = 'all';
      
      break;
    }
  }
  
  return permissions;
};

/**
 * Create default system roles if they don't exist
 */
const createDefaultRoles = async () => {
  try {
    const defaultRoles = [
      {
        name: 'Administrator',
        description: 'Full system access with all permissions',
        isSystemRole: true
      },
      {
        name: 'Manager',
        description: 'Manages store operations with limited system configuration access',
        isSystemRole: true
      },
      {
        name: 'Cashier',
        description: 'Handles sales and basic customer management',
        isSystemRole: true
      }
    ];
    
    for (const role of defaultRoles) {
      const exists = await prisma.role.findUnique({
        where: { name: role.name }
      });
      
      if (!exists) {
        await prisma.role.create({
          data: {
            name: role.name,
            description: role.description,
            permissions: createRoleTemplate(role.name),
            isSystemRole: role.isSystemRole,
            isActive: true
          }
        });
        console.log(`Created default role: ${role.name}`);
      }
    }
  } catch (error) {
    console.error('Error creating default roles:', error);
  }
};

// Initialize default roles when the server starts
createDefaultRoles();

/**
 * Get all roles
 * @route GET /api/v1/roles
 */
export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    return res.status(200).json(roles);
  } catch (error) {
    console.error('Error getting roles:', error);
    return res.status(500).json({ error: 'Failed to fetch roles' });
  }
};

/**
 * Get role by ID
 * @route GET /api/v1/roles/:id
 */
export const getRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const role = await prisma.role.findUnique({
      where: { id }
    });
    
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    return res.status(200).json(role);
  } catch (error) {
    console.error('Error getting role:', error);
    return res.status(500).json({ error: 'Failed to fetch role' });
  }
};

/**
 * Create a new role
 * @route POST /api/v1/roles
 */
export const createRole = async (req: Request, res: Response) => {
  try {
    const { name, description, permissions } = req.body;
    
    // Validate required fields
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }
    
    // Check if role with this name already exists
    const existing = await prisma.role.findUnique({
      where: { name }
    });
    
    if (existing) {
      return res.status(400).json({ error: 'A role with this name already exists' });
    }
    
    // Use default permissions if none provided
    const rolePermissions = permissions || createDefaultPermissions();
    
    // Create new role
    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions: rolePermissions,
        isSystemRole: false,
        isActive: true
      }
    });
    
    return res.status(201).json(role);
  } catch (error) {
    console.error('Error creating role:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'A role with this name already exists' });
      }
    }
    
    return res.status(500).json({ error: 'Failed to create role' });
  }
};

/**
 * Update an existing role
 * @route PATCH /api/v1/roles/:id
 */
export const updateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, permissions, isActive } = req.body;
    
    // Check if role exists
    const existing = await prisma.role.findUnique({
      where: { id }
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    // Prevent modification of system roles (except for permissions)
    if (existing.isSystemRole && (name !== undefined || description !== undefined)) {
      return res.status(403).json({ 
        error: 'System roles cannot have their name or description modified' 
      });
    }
    
    // Check if updating to a name that already exists (excluding current record)
    if (name && name !== existing.name) {
      const nameExists = await prisma.role.findFirst({
        where: {
          name,
          id: { not: id }
        }
      });
      
      if (nameExists) {
        return res.status(400).json({ error: 'A role with this name already exists' });
      }
    }
    
    // Update role
    const updatedRole = await prisma.role.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(permissions && { permissions }),
        ...(isActive !== undefined && { isActive })
      }
    });
    
    return res.status(200).json(updatedRole);
  } catch (error) {
    console.error('Error updating role:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'A role with this name already exists' });
      }
    }
    
    return res.status(500).json({ error: 'Failed to update role' });
  }
};

/**
 * Delete a role
 * @route DELETE /api/v1/roles/:id
 */
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if role exists
    const existing = await prisma.role.findUnique({
      where: { id },
      include: {
        staff: {
          select: { id: true }
        }
      }
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    // Prevent deletion of system roles
    if (existing.isSystemRole) {
      return res.status(403).json({ error: 'System roles cannot be deleted' });
    }
    
    // Check if role is assigned to any staff
    if (existing.staff.length > 0) {
      return res.status(400).json({ 
        error: 'This role is assigned to staff members and cannot be deleted'
      });
    }
    
    // Delete role
    await prisma.role.delete({
      where: { id }
    });
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting role:', error);
    return res.status(500).json({ error: 'Failed to delete role' });
  }
};
