import express from 'express';
import { shopController } from '../controllers/shopController';

const router = express.Router();

/**
 * @route   GET /api/v1/shops
 * @desc    Get all shops with optional filtering and pagination
 * @access  Public
 */
router.get('/', shopController.getAllShops.bind(shopController));

/**
 * @route   GET /api/v1/shops/:id
 * @desc    Get a shop by ID
 * @access  Public
 */
router.get('/:id', shopController.getShopById.bind(shopController));

/**
 * @route   POST /api/v1/shops
 * @desc    Create a new shop
 * @access  Private
 */
router.post('/', shopController.createShop.bind(shopController));

/**
 * @route   PUT /api/v1/shops/:id
 * @desc    Update an existing shop (full update)
 * @access  Private
 */
router.put('/:id', shopController.updateShop.bind(shopController));

/**
 * @route   PATCH /api/v1/shops/:id
 * @desc    Update an existing shop (partial update)
 * @access  Private
 */
router.patch('/:id', shopController.updateShop.bind(shopController));

/**
 * @route   DELETE /api/v1/shops/:id
 * @desc    Delete a shop
 * @access  Private
 */
router.delete('/:id', shopController.deleteShop.bind(shopController));

/**
 * @route   GET /api/v1/shops/:storeId/inventory
 * @desc    Get inventory for a specific shop
 * @access  Public
 */
router.get('/:storeId/inventory', shopController.getShopInventory.bind(shopController));

/**
 * @route   PUT /api/v1/shops/:storeId/inventory/:productId
 * @desc    Update inventory for a specific product in a shop
 * @access  Private
 */
router.put(
  '/:storeId/inventory/:productId',
  shopController.updateInventory.bind(shopController)
);

export default router;