import express from 'express';
import { z } from 'zod';
import { StaffService } from '../services/staff.service';
import { authenticateToken } from '../../middleware/auth';
import { CreateStaffSchema, UpdateStaffSchema, CreateShiftSchema, UpdateShiftSchema } from '../types/staff.types';
import { PrismaClient } from '@prisma/client';
import { checkPermission } from '../../middleware/permissions';

const router = express.Router();
const staffService = new StaffService();
const prisma = new PrismaClient();

// Middleware
router.use(authenticateToken);

// Staff routes
router.post('/', async (req, res) => {
  try {
    const data = CreateStaffSchema.parse(req.body);
    const staff = await staffService.createStaff(data);
    res.status(201).json(staff);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create staff error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const staff = await staffService.getAllStaff();
    res.json(staff);
  } catch (error) {
    console.error('Get all staff error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const staff = await staffService.getStaff(req.params.id);
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    res.json(staff);
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = UpdateStaffSchema.parse(req.body);
    const staff = await staffService.updateStaff(req.params.id, data);
    res.json(staff);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update staff error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await staffService.deleteStaff(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Shift routes
router.post('/:id/shifts', async (req, res) => {
  try {
    const data = CreateShiftSchema.parse({
      ...req.body,
      staffId: req.params.id,
    });
    const shift = await staffService.startShift(data);
    res.status(201).json(shift);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Start shift error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/shifts/:shiftId', async (req, res) => {
  try {
    const data = UpdateShiftSchema.parse(req.body);
    const shift = await staffService.endShift(req.params.shiftId, data);
    res.json(shift);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('End shift error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/shifts', async (req, res) => {
  try {
    const shifts = await staffService.getStaffShifts(req.params.id);
    res.json(shifts);
  } catch (error) {
    console.error('Get staff shifts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/staff/roles - Get all staff roles
router.get('/roles', async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        permissions: true,
        staffCount: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    // Transform to match frontend schema
    const formattedRoles = roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description || '',
      permissions: Array.isArray(role.permissions) ? role.permissions : [],
      staffCount: role.staffCount,
      isActive: role.isActive,
      createdAt: role.createdAt.toISOString(),
      updatedAt: role.updatedAt.toISOString()
    }));
    
    return res.status(200).json(formattedRoles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// GET /api/v1/staff/roles/:id - Get role by ID
router.get('/roles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const role = await prisma.role.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        permissions: true,
        staffCount: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    // Transform to match frontend schema
    const formattedRole = {
      id: role.id,
      name: role.name,
      description: role.description || '',
      permissions: Array.isArray(role.permissions) ? role.permissions : [],
      staffCount: role.staffCount,
      isActive: role.isActive,
      createdAt: role.createdAt.toISOString(),
      updatedAt: role.updatedAt.toISOString()
    };
    
    return res.status(200).json(formattedRole);
  } catch (error) {
    console.error('Error fetching role:', error);
    return res.status(500).json({ error: 'Failed to fetch role' });
  }
});

// POST /api/v1/staff/roles - Create a new role
router.post('/roles', async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    
    // Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }
    
    // Check for duplicate name
    const existingRole = await prisma.role.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    });
    
    if (existingRole) {
      return res.status(400).json({ error: 'A role with this name already exists' });
    }
    
    // Create the role
    const newRole = await prisma.role.create({
      data: {
        name,
        description,
        permissions: permissions || {},
        staffCount: 0,
        isActive: true
      }
    });
    
    // Transform to match frontend schema
    const formattedRole = {
      id: newRole.id,
      name: newRole.name,
      description: newRole.description || '',
      permissions: Array.isArray(newRole.permissions) ? newRole.permissions : [],
      staffCount: newRole.staffCount,
      isActive: newRole.isActive,
      createdAt: newRole.createdAt.toISOString(),
      updatedAt: newRole.updatedAt.toISOString()
    };
    
    return res.status(201).json(formattedRole);
  } catch (error) {
    console.error('Error creating role:', error);
    return res.status(500).json({ error: 'Failed to create role' });
  }
});

// PUT /api/v1/staff/roles/:id - Update a role
router.put('/roles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;
    
    // Validation
    if (name && name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }
    
    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id }
    });
    
    if (!existingRole) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    // Check for duplicate name if name is being changed
    if (name && name !== existingRole.name) {
      const duplicateName = await prisma.role.findFirst({
        where: { 
          name: { equals: name, mode: 'insensitive' },
          id: { not: id }
        }
      });
      
      if (duplicateName) {
        return res.status(400).json({ error: 'A role with this name already exists' });
      }
    }
    
    // Update the role
    const updatedRole = await prisma.role.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        permissions: permissions || undefined,
        isActive: req.body.isActive !== undefined ? req.body.isActive : undefined
      }
    });
    
    // Transform to match frontend schema
    const formattedRole = {
      id: updatedRole.id,
      name: updatedRole.name,
      description: updatedRole.description || '',
      permissions: Array.isArray(updatedRole.permissions) ? updatedRole.permissions : [],
      staffCount: updatedRole.staffCount,
      isActive: updatedRole.isActive,
      createdAt: updatedRole.createdAt.toISOString(),
      updatedAt: updatedRole.updatedAt.toISOString()
    };
    
    return res.status(200).json(formattedRole);
  } catch (error) {
    console.error('Error updating role:', error);
    return res.status(500).json({ error: 'Failed to update role' });
  }
});

// DELETE /api/v1/staff/roles/:id - Delete a role
router.delete('/roles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id }
    });
    
    if (!existingRole) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    // Check if role is assigned to any staff members
    const staffCount = await prisma.staff.count({
      where: { roleId: id }
    });
    
    if (staffCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete a role that is assigned to staff members',
        staffCount
      });
    }
    
    // Delete the role
    await prisma.role.delete({
      where: { id }
    });
    
    return res.status(200).json({ success: true, message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    return res.status(500).json({ error: 'Failed to delete role' });
  }
});

export default router; 