import express from 'express';
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff
} from '../controllers/staffController';

const router = express.Router();

// Mock staff data with banking details including branch location
const mockStaff = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    role: 'Manager',
    status: 'active',
    hireDate: '2022-01-15',
    department: 'Sales',
    position: 'Sales Manager',
    employmentType: 'full-time',
    bankingDetails: {
      accountName: 'John Doe',
      accountNumber: '1234567890',
      bankName: 'Example Bank',
      accountType: 'Checking',
      branchLocation: 'Downtown Branch',
      branchCode: '001',
      swiftCode: 'EXBKUS33',
    },
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '098-765-4321'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '987-654-3210',
    role: 'Sales Associate',
    status: 'active',
    hireDate: '2023-03-10',
    department: 'Sales',
    position: 'Junior Sales Associate',
    employmentType: 'part-time',
    bankingDetails: {
      accountName: 'Jane Smith',
      accountNumber: '0987654321',
      bankName: 'City Bank',
      accountType: 'Savings',
      branchLocation: 'Main Street Branch',
      branchCode: '002',
    },
    emergencyContact: {
      name: 'John Smith',
      relationship: 'Husband',
      phone: '123-456-7890'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

/**
 * @route   GET /api/v1/staff
 * @desc    Get all staff members
 * @access  Public
 */
router.get('/', getAllStaff);

/**
 * @route   GET /api/v1/staff/:id
 * @desc    Get a single staff member by ID
 * @access  Public
 */
router.get('/:id', getStaffById);

/**
 * @route   POST /api/v1/staff
 * @desc    Create a new staff member
 * @access  Public
 */
router.post('/', createStaff);

/**
 * @route   PATCH /api/v1/staff/:id
 * @desc    Update a staff member
 * @access  Public
 */
router.patch('/:id', updateStaff);

/**
 * @route   DELETE /api/v1/staff/:id
 * @desc    Delete a staff member
 * @access  Public
 */
router.delete('/:id', deleteStaff);

export default router; 