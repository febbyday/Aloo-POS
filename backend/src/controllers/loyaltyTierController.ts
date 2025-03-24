import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Create a new loyalty tier
 * @route POST /api/v1/loyalty/tiers
 */
export const createLoyaltyTier = async (req: Request, res: Response) => {
  try {
    const { name, minimumPoints, minimumSpend, discount, benefits, color } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Check if tier with this name already exists
    const existing = await prisma.loyaltyTier.findUnique({
      where: { name }
    });

    if (existing) {
      return res.status(409).json({ error: 'A loyalty tier with this name already exists' });
    }

    // Create new loyalty tier
    const tier = await prisma.loyaltyTier.create({
      data: {
        name,
        minimumPoints: minimumPoints || 0,
        minimumSpend: minimumSpend || 0,
        discount: discount || 0,
        benefits: benefits || [],
        color: color || "#000000"
      }
    });

    return res.status(201).json(tier);
  } catch (error) {
    console.error('Error creating loyalty tier:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'A loyalty tier with this name already exists' });
      }
    }

    return res.status(500).json({ error: 'Failed to create loyalty tier' });
  }
};
