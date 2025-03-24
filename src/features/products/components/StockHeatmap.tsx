// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Product } from '../types';

interface StockHeatmapProps {
  product: Product;
}

export function StockHeatmap({ product }: StockHeatmapProps) {
  const stockData = useMemo(() => {
    if (!product.locations || product.locations.length === 0) {
      return [];
    }

    return product.locations.map(location => {
      const currentStock = location.stock || 0;
      const minStock = location.minStock || 0;
      const maxStock = location.maxStock || 100;
      const range = maxStock - minStock;
      
      // Calculate percentage filled (capped between 0-100%)
      const percentage = range <= 0 
        ? 50 // Default to 50% if range is invalid
        : Math.min(100, Math.max(0, ((currentStock - minStock) / range) * 100));
      
      // Determine status
      let status: 'critical' | 'low' | 'optimal' | 'excess';
      if (currentStock <= minStock * 0.5) {
        status = 'critical';
      } else if (currentStock <= minStock) {
        status = 'low';
      } else if (currentStock <= maxStock) {
        status = 'optimal';
      } else {
        status = 'excess';
      }

      return {
        locationId: location.locationId,
        locationName: location.locationName || `Location ${location.locationId}`,
        currentStock,
        minStock,
        maxStock,
        percentage,
        status
      };
    });
  }, [product.locations]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-destructive text-destructive-foreground';
      case 'low':
        return 'bg-warning text-warning-foreground';
      case 'optimal':
        return 'bg-success text-success-foreground';
      case 'excess':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-destructive';
      case 'low':
        return 'bg-warning';
      case 'optimal':
        return 'bg-success';
      case 'excess':
        return 'bg-blue-500';
      default:
        return 'bg-muted';
    }
  };

  if (stockData.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center py-6 text-muted-foreground">
            No inventory data available for this product
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Inventory Levels</h3>
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="bg-destructive text-destructive-foreground">Critical</Badge>
            <Badge variant="outline" className="bg-warning text-warning-foreground">Low</Badge>
            <Badge variant="outline" className="bg-success text-success-foreground">Optimal</Badge>
            <Badge variant="outline" className="bg-blue-500 text-white">Excess</Badge>
          </div>
        </div>
        
        <div className="space-y-4">
          {stockData.map((location) => (
            <div key={location.locationId} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="font-medium">{location.locationName}</div>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", getStatusColor(location.status))}
                >
                  {location.currentStock} units
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{location.minStock}</span>
                <Progress 
                  value={location.percentage} 
                  className="h-2 flex-1"
                  indicatorClassName={getProgressColor(location.status)}
                />
                <span className="text-xs text-muted-foreground">{location.maxStock}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {location.status === 'critical' && 'Critical stock level! Reorder immediately.'}
                {location.status === 'low' && 'Stock is below minimum level. Consider reordering.'}
                {location.status === 'optimal' && 'Stock level is optimal.'}
                {location.status === 'excess' && 'Stock exceeds maximum level. Consider redistribution.'}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
