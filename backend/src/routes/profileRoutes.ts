/**
 * Profile Routes
 *
 * API routes for user profile management
 */

import express from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  setupPin,
  verifyPin,
  changePin,
  disablePin
} from '../controllers/profileController';
import { authenticateJWT } from '../middleware/auth';
import multer from 'multer';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

const router = express.Router();

// All profile routes require authentication
router.use(authenticateJWT);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/', getProfile);

/**
 * @route   POST /api/v1/auth/profile/update
 * @desc    Update user profile
 * @access  Private
 */
router.post('/update', updateProfile);

/**
 * @route   POST /api/v1/auth/profile/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', changePassword);

/**
 * @route   POST /api/v1/auth/profile/upload-avatar
 * @desc    Upload user avatar
 * @access  Private
 */
router.post('/upload-avatar', upload.single('avatar'), uploadAvatar);

/**
 * @route   POST /api/v1/auth/profile/setup-pin
 * @desc    Setup PIN for user
 * @access  Private
 */
router.post('/setup-pin', setupPin);

/**
 * @route   POST /api/v1/auth/profile/verify-pin
 * @desc    Verify PIN
 * @access  Private
 */
router.post('/verify-pin', verifyPin);

/**
 * @route   POST /api/v1/auth/profile/change-pin
 * @desc    Change PIN
 * @access  Private
 */
router.post('/change-pin', changePin);

/**
 * @route   POST /api/v1/auth/profile/disable-pin
 * @desc    Disable PIN
 * @access  Private
 */
router.post('/disable-pin', disablePin);

export default router;
