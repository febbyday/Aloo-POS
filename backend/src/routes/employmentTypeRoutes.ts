import express from 'express';
import {
  getAllEmploymentTypes,
  getEmploymentTypeById,
  createEmploymentType,
  updateEmploymentType,
  deleteEmploymentType
} from '../controllers/employmentTypeController';

const router = express.Router();

/**
 * @route   GET /api/v1/employment-types
 * @desc    Get all employment types
 * @access  Public
 */
router.get('/', getAllEmploymentTypes);

/**
 * @route   GET /api/v1/employment-types/:id
 * @desc    Get a single employment type by ID
 * @access  Public
 */
router.get('/:id', getEmploymentTypeById);

/**
 * @route   POST /api/v1/employment-types
 * @desc    Create a new employment type
 * @access  Public
 */
router.post('/', createEmploymentType);

/**
 * @route   PATCH /api/v1/employment-types/:id
 * @desc    Update an employment type
 * @access  Public
 */
router.patch('/:id', updateEmploymentType);

/**
 * @route   DELETE /api/v1/employment-types/:id
 * @desc    Delete an employment type
 * @access  Public
 */
router.delete('/:id', deleteEmploymentType);

export default router; 