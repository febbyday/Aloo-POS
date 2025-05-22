import React from "react";
import { DollarSign, Edit, LineChart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriceHistoryChart } from '../../components/PriceHistoryChart';
import type { Product } from '../../types';

interface PricingTabContentProps {
  product: Product;
  timeRange: '7' | '30' | '90' | '365';
  setTimeRange: (range: '7' | '30' | '90' | '365') => void;
  onManagePrice: () => void;
}

export function PricingTabContent({ 
  product, 
  timeRange, 
  setTimeRange, 
  onManagePrice 
}: PricingTabContentProps) {
  return (
    <div className="space-y-6">
      {/* Pricing Card */}
      <div className="bg-card rounded-lg border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-primary" />
            Pricing Information
          </h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onManagePrice}
          >
            <Edit className="h-4 w-4 mr-2" />
            Manage Pricing
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Card className="overflow-hidden border-0 shadow-sm">
            <CardContent className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Retail Price</h3>
              <p className="text-2xl font-bold">${product.retailPrice.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Standard selling price</p>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-0 shadow-sm">
            <CardContent className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Cost Price</h3>
              <p className="text-2xl font-medium">
                {product.costPrice ? 
                  `$${product.costPrice.toFixed(2)}` : 
                  (product.isTemporary ? 
                    <span className="italic text-gray-400">Not set</span> : 
                    "$0.00")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Purchase price from supplier</p>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-0 shadow-sm">
            <CardContent className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Sale Price</h3>
              <p className="text-2xl font-medium">
                {product.salePrice ? 
                  <span className="text-green-600">${product.salePrice.toFixed(2)}</span> : 
                  (product.isTemporary ? 
                    <span className="italic text-gray-400">Not set</span> : 
                    "No sale")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Special promotional price</p>
            </CardContent>
          </Card>
        </div>

        {/* Profit Margin */}
        {product.costPrice && product.retailPrice && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Profit Margin</h3>
            <div className="bg-muted/30 p-4 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Profit per Unit</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${(product.retailPrice - product.costPrice).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Margin Percentage</p>
                  <p className="text-2xl font-bold text-green-600">
                    {((product.retailPrice - product.costPrice) / product.retailPrice * 100).toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="font-medium">Markup</p>
                  <p className="text-2xl font-bold text-green-600">
                    {((product.retailPrice - product.costPrice) / product.costPrice * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Price History Chart */}
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <LineChart className="h-4 w-4 mr-2 text-primary" />
            Price History
          </h3>
          <div className="h-64 bg-muted/30 rounded-md flex items-center justify-center">
            <PriceHistoryChart timeRange={timeRange} />
          </div>
          <div className="flex items-center justify-end mt-2 space-x-2">
            <Button 
              variant={timeRange === '7' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeRange('7')}
            >
              7 Days
            </Button>
            <Button 
              variant={timeRange === '30' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeRange('30')}
            >
              30 Days
            </Button>
            <Button 
              variant={timeRange === '90' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeRange('90')}
            >
              90 Days
            </Button>
            <Button 
              variant={timeRange === '365' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeRange('365')}
            >
              1 Year
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
