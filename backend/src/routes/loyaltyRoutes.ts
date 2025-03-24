import express from 'express';
import { createLoyaltyTier } from '../controllers/loyaltyTierController';

const router = express.Router();

router.post('/tiers', createLoyaltyTier);

export default router;
