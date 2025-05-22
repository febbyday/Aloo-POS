import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown, Percent, Calendar, Tag } from "lucide-react";
import type { Product } from "../../types";
import { formatCurrency } from '@/lib/utils/formatters';

interface PriceDetailsTableProps {
  product: Product;
}

/**
 * Component that displays detailed pricing information for a product
 * Shows current prices, margins, and price comparisons
 */
export function PriceDetailsTable({ product }: PriceDetailsTableProps) {
  // Calculate profit margin
  const calculateMargin = (retail: number, cost: number) => {
    if (!cost || cost === 0) return 0;
    return ((retail - cost) / retail) * 100;
  };

  // Calculate profit amount
  const calculateProfit = (retail: number, cost: number) => {
    return retail - cost;
  };

  // Calculate discount percentage
  const calculateDiscount = (retail: number, sale: number | undefined) => {
    if (!sale || sale === 0) return 0;
    return ((retail - sale) / retail) * 100;
  };

  const margin = calculateMargin(product.retailPrice, product.costPrice);
  const profit = calculateProfit(product.retailPrice, product.costPrice);
  const discount = calculateDiscount(product.retailPrice, product.salePrice);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-primary" />
          Price Details
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Price Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-2 text-primary" />
                  Retail Price
                </div>
              </TableCell>
              <TableCell className="font-bold text-lg">
                {formatCurrency(product.retailPrice)}
              </TableCell>
              <TableCell className="text-right">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Standard
                </Badge>
              </TableCell>
            </TableRow>
            
            <TableRow>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <TrendingDown className="h-4 w-4 mr-2 text-destructive" />
                  Cost Price
                </div>
              </TableCell>
              <TableCell>
                {formatCurrency(product.costPrice)}
              </TableCell>
              <TableCell className="text-right">
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                  Supplier Cost
                </Badge>
              </TableCell>
            </TableRow>
            
            {product.salePrice && (
              <TableRow>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <Percent className="h-4 w-4 mr-2 text-green-600" />
                    Sale Price
                  </div>
                </TableCell>
                <TableCell className="text-green-600 font-medium">
                  {formatCurrency(product.salePrice)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {discount.toFixed(1)}% Off
                  </Badge>
                </TableCell>
              </TableRow>
            )}
            
            <TableRow>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                  Profit Margin
                </div>
              </TableCell>
              <TableCell>
                {formatCurrency(profit)}
              </TableCell>
              <TableCell className="text-right">
                <Badge 
                  variant={margin >= 30 ? "default" : margin >= 15 ? "outline" : "destructive"}
                  className={
                    margin >= 30 
                      ? "bg-green-100 text-green-800 hover:bg-green-100" 
                      : margin >= 15 
                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                      : "bg-red-100 text-red-800 hover:bg-red-100"
                  }
                >
                  {margin.toFixed(1)}%
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default PriceDetailsTable; 