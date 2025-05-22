import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import auditService from '../services/auditService';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/permissions';
import { roleSchema, createRoleSchema, updateRoleSchema } from '../../shared/schemas/roleSchema';
import { Permissions } from '../../shared/schemas/permissions';
import { AccessLevel } from '../../shared/schemas/accessLevel';
import { getDefaultPermissions } from '../../shared/schemas/permissions';
import {
  stringArrayToPermissions,
  permissionsToStringArray,
  convertLegacyPermissions
} from '../utils/permissionUtils';

// Type alias for compatibility with existing code
type PermissionsObject = Permissions;

// Use the shared getDefaultPermissions function
const createDefaultPermissions = (): PermissionsObject => {
  return getDefaultPermissions();
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
            modulePermissions[permission] = AccessLevel.ALL; // Full access to all access level permissions
          }
        });
      });
      break;
    }

    case 'Manager': {
      // Store manager gets full access to most areas except some settings

      // Sales permissions
      permissions.sales.view = AccessLevel.ALL;
      permissions.sales.create = AccessLevel.ALL;
      permissions.sales.edit = AccessLevel.ALL;
      permissions.sales.delete = AccessLevel.DEPARTMENT;
      permissions.sales.processRefunds = true;
      permissions.sales.applyDiscounts = true;
      permissions.sales.voidTransactions = true;
      permissions.sales.accessReports = true;
      permissions.sales.managePromotions = true;
      permissions.sales.viewSalesHistory = AccessLevel.ALL;

      // Inventory permissions
      permissions.inventory.view = AccessLevel.ALL;
      permissions.inventory.create = AccessLevel.ALL;
      permissions.inventory.edit = AccessLevel.ALL;
      permissions.inventory.delete = AccessLevel.DEPARTMENT;
      permissions.inventory.adjustStock = true;
      permissions.inventory.orderInventory = true;
      permissions.inventory.manageSuppliers = true;
      permissions.inventory.viewStockAlerts = true;
      permissions.inventory.transferStock = true;
      permissions.inventory.manageCategories = true;

      // Staff permissions
      permissions.staff.view = AccessLevel.ALL;
      permissions.staff.create = AccessLevel.DEPARTMENT;
      permissions.staff.edit = AccessLevel.DEPARTMENT;
      permissions.staff.delete = AccessLevel.NONE;
      permissions.staff.viewPerformance = AccessLevel.DEPARTMENT;
      permissions.staff.manageSchedules = AccessLevel.DEPARTMENT;
      permissions.staff.viewSalaries = AccessLevel.DEPARTMENT;
      permissions.staff.manageAttendance = AccessLevel.DEPARTMENT;

      // Reports permissions
      permissions.reports.view = AccessLevel.ALL;
      permissions.reports.create = AccessLevel.ALL;
      permissions.reports.edit = AccessLevel.DEPARTMENT;
      permissions.reports.delete = AccessLevel.DEPARTMENT;
      permissions.reports.viewSalesReports = true;
      permissions.reports.viewFinancialReports = true;
      permissions.reports.viewInventoryReports = true;
      permissions.reports.viewStaffReports = true;
      permissions.reports.viewCustomReports = true;
      permissions.reports.scheduleReports = true;

      // Settings permissions - limited
      permissions.settings.view = AccessLevel.ALL;
      permissions.settings.create = AccessLevel.NONE;
      permissions.settings.edit = AccessLevel.NONE;
      permissions.settings.delete = AccessLevel.NONE;
      permissions.settings.manageStoreInfo = true;
      permissions.settings.viewAuditLogs = true;

      // Financial permissions
      permissions.financial.view = AccessLevel.ALL;
      permissions.financial.create = AccessLevel.ALL;
      permissions.financial.edit = AccessLevel.DEPARTMENT;
      permissions.financial.delete = AccessLevel.NONE;
      permissions.financial.processPayments = true;
      permissions.financial.reconcileCash = true;
      permissions.financial.viewFinancialSummary = true;
      permissions.financial.manageExpenses = true;
      permissions.financial.approveRefunds = true;

      // Customer permissions
      permissions.customers.view = AccessLevel.ALL;
      permissions.customers.create = AccessLevel.ALL;
      permissions.customers.edit = AccessLevel.ALL;
      permissions.customers.delete = AccessLevel.DEPARTMENT;
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
      permissions.sales.view = AccessLevel.ALL;
      permissions.sales.create = AccessLevel.ALL;
      permissions.sales.edit = AccessLevel.SELF;
      permissions.sales.delete = AccessLevel.NONE;
      permissions.sales.processRefunds = false;
      permissions.sales.applyDiscounts = true;
      permissions.sales.voidTransactions = false;
      permissions.sales.viewSalesHistory = AccessLevel.SELF;

      // Limited permissions in other areas
      permissions.inventory.view = AccessLevel.ALL;
      permissions.customers.view = AccessLevel.ALL;
      permissions.customers.create = AccessLevel.ALL;

      permissions.financial.processPayments = true;
      break;
    }

    case 'Inventory Manager': {
      // Inventory-focused permissions
      permissions.inventory.view = AccessLevel.ALL;
      permissions.inventory.create = AccessLevel.ALL;
      permissions.inventory.edit = AccessLevel.ALL;
      permissions.inventory.delete = AccessLevel.ALL;
      permissions.inventory.adjustStock = true;
      permissions.inventory.orderInventory = true;
      permissions.inventory.manageSuppliers = true;
      permissions.inventory.viewStockAlerts = true;
      permissions.inventory.transferStock = true;
      permissions.inventory.manageCategories = true;

      permissions.suppliers.view = AccessLevel.ALL;
      permissions.suppliers.create = AccessLevel.ALL;
      permissions.suppliers.edit = AccessLevel.ALL;
      permissions.suppliers.delete = AccessLevel.DEPARTMENT;

      permissions.reports.view = AccessLevel.ALL;
      permissions.reports.viewInventoryReports = true;
      break;
    }

    case 'Staff Manager': {
      // Staff/HR manager permissions
      permissions.staff.view = AccessLevel.ALL;
      permissions.staff.create = AccessLevel.ALL;
      permissions.staff.edit = AccessLevel.ALL;
      permissions.staff.delete = AccessLevel.ALL;
      permissions.staff.viewPerformance = AccessLevel.ALL;
      permissions.staff.manageSchedules = AccessLevel.ALL;
      permissions.staff.viewSalaries = AccessLevel.ALL;
      permissions.staff.manageAttendance = AccessLevel.ALL;

      permissions.reports.view = AccessLevel.ALL;
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
      createRoleSchema.parse({
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

    // Convert permissions to standardized format if needed
    let standardizedPermissions: Permissions;

    if (Array.isArray(permissions)) {
      // If permissions are in string array format, convert to object format
      standardizedPermissions = stringArrayToPermissions(permissions);
    } else if (typeof permissions === 'object' &&
              (permissions.administrator || permissions.manager)) {
      // If permissions are in legacy format, convert to standardized format
      standardizedPermissions = convertLegacyPermissions(permissions);
    } else {
      // Otherwise, assume it's already in the standardized format
      standardizedPermissions = permissions as Permissions;
    }

    // Create role
    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions: standardizedPermissions as Prisma.JsonValue,
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

    // Convert permissions to standardized format if needed
    if (permissions !== undefined) {
      let standardizedPermissions: Permissions;

      if (Array.isArray(permissions)) {
        // If permissions are in string array format, convert to object format
        standardizedPermissions = stringArrayToPermissions(permissions);
      } else if (typeof permissions === 'object' &&
                (permissions.administrator || permissions.manager)) {
        // If permissions are in legacy format, convert to standardized format
        standardizedPermissions = convertLegacyPermissions(permissions);
      } else {
        // Otherwise, assume it's already in the standardized format
        standardizedPermissions = permissions as Permissions;
      }

      updateData.permissions = standardizedPermissions;
    }

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
