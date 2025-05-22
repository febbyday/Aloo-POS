/**
 * Admin Routes
 * 
 * Routes for administrative functions like monitoring and reporting.
 */

import express from 'express';
import { authenticateJWT } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';
import { generateDeprecationReport } from '../utils/deprecationTracker';

const router = express.Router();

// All admin routes require authentication and admin permissions
router.use(authenticateJWT);
router.use(checkPermission('admin', 'view'));

/**
 * @route   GET /api/v1/admin/deprecation-report
 * @desc    Get a report of deprecated route usage
 * @access  Admin
 */
router.get('/deprecation-report', (req, res) => {
  try {
    const report = generateDeprecationReport();
    res.json(report);
  } catch (error) {
    console.error('Error generating deprecation report:', error);
    res.status(500).json({ error: 'Failed to generate deprecation report' });
  }
});

export default router;
