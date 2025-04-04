import express from 'express';
import { Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';
import auditService from '../services/auditService';

const router = express.Router();

// Secure all audit log routes - require authentication
router.use(authenticate);

/**
 * Get all audit logs with filtering and pagination
 * @route GET /api/v1/audit-logs
 */
router.get(
  '/', 
  checkPermission('settings', 'view'), 
  async (req: Request, res: Response) => {
    try {
      const { 
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
      } = req.query;
      
      // Convert pagination params to numbers
      const pageNum = Number(page);
      const limitNum = Number(limit);
      
      // Parse date strings to Date objects if provided
      let startDateObj: Date | undefined;
      let endDateObj: Date | undefined;
      
      if (startDate) {
        startDateObj = new Date(startDate as string);
      }
      
      if (endDate) {
        endDateObj = new Date(endDate as string);
      }
      
      const result = await auditService.getLogs({
        userId: userId as string,
        action: action as string,
        resource: resource as string,
        resourceId: resourceId as string,
        startDate: startDateObj,
        endDate: endDateObj,
        page: pageNum,
        limit: limitNum,
        sortBy: sortBy as string,
        sortOrder: (sortOrder as 'asc' | 'desc') || 'desc'
      });
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  }
);

/**
 * Get audit logs for a specific resource
 * @route GET /api/v1/audit-logs/:resource/:resourceId
 */
router.get(
  '/:resource/:resourceId',
  checkPermission('settings', 'view'),
  async (req: Request, res: Response) => {
    try {
      const { resource, resourceId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      // Convert pagination params to numbers
      const pageNum = Number(page);
      const limitNum = Number(limit);
      
      const result = await auditService.getResourceLogs(
        resource,
        resourceId,
        pageNum,
        limitNum
      );
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching resource audit logs:', error);
      return res.status(500).json({ error: 'Failed to fetch resource audit logs' });
    }
  }
);

/**
 * Get audit logs for role and permission changes
 * @route GET /api/v1/audit-logs/roles
 */
router.get(
  '/roles',
  checkPermission('staff', 'view'),
  async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      
      // Convert pagination params to numbers
      const pageNum = Number(page);
      const limitNum = Number(limit);
      
      const result = await auditService.getRoleAndPermissionLogs(
        pageNum,
        limitNum
      );
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching role audit logs:', error);
      return res.status(500).json({ error: 'Failed to fetch role audit logs' });
    }
  }
);

export default router; 