import express from 'express';
import { orderController } from '../controllers/orderController';

const router = express.Router();

/**
 * @route   GET /api/orders
 * @desc    Get all orders with pagination and filtering
 * @access  Private
 */
router.get('/', orderController.getAllOrders.bind(orderController));

/**
 * @route   GET /api/orders/summary
 * @desc    Get sales summary data (daily, weekly, monthly)
 * @access  Private
 */
router.get('/summary', orderController.getSalesSummary.bind(orderController));

/**
 * @route   GET /api/orders/number/:orderNumber
 * @desc    Get an order by order number
 * @access  Private
 */
router.get('/number/:orderNumber', orderController.getOrderByOrderNumber.bind(orderController));

/**
 * @route   GET /api/orders/:id
 * @desc    Get an order by ID
 * @access  Private
 */
router.get('/:id', orderController.getOrderById.bind(orderController));

/**
 * @route   GET /api/orders/:id/summary
 * @desc    Get order summary (useful for receipt/invoice)
 * @access  Private
 */
router.get('/:id/summary', orderController.getOrderSummary.bind(orderController));

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private
 */
router.post('/', orderController.createOrder.bind(orderController));

/**
 * @route   PUT /api/orders/:id
 * @desc    Update an existing order
 * @access  Private
 */
router.put('/:id', orderController.updateOrder.bind(orderController));

/**
 * @route   DELETE /api/orders/:id
 * @desc    Delete an order
 * @access  Private
 */
router.delete('/:id', orderController.deleteOrder.bind(orderController));

export default router; 