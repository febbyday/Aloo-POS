import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, History, TrendingUp, Tag } from "lucide-react";
import type { Product } from "../../types";
import { PriceDetailsTable } from "./PriceDetailsTable";
import { ProductPriceHistoryTable } from "./ProductPriceHistoryTable";
import { PriceHistoryChart } from "../PriceHistoryChart";

interface PricingOverviewProps {
  product: Product;
}

/**
 * A comprehensive pricing overview component that combines price details and history
 * Provides tabs for different pricing views
 */
export function PricingOverview({ product }: PricingOverviewProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-primary" />
          Pricing Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="details" className="flex items-center justify-center">
              <Tag className="h-4 w-4 mr-2" />
              Price Details
            </TabsTrigger>
            <TabsTrigger value="chart" className="flex items-center justify-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Price Chart
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center justify-center">
              <History className="h-4 w-4 mr-2" />
              Price History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <PriceDetailsTable product={product} />
          </TabsContent>
          
          <TabsContent value="chart">
            <PriceHistoryChart product={product} />
          </TabsContent>
          
          <TabsContent value="history">
            <ProductPriceHistoryTable productId={product.id} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default PricingOverview; 