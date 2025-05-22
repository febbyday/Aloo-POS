import { BarChart, Calendar, ShoppingCart, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SectionCard } from '../SectionCard';
import { SalesStatsCharts } from '../stats';
import { Product } from '../../types';

interface ProductSalesHistoryTabProps {
  product: Product;
  timeRange: string;
  onTimeRangeChange: (value: string) => void;
  analyticsData: any; // Replace with proper type
}

export function ProductSalesHistoryTab({
  product,
  timeRange,
  onTimeRangeChange,
  analyticsData
}: ProductSalesHistoryTabProps) {
  return (
    <div className="space-y-6">
      {/* Sales Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">247</div>
            <p className="text-sm text-muted-foreground">Total Units Sold</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              $24,453.00
            </div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">Mar 2, 2025</div>
            <p className="text-sm text-muted-foreground">Last Sale Date</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">+12.4%</div>
            <p className="text-sm text-muted-foreground">Monthly Growth</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Charts */}
      <SectionCard
        title="Sales Performance"
        icon={BarChart}
        headerRight={
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        }
      >
        <div className="h-[400px]">
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Sales statistics charts would be displayed here
          </div>
        </div>
      </SectionCard>

      {/* Sales Transactions */}
      <SectionCard title="Recent Sales" icon={ShoppingCart}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Mock data for sales - would be replaced with actual data */}
            {[
              {
                id: 'ORD-2025-0042',
                date: '2025-03-02',
                customer: 'John Smith',
                quantity: 1,
                price: 129.99,
                total: 129.99,
                status: 'Completed'
              },
              {
                id: 'ORD-2025-0039',
                date: '2025-02-28',
                customer: 'Sarah Johnson',
                quantity: 2,
                price: 129.99,
                total: 259.98,
                status: 'Completed'
              },
              {
                id: 'ORD-2025-0035',
                date: '2025-02-25',
                customer: 'Michael Brown',
                quantity: 1,
                price: 99.99,
                total: 99.99,
                status: 'Completed'
              }
            ].map((sale) => (
              <TableRow key={sale.id}>
                <TableCell className="font-medium">{sale.id}</TableCell>
                <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                <TableCell>{sale.customer}</TableCell>
                <TableCell>{sale.quantity}</TableCell>
                <TableCell>${sale.price.toFixed(2)}</TableCell>
                <TableCell>${sale.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                    {sale.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SectionCard>
    </div>
  );
}
