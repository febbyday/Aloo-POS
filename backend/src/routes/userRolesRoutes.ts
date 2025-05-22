/**
 * User Roles Routes
 *
 * This file re-exports the main role routes for user role management.
 * It serves as a compatibility layer for the /api/v1/users/roles endpoint.
 *
 * NOTE: For all role management, use the main role routes at /api/v1/roles instead.
 * This file exists only to maintain backward compatibility.
 */

import express from 'express';
import roleRoutes from './roleRoutes';
import { logDeprecatedRouteUsage } from '../utils/deprecationTracker';

const router = express.Router();

// Add a deprecation warning middleware with enhanced logging
router.use((req, res, next) => {
  // Log the deprecated route usage
  logDeprecatedRouteUsage(req, '/api/v1/users/roles');

  // Add deprecation warning header to response
  res.set('X-Deprecated-API', 'This endpoint is deprecated. Please use /api/v1/roles instead.');
  res.set('X-Deprecated-Since', '1.5.0');
  res.set('X-Removal-Version', '2.0.0');

  next();
});

// Re-use the main role routes
router.use('/', roleRoutes);

export default router;
