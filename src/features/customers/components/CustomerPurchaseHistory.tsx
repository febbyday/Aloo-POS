import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { ShoppingBag, Package, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CustomerPurchaseHistoryProps {
  customerId: string;
}

// Sample purchase data for development
const samplePurchases = [
  {
    id: 'order-001',
    date: new Date().toISOString(),
    total: 129.99,
    status: 'COMPLETED',
    items: 3
  },
  {
    id: 'order-002',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    total: 49.99,
    status: 'COMPLETED',
    items: 1
  },
  {
    id: 'order-003',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    total: 89.99,
    status: 'COMPLETED',
    items: 2
  }
];

const CustomerPurchaseHistory: React.FC<CustomerPurchaseHistoryProps> = ({ customerId }) => {
  // In a real app, you would fetch the customer's purchase history from an API
  const purchases = samplePurchases;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <ShoppingBag className="h-5 w-5 mr-2 text-primary" />
          Purchase History
        </CardTitle>
        <CardDescription>
          View all purchases made by this customer
        </CardDescription>
      </CardHeader>
      <CardContent>
        {purchases.length === 0 ? (
          <div className="text-center py-6">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <p className="mt-2 text-muted-foreground">No purchase history found for this customer</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium">{purchase.id}</TableCell>
                  <TableCell>{formatDate(purchase.date)}</TableCell>
                  <TableCell>{purchase.items}</TableCell>
                  <TableCell>{formatCurrency(purchase.total)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {purchase.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerPurchaseHistory;
