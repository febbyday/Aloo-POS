import express from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';

/**
 * Router for customer group management
 */
const router = express.Router();

/**
 * Validation schema for customer group data
 */
const CustomerGroupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().optional(),
  discountType: z.string().default("percentage"),
  discountValue: z.number().default(0),
  isActive: z.boolean().default(true),
});

/**
 * GET /api/v1/customer-groups
 * Retrieve all customer groups
 */
router.get('/', async (req, res) => {
  try {
    const groups = await prisma.customerGroup.findMany({
      include: {
        customers: true
      }
    });
    
    res.json({
      data: groups,
      success: true,
      message: 'Customer groups retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching customer groups:', error);
    res.status(500).json({ 
      error: 'Failed to fetch customer groups',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      data: []
    });
  }
});

/**
 * GET /api/v1/customer-groups/:id
 * Retrieve a specific customer group by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const group = await prisma.customerGroup.findUnique({
      where: { id: req.params.id },
      include: {
        customers: true
      }
    });
    
    if (!group) {
      return res.status(404).json({ 
        error: 'Customer group not found',
        success: false,
        message: 'Customer group not found',
        data: null
      });
    }
    
    res.json({
      data: group,
      success: true,
      message: 'Customer group retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching customer group:', error);
    res.status(500).json({ 
      error: 'Failed to fetch customer group',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      data: null
    });
  }
});

/**
 * POST /api/v1/customer-groups
 * Create a new customer group
 */
router.post('/', async (req, res) => {
  try {
    // Validate request data
    const validatedData = CustomerGroupSchema.parse(req.body);
    
    // Check for existing group with same name
    const existingGroup = await prisma.customerGroup.findUnique({
      where: { name: validatedData.name }
    });

    if (existingGroup) {
      return res.status(409).json({ 
        error: 'A customer group with this name already exists',
        success: false,
        message: 'A customer group with this name already exists',
        data: null
      });
    }
    
    // Create the customer group
    const group = await prisma.customerGroup.create({
      data: validatedData,
    });

    res.status(201).json({
      data: group,
      success: true,
      message: 'Customer group created successfully'
    });
  } catch (error) {
    console.error('Error creating customer group:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors,
        success: false,
        message: 'Validation failed',
        data: null
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create customer group',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      data: null
    });
  }
});

/**
 * PUT /api/v1/customer-groups/:id
 * Update an existing customer group
 */
router.put('/:id', async (req, res) => {
  try {
    // Verify group exists
    const existingGroup = await prisma.customerGroup.findUnique({
      where: { id: req.params.id }
    });

    if (!existingGroup) {
      return res.status(404).json({ 
        error: 'Customer group not found',
        success: false,
        message: 'Customer group not found',
        data: null
      });
    }

    // Validate request data (partial update allowed)
    const validatedData = CustomerGroupSchema.partial().parse(req.body);
    
    // If name is being updated, verify it's not already taken
    if (validatedData.name && validatedData.name !== existingGroup.name) {
      const nameExists = await prisma.customerGroup.findUnique({
        where: { name: validatedData.name }
      });

      if (nameExists) {
        return res.status(409).json({ 
          error: 'A customer group with this name already exists',
          success: false,
          message: 'A customer group with this name already exists',
          data: null
        });
      }
    }
    
    // Update the customer group
    const group = await prisma.customerGroup.update({
      where: { id: req.params.id },
      data: validatedData,
    });

    res.json({
      data: group,
      success: true,
      message: 'Customer group updated successfully'
    });
  } catch (error) {
    console.error('Error updating customer group:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors,
        success: false,
        message: 'Validation failed',
        data: null
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to update customer group',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      data: null
    });
  }
});

/**
 * DELETE /api/v1/customer-groups/:id
 * Delete a customer group
 */
router.delete('/:id', async (req, res) => {
  try {
    // Verify group exists
    const existingGroup = await prisma.customerGroup.findUnique({
      where: { id: req.params.id }
    });

    if (!existingGroup) {
      return res.status(404).json({ 
        error: 'Customer group not found',
        success: false,
        message: 'Customer group not found',
        data: null
      });
    }

    // Delete the customer group
    await prisma.customerGroup.delete({
      where: { id: req.params.id },
    });

    res.json({
      data: { id: req.params.id },
      success: true,
      message: 'Customer group deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer group:', error);
    res.status(500).json({ 
      error: 'Failed to delete customer group',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      data: null
    });
  }
});

/**
 * POST /api/v1/customer-groups/:id/add-customer/:customerId
 * Add a customer to a group
 */
router.post('/:id/add-customer/:customerId', async (req, res) => {
  try {
    const { id, customerId } = req.params;
    
    // Verify both group and customer exist
    const [group, customer] = await Promise.all([
      prisma.customerGroup.findUnique({ where: { id } }),
      prisma.customer.findUnique({ where: { id: customerId } })
    ]);
    
    if (!group) {
      return res.status(404).json({ 
        error: 'Customer group not found',
        success: false,
        message: 'Customer group not found',
        data: null
      });
    }
    
    if (!customer) {
      return res.status(404).json({ 
        error: 'Customer not found',
        success: false,
        message: 'Customer not found',
        data: null
      });
    }
    
    // Add customer to group
    await prisma.customerGroup.update({
      where: { id },
      data: {
        customers: {
          connect: { id: customerId }
        }
      }
    });
    
    res.json({
      success: true,
      message: 'Customer added to group successfully',
      data: { groupId: id, customerId }
    });
  } catch (error) {
    console.error('Error adding customer to group:', error);
    res.status(500).json({ 
      error: 'Failed to add customer to group',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      data: null
    });
  }
});

/**
 * POST /api/v1/customer-groups/:id/remove-customer/:customerId
 * Remove a customer from a group
 */
router.post('/:id/remove-customer/:customerId', async (req, res) => {
  try {
    const { id, customerId } = req.params;
    
    // Verify both group and customer exist
    const [group, customer] = await Promise.all([
      prisma.customerGroup.findUnique({ where: { id } }),
      prisma.customer.findUnique({ where: { id: customerId } })
    ]);
    
    if (!group) {
      return res.status(404).json({ 
        error: 'Customer group not found',
        success: false,
        message: 'Customer group not found',
        data: null
      });
    }
    
    if (!customer) {
      return res.status(404).json({ 
        error: 'Customer not found',
        success: false,
        message: 'Customer not found',
        data: null
      });
    }
    
    // Remove customer from group
    await prisma.customerGroup.update({
      where: { id },
      data: {
        customers: {
          disconnect: { id: customerId }
        }
      }
    });
    
    res.json({
      success: true,
      message: 'Customer removed from group successfully',
      data: { groupId: id, customerId }
    });
  } catch (error) {
    console.error('Error removing customer from group:', error);
    res.status(500).json({ 
      error: 'Failed to remove customer from group',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      data: null
    });
  }
});

export default router; 