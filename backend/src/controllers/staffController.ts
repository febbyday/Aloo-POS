// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { Request, Response } from 'express';
import { prisma } from '../index';
import { Prisma } from '@prisma/client';

/**
 * Get all staff members
 * @route GET /api/v1/staff
 */
export const getAllStaff = async (req: Request, res: Response) => {
  try {
    // Get all staff from the database
    const staff = await prisma.staff.findMany({
      include: {
        employmentType: true,
        role: true,
        employmentStatus: true
      },
      orderBy: {
        lastName: 'asc'
      }
    });
    
    // Transform the data to match the expected structure
    const formattedStaff = staff.map(s => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      phone: s.phone,
      role: s.role?.name || 'Staff',
      roleId: s.roleId,
      status: s.status.toLowerCase(),
      employmentStatusId: s.employmentStatusId,
      employmentStatus: s.employmentStatus?.name || 'Active',
      hireDate: s.hireDate.toISOString().split('T')[0],
      department: s.department,
      position: s.position,
      employmentTypeId: s.employmentTypeId,
      employmentType: s.employmentType?.name || 'full-time',
      bankingDetails: s.bankingDetails as Record<string, any> || null,
      emergencyContact: s.emergencyContact as Record<string, any>,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      updatedBy: s.updatedBy
    }));
    
    return res.status(200).json(formattedStaff);
  } catch (error) {
    console.error('Error getting staff:', error);
    return res.status(500).json({ error: 'Failed to fetch staff data' });
  }
};

/**
 * Get staff member by ID
 * @route GET /api/v1/staff/:id
 */
export const getStaffById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get staff from the database
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        employmentType: true,
        role: true,
        employmentStatus: true
      }
    });
    
    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }
    
    // Transform the data to match the expected structure
    const formattedStaff = {
      id: staff.id,
      firstName: staff.firstName,
      lastName: staff.lastName,
      email: staff.email,
      phone: staff.phone,
      role: staff.role?.name || 'Staff',
      roleId: staff.roleId,
      status: staff.status.toLowerCase(),
      employmentStatusId: staff.employmentStatusId,
      employmentStatus: staff.employmentStatus?.name || 'Active',
      hireDate: staff.hireDate.toISOString().split('T')[0],
      department: staff.department,
      position: staff.position,
      employmentTypeId: staff.employmentTypeId,
      employmentType: staff.employmentType?.name || 'full-time',
      bankingDetails: staff.bankingDetails as Record<string, any> || null,
      emergencyContact: staff.emergencyContact as Record<string, any>,
      createdAt: staff.createdAt.toISOString(),
      updatedAt: staff.updatedAt.toISOString(),
      updatedBy: staff.updatedBy
    };
    
    return res.status(200).json(formattedStaff);
  } catch (error) {
    console.error('Error getting staff member:', error);
    return res.status(500).json({ error: 'Failed to fetch staff member' });
  }
};

/**
 * Create a new staff member
 * @route POST /api/v1/staff
 */
