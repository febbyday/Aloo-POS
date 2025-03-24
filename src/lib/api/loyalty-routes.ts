import { loyaltyService } from './services/loyalty-service';

/**
 * Express middleware for loyalty program API routes
 */
export default function loyaltyRoutes(app) {
  /**
   * Get all loyalty tiers
   */
  app.get('/api/v1/loyalty/tiers', async (req, res) => {
    try {
      const tiers = await loyaltyService.getTiers();
      res.json(tiers);
    } catch (error) {
      console.error('Error fetching tiers:', error);
      res.status(500).json({ error: 'Failed to fetch loyalty tiers' });
    }
  });
  
  /**
   * Get the default (lowest) loyalty tier
   */
  app.get('/api/v1/loyalty/default-tier', async (req, res) => {
    try {
      const defaultTier = await loyaltyService.getDefaultTier();
      res.json({ data: defaultTier });
    } catch (error) {
      console.error('Error fetching default tier:', error);
      res.status(500).json({ error: 'Failed to fetch default loyalty tier' });
    }
  });
  
  /**
   * Determine the next tier for a customer based on spending
   */
  app.post('/api/v1/loyalty/next-tier', async (req, res) => {
    try {
      const { currentTierId, totalSpent } = req.body;
      
      // Validate request body
      if (!currentTierId || totalSpent === undefined) {
        return res.status(400).json({ 
          error: 'Missing required parameters: currentTierId and totalSpent are required' 
        });
      }
      
      // Get the next tier the customer qualifies for
      const nextTier = await loyaltyService.getNextTierForCustomer(currentTierId, totalSpent);
      
      res.json({ data: nextTier });
    } catch (error) {
      console.error('Error determining next tier:', error);
      res.status(500).json({ error: 'Failed to determine next loyalty tier' });
    }
  });
} 