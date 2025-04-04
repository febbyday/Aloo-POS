import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BadgePercent, Gift, Award, ChevronRight } from 'lucide-react';

interface LoyaltyTier {
  id: string;
  name: string;
  pointThreshold: number;
  benefits: string[];
}

interface LoyaltyCardProps {
  customerId: string;
  loyaltyPoints: number;
  tier?: LoyaltyTier;
  onPointsUpdated?: () => void;
}

// Sample loyalty tiers for development
const loyaltyTiers = [
  {
    id: 'bronze',
    name: 'Bronze',
    pointThreshold: 0,
    benefits: ['5% discount on selected items', 'Birthday gift']
  },
  {
    id: 'silver',
    name: 'Silver',
    pointThreshold: 100,
    benefits: ['10% discount on selected items', 'Birthday gift', 'Free shipping on orders over $50']
  },
  {
    id: 'gold',
    name: 'Gold',
    pointThreshold: 500,
    benefits: ['15% discount on all items', 'Birthday gift', 'Free shipping on all orders', 'Early access to sales']
  },
  {
    id: 'platinum',
    name: 'Platinum',
    pointThreshold: 1000,
    benefits: ['20% discount on all items', 'Premium birthday gift', 'Free shipping on all orders', 'Early access to sales', 'Dedicated customer service']
  }
];

const LoyaltyCard: React.FC<LoyaltyCardProps> = ({ 
  customerId, 
  loyaltyPoints, 
  tier = loyaltyTiers[0],
  onPointsUpdated 
}) => {
  // Find the current tier and next tier
  const currentTierIndex = tier ? loyaltyTiers.findIndex(t => t.id === tier.id) : 0;
  const currentTier = tier || loyaltyTiers[0];
  const nextTier = currentTierIndex < loyaltyTiers.length - 1 ? loyaltyTiers[currentTierIndex + 1] : null;
  
  // Calculate progress to next tier
  const pointsToNextTier = nextTier ? nextTier.pointThreshold - loyaltyPoints : 0;
  const progressPercentage = nextTier 
    ? Math.min(100, (loyaltyPoints - currentTier.pointThreshold) / (nextTier.pointThreshold - currentTier.pointThreshold) * 100) 
    : 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <BadgePercent className="h-5 w-5 mr-2 text-primary" />
          Loyalty Program
        </CardTitle>
        <CardDescription>
          View loyalty status and benefits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Current Points</p>
            <p className="text-2xl font-bold">{loyaltyPoints}</p>
          </div>
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 px-3 py-1.5">
            <Award className="h-4 w-4 mr-1.5" />
            {currentTier.name} Tier
          </Badge>
        </div>
        
        {nextTier && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to {nextTier.name}</span>
              <span>{pointsToNextTier} points needed</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}
        
        <div className="space-y-3">
          <p className="text-sm font-medium">Current Benefits:</p>
          <ul className="space-y-2">
            {currentTier.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start">
                <Gift className="h-4 w-4 mr-2 text-primary mt-0.5" />
                <span className="text-sm">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <div className="flex justify-between items-center w-full">
            <span>View Loyalty Program Details</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LoyaltyCard;
