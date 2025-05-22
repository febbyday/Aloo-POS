import express from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { authenticateJWT } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { z } from 'zod';

const router = express.Router();
const controller = new SettingsController();

// Validation schema for updating a setting
const UpdateSettingSchema = z.object({
  value: z.any(),
});

// Validation schema for migrating settings
const MigrateSettingsSchema = z.object({
  settings: z.record(z.any()),
});

// All routes require authentication
router.use(authenticateJWT);

/**
 * @route   GET /api/v1/settings/:module
 * @desc    Get all settings for a module
 * @access  Private
 */
router.get('/:module', controller.getModuleSettings.bind(controller));

/**
 * @route   GET /api/v1/settings/:module/:key
 * @desc    Get a specific setting by key
 * @access  Private
 */
router.get('/:module/:key', controller.getSetting.bind(controller));

/**
 * @route   PUT /api/v1/settings/:module/:key
 * @desc    Update a specific setting
 * @access  Private
 */
router.put(
  '/:module/:key',
  validateRequest(UpdateSettingSchema),
  controller.updateSetting.bind(controller)
);

/**
 * @route   PUT /api/v1/settings/:module
 * @desc    Update all settings for a module
 * @access  Private
 */
router.put('/:module', controller.updateModuleSettings.bind(controller));

/**
 * @route   GET /api/v1/settings/:module/history
 * @desc    Get settings history for a module
 * @access  Private
 */
router.get('/:module/history', controller.getSettingsHistory.bind(controller));

/**
 * @route   POST /api/v1/settings/:module/migrate
 * @desc    Migrate settings from localStorage to database
 * @access  Private
 */
router.post(
  '/:module/migrate',
  validateRequest(MigrateSettingsSchema),
  controller.migrateSettings.bind(controller)
);

export default router;
