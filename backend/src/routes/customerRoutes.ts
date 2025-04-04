import express from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';

/**
 * Router for customer-related endpoints
 */
const router = express.Router();

/**
 * Validation schema for customer data
 */
const CustomerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().optional(),
  status: z.string().default("active"),
  membershipLevel: z.string().default("bronze"),
  loyaltyPoints: z.number().default(0),
  totalSpent: z.number().default(0),
});

/**
 * GET /api/v1/customers
 * Retrieve a paginated list of customers
 */
router.get('/', async (req, res) => {
  try {
    // Set cache control headers to prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Extract query parameters
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const skip = (page - 1) * pageSize;
    const search = req.query.search as string;
    
    console.log('Customer API Request:', {
      query: req.query,
      page,
      pageSize,
      search
    });

    // Build filter conditions
    const where = search ? {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    } : {};

    // Execute query with pagination
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          addresses: true,
        },
        orderBy: { lastName: 'asc' },
      }),
      prisma.customer.count({ where }),
    ]);

    // Map customer data to match frontend expectations
    const mappedCustomers = customers.map(customer => ({
      ...customer,
      tier: customer.membershipLevel, // Add this for backward compatibility
    }));

    // Return paginated results with format matching frontend expectations
    return res.json({
      data: mappedCustomers,
      pagination: {
        page,
        pageSize,
        totalItems: total,
        totalPages: Math.ceil(total / pageSize),
      },
      message: 'Customers retrieved successfully',
      success: true,
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    // Return consistent error response structure with required pagination
    return res.status(500).json({ 
      error: 'Failed to fetch customers',
      message: error instanceof Error ? error.message : 'Unknown error',
      success: false,
      data: [],
      pagination: {
        page: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0
      }
    });
  }
});

/**
 * GET /api/v1/customers/:id
 * Retrieve a single customer by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        addresses: true,
      },
    });

    if (!customer) {
      return res.status(404).json({ 
        error: 'Customer not found',
        success: false,
        message: 'Customer not found',
        data: null
      });
    }

    // Map customer data to match frontend expectations
    const mappedCustomer = {
      ...customer,
      tier: customer.membershipLevel, // Add this for backward compatibility
    };

    res.json({
      data: mappedCustomer,
      message: 'Customer retrieved successfully',
      success: true
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ 
      error: 'Failed to fetch customer',
      message: error instanceof Error ? error.message : 'Unknown error',
      success: false,
      data: null
    });
  }
});

/**
 * POST /api/v1/customers
 * Create a new customer
 */
router.post('/', async (req, res) => {
  try {
    // Validate request data
    const validatedData = CustomerSchema.parse(req.body);
    
    // Check for existing customer with same email
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: validatedData.email }
    });

    if (existingCustomer) {
      return res.status(409).json({ 
        error: 'A customer with this email already exists',
        success: false,
        message: 'A customer with this email already exists',
        data: null
      });
    }
    
    // Create the customer
    const customer = await prisma.customer.create({
      data: validatedData,
    });

    // Map customer data to match frontend expectations
    const mappedCustomer = {
      ...customer,
      tier: customer.membershipLevel, // Add this for backward compatibility
    };

    res.status(201).json({
      data: mappedCustomer,
      message: 'Customer created successfully',
      success: true
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    
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
      error: 'Failed to create customer',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      data: null
    });
  }
});

/**
 * PUT /api/v1/customers/:id
 * Update an existing customer
 */
router.put('/:id', async (req, res) => {
  try {
    // Verify customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: req.params.id }
    });

    if (!existingCustomer) {
      return res.status(404).json({ 
        error: 'Customer not found',
        success: false,
        message: 'Customer not found',
        data: null
      });
    }

    // Validate request data (partial update allowed)
    const validatedData = CustomerSchema.partial().parse(req.body);
    
    // If email is being updated, verify it's not already taken
    if (validatedData.email && validatedData.email !== existingCustomer.email) {
      const emailExists = await prisma.customer.findUnique({
        where: { email: validatedData.email }
      });

      if (emailExists) {
        return res.status(409).json({ 
          error: 'A customer with this email already exists',
          success: false,
          message: 'A customer with this email already exists',
          data: null
        });
      }
    }
    
    // Update the customer
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: validatedData,
    });

    // Map customer data to match frontend expectations
    const mappedCustomer = {
      ...customer,
      tier: customer.membershipLevel, // Add this for backward compatibility
    };

    res.json({
      data: mappedCustomer,
      message: 'Customer updated successfully',
      success: true
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    
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
      error: 'Failed to update customer',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      data: null
    });
  }
});

/**
 * DELETE /api/v1/customers/:id
 * Delete a customer
 */
router.delete('/:id', async (req, res) => {
  try {
    // Verify customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: req.params.id }
    });

    if (!existingCustomer) {
      return res.status(404).json({ 
        error: 'Customer not found',
        success: false,
        message: 'Customer not found',
        data: null
      });
    }

    // Delete the customer
    await prisma.customer.delete({
      where: { id: req.params.id },
    });

    res.json({
      data: { id: req.params.id },
      message: 'Customer deleted successfully',
      success: true
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ 
      error: 'Failed to delete customer',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      data: null
    });
  }
});

export default router;