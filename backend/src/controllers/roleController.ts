// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import auditService from '../services/auditService';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/permissions';

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
  shops: Permission;
  suppliers: Permission;
  [key: string]: Permission;
}

// Input validation schema for roles
const roleSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be at most 50 characters'),
  description: z.string().max(200, 'Description must be at most 200 characters').optional(),
  permissions: z.record(z.string(), z.any()),
  isActive: z.boolean().default(true),
  isSystemRole: z.boolean().default(false)
});

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
    },
    shops: { ...defaultItem },
    suppliers: { ...defaultItem }
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
    
    case 'Manager': {
      // Store manager gets full access to most areas except some settings
      
      // Sales permissions
      permissions.sales.view = 'all';
      permissions.sales.create = 'all';
      permissions.sales.edit = 'all';
      permissions.sales.delete = 'dept';
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
      permissions.inventory.delete = 'dept';
      permissions.inventory.adjustStock = true;
      permissions.inventory.orderInventory = true;
      permissions.inventory.manageSuppliers = true;
      permissions.inventory.viewStockAlerts = true;
      permissions.inventory.transferStock = true;
      permissions.inventory.manageCategories = true;
      
      // Staff permissions
      permissions.staff.view = 'all';
      permissions.staff.create = 'dept';
      permissions.staff.edit = 'dept';
      permissions.staff.delete = 'none';
      permissions.staff.viewPerformance = 'dept';
      permissions.staff.manageSchedules = 'dept';
      permissions.staff.viewSalaries = 'dept';
      permissions.staff.manageAttendance = 'dept';
      
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
      permissions.sales.viewSalesHistory = 'self';
      
      // Limited permissions in other areas
      permissions.inventory.view = 'all';
      permissions.customers.view = 'all';
      permissions.customers.create = 'all';
      
      permissions.financial.processPayments = true;
      break;
    }
    
    case 'Inventory Manager': {
      // Inventory-focused permissions
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
      
      permissions.suppliers.view = 'all';
      permissions.suppliers.create = 'all';
      permissions.suppliers.edit = 'all';
      permissions.suppliers.delete = 'dept';
      
      permissions.reports.view = 'all';
      permissions.reports.viewInventoryReports = true;
      break;
    }
    
    case 'Staff Manager': {
      // Staff/HR manager permissions
      permissions.staff.view = 'all';
      permissions.staff.create = 'all';
      permissions.staff.edit = 'all';
      permissions.staff.delete = 'all';
      permissions.staff.viewPerformance = 'all';
      permissions.staff.manageSchedules = 'all';
      permissions.staff.viewSalaries = 'all';
      permissions.staff.manageAttendance = 'all';
      
      permissions.reports.view = 'all';
      permissions.reports.viewStaffReports = true;
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
      },
      {
        name: 'Inventory Manager',
        description: 'Manages product inventory and stock levels',
        isSystemRole: true
      },
      {
        name: 'Staff Manager',
        description: 'Manages staff scheduling and HR functions',
        isSystemRole: true
      }
    ];
    
    for (const role of defaultRoles) {
      try {
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
      } catch (innerError) {
        console.error(`Error creating role ${role.name}:`, innerError);
        // Continue to next role instead of failing completely
      }
    }
  } catch (error) {
    console.error('Error creating default roles:', error);
  }
};

// Initialize default roles on demand instead of at server start
// Commenting out automatic initialization to avoid errors during startup
// createDefaultRoles();

// Export createDefaultRoles so it can be called manually
export { createDefaultRoles };

/**
 * Get all roles
 * @route GET /api/v1/roles
 */
export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: { staff: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform the roles to include staffCount
    const transformedRoles = roles.map(role => ({
      ...role,
      staffCount: role._count.staff,
      _count: undefined
    }));

    return res.status(200).json(transformedRoles);
  } catch (error) {
    logger.error('Error fetching roles:', error);
    return res.status(500).json({ error: 'Failed to fetch roles' });
  }
};

/**
 * Get role by ID
 * @route GET /api/v1/roles/:id
 */
export const getRoleById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { staff: true }
        }
      }
    });

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Transform the role to include staffCount
    const transformedRole = {
      ...role,
      staffCount: role._count.staff,
      _count: undefined
    };

    return res.status(200).json(transformedRole);
  } catch (error) {
    logger.error(`Error fetching role ${id}:`, error);
    return res.status(500).json({ error: 'Failed to fetch role' });
  }
};

/**
 * Create a new role
 * @route POST /api/v1/roles
 */
