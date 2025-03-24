import express from 'express';
import { categoryController } from '../controllers/categoryController';

const router = express.Router();

/**
 * @route   GET /api/categories
 * @desc    Get all categories with filtering and pagination
 * @access  Public
 */
router.get('/', categoryController.getAllCategories.bind(categoryController));

/**
 * @route   GET /api/categories/:id
 * @desc    Get a category by ID
 * @access  Public
 */
router.get('/:id', categoryController.getCategoryById.bind(categoryController));

/**
 * @route   POST /api/categories
 * @desc    Create a new category
 * @access  Private
 */
router.post('/', categoryController.createCategory.bind(categoryController));

/**
 * @route   PUT /api/categories/:id
 * @desc    Update an existing category
 * @access  Private
 */
router.put('/:id', categoryController.updateCategory.bind(categoryController));

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete a category
 * @access  Private
 */
router.delete('/:id', categoryController.deleteCategory.bind(categoryController));

/**
 * @route   GET /api/categories/subcategories/:parentId
 * @desc    Get subcategories by parent ID
 * @access  Public
 */
router.get('/subcategories/:parentId', categoryController.getSubcategories.bind(categoryController));

/**
 * @route   GET /api/categories/hierarchy
 * @desc    Get category hierarchy (tree structure)
 * @access  Public
 */
router.get('/hierarchy', categoryController.getCategoryHierarchy.bind(categoryController));

export default router; 