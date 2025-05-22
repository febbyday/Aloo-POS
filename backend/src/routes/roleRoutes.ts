/**
 * Role Routes
 *
 * This file defines all role-related routes for the application.
 * It serves as the single source of truth for role management endpoints.
 */

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
import { authenticateJWT } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';

const router = express.Router();

// All routes require authentication
router.use(authenticateJWT);

/**
 * Role Management Routes
 * These routes handle basic CRUD operations for roles
 */

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

/**
 * Role Templates Routes
 * These routes handle role templates for predefined permission sets
 */

// GET /api/v1/roles/templates - Get role templates
router.get(
  '/templates',
  checkPermission('staff', 'view'),
  getRoleTemplates
);

/**
 * Role Assignment Routes
 * These routes handle the relationship between roles and staff/users
 */

// GET /api/v1/roles/:id/staff - Get staff members assigned to a role
router.get(
  '/:id/staff',
  checkPermission('staff', 'view'),
  getRoleStaff
);

export default router;