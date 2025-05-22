import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Printer,
  RefreshCw,
  Receipt,
  Package,
  User,
  Calendar,
  DollarSign,
  CheckCircle,
  Info,
  FileText,
  RotateCcw,
  Eye
} from 'lucide-react';
import { enhancedApiClient } from '@/lib/api/enhanced-api-client';
import { getApiUrl } from '@/lib/api/enhanced-config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

// Mock data for return details
interface ReturnItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  reason: string;
  condition: 'New' | 'Used' | 'Damaged';
}

interface ReturnData {
  id: string;
  reference: string;
  saleId: string;
  saleReference: string;
  createdAt: Date;
  processedAt?: Date;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
  items: ReturnItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  notes: string;
  staffMember: string;
  location: string;
  reason: string;
}

// Mock data for demo purposes
const getMockReturnDetails = (id: string): ReturnData => ({
  id,
  reference: `RET-${id.padStart(6, '0')}`,
  saleId: 'sale-123456',
  saleReference: 'INV-123456',
  createdAt: new Date(),
  processedAt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // 1 day ago
  customer: {
    id: 'cust-123',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567'
  },
  items: [
    {
      id: 'item-1',
      name: 'Wireless Headphones',
      sku: 'WH-101',
      quantity: 1,
      price: 89.99,
      reason: 'Defective',
      condition: 'Used'
    },
    {
      id: 'item-2',
      name: 'Phone Case',
      sku: 'PC-102',
      quantity: 2,
      price: 19.99,
      reason: 'Wrong Item',
      condition: 'New'
    }
  ],
  subtotal: 129.97,
  tax: 12.00,
  total: 141.97,
  status: 'approved',
  notes: 'Customer reported headphones not charging properly. Phone cases were the wrong color.',
  staffMember: 'Emily Johnson',
  location: 'Main Store',
  reason: 'Product Issues'
});

/**
 * ReturnDetailsPage Component
 *
 * Displays comprehensive details for a specific return, including
 * line items, return information, customer details, and actions.
 */
export function ReturnDetailsPage() {
  const { returnId } = useParams<{ returnId: string }>();
  const navigate = useNavigate();
  const [returnData, setReturnData] = useState<ReturnData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    // In a real app, this would be an API call
    const loadReturnDetails = async () => {
      try {
        setLoading(true);

        // Check API connectivity first using the enhanced API client
        try {
          // Use the getApiUrl function to ensure we're using the correct URL
          const healthUrl = getApiUrl('health', 'CHECK');
          console.log('Checking API health at:', healthUrl);

          // Try using the enhanced API client
          try {
            const healthResponse = await enhancedApiClient.get('health/CHECK');
            console.log('API Health Check (enhanced client):', healthResponse);
          } catch (enhancedError) {
            console.error('Enhanced API client health check failed:', enhancedError);
          }

          // Also try with a direct fetch as a fallback
          const healthResponse = await fetch(healthUrl);
          console.log('API Health Check (fetch):', {
            url: healthUrl,
            status: healthResponse.status,
            ok: healthResponse.ok,
            statusText: healthResponse.statusText
          });
        } catch (healthError) {
          console.error('API Health Check Failed:', healthError);
        }

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        if (returnId) {
          // In a real app, we would fetch data from the API
          // const response = await fetch(`/api/v1/sales/returns/${returnId}`);
          // const data = await response.json();

          // For now, use mock data
          const data = getMockReturnDetails(returnId);
          setReturnData(data);
        }
      } catch (error) {
        console.error('Error loading return details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReturnDetails();
  }, [returnId]);

  const handleGoBack = () => {
    navigate('/sales/returns');
  };

  const getStatusBadgeColor = (status: ReturnData['status']) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
  };

  const getConditionBadgeColor = (condition: ReturnItem['condition']) => {
    switch (condition) {
      case 'New':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'Used':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
      case 'Damaged':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!returnData) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">Return Not Found</h2>
        <p className="text-muted-foreground">The return you are looking for could not be found.</p>
        <Button onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Returns
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Return Details</h1>
          <Badge className={getStatusBadgeColor(returnData.status)}>
            {returnData.status.charAt(0).toUpperCase() + returnData.status.slice(1)}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Receipt className="mr-2 h-4 w-4" />
            Receipt
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Return Information</CardTitle>
            <CardDescription>Reference: {returnData.reference}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="details">Items</TabsTrigger>
                <TabsTrigger value="original">Original Sale</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {returnData.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.sku}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.reason}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getConditionBadgeColor(item.condition)}>
                              {item.condition}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">${(item.quantity * item.price).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={6} className="text-right">Subtotal</TableCell>
                        <TableCell className="text-right">${returnData.subtotal.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={6} className="text-right">Tax</TableCell>
                        <TableCell className="text-right">${returnData.tax.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={6} className="text-right font-bold">Total Refund</TableCell>
                        <TableCell className="text-right font-bold">${returnData.total.toFixed(2)}</TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="original">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Original Sale</h3>
                      <p className="text-sm text-muted-foreground">Reference: {returnData.saleReference}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/sales/${returnData.saleId}`)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Sale
                    </Button>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium">Sale Date</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(2024, 2, 15), 'PPP')}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Sale Total</h4>
                      <p className="text-sm text-muted-foreground">
                        ${(returnData.total * 1.5).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Payment Method</h4>
                      <p className="text-sm text-muted-foreground">
                        Credit Card (ending in 4567)
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Staff Member</h4>
                      <p className="text-sm text-muted-foreground">
                        {returnData.staffMember}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="py-1">
                      {format(returnData.createdAt, 'PPP, p')}
                    </Badge>
                    <span className="font-medium">Return created by {returnData.staffMember}</span>
                  </div>
                  {returnData.processedAt && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="py-1">
                        {format(returnData.processedAt, 'PPP, p')}
                      </Badge>
                      <span className="font-medium">Return processed and approved</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="py-1">
                      {format(new Date(returnData.createdAt.getTime() + 2 * 60 * 60 * 1000), 'PPP, p')}
                    </Badge>
                    <span className="font-medium">Refund issued to customer</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            {returnData.notes && (
              <div className="w-full">
                <Separator className="my-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="font-semibold">Notes:</span> {returnData.notes}
                </p>
              </div>
            )}
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              {returnData.customer ? (
                <div className="space-y-2">
                  <p className="font-medium text-lg">{returnData.customer.name}</p>
                  <p className="text-sm text-muted-foreground">{returnData.customer.email}</p>
                  <p className="text-sm text-muted-foreground">{returnData.customer.phone}</p>
                  <Button size="sm" variant="link" className="mt-2 px-0">
                    View Customer Profile
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">No customer associated</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Return Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Created At</p>
                  <p className="text-sm text-muted-foreground">
                    {format(returnData.createdAt, 'PPP, p')}
                  </p>
                </div>
                {returnData.processedAt && (
                  <div>
                    <p className="text-sm font-medium">Processed At</p>
                    <p className="text-sm text-muted-foreground">
                      {format(returnData.processedAt, 'PPP, p')}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">Staff Member</p>
                  <p className="text-sm text-muted-foreground">{returnData.staffMember}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{returnData.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Primary Reason</p>
                  <p className="text-sm text-muted-foreground">{returnData.reason}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                Print Return Label
              </Button>
              <Button className="w-full" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
              <Button className="w-full" variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reverse Return
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ReturnDetailsPage;
