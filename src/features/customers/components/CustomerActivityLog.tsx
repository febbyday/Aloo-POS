import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils/formatters';
import { Clock, ShoppingBag, User, Mail, Phone, MapPin, BadgePercent, Heart } from 'lucide-react';

interface CustomerActivityLogProps {
  customerId: string;
}

// Sample activity data for development
const sampleActivities = [
  {
    id: '1',
    type: 'PURCHASE',
    description: 'Made a purchase of $129.99',
    timestamp: new Date().toISOString(),
    icon: ShoppingBag
  },
  {
    id: '2',
    type: 'PROFILE_UPDATE',
    description: 'Updated contact information',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    icon: User
  },
  {
    id: '3',
    type: 'EMAIL_UPDATE',
    description: 'Changed email address',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    icon: Mail
  },
  {
    id: '4',
    type: 'PHONE_UPDATE',
    description: 'Updated phone number',
    timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    icon: Phone
  },
  {
    id: '5',
    type: 'ADDRESS_UPDATE',
    description: 'Updated shipping address',
    timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    icon: MapPin
  },
  {
    id: '6',
    type: 'LOYALTY_POINTS',
    description: 'Earned 50 loyalty points',
    timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    icon: BadgePercent
  }
];

const CustomerActivityLog: React.FC<CustomerActivityLogProps> = ({ customerId }) => {
  // In a real app, you would fetch the customer's activity log from an API
  const activities = sampleActivities;

  // Function to get the appropriate icon color based on activity type
  const getIconColor = (type: string) => {
    switch (type) {
      case 'PURCHASE':
        return 'text-green-500';
      case 'PROFILE_UPDATE':
      case 'EMAIL_UPDATE':
      case 'PHONE_UPDATE':
      case 'ADDRESS_UPDATE':
        return 'text-blue-500';
      case 'LOYALTY_POINTS':
        return 'text-amber-500';
      case 'WISHLIST':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Clock className="h-5 w-5 mr-2 text-primary" />
          Activity Log
        </CardTitle>
        <CardDescription>
          Recent customer activity and interactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-6">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <p className="mt-2 text-muted-foreground">No activity found for this customer</p>
          </div>
        ) : (
          <div className="relative pl-6 border-l border-border space-y-6">
            {activities.map((activity) => {
              const IconComponent = activity.icon;
              return (
                <div key={activity.id} className="relative">
                  <div className="absolute -left-10 p-1.5 rounded-full bg-background border border-border">
                    <IconComponent className={`h-4 w-4 ${getIconColor(activity.type)}`} />
                  </div>
                  <div>
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(activity.timestamp)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerActivityLog;
