/**
 * Logs Routes
 * 
 * This module defines routes for handling client-side logs.
 */

import { Router } from 'express';
import { logger } from '../utils/logger';
import { sendSuccessResponse } from '../utils/errorHandling';

const router = Router();

/**
 * Handle client-side error logs
 */
router.post('/client-error', (req, res) => {
  const logData = req.body;
  
  // Add request context
  const context = {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    clientErrorLog: true
  };
  
  // Log the client error
  logger.error(`Client Error: ${logData.message}`, logData, context);
  
  // Send success response
  return sendSuccessResponse(res, { received: true }, 'Error log received');
});

/**
 * Handle client-side general logs
 */
router.post('/client-log', (req, res) => {
  const { level = 'info', message, ...data } = req.body;
  
  // Add request context
  const context = {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    clientLog: true,
    ...data
  };
  
  // Log with appropriate level
  switch (level) {
    case 'error':
      logger.error(message, data.error || null, context);
      break;
    case 'warn':
      logger.warn(message, context);
      break;
    case 'debug':
      logger.debug(message, context);
      break;
    case 'info':
    default:
      logger.info(message, context);
      break;
  }
  
  // Send success response
  return sendSuccessResponse(res, { received: true }, 'Log received');
});

export default router;
