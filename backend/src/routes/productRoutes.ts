import express from 'express';
import { productController } from '../controllers/productController';

const router = express.Router();

/**
 * @route   GET /api/products
 * @desc    Get all products with filtering and pagination
 * @access  Public
 */
router.get('/', productController.getAllProducts.bind(productController));

/**
 * @route   GET /api/products/search
 * @desc    Quick search for products (used for autocomplete)
 * @access  Public
 */
router.get('/search', productController.quickSearch.bind(productController));

/**
 * @route   GET /api/products/category/:categoryId
 * @desc    Get products by category
 * @access  Public
 */
router.get('/category/:categoryId', productController.getProductsByCategory.bind(productController));

/**
 * @route   GET /api/products/supplier/:supplierId
 * @desc    Get products by supplier
 * @access  Public
 */
router.get('/supplier/:supplierId', productController.getProductsBySupplier.bind(productController));

/**
 * @route   GET /api/products/sku/:sku
 * @desc    Get a product by SKU
 * @access  Public
 */
router.get('/sku/:sku', productController.getProductBySku.bind(productController));

/**
 * @route   GET /api/products/barcode/:barcode
 * @desc    Get a product by barcode
 * @access  Public
 */
router.get('/barcode/:barcode', productController.getProductByBarcode.bind(productController));

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private
 */
router.post('/', productController.createProduct.bind(productController));

/**
 * @route   PUT /api/products/:id
 * @desc    Update an existing product
 * @access  Private
 */
router.put('/:id', productController.updateProduct.bind(productController));

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private
 */
router.delete('/:id', productController.deleteProduct.bind(productController));

/**
 * @route   PUT /api/products/:id/stock
 * @desc    Update product stock
 * @access  Private
 */
router.put('/:id/stock', productController.updateStock.bind(productController));

/**
 * @route   PUT /api/products/:id/stock/locations
 * @desc    Adjust stock across multiple locations
 * @access  Private
 */
router.put('/:id/stock/locations', productController.adjustStockAcrossLocations.bind(productController));

/**
 * @route   GET /api/products/:id
 * @desc    Get a product by ID
 * @access  Public
 * @note    This route must be defined last to avoid conflicts with other routes
 */
router.get('/:id', productController.getProductById.bind(productController));

export default router; 