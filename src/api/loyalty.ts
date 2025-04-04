import express from 'express';
import { z } from 'zod';

const router = express.Router();

// Validation schema for loyalty settings
const LoyaltySettingsSchema = z.object({
  pointsPerPurchase: z.number().min(0),
  minimumPointsForRedemption: z.number().min(0),
  pointsToMoneyRatio: z.number().min(0),
  expirationDays: z.number().min(0),
  isEnabled: z.boolean(),
  welcomePoints: z.number().min(0),
  birthdayPoints: z.number().min(0),
  specialEvents: z.array(z.object({
    id: z.string(),
    name: z.string(),
    points: z.number().min(0),
    startDate: z.date(),
    endDate: z.date(),
  })),
});

// In-memory storage for settings (replace with database in production)
let loyaltySettings = {
  pointsPerPurchase: 1,
  minimumPointsForRedemption: 100,
  pointsToMoneyRatio: 0.01,
  expirationDays: 365,
  isEnabled: true,
  welcomePoints: 100,
  birthdayPoints: 50,
  specialEvents: [],
};

// Get loyalty settings
router.get('/settings', (req, res) => {
  res.json(loyaltySettings);
});

// Update loyalty settings
router.put('/settings', (req, res) => {
  try {
    const updatedSettings = LoyaltySettingsSchema.parse({
      ...loyaltySettings,
      ...req.body,
    });
    loyaltySettings = updatedSettings;
    res.json(updatedSettings);
  } catch (error) {
    res.status(400).json({ error: 'Invalid settings data' });
  }
});

// Add special event
router.post('/settings/events', (req, res) => {
  try {
    const newEvent = {
      id: Date.now().toString(),
      ...req.body,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
    };
    
    loyaltySettings.specialEvents.push(newEvent);
    res.json(newEvent);
  } catch (error) {
    res.status(400).json({ error: 'Invalid event data' });
  }
});

// Remove special event
router.delete('/settings/events/:id', (req, res) => {
  const { id } = req.params;
  loyaltySettings.specialEvents = loyaltySettings.specialEvents.filter(
    event => event.id !== id
  );
  res.status(204).send();
});

export default router; 