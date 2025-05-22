import { Router } from 'express';
import batchRoutes from './batch.routes';

const router = Router();

// Temporary root route
router.get('/', (req, res) => {
  res.json({ message: 'POS System API' });
});

// Mount batch routes
router.use('/batch', batchRoutes);

export default router;