export const createStaff = async (req: Request, res: Response) => {
  try {
    const staffData = req.body;
    
    // Validate required fields
    if (!staffData.firstName || !staffData.lastName || !staffData.email) {
      return res.status(400).json({ error: 'First name, last name, and email are required' });
    }
    
    // Find employment type ID if employmentType is provided
    let employmentTypeId = null;
    if (staffData.employmentType) {
      const employmentType = await prisma.employmentType.findFirst({
        where: { 
          name: { equals: staffData.employmentType, mode: 'insensitive' } 
        }
      });
      
      if (employmentType) {
        employmentTypeId = employmentType.id;
      }
    }
    
    // Find role ID if role is provided
    let roleId = null;
    if (staffData.role) {
      const role = await prisma.role.findFirst({
        where: { 
          name: { equals: staffData.role, mode: 'insensitive' } 
        }
      });
      
      if (role) {
        roleId = role.id;
      }
    }
    
    // Find employment status ID if employmentStatus is provided
    let employmentStatusId = null;
    if (staffData.employmentStatus) {
      const status = await prisma.employmentStatus.findFirst({
        where: { 
          name: { equals: staffData.employmentStatus, mode: 'insensitive' } 
        }
      });
      
      if (status) {
        employmentStatusId = status.id;
      }
    }
    
    // Create new staff in database
    const newStaff = await prisma.staff.create({
      data: {
        firstName: staffData.firstName,
        lastName: staffData.lastName,
        email: staffData.email,
        phone: staffData.phone || '',
        roleId: roleId,
        status: (staffData.status?.toUpperCase() as any) || 'ACTIVE',
        hireDate: staffData.hireDate ? new Date(staffData.hireDate) : new Date(),
        department: staffData.department || '',
        position: staffData.position || '',
        employmentTypeId: employmentTypeId,
        employmentStatusId: employmentStatusId,
        bankingDetails: staffData.bankingDetails || null,
        emergencyContact: staffData.emergencyContact || { name: '', relationship: '', phone: '' },
        updatedBy: staffData.updatedBy || null
      },
      include: {
        employmentType: true,
        role: true,
        employmentStatus: true
      }
    });
    
    // Update counters
    if (employmentTypeId) {
      await prisma.employmentType.update({
        where: { id: employmentTypeId },
        data: {
          staffCount: {
            increment: 1
          }
        }
      });
    }
    
    if (roleId) {
      await prisma.role.update({
        where: { id: roleId },
        data: {
          staffCount: {
            increment: 1
          }
        }
      });
    }
    
    if (employmentStatusId) {
      await prisma.employmentStatus.update({
        where: { id: employmentStatusId },
        data: {
          staffCount: {
            increment: 1
          }
        }
      });
    }
    
    // Format the response to match expected structure
    const formattedStaff = {
      id: newStaff.id,
      firstName: newStaff.firstName,
      lastName: newStaff.lastName,
      email: newStaff.email,
      phone: newStaff.phone,
      role: newStaff.role?.name || 'Staff',
      roleId: newStaff.roleId,
      status: newStaff.status.toLowerCase(),
      employmentStatusId: newStaff.employmentStatusId,
      employmentStatus: newStaff.employmentStatus?.name || 'Active',
      hireDate: newStaff.hireDate.toISOString().split('T')[0],
      department: newStaff.department,
      position: newStaff.position,
      employmentTypeId: newStaff.employmentTypeId,
      employmentType: newStaff.employmentType?.name || 'full-time',
      bankingDetails: newStaff.bankingDetails as Record<string, any> || null,
      emergencyContact: newStaff.emergencyContact as Record<string, any>,
      createdAt: newStaff.createdAt.toISOString(),
      updatedAt: newStaff.updatedAt.toISOString(),
      updatedBy: newStaff.updatedBy
    };
    
    return res.status(201).json(formattedStaff);
  } catch (error) {
    console.error('Error creating staff member:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'A staff member with this email already exists' });
      }
    }
    
    return res.status(500).json({ error: 'Failed to create staff member' });
  }
};

/**
 * Update a staff member
 * @route PATCH /api/v1/staff/:id
 */
