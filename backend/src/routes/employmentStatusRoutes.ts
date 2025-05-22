import express from 'express';
import {
  getAllEmploymentStatuses,
  getEmploymentStatusById,
  createEmploymentStatus,
  updateEmploymentStatus,
  deleteEmploymentStatus
} from '../controllers/employmentStatusController';

const router = express.Router();

/**
 * @route   GET /api/v1/employment-statuses
 * @desc    Get all employment statuses
 * @access  Public
 */
router.get('/', getAllEmploymentStatuses);

/**
 * @route   GET /api/v1/employment-statuses/:id
 * @desc    Get a single employment status by ID
 * @access  Public
 */
router.get('/:id', getEmploymentStatusById);

/**
 * @route   POST /api/v1/employment-statuses
 * @desc    Create a new employment status
 * @access  Public
 */
router.post('/', createEmploymentStatus);

/**
 * @route   PATCH /api/v1/employment-statuses/:id
 * @desc    Update an employment status
 * @access  Public
 */
router.patch('/:id', updateEmploymentStatus);

/**
 * @route   DELETE /api/v1/employment-statuses/:id
 * @desc    Delete an employment status
 * @access  Public
 */
router.delete('/:id', deleteEmploymentStatus);

export default router;
