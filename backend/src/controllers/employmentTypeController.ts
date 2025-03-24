import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * Get all employment types
 * @route GET /api/v1/employment-types
 */
export const getAllEmploymentTypes = async (req: Request, res: Response) => {
  try {
    const employmentTypes = await prisma.employmentType.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    return res.status(200).json(employmentTypes);
  } catch (error) {
    console.error('Error getting employment types:', error);
    return res.status(500).json({ error: 'Failed to fetch employment types' });
  }
};

/**
 * Get employment type by ID
 * @route GET /api/v1/employment-types/:id
 */
export const getEmploymentTypeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const employmentType = await prisma.employmentType.findUnique({
      where: { id }
    });
    
    if (!employmentType) {
      return res.status(404).json({ error: 'Employment type not found' });
    }
    
    return res.status(200).json(employmentType);
  } catch (error) {
    console.error('Error getting employment type:', error);
    return res.status(500).json({ error: 'Failed to fetch employment type' });
  }
};

/**
 * Create a new employment type
 * @route POST /api/v1/employment-types
 */
export const createEmploymentType = async (req: Request, res: Response) => {
  try {
    const { name, description, color, benefits } = req.body;
    
    // Validate required fields
    if (!name || !description || !color) {
      return res.status(400).json({ error: 'Name, description, and color are required' });
    }
    
    // Check if employment type with this name already exists
    const existing = await prisma.employmentType.findUnique({
      where: { name }
    });
    
    if (existing) {
      return res.status(400).json({ error: 'An employment type with this name already exists' });
    }
    
    // Create new employment type
    const employmentType = await prisma.employmentType.create({
      data: {
        name,
        description,
        color,
        benefits: Array.isArray(benefits) ? benefits : [],
        isActive: true,
        staffCount: 0
      }
    });
    
    return res.status(201).json(employmentType);
  } catch (error) {
    console.error('Error creating employment type:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'An employment type with this name already exists' });
      }
    }
    
    return res.status(500).json({ error: 'Failed to create employment type' });
  }
};

/**
 * Update an employment type
 * @route PATCH /api/v1/employment-types/:id
 */
export const updateEmploymentType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, color, benefits, isActive, staffCount } = req.body;
    
    // Check if employment type exists
    const existing = await prisma.employmentType.findUnique({
      where: { id }
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Employment type not found' });
    }
    
    // Check if updating to a name that already exists (excluding current record)
    if (name && name !== existing.name) {
      const nameExists = await prisma.employmentType.findFirst({
        where: {
          name,
          id: { not: id }
        }
      });
      
      if (nameExists) {
        return res.status(400).json({ error: 'An employment type with this name already exists' });
      }
    }
    
    // Update employment type
    const updatedEmploymentType = await prisma.employmentType.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(color && { color }),
        ...(benefits && { benefits: Array.isArray(benefits) ? benefits : existing.benefits }),
        ...(isActive !== undefined && { isActive }),
        ...(staffCount !== undefined && { staffCount })
      }
    });
    
    return res.status(200).json(updatedEmploymentType);
  } catch (error) {
    console.error('Error updating employment type:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'An employment type with this name already exists' });
      }
    }
    
    return res.status(500).json({ error: 'Failed to update employment type' });
  }
};

/**
 * Delete an employment type
 * @route DELETE /api/v1/employment-types/:id
 */
export const deleteEmploymentType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if employment type exists
    const existing = await prisma.employmentType.findUnique({
      where: { id }
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Employment type not found' });
    }
    
    // Delete employment type
    await prisma.employmentType.delete({
      where: { id }
    });
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting employment type:', error);
    return res.status(500).json({ error: 'Failed to delete employment type' });
  }
}; 