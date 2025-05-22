import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, History, User, Info, TrendingUp } from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import type { PriceHistory } from "../../types";
import { formatCurrency } from "@/lib/utils/formatters";

interface ProductPriceHistoryTableProps {
  productId: string;
  data?: PriceHistory[];
}

/**
 * A simplified price history table specifically for the product details page
 * Shows the price change history for a specific product
 */
export function ProductPriceHistoryTable({ productId, data = [] }: ProductPriceHistoryTableProps) {
  // In a real app, we would fetch the price history for this specific product
  // For now, we'll generate some mock data
  const mockPriceHistory: PriceHistory[] = [
    {
      id: "ph1",
      productId: productId,
      price: 129.99,
      date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 days ago
      reason: "Initial price",
      userId: "user1"
    },
    {
      id: "ph2",
      productId: productId,
      price: 119.99,
      date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
      reason: "Competitive adjustment",
      userId: "user2"
    },
    {
      id: "ph3",
      productId: productId,
      price: 109.99,
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
      reason: "Summer sale",
      userId: "user1"
    },
    {
      id: "ph4",
      productId: productId,
      price: 129.99,
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      reason: "End of promotion",
      userId: "user3"
    }
  ];

  // Use provided data or fallback to mock data
  const priceHistory = data.length > 0 ? data : mockPriceHistory;
  
  // Sort by date (newest first)
  const sortedHistory = [...priceHistory].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Format data for the mini chart
  const chartData = [...sortedHistory]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort by date (oldest first) for chart
    .map(item => ({
      date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      price: item.price
    }));

  // Custom tooltip for the mini chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-md p-2 text-xs">
          <p className="font-medium">{label}</p>
          <p className="text-primary">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center">
            <History className="h-5 w-5 mr-2 text-primary" />
            Price History
          </CardTitle>
          
          {/* Mini price trend chart */}
          {chartData.length > 1 && (
            <div className="w-[200px] h-[40px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  Date
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                  Price
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                  Reason
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  Updated By
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedHistory.map((history, index) => {
              // Calculate price change from previous entry
              const prevPrice = index < sortedHistory.length - 1 ? sortedHistory[index + 1].price : history.price;
              const priceChange = history.price - prevPrice;
              const percentChange = prevPrice !== 0 ? (priceChange / prevPrice) * 100 : 0;
              
              return (
                <TableRow key={history.id}>
                  <TableCell>
                    {new Date(history.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatCurrency(history.price)}</span>
                      {index < sortedHistory.length - 1 && (
                        <span className={`text-xs ${priceChange > 0 ? 'text-green-600' : priceChange < 0 ? 'text-red-600' : 'text-muted-foreground'} flex items-center`}>
                          {priceChange > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : priceChange < 0 ? <TrendingUp className="h-3 w-3 mr-1 rotate-180" /> : null}
                          {priceChange !== 0 ? `${priceChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%` : ''}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {history.reason || "-"}
                  </TableCell>
                  <TableCell>
                    {history.userId || "System"}
                  </TableCell>
                </TableRow>
              );
            })}
            {sortedHistory.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No price history available for this product.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default ProductPriceHistoryTable; 