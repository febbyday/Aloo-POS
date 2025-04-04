// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
import { ArrowRight, BarChart2, Edit, Truck, Tag, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { Product } from '../types';

interface ProductHeaderProps {
  product: Product;
  onBack: () => void;
  onViewAnalytics: () => void;
  onStockTransfer: () => void;
  onReorder: () => void;
  onCategorize: () => void;
  onEditProduct: () => void;
}

export function ProductHeader({
  product,
  onBack,
  onViewAnalytics,
  onStockTransfer,
  onReorder,
  onCategorize,
  onEditProduct
}: ProductHeaderProps) {
  const { toast } = useToast();

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={onBack}
          >
            <ArrowRight className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{product.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={onViewAnalytics}>
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </TooltipTrigger>
              <TooltipContent>View sales, revenue and performance analytics</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={onStockTransfer}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Transfer
                </Button>
              </TooltipTrigger>
              <TooltipContent>Transfer stock between locations</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={onReorder}>
                  <Truck className="h-4 w-4 mr-2" />
                  Reorder
                </Button>
              </TooltipTrigger>
              <TooltipContent>Create purchase order for restock</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={onCategorize}>
                  <Tag className="h-4 w-4 mr-2" />
                  Categorize
                </Button>
              </TooltipTrigger>
              <TooltipContent>Manage product categories and tags</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={onEditProduct}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Product
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit product details</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-2 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="product-status"
                      checked={product.status === 'active'}
                      onCheckedChange={(checked: boolean) => {
                        // Here you would typically update the product status via API
                        const newStatus = checked ? 'active' : 'inactive';

                        // Simulate API call with a delay
                        setTimeout(() => {
                          // In a real app, this would be updated via API
                          product.status = newStatus;

                          toast({
                            title: `Product ${checked ? 'activated' : 'deactivated'}`,
                            description: `${product.name} is now ${checked ? 'active' : 'inactive'}`
                          });
                        }, 300);
                      }}
                      disabled={product.isTemporary}
                    />
                    <Label htmlFor="product-status" className="text-sm font-medium">
                      {product.isTemporary
                        ? 'Temporary'
                        : product.status === 'active'
                          ? 'Active'
                          : 'Inactive'}
                    </Label>
                  </div>
                  {product.isTemporary && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      <Clock className="h-3 w-3 mr-1" />
                      Temporary
                    </Badge>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>Toggle product active status</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