export const createRole = async (req: AuthRequest, res: Response) => {
  const { name, description, permissions, isActive = true, isSystemRole = false } = req.body;

  try {
    // Validate input
    try {
      roleSchema.parse({
        name,
        description,
        permissions,
        isActive,
        isSystemRole
      });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: validationError.errors
        });
      }
      throw validationError;
    }

    // Check for existing role with the same name
    const existingRole = await prisma.role.findFirst({
      where: { 
        name: { 
          equals: name, 
          mode: 'insensitive' 
        } 
      }
    });

    if (existingRole) {
      return res.status(409).json({ 
        error: 'A role with this name already exists' 
      });
    }

    // Create role
    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions: permissions as Prisma.JsonValue,
        isActive,
        isSystemRole,
        createdBy: req.user?.id
      }
    });

    // Create audit log
    await prisma.roleAuditLog.create({
      data: {
        roleId: role.id,
        userId: req.user?.id,
        action: 'create',
        changes: {
          name: { from: null, to: name },
          description: { from: null, to: description },
          isActive: { from: null, to: isActive },
          permissions: permissions ? Object.keys(permissions).map(module => ({
            module,
            from: null,
            to: permissions[module]
          })) : []
        }
      }
    });

    logger.info(`Role created: ${role.id} (${role.name})`);
    return res.status(201).json(role);
  } catch (error) {
    logger.error('Error creating role:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'A role with this name already exists' });
      }
    }
    
    return res.status(500).json({ error: 'Failed to create role' });
  }
};

/**
 * Update an existing role
 * @route PATCH /api/v1/roles/:id
 */
export const updateRole = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, description, permissions, isActive } = req.body;

  try {
    const existingRole = await prisma.role.findUnique({
      where: { id }
    });

    if (!existingRole) {
      return res.status(404).json({ error: 'Role not found' });
    }

    if (existingRole.isSystemRole) {
      return res.status(403).json({ error: 'System roles cannot be modified' });
    }

    // Prepare data for update
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (permissions !== undefined) updateData.permissions = permissions;
    if (isActive !== undefined) updateData.isActive = isActive;
    updateData.updatedBy = req.user?.id;

    // Update the role
    const updatedRole = await prisma.role.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { staff: true }
        }
      }
    });

    // Prepare changes for audit log
    const changes: any = {};
    if (name !== undefined && name !== existingRole.name) {
      changes.name = { from: existingRole.name, to: name };
    }
    if (description !== undefined && description !== existingRole.description) {
      changes.description = { from: existingRole.description, to: description };
    }
    if (isActive !== undefined && isActive !== existingRole.isActive) {
      changes.isActive = { from: existingRole.isActive, to: isActive };
    }
    if (permissions !== undefined) {
      // Compare permissions and track changes
      const permissionChanges: any[] = [];
      
      // Get all modules from both old and new permissions
      const allModules = new Set([
        ...Object.keys(existingRole.permissions || {}),
        ...Object.keys(permissions || {})
      ]);

      allModules.forEach(module => {
        const oldModulePerms = (existingRole.permissions || {})[module] || {};
        const newModulePerms = permissions[module] || {};
        
        // Get all permissions from both old and new for this module
        const allPerms = new Set([
          ...Object.keys(oldModulePerms),
          ...Object.keys(newModulePerms)
        ]);
        
        allPerms.forEach(perm => {
          const oldValue = oldModulePerms[perm];
          const newValue = newModulePerms[perm];
          
          if (oldValue !== newValue) {
            permissionChanges.push({
              module,
              permission: perm,
              from: oldValue,
              to: newValue
            });
          }
        });
      });
      
      if (permissionChanges.length > 0) {
        changes.permissions = permissionChanges;
      }
    }

    // Create audit log if there are changes
    if (Object.keys(changes).length > 0) {
      await prisma.roleAuditLog.create({
        data: {
          roleId: id,
          userId: req.user?.id,
          action: isActive !== undefined && isActive !== existingRole.isActive
            ? (isActive ? 'activate' : 'deactivate')
            : 'update',
          changes
        }
      });
    }

    // Transform the role to include staffCount
    const transformedRole = {
      ...updatedRole,
      staffCount: updatedRole._count.staff,
      _count: undefined
    };

    return res.status(200).json(transformedRole);
  } catch (error) {
    logger.error(`Error updating role ${id}:`, error);
    return res.status(500).json({ error: 'Failed to update role' });
  }
};

/**
 * Delete a role
 * @route DELETE /api/v1/roles/:id
 */
