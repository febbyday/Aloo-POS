/**
 * User Roles Routes
 * 
 * This file defines routes for user roles management.
 */

import express from 'express';
import prisma from '../lib/prisma';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateJWT);

/**
 * GET /api/v1/users/roles
 * Get all roles
 */
router.get('/', async (req, res) => {
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
    console.error('Error fetching roles:', error);
    return res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

/**
 * GET /api/v1/users/roles/:id
 * Get role by ID
 */
router.get('/:id', async (req, res) => {
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
    console.error(`Error fetching role ${id}:`, error);
    return res.status(500).json({ error: 'Failed to fetch role' });
  }
});

/**
 * POST /api/v1/users/roles
 * Create a new role
 */
router.post('/', async (req, res) => {
  const { name, description, permissions, isActive = true, isSystemRole = false } = req.body;

  try {
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
        permissions,
        isActive,
        isSystemRole,
        createdBy: req.user?.id
      }
    });

    return res.status(201).json(role);
  } catch (error) {
    console.error('Error creating role:', error);
    return res.status(500).json({ error: 'Failed to create role' });
  }
});

/**
 * PUT /api/v1/users/roles/:id
 * Update a role
 */
router.put('/:id', async (req, res) => {
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

    // Transform the role to include staffCount
    const transformedRole = {
      ...updatedRole,
      staffCount: updatedRole._count.staff,
      _count: undefined
    };

    return res.status(200).json(transformedRole);
  } catch (error) {
    console.error(`Error updating role ${id}:`, error);
    return res.status(500).json({ error: 'Failed to update role' });
  }
});

/**
 * DELETE /api/v1/users/roles/:id
 * Delete a role
 */
router.delete('/:id', async (req, res) => {
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

    return res.status(200).json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error(`Error deleting role ${id}:`, error);
    return res.status(500).json({ error: 'Failed to delete role' });
  }
});

export default router;
