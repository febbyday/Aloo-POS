/**
 * File Routes
 * 
 * API routes for file uploads and retrieval
 */

import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

/**
 * @route   GET /api/v1/files/:module/:filename
 * @desc    Serve a file
 * @access  Public
 */
router.get('/:module/:filename', async (req, res) => {
  try {
    const { module, filename } = req.params;
    const filePath = path.join(process.env.FILE_STORAGE_PATH || './uploads', module, filename);

    // Check if file exists
    try {
      await fs.access(filePath);
      res.sendFile(path.resolve(filePath));
    } catch {
      res.status(404).json({ 
        success: false,
        error: 'File not found' 
      });
    }
  } catch (error) {
    console.error('Serve file error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

export default router;