export const deleteRole = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { staff: true }
        }
      }
    });

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    if (role.isSystemRole) {
      return res.status(403).json({ error: 'System roles cannot be deleted' });
    }

    if (role._count.staff > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete a role that is assigned to staff members',
        staffCount: role._count.staff
      });
    }

    // Delete role
    await prisma.role.delete({
      where: { id }
    });

    // Create audit log
    await prisma.roleAuditLog.create({
      data: {
        roleId: id,
        userId: req.user?.id,
        action: 'delete',
        changes: {
          name: { from: role.name, to: null },
          description: { from: role.description, to: null },
          isActive: { from: role.isActive, to: null }
        }
      }
    });

    return res.status(200).json({ message: 'Role deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting role ${id}:`, error);
    return res.status(500).json({ error: 'Failed to delete role' });
  }
};

/**
 * Get staff members assigned to a role
 * @route GET /api/v1/roles/:id/staff
 */
export const getRoleStaff = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const role = await prisma.role.findUnique({
      where: { id }
    });

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    const staffMembers = await prisma.staff.findMany({
      where: {
        roleId: id
      },
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        firstName: 'asc'
      }
    });

    return res.status(200).json(staffMembers);
  } catch (error) {
    logger.error(`Error fetching staff for role ${id}:`, error);
    return res.status(500).json({ error: 'Failed to fetch staff members' });
  }
};

/**
 * Get audit logs for a role
 */
export const getRoleAuditLogs = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { page = 1, limit = 20, startDate, endDate } = req.query;

  const pageNum = Number(page);
  const limitNum = Number(limit);
  
  try {
    const role = await prisma.role.findUnique({
      where: { id }
    });

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Build the where clause
    const where: any = { roleId: id };
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    // Count total logs
    const totalCount = await prisma.roleAuditLog.count({ where });
    const totalPages = Math.ceil(totalCount / limitNum);

    // Get logs for the requested page
    const logs = await prisma.roleAuditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (pageNum - 1) * limitNum,
      take: limitNum
    });

    // Transform the logs to include userName
    const transformedLogs = logs.map(log => ({
      id: log.id,
      roleId: log.roleId,
      roleName: role.name,
      userId: log.userId,
      userName: log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System',
      action: log.action,
      changes: log.changes,
      timestamp: log.createdAt,
      user: undefined
    }));

    return res.status(200).json({
      logs: transformedLogs,
      totalCount,
      totalPages,
      currentPage: pageNum
    });
  } catch (error) {
    logger.error(`Error fetching audit logs for role ${id}:`, error);
    return res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};

/**
 * Get all role templates
 */
export const getRoleTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await prisma.roleTemplate.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return res.status(200).json(templates);
  } catch (error) {
    logger.error('Error fetching role templates:', error);
    return res.status(500).json({ error: 'Failed to fetch role templates' });
  }
};

/**
 * Apply a template to a role
 */
export const applyTemplateToRole = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { templateId } = req.body;

  if (!templateId) {
    return res.status(400).json({ error: 'Template ID is required' });
  }

  try {
    const role = await prisma.role.findUnique({
      where: { id }
    });

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    if (role.isSystemRole) {
      return res.status(403).json({ error: 'Cannot modify system roles' });
    }

    const template = await prisma.roleTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Update role with template permissions
    const updatedRole = await prisma.role.update({
      where: { id },
      data: {
        permissions: template.permissions,
        updatedBy: req.user?.id
      },
      include: {
        _count: {
          select: { staff: true }
        }
      }
    });

    // Create audit log
    await prisma.roleAuditLog.create({
      data: {
        roleId: id,
        userId: req.user?.id,
        action: 'update',
        changes: {
          template: { 
            from: null, 
            to: template.name 
          },
          permissions: Object.keys(template.permissions).map(module => ({
            module,
            permission: 'applied-template',
            from: (role.permissions as any)?.[module] || null,
            to: (template.permissions as any)[module] || null
          }))
        }
      }
    });

    // Transform the role to include staffCount
    const transformedRole = {
      ...updatedRole,
      staffCount: updatedRole._count.staff,
      _count: undefined
    };

    return res.status(200).json(transformedRole);
  } catch (error) {
    logger.error(`Error applying template to role ${id}:`, error);
    return res.status(500).json({ error: 'Failed to apply template to role' });
  }
};

/**
 * Get a specific role template
 */
export const getRoleTemplateById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const template = await prisma.roleTemplate.findUnique({
      where: { id }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    return res.status(200).json(template);
  } catch (error) {
    logger.error(`Error fetching template ${id}:`, error);
    return res.status(500).json({ error: 'Failed to fetch template' });
  }
};
