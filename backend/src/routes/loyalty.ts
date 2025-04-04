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
    id: z.string().optional(),
    name: z.string(),
    points: z.number().min(0),
    startDate: z.string(), // Date will be parsed in the handler
    endDate: z.string(), // Date will be parsed in the handler
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
    const validatedData = LoyaltySettingsSchema.parse({
      ...loyaltySettings,
      ...req.body,
    });

    // Convert date strings to Date objects for special events
    validatedData.specialEvents = validatedData.specialEvents.map(event => ({
      ...event,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
    }));

    loyaltySettings = validatedData;
    res.json(validatedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid settings data', details: error.errors });
    } else {
      res.status(400).json({ error: 'Invalid settings data' });
    }
  }
});

// Add special event
router.post('/settings/events', (req, res) => {
  try {
    const eventSchema = LoyaltySettingsSchema.shape.specialEvents.element.omit({ id: true });
    const validatedEvent = eventSchema.parse(req.body);

    const newEvent = {
      id: Date.now().toString(),
      ...validatedEvent,
      startDate: new Date(validatedEvent.startDate),
      endDate: new Date(validatedEvent.endDate),
    };
    
    loyaltySettings.specialEvents.push(newEvent);
    res.json(newEvent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid event data', details: error.errors });
    } else {
      res.status(400).json({ error: 'Invalid event data' });
    }
  }
});

// Remove special event
router.delete('/settings/events/:id', (req, res) => {
  const { id } = req.params;
  const eventIndex = loyaltySettings.specialEvents.findIndex(event => event.id === id);
  
  if (eventIndex === -1) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }

  loyaltySettings.specialEvents = loyaltySettings.specialEvents.filter(
    event => event.id !== id
  );
  res.status(204).send();
});

export default router; 