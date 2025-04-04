import { Request } from 'express';
import prisma from '../lib/prisma';

// Extend the Request type to include user property
interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

interface AuditLogData {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Service for creating and managing audit logs
 */
class AuditService {
  /**
   * Create a new audit log entry
   * 
   * @param req The request object (for user info, IP, user agent)
   * @param data Audit log data
   * @returns The created audit log
   */
  async createLog(req: AuthRequest, data: AuditLogData) {
    try {
      // Get user from request if not provided
      const userId = data.userId || req.user?.id;
      
      // Using a try-catch approach for now instead of throwing errors
      // when models don't exist yet, allowing for graceful degradation
      try {
        // Check if AuditLog model exists in Prisma client
        // Create the log entry
        return await prisma.$transaction(async (tx) => {
          // Using dynamic invocation to handle potential missing model
          const log = await (tx as any).auditLog.create({
            data: {
              userId,
              action: data.action,
              resource: data.resource,
              resourceId: data.resourceId,
              details: data.details || {},
              ipAddress: data.ipAddress || req.ip || null,
              userAgent: data.userAgent || req.headers['user-agent'] || null,
            }
          });
          
          return log;
        });
      } catch (err) {
        // If AuditLog doesn't exist yet, log to console instead
        console.log('AUDIT LOG (Console fallback):', {
          userId,
          timestamp: new Date(),
          action: data.action,
          resource: data.resource,
          resourceId: data.resourceId,
          details: data.details || {},
          ipAddress: data.ipAddress || req.ip || null,
          userAgent: data.userAgent || req.headers['user-agent'] || null,
        });
        return null;
      }
    } catch (error) {
      console.error('Error creating audit log:', error);
      // Don't throw the error - audit logs should never break the main flow
      // but we should log it for monitoring
      return null;
    }
  }
  
  /**
   * Get audit logs with filtering and pagination
   * 
   * @param filters Filter criteria
   * @param pagination Pagination options
   * @returns Filtered and paginated audit logs
   */
  async getLogs({ 
    userId, 
    action, 
    resource, 
    resourceId,
    startDate,
    endDate,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  }: {
    userId?: string;
    action?: string;
    resource?: string;
    resourceId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    try {
      const skip = (page - 1) * limit;
      
      // Build where conditions
      const where: any = {};
      
      if (userId) where.userId = userId;
      if (action) where.action = action;
      if (resource) where.resource = resource;
      if (resourceId) where.resourceId = resourceId;
      
      // Date range filter
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }
      
      try {
        // Get logs with pagination and sorting
        const [logs, totalCount] = await Promise.all([
          (prisma as any).auditLog.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }),
          (prisma as any).auditLog.count({ where })
        ]);
        
        return {
          logs,
          pagination: {
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit)
          }
        };
      } catch (err) {
        // If AuditLog doesn't exist yet, return empty results
        console.warn('AuditLog model may not exist yet:', err);
        return {
          logs: [],
          pagination: {
            page,
            limit,
            totalCount: 0,
            totalPages: 0
          }
        };
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw new Error('Failed to fetch audit logs');
    }
  }
  
  /**
   * Get audit logs for a specific resource
   * 
   * @param resource Resource type (e.g., "role", "staff")
   * @param resourceId Resource ID
   * @param page Page number
   * @param limit Items per page
   * @returns Audit logs for the resource
   */
  async getResourceLogs(
    resource: string, 
    resourceId: string, 
    page = 1, 
    limit = 20
  ) {
    return this.getLogs({
      resource,
      resourceId,
      page,
      limit
    });
  }
  
  /**
   * Get audit logs related to role and permission changes
   * 
   * @param page Page number
   * @param limit Items per page
   * @returns Role and permission change logs
   */
  async getRoleAndPermissionLogs(page = 1, limit = 20) {
    return this.getLogs({
      resource: 'role',
      page,
      limit
    });
  }
  
  /**
   * Log a role creation event
   * 
   * @param req Request object
   * @param roleId Role ID
   * @param roleData Role data
   * @returns Created audit log
   */
  async logRoleCreation(req: AuthRequest, roleId: string, roleData: any) {
    return this.createLog(req, {
      action: 'create',
      resource: 'role',
      resourceId: roleId,
      details: {
        name: roleData.name,
        description: roleData.description,
        isSystemRole: roleData.isSystemRole || false,
        // Don't log the full permissions object as it can be large
        // Just log that permissions were set
        permissionsSet: !!roleData.permissions
      }
    });
  }
  
  /**
   * Log a role update event
   * 
   * @param req Request object
   * @param roleId Role ID
   * @param changes Changes made to the role
   * @param previousData Previous role data
   * @returns Created audit log
   */
  async logRoleUpdate(req: AuthRequest, roleId: string, changes: any, previousData?: any) {
    // Determine what changed
    const changeLog: any = { ...changes };
    
    // For permissions, log which modules were modified rather than the entire object
    if (changes.permissions && previousData?.permissions) {
      const changedModules = new Set<string>();
      
      Object.keys(changes.permissions).forEach(module => {
        if (JSON.stringify(changes.permissions[module]) !== 
            JSON.stringify(previousData.permissions[module])) {
          changedModules.add(module);
        }
      });
      
      // Replace full permissions object with just modified module names
      changeLog.permissions = Array.from(changedModules);
    }
    
    return this.createLog(req, {
      action: 'update',
      resource: 'role',
      resourceId: roleId,
      details: {
        changes: changeLog,
        previousName: previousData?.name
      }
    });
  }
  
  /**
   * Log a role deletion event
   * 
   * @param req Request object
   * @param roleId Role ID
   * @param roleName Role name
   * @returns Created audit log
   */
  async logRoleDeletion(req: AuthRequest, roleId: string, roleName: string) {
    return this.createLog(req, {
      action: 'delete',
      resource: 'role',
      resourceId: roleId,
      details: {
        name: roleName
      }
    });
  }
  
  /**
   * Log a permission check event (useful for security auditing)
   * 
   * @param req Request object
   * @param resource Resource being accessed
   * @param action Action being performed
   * @param granted Whether permission was granted
   * @returns Created audit log
   */
  async logPermissionCheck(
    req: AuthRequest, 
    resource: string, 
    action: string, 
    granted: boolean
  ) {
    // Only log denied permissions or sensitive permission checks to avoid log spam
    const sensitiveResources = ['staff', 'financial', 'settings'];
    const sensitiveActions = ['delete', 'create', 'edit'];
    
    const isSensitive = sensitiveResources.includes(resource) || 
                        sensitiveActions.includes(action);
    
    // Skip logging for non-sensitive granted permissions to reduce log volume
    if (granted && !isSensitive) {
      return null;
    }
    
    return this.createLog(req, {
      action: granted ? 'permission_granted' : 'permission_denied',
      resource: 'permission',
      details: {
        targetResource: resource,
        targetAction: action,
        url: req.originalUrl,
        method: req.method
      }
    });
  }
}

// Export a singleton instance
const auditService = new AuditService();
export default auditService; 