export const updateStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Check if staff exists
    const existingStaff = await prisma.staff.findUnique({
      where: { id },
      include: {
        employmentType: true,
        role: true,
        employmentStatus: true
      }
    });
    
    if (!existingStaff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }
    
    let employmentTypeId = existingStaff.employmentTypeId;
    let roleId = existingStaff.roleId;
    let employmentStatusId = existingStaff.employmentStatusId;
    
    // Update employment type if provided
    if (updates.employmentType && updates.employmentType !== existingStaff.employmentType?.name) {
      const employmentType = await prisma.employmentType.findFirst({
        where: { 
          name: { equals: updates.employmentType, mode: 'insensitive' } 
        }
      });
      
      if (employmentType) {
        // Decrement count on old employment type if it exists
        if (existingStaff.employmentTypeId) {
          await prisma.employmentType.update({
            where: { id: existingStaff.employmentTypeId },
            data: {
              staffCount: {
                decrement: 1
              }
            }
          });
        }
        
        // Set new employment type and increment its count
        employmentTypeId = employmentType.id;
        
        await prisma.employmentType.update({
          where: { id: employmentTypeId },
          data: {
            staffCount: {
              increment: 1
            }
          }
        });
      }
    }
    
    // Update role if provided
    if (updates.role && updates.role !== existingStaff.role?.name) {
      const role = await prisma.role.findFirst({
        where: { 
          name: { equals: updates.role, mode: 'insensitive' } 
        }
      });
      
      if (role) {
        // Decrement count on old role if it exists
        if (existingStaff.roleId) {
          await prisma.role.update({
            where: { id: existingStaff.roleId },
            data: {
              staffCount: {
                decrement: 1
              }
            }
          });
        }
        
        // Set new role and increment its count
        roleId = role.id;
        
        await prisma.role.update({
          where: { id: roleId },
          data: {
            staffCount: {
              increment: 1
            }
          }
        });
      }
    }
    
    // Update employment status if provided
    if (updates.employmentStatus && updates.employmentStatus !== existingStaff.employmentStatus?.name) {
      const status = await prisma.employmentStatus.findFirst({
        where: { 
          name: { equals: updates.employmentStatus, mode: 'insensitive' } 
        }
      });
      
      if (status) {
        // Decrement count on old status if it exists
        if (existingStaff.employmentStatusId) {
          await prisma.employmentStatus.update({
            where: { id: existingStaff.employmentStatusId },
            data: {
              staffCount: {
                decrement: 1
              }
            }
          });
        }
        
        // Set new status and increment its count
        employmentStatusId = status.id;
        
        await prisma.employmentStatus.update({
          where: { id: employmentStatusId },
          data: {
            staffCount: {
              increment: 1
            }
          }
        });
      }
    }
    
    // Prepare data for update
    const updateData: any = {
      ...(updates.firstName !== undefined && { firstName: updates.firstName }),
      ...(updates.lastName !== undefined && { lastName: updates.lastName }),
      ...(updates.email !== undefined && { email: updates.email }),
      ...(updates.phone !== undefined && { phone: updates.phone }),
      ...(employmentTypeId !== existingStaff.employmentTypeId && { employmentTypeId }),
      ...(roleId !== existingStaff.roleId && { roleId }),
      ...(employmentStatusId !== existingStaff.employmentStatusId && { employmentStatusId }),
      ...(updates.status !== undefined && { status: updates.status.toUpperCase() }),
      ...(updates.hireDate !== undefined && { hireDate: new Date(updates.hireDate) }),
      ...(updates.department !== undefined && { department: updates.department }),
      ...(updates.position !== undefined && { position: updates.position }),
      ...(updates.bankingDetails !== undefined && { bankingDetails: updates.bankingDetails }),
      ...(updates.emergencyContact !== undefined && { emergencyContact: updates.emergencyContact }),
      updatedBy: updates.updatedBy || existingStaff.updatedBy
    };
    
    // Update staff in database
    const updatedStaff = await prisma.staff.update({
      where: { id },
      data: updateData,
      include: {
        employmentType: true,
        role: true,
        employmentStatus: true
      }
    });
    
    // Format response
    const formattedStaff = {
      id: updatedStaff.id,
      firstName: updatedStaff.firstName,
      lastName: updatedStaff.lastName,
      email: updatedStaff.email,
      phone: updatedStaff.phone,
      role: updatedStaff.role?.name || 'Staff',
      roleId: updatedStaff.roleId,
      status: updatedStaff.status.toLowerCase(),
      employmentStatusId: updatedStaff.employmentStatusId,
      employmentStatus: updatedStaff.employmentStatus?.name || 'Active',
      hireDate: updatedStaff.hireDate.toISOString().split('T')[0],
      department: updatedStaff.department,
      position: updatedStaff.position,
      employmentTypeId: updatedStaff.employmentTypeId,
      employmentType: updatedStaff.employmentType?.name || 'full-time',
      bankingDetails: updatedStaff.bankingDetails as Record<string, any> || null,
      emergencyContact: updatedStaff.emergencyContact as Record<string, any>,
      createdAt: updatedStaff.createdAt.toISOString(),
      updatedAt: updatedStaff.updatedAt.toISOString(),
      updatedBy: updatedStaff.updatedBy
    };
    
    return res.status(200).json(formattedStaff);
  } catch (error) {
    console.error('Error updating staff member:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'A staff member with this email already exists' });
      }
    }
    
    return res.status(500).json({ error: 'Failed to update staff member' });
  }
};

/**
 * Delete a staff member
 * @route DELETE /api/v1/staff/:id
 */
export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if staff exists
    const staff = await prisma.staff.findUnique({
      where: { id }
    });
    
    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }
    
    // Update counters before deletion
    if (staff.employmentTypeId) {
      await prisma.employmentType.update({
        where: { id: staff.employmentTypeId },
        data: {
          staffCount: {
            decrement: 1
          }
        }
      });
    }
    
    if (staff.roleId) {
      await prisma.role.update({
        where: { id: staff.roleId },
        data: {
          staffCount: {
            decrement: 1
          }
        }
      });
    }
    
    if (staff.employmentStatusId) {
      await prisma.employmentStatus.update({
        where: { id: staff.employmentStatusId },
        data: {
          staffCount: {
            decrement: 1
          }
        }
      });
    }
    
    // Delete staff member
    await prisma.staff.delete({
      where: { id }
    });
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    return res.status(500).json({ error: 'Failed to delete staff member' });
  }
};