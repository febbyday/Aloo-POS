import express from 'express';
import multer from 'multer';
import { z } from 'zod';
import { FileStorageService } from '../../src/lib/services/fileStorage';
import { authenticate } from '../middleware/auth';
import path from 'path';
import fs from 'fs/promises';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Initialize file storage service
const fileStorage = new FileStorageService({
  basePath: process.env.FILE_STORAGE_PATH || './uploads',
  allowedTypes: (process.env.FILE_STORAGE_ALLOWED_TYPES || 'image/*,application/pdf').split(','),
  maxFileSize: parseInt(process.env.FILE_STORAGE_MAX_SIZE || '5242880'),
  compression: process.env.FILE_STORAGE_COMPRESSION === 'true',
  accessControl: (process.env.FILE_STORAGE_ACCESS_CONTROL as 'private' | 'public') || 'private',
  storageType: (process.env.FILE_STORAGE_TYPE as 'local' | 's3' | 'azure') || 'local',
});

// Validation schemas
const UploadSchema = z.object({
  module: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
});

// Routes
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { module, metadata } = UploadSchema.parse(req.body);
    const result = await fileStorage.uploadFile(req.file, module, metadata);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json(result.file);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:module/:fileId', async (req, res) => {
  try {
    const { module, fileId } = req.params;
    const metadata = await fileStorage.getFileMetadata(module, fileId);

    if (!metadata) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json(metadata);
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:module/:fileId', authenticate, async (req, res) => {
  try {
    const { module, fileId } = req.params;
    const success = await fileStorage.deleteFile(module, fileId);

    if (!success) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static files
router.get('/:module/:filename', async (req, res) => {
  try {
    const { module, filename } = req.params;
    const filePath = path.join(process.env.FILE_STORAGE_PATH || './uploads', module, filename);

    // Check if file exists
    try {
      await fs.access(filePath);
      res.sendFile(filePath);
    } catch {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Serve file error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 