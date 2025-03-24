import express from 'express';
import { supplierController } from '../controllers/supplierController';

const router = express.Router();

/**
 * @route   GET /api/suppliers
 * @desc    Get all suppliers with filtering and pagination
 * @access  Public
 */
router.get('/', supplierController.getAllSuppliers.bind(supplierController));

/**
 * @route   GET /api/suppliers/:id
 * @desc    Get a supplier by ID
 * @access  Public
 */
router.get('/:id', supplierController.getSupplierById.bind(supplierController));

/**
 * @route   POST /api/suppliers
 * @desc    Create a new supplier
 * @access  Private
 */
router.post('/', supplierController.createSupplier.bind(supplierController));

/**
 * @route   PUT /api/suppliers/:id
 * @desc    Update an existing supplier
 * @access  Private
 */
router.put('/:id', supplierController.updateSupplier.bind(supplierController));

/**
 * @route   DELETE /api/suppliers/:id
 * @desc    Delete a supplier
 * @access  Private
 */
router.delete('/:id', supplierController.deleteSupplier.bind(supplierController));

export default router; 