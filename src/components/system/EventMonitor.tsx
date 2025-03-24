import React, { useState } from 'react';
import { EventLogger } from '@/lib/events/components/EventLogger';
import { POS_EVENTS } from '@/lib/events/event-bus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface EventCategory {
  name: string;
  events: string[];
  color: string;
}

const eventCategories: EventCategory[] = [
  {
    name: 'Products',
    events: [
      POS_EVENTS.PRODUCT_CREATED,
      POS_EVENTS.PRODUCT_UPDATED,
      POS_EVENTS.PRODUCT_DELETED,
      POS_EVENTS.PRODUCT_INVENTORY_CHANGED,
      POS_EVENTS.PRODUCT_PRICE_CHANGED,
    ],
    color: 'bg-blue-500',
  },
  {
    name: 'Customers',
    events: [
      POS_EVENTS.CUSTOMER_CREATED,
      POS_EVENTS.CUSTOMER_UPDATED,
      POS_EVENTS.CUSTOMER_DELETED,
      POS_EVENTS.CUSTOMER_LOYALTY_CHANGED,
    ],
    color: 'bg-green-500',
  },
  {
    name: 'Orders',
    events: [
      POS_EVENTS.ORDER_CREATED,
      POS_EVENTS.ORDER_UPDATED,
      POS_EVENTS.ORDER_DELETED,
      POS_EVENTS.ORDER_STATUS_CHANGED,
      POS_EVENTS.ORDER_PAYMENT_STATUS_CHANGED,
    ],
    color: 'bg-purple-500',
  },
  {
    name: 'Suppliers',
    events: [
      POS_EVENTS.SUPPLIER_CREATED,
      POS_EVENTS.SUPPLIER_UPDATED,
      POS_EVENTS.SUPPLIER_DELETED,
      POS_EVENTS.SUPPLIER_RATING_CHANGED,
    ],
    color: 'bg-yellow-500',
  },
  {
    name: 'Inventory',
    events: [
      POS_EVENTS.INVENTORY_LOW,
      POS_EVENTS.INVENTORY_OUT_OF_STOCK,
      POS_EVENTS.INVENTORY_RESTOCKED,
    ],
    color: 'bg-red-500',
  },
  {
    name: 'System',
    events: [
      POS_EVENTS.SYSTEM_ERROR,
      POS_EVENTS.SYSTEM_WARNING,
      POS_EVENTS.SYSTEM_INFO,
    ],
    color: 'bg-gray-500',
  },
  {
    name: 'UI',
    events: [
      POS_EVENTS.UI_THEME_CHANGED,
      POS_EVENTS.UI_LANGUAGE_CHANGED,
      POS_EVENTS.UI_NOTIFICATION,
    ],
    color: 'bg-pink-500',
  },
  {
    name: 'Auth',
    events: [
      POS_EVENTS.AUTH_LOGIN,
      POS_EVENTS.AUTH_LOGOUT,
      POS_EVENTS.AUTH_SESSION_EXPIRED,
    ],
    color: 'bg-indigo-500',
  },
];

export const EventMonitor: React.FC = () => {
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [filterText, setFilterText] = useState('');
  const [maxEntries, setMaxEntries] = useState(50);
  const [showTimestamp, setShowTimestamp] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  const handleCategoryChange = (category: EventCategory, checked: boolean) => {
    if (checked) {
      setSelectedEvents(prev => [...prev, ...category.events]);
    } else {
      setSelectedEvents(prev => prev.filter(event => !category.events.includes(event)));
    }
  };
  
  const handleEventChange = (event: string, checked: boolean) => {
    if (checked) {
      setSelectedEvents(prev => [...prev, event]);
    } else {
      setSelectedEvents(prev => prev.filter(e => e !== event));
    }
  };
  
  const isCategorySelected = (category: EventCategory) => {
    return category.events.every(event => selectedEvents.includes(event));
  };
  
  const isCategoryPartiallySelected = (category: EventCategory) => {
    return !isCategorySelected(category) && category.events.some(event => selectedEvents.includes(event));
  };
  
  const handleSelectAll = () => {
    const allEvents = Object.values(POS_EVENTS);
    setSelectedEvents(allEvents);
  };
  
  const handleDeselectAll = () => {
    setSelectedEvents([]);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Event Monitor</CardTitle>
        <CardDescription>
          Monitor and debug events across the POS system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="filter">Filter Events</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <div className="mb-4">
              <Input
                placeholder="Filter events..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="mb-2"
              />
            </div>
            
            <div className="event-monitor-container border rounded-md p-4 h-[500px] overflow-auto bg-muted/20">
              <EventLogger
                filter={selectedEvents.length > 0 ? selectedEvents : undefined}
                maxEntries={maxEntries}
                showTimestamp={showTimestamp}
                showControls={true}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="filter">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Button onClick={handleSelectAll} variant="outline" size="sm" className="mr-2">
                  Select All
                </Button>
                <Button onClick={handleDeselectAll} variant="outline" size="sm">
                  Deselect All
                </Button>
              </div>
              <div className="text-right">
                <Badge variant="outline">
                  {selectedEvents.length} events selected
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {eventCategories.map((category) => (
                <div key={category.name} className="border rounded-md p-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id={`category-${category.name}`}
                      checked={isCategorySelected(category)}
                      data-state={isCategoryPartiallySelected(category) ? 'indeterminate' : undefined}
                      onCheckedChange={(checked) => handleCategoryChange(category, checked === true)}
                    />
                    <Label htmlFor={`category-${category.name}`} className="font-bold">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${category.color} mr-2`}></div>
                        {category.name}
                      </div>
                    </Label>
                  </div>
                  
                  <div className="space-y-2 pl-6">
                    {category.events.map((event) => (
                      <div key={event} className="flex items-center space-x-2">
                        <Checkbox
                          id={event}
                          checked={selectedEvents.includes(event)}
                          onCheckedChange={(checked) => handleEventChange(event, checked === true)}
                        />
                        <Label htmlFor={event} className="text-sm">
                          {event.split(':').join(': ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="space-y-4">
              <div>
                <Label htmlFor="max-entries">Maximum Entries</Label>
                <Input
                  id="max-entries"
                  type="number"
                  value={maxEntries}
                  onChange={(e) => setMaxEntries(parseInt(e.target.value) || 50)}
                  min={10}
                  max={500}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Maximum number of events to display (10-500)
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-timestamp"
                  checked={showTimestamp}
                  onCheckedChange={(checked) => setShowTimestamp(checked === true)}
                />
                <Label htmlFor="show-timestamp">Show Timestamps</Label>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Event monitoring helps debug cross-module communication
        </div>
      </CardFooter>
    </Card>
  );
};

export default EventMonitor;
