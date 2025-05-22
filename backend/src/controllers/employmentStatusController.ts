import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * Get all employment statuses
 * @route GET /api/v1/employment-statuses
 */
export const getAllEmploymentStatuses = async (req: Request, res: Response) => {
  try {
    const statuses = await prisma.employmentStatus.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    return res.status(200).json(statuses);
  } catch (error) {
    console.error('Error getting employment statuses:', error);
    return res.status(500).json({ error: 'Failed to fetch employment statuses' });
  }
};

/**
 * Get employment status by ID
 * @route GET /api/v1/employment-statuses/:id
 */
export const getEmploymentStatusById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const status = await prisma.employmentStatus.findUnique({
      where: { id }
    });
    
    if (!status) {
      return res.status(404).json({ error: 'Employment status not found' });
    }
    
    return res.status(200).json(status);
  } catch (error) {
    console.error('Error getting employment status:', error);
    return res.status(500).json({ error: 'Failed to fetch employment status' });
  }
};

/**
 * Create a new employment status
 * @route POST /api/v1/employment-statuses
 */
export const createEmploymentStatus = async (req: Request, res: Response) => {
  try {
    const { name, description, color, benefits } = req.body;
    
    // Validate required fields
    if (!name || !description || !color) {
      return res.status(400).json({ error: 'Name, description, and color are required' });
    }
    
    // Check if employment status with this name already exists
    const existing = await prisma.employmentStatus.findUnique({
      where: { name }
    });
    
    if (existing) {
      return res.status(400).json({ error: 'An employment status with this name already exists' });
    }
    
    // Create new employment status
    const status = await prisma.employmentStatus.create({
      data: {
        name,
        description,
        color,
        benefits: benefits || [],
        isActive: true,
        staffCount: 0
      }
    });
    
    return res.status(201).json(status);
  } catch (error) {
    console.error('Error creating employment status:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'An employment status with this name already exists' });
      }
    }
    
    return res.status(500).json({ error: 'Failed to create employment status' });
  }
};

/**
 * Update an employment status
 * @route PATCH /api/v1/employment-statuses/:id
 */
export const updateEmploymentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, color, isActive, benefits } = req.body;
    
    // Check if employment status exists
    const existing = await prisma.employmentStatus.findUnique({
      where: { id }
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Employment status not found' });
    }
    
    // Check if updating to a name that already exists (excluding current record)
    if (name && name !== existing.name) {
      const nameExists = await prisma.employmentStatus.findFirst({
        where: {
          name,
          id: { not: id }
        }
      });
      
      if (nameExists) {
        return res.status(400).json({ error: 'An employment status with this name already exists' });
      }
    }
    
    // Update employment status
    const updatedStatus = await prisma.employmentStatus.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
        ...(isActive !== undefined && { isActive }),
        ...(benefits !== undefined && { benefits })
      }
    });
    
    return res.status(200).json(updatedStatus);
  } catch (error) {
    console.error('Error updating employment status:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'An employment status with this name already exists' });
      }
    }
    
    return res.status(500).json({ error: 'Failed to update employment status' });
  }
};

/**
 * Delete an employment status
 * @route DELETE /api/v1/employment-statuses/:id
 */
export const deleteEmploymentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if employment status exists
    const existing = await prisma.employmentStatus.findUnique({
      where: { id },
      include: {
        staff: {
          select: { id: true }
        }
      }
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Employment status not found' });
    }
    
    // Check if status is assigned to any staff
    if (existing.staff.length > 0) {
      return res.status(400).json({ 
        error: 'This employment status is assigned to staff members and cannot be deleted'
      });
    }
    
    // Delete employment status
    await prisma.employmentStatus.delete({
      where: { id }
    });
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting employment status:', error);
    return res.status(500).json({ error: 'Failed to delete employment status' });
  }
};

/**
 * Create default employment statuses if they don't exist
 */
export const createDefaultEmploymentStatuses = async () => {
  try {
    const defaultStatuses = [
      {
        name: 'Full-time',
        description: 'Regular full-time employee',
        color: '#4CAF50', // Green
        benefits: ['Health Insurance', 'Paid Time Off', '401k', 'Dental', 'Vision', 'Life Insurance']
      },
      {
        name: 'Part-time',
        description: 'Regular part-time employee',
        color: '#8BC34A', // Light Green
        benefits: ['Limited Health Insurance', 'Limited Paid Time Off', 'Employee Discounts']
      },
      {
        name: 'Contractor',
        description: 'Independent contractor or freelancer',
        color: '#9C27B0', // Purple
        benefits: ['Performance Bonus', 'Flexible Hours', 'Remote Work Option']
      },
      {
        name: 'Intern',
        description: 'Temporary internship position',
        color: '#FFC107', // Amber
        benefits: ['Training Program', 'Mentorship', 'Networking Opportunities']
      },
      {
        name: 'Temporary',
        description: 'Short-term temporary employment',
        color: '#607D8B', // Blue Grey
        benefits: ['Flexible Scheduling', 'Experience Certificate']
      },
      {
        name: 'Terminated',
        description: 'Employment has been terminated',
        color: '#F44336', // Red
        benefits: []
      },
      {
        name: 'Probation',
        description: 'In trial period',
        color: '#2196F3', // Blue
        benefits: ['Basic Health Insurance', 'Training Program', 'Mentorship']
      },
      {
        name: 'Suspended',
        description: 'Temporarily removed from duties',
        color: '#FF9800', // Orange
        benefits: []
      }
    ];
    
    for (const status of defaultStatuses) {
      const exists = await prisma.employmentStatus.findUnique({
        where: { name: status.name }
      });
      
      if (!exists) {
        await prisma.employmentStatus.create({
          data: {
            name: status.name,
            description: status.description,
            color: status.color,
            benefits: status.benefits,
            isActive: true,
            staffCount: 0
          }
        });
      }
    }
    
    console.log('Default employment statuses created successfully');
  } catch (error) {
    console.error('Error creating default employment statuses:', error);
  }
};

// Initialize default employment statuses when the server starts
createDefaultEmploymentStatuses();
