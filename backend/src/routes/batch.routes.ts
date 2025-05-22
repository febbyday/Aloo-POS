/**
 * Batch Routes
 * 
 * Routes for handling batch API requests.
 */

import { Router } from 'express';
import { batchController } from '../controllers/batch.controller';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

/**
 * @route POST /api/v1/batch
 * @desc Process a batch of API requests
 * @access Private
 */
router.post('/', asyncHandler(batchController.processBatch));

export default router;
