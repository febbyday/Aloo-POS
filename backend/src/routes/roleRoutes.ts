import express from 'express';
import { 
  getAllRoles, 
  getRoleById, 
  createRole, 
  updateRole, 
  deleteRole,
  getRoleTemplates,
  getRoleStaff
} from '../controllers/roleController';
import { authenticate } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/roles - Get all roles
router.get(
  '/', 
  checkPermission('staff', 'view'), 
  getAllRoles
);

// GET /api/v1/roles/:id - Get role by ID
router.get(
  '/:id', 
  checkPermission('staff', 'view'), 
  getRoleById
);

// GET /api/v1/roles/:id/staff - Get staff members assigned to a role
router.get(
  '/:id/staff',
  checkPermission('staff', 'view'),
  getRoleStaff
);

// GET /api/v1/roles/templates - Get role templates
router.get(
  '/templates', 
  checkPermission('staff', 'view'), 
  getRoleTemplates
);

// POST /api/v1/roles - Create a new role
router.post(
  '/', 
  checkPermission('staff', 'create'), 
  createRole
);

// PATCH /api/v1/roles/:id - Update a role
router.patch(
  '/:id', 
  checkPermission('staff', 'edit'), 
  updateRole
);

// DELETE /api/v1/roles/:id - Delete a role
router.delete(
  '/:id', 
  checkPermission('staff', 'delete'), 
  deleteRole
);

export default router;