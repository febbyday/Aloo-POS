import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EventMonitor } from '@/components/system/EventMonitor';
import { RelationshipGraph } from '@/components/system/RelationshipGraph';
import { useServiceIntegration } from '@/lib/integrations/hooks/useServiceIntegration';
import { eventBus, POS_EVENTS } from '@/lib/events/event-bus';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

export const IntegrationsPage: React.FC = () => {
  const { initialized, systemEvents, clearSystemEvents, emitSystemEvent } = useServiceIntegration();
  
  const handleTestEvent = (eventType: string) => {
    switch (eventType) {
      case 'product':
        eventBus.emit(POS_EVENTS.PRODUCT_INVENTORY_CHANGED, {
          productId: 'prod_1',
          newQuantity: 5,
        });
        break;
      case 'customer':
        eventBus.emit(POS_EVENTS.CUSTOMER_LOYALTY_CHANGED, {
          customerId: 'cust_1',
          newPoints: 750,
        });
        break;
      case 'order':
        eventBus.emit(POS_EVENTS.ORDER_STATUS_CHANGED, {
          orderId: 'ord_1',
          newStatus: 'delivered',
          oldStatus: 'processing',
        });
        break;
      case 'error':
        emitSystemEvent('error', 'This is a test error message');
        break;
      case 'warning':
        emitSystemEvent('warning', 'This is a test warning message');
        break;
      case 'info':
        emitSystemEvent('info', 'This is a test information message');
        break;
      default:
        break;
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">System Integrations</h1>
        <p className="text-muted-foreground">
          Monitor and manage cross-module communication and entity relationships
        </p>
      </div>
      
      <Alert variant={initialized ? "default" : "destructive"}>
        <div className="flex items-center">
          {initialized ? (
            <CheckCircle2 className="h-4 w-4 mr-2" />
          ) : (
            <AlertCircle className="h-4 w-4 mr-2" />
          )}
          <AlertTitle>Service Integrator Status</AlertTitle>
        </div>
        <AlertDescription>
          {initialized 
            ? "Service integrator is initialized and running. All cross-module communication is active."
            : "Service integrator is not initialized. Cross-module communication may not work properly."
          }
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="events">
        <TabsList className="mb-4">
          <TabsTrigger value="events">Event Monitor</TabsTrigger>
          <TabsTrigger value="relationships">Entity Relationships</TabsTrigger>
          <TabsTrigger value="test">Test Integration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="events">
          <EventMonitor />
        </TabsContent>
        
        <TabsContent value="relationships">
          <RelationshipGraph />
        </TabsContent>
        
        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Test Integration Events</CardTitle>
              <CardDescription>
                Trigger test events to verify that cross-module communication is working properly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Business Events</h3>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => handleTestEvent('product')} 
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Badge className="mr-2 bg-blue-500">Product</Badge>
                      Test Product Inventory Change
                    </Button>
                    
                    <Button 
                      onClick={() => handleTestEvent('customer')} 
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Badge className="mr-2 bg-green-500">Customer</Badge>
                      Test Customer Loyalty Change
                    </Button>
                    
                    <Button 
                      onClick={() => handleTestEvent('order')} 
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Badge className="mr-2 bg-purple-500">Order</Badge>
                      Test Order Status Change
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">System Events</h3>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => handleTestEvent('error')} 
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Badge className="mr-2 bg-red-500">Error</Badge>
                      Test System Error
                    </Button>
                    
                    <Button 
                      onClick={() => handleTestEvent('warning')} 
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Badge className="mr-2 bg-yellow-500">Warning</Badge>
                      Test System Warning
                    </Button>
                    
                    <Button 
                      onClick={() => handleTestEvent('info')} 
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Badge className="mr-2 bg-blue-500">Info</Badge>
                      Test System Information
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">System Event Log</h3>
                
                <div className="border rounded-md p-4 h-[200px] overflow-auto bg-muted/20">
                  {systemEvents.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No system events logged yet. Trigger a test event to see it here.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {systemEvents.map((event, index) => (
                        <div 
                          key={index} 
                          className={`p-2 rounded-md ${
                            event.type === 'error' ? 'bg-red-100 text-red-800' :
                            event.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}
                        >
                          <div className="flex justify-between">
                            <span className="font-medium">{event.type.toUpperCase()}</span>
                            <span className="text-xs">
                              {event.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p>{event.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end mt-2">
                  <Button 
                    onClick={clearSystemEvents} 
                    variant="outline" 
                    size="sm"
                    disabled={systemEvents.length === 0}
                  >
                    Clear Events
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationsPage;
