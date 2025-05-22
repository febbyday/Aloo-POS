import React from "react";
import { 
  FileText, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  BarChart2, 
  History 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProductDetailsTabsProps {
  defaultTab?: string;
  children: React.ReactNode;
}

export function ProductDetailsTabs({ defaultTab = "details", children }: ProductDetailsTabsProps) {
  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="details" className="flex items-center justify-center">
                <FileText className="h-4 w-4 mr-2" />
                Details
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent>Basic product information</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="pricing" className="flex items-center justify-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Pricing
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent>Pricing and margin information</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="inventory" className="flex items-center justify-center">
                <Package className="h-4 w-4 mr-2" />
                Inventory
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent>Stock levels and inventory management</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="sales" className="flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Sales
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent>Sales history and transactions</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="analytics" className="flex items-center justify-center">
                <BarChart2 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent>Performance metrics and trends</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="history" className="flex items-center justify-center">
                <History className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent>Product change history and audit log</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TabsList>

      <div className="mt-6 space-y-6">
        {children}
      </div>
    </Tabs>
  );
}
