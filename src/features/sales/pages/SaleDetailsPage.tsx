// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, RefreshCw, Receipt } from 'lucide-react';
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
import { formatCurrency } from '@/lib/utils/formatters';
import { ScrollArea } from '@/components/ui/scroll-area';

// This would normally come from your API or service
interface SaleItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

interface Payment {
  method: string;
  amount: number;
  reference?: string;
  timestamp: Date;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface SaleData {
  id: string;
  reference: string;
  createdAt: Date;
  updatedAt: Date;
  customer: Customer | null;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'completed' | 'refunded' | 'partially_refunded';
  payments: Payment[];
  notes: string;
  staffMember: string;
  location: string;
}

// Mock data for demo purposes
const getMockSaleDetails = (id: string): SaleData => ({
  id,
  reference: `INV-${id.padStart(6, '0')}`,
  createdAt: new Date(),
  updatedAt: new Date(),
  customer: {
    id: 'cust-123',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567'
  },
  items: [
    {
      id: 'item-1',
      productId: 'prod-101',
      name: 'Wireless Headphones',
      sku: 'WH-101',
      quantity: 1,
      price: 89.99,
      discount: 0,
      total: 89.99
    },
    {
      id: 'item-2',
      productId: 'prod-102',
      name: 'Phone Case',
      sku: 'PC-102',
      quantity: 2,
      price: 19.99,
      discount: 5.00,
      total: 34.98
    }
  ],
  subtotal: 124.97,
  discount: 5.00,
  tax: 12.00,
  total: 131.97,
  status: 'completed',
  payments: [
    {
      method: 'Credit Card',
      amount: 131.97,
      reference: 'txn_123456',
      timestamp: new Date()
    }
  ],
  notes: 'Customer requested gift wrapping.',
  staffMember: 'Emily Johnson',
  location: 'Main Store'
});

/**
 * SaleDetailsPage Component
 * 
 * Displays comprehensive details for a specific sale, including
 * line items, payment information, customer details, and actions
 * like printing receipts or processing returns.
 */
export function SaleDetailsPage() {
  const { saleId } = useParams<{ saleId: string }>();
  const navigate = useNavigate();
  const [sale, setSale] = useState<SaleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    // In a real app, this would be an API call
    const loadSaleDetails = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (saleId) {
          // Get mock data for demo
          const data = getMockSaleDetails(saleId);
          setSale(data);
        }
      } catch (error) {
        console.error('Error loading sale details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSaleDetails();
  }, [saleId]);

  const handleGoBack = () => {
    navigate('/sales');
  };

  const getStatusBadgeColor = (status: SaleData['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'refunded':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'partially_refunded':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
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

  if (!sale) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">Sale Not Found</h2>
        <p className="text-muted-foreground">The sale you are looking for could not be found.</p>
        <Button onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sales
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Sale Details</h1>
          <Badge className={getStatusBadgeColor(sale.status)}>
            {sale.status.charAt(0).toUpperCase() + sale.status.slice(1).replace('_', ' ')}
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
            <CardTitle>Sale Information</CardTitle>
            <CardDescription>Reference: {sale.reference}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="details">Items</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Discount</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sale.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.sku}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.discount)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={5} className="text-right">Subtotal</TableCell>
                        <TableCell className="text-right">{formatCurrency(sale.subtotal)}</TableCell>
                      </TableRow>
                      {sale.discount > 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-right">Discount</TableCell>
                          <TableCell className="text-right">-{formatCurrency(sale.discount)}</TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell colSpan={5} className="text-right">Tax</TableCell>
                        <TableCell className="text-right">{formatCurrency(sale.tax)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={5} className="text-right font-bold">Total</TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(sale.total)}</TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="payments">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Method</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sale.payments.map((payment, index) => (
                      <TableRow key={index}>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell>{payment.reference || '-'}</TableCell>
                        <TableCell>{payment.timestamp.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-bold">Total Paid</TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(sale.payments.reduce((sum, p) => sum + p.amount, 0))}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </TabsContent>
              
              <TabsContent value="history">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="py-1">
                      {new Date().toLocaleString()}
                    </Badge>
                    <span className="font-medium">Sale created by {sale.staffMember}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="py-1">
                      {new Date().toLocaleString()}
                    </Badge>
                    <span className="font-medium">Payment processed</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            {sale.notes && (
              <div className="w-full">
                <Separator className="my-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="font-semibold">Notes:</span> {sale.notes}
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
              {sale.customer ? (
                <div className="space-y-2">
                  <p className="font-medium text-lg">{sale.customer.name}</p>
                  <p className="text-sm text-muted-foreground">{sale.customer.email}</p>
                  <p className="text-sm text-muted-foreground">{sale.customer.phone}</p>
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
              <CardTitle>Sale Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Created At</p>
                  <p className="text-sm text-muted-foreground">
                    {sale.createdAt.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Staff Member</p>
                  <p className="text-sm text-muted-foreground">{sale.staffMember}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{sale.location}</p>
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
                Process Refund
              </Button>
              <Button className="w-full" variant="outline">
                Send Receipt
              </Button>
              <Button className="w-full" variant="outline">
                Create Similar Sale
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SaleDetailsPage;
