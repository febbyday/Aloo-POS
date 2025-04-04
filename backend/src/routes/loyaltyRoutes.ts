import express from 'express';
import { createLoyaltyTier } from '../controllers/loyaltyTierController';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Default settings if none exist in DB
const defaultSettings = {
  pointsPerPurchase: 1,
  minimumPointsForRedemption: 100,
  pointsToMoneyRatio: 0.01,
  expirationDays: 365,
  isEnabled: true,
  welcomePoints: 100,
  birthdayPoints: 50,
  specialEvents: []
};

// GET /api/v1/loyalty/settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await prisma.loyaltySettings.findFirst();
    res.json(settings || defaultSettings);
  } catch (error) {
    console.error('Error fetching loyalty settings:', error);
    res.status(500).json({ error: 'Failed to fetch loyalty settings' });
  }
});

// GET /api/v1/loyalty/tiers
router.get('/tiers', async (req, res) => {
  try {
    console.log('Fetching loyalty tiers...');
    const tiers = await prisma.loyaltyTier.findMany({
      orderBy: { minimumSpend: 'asc' }
    });
    console.log('Found tiers:', tiers);
    res.json({ data: tiers });
  } catch (error) {
    console.error('Error fetching loyalty tiers:', error);
    res.status(500).json({ error: 'Failed to fetch loyalty tiers', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// POST /api/v1/loyalty/tiers
router.post('/tiers', createLoyaltyTier);

// GET /api/v1/loyalty/rewards
router.get('/rewards', async (req, res) => {
  try {
    const rewards = await prisma.loyaltyReward.findMany({
      orderBy: { pointsCost: 'asc' }
    });
    res.json({ data: rewards });
  } catch (error) {
    console.error('Error fetching loyalty rewards:', error);
    res.status(500).json({ error: 'Failed to fetch loyalty rewards' });
  }
});

// GET /api/v1/loyalty/events
router.get('/events', async (req, res) => {
  try {
    const events = await prisma.loyaltyEvent.findMany({
      orderBy: { startDate: 'desc' }
    });
    res.json({ data: events });
  } catch (error) {
    console.error('Error fetching loyalty events:', error);
    res.status(500).json({ error: 'Failed to fetch loyalty events' });
  }
});

// GET /api/v1/loyalty/transactions
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await prisma.loyaltyTransaction.findMany({
      include: {
        customer: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ data: transactions });
  } catch (error) {
    console.error('Error fetching loyalty transactions:', error);
    res.status(500).json({ error: 'Failed to fetch loyalty transactions' });
  }
});

export default router;
