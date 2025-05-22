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

/**
 * Role Routes
 *
 * DEPRECATED: These routes are deprecated. Use the main role routes at /api/v1/roles instead.
 * This is a compatibility layer that redirects to the main role routes.
 */

// Import the main role routes
import roleRoutes from '../../routes/roleRoutes';
import { logDeprecatedRouteUsage } from '../../utils/deprecationTracker';

// Mount the main role routes under /roles with enhanced deprecation warning
router.use('/roles', (req, res, next) => {
  // Log the deprecated route usage
  logDeprecatedRouteUsage(req, '/api/v1/staff/roles');

  // Add deprecation warning header to response
  res.set('X-Deprecated-API', 'This endpoint is deprecated. Please use /api/v1/roles instead.');
  res.set('X-Deprecated-Since', '1.5.0');
  res.set('X-Removal-Version', '2.0.0');

  next();
}, roleRoutes);

export default router;