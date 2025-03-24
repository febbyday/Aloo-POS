import express from 'express';
import { storeController } from '../controllers/storeController';
import { validateRequest } from '../middleware/validation';
import { CreateShopSchema, UpdateShopSchema } from '../types/schemas/shopSchema';

const router = express.Router();

/**
 * @route   GET /api/v1/shops
 * @desc    Get all shops with filtering and pagination
 * @access  Public
 */
router.get('/', storeController.getAllStores.bind(storeController));

/**
 * @route   GET /api/v1/shops/:id
 * @desc    Get a shop by ID
 * @access  Public
 */
router.get('/:id', storeController.getStoreById.bind(storeController));

/**
 * @route   POST /api/v1/shops
 * @desc    Create a new shop
 * @access  Private
 */
router.post('/', 
  validateRequest(CreateShopSchema), 
  storeController.createStore.bind(storeController)
);

/**
 * @route   PUT /api/v1/shops/:id
 * @desc    Update an existing shop
 * @access  Private
 */
router.put('/:id', 
  validateRequest(UpdateShopSchema), 
  storeController.updateStore.bind(storeController)
);

/**
 * @route   DELETE /api/v1/shops/:id
 * @desc    Delete a shop
 * @access  Private
 */
router.delete('/:id', storeController.deleteStore.bind(storeController));

/**
 * @route   GET /api/v1/shops/:shopId/inventory
 * @desc    Get inventory for a specific shop
 * @access  Public
 */
router.get('/:shopId/inventory', storeController.getStoreInventory.bind(storeController));

/**
 * @route   PUT /api/v1/shops/:shopId/inventory/:productId
 * @desc    Update inventory for a specific product in a shop
 * @access  Private
 */
router.put('/:shopId/inventory/:productId', storeController.updateInventory.bind(storeController));

export default router;