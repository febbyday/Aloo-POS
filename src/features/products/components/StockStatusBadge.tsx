// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { Badge } from "@/components/ui/badge";
import { StockStatus } from "../types/unified-product.types";

interface StockStatusBadgeProps {
  status: StockStatus | string;
  quantity?: number;
  lowStockThreshold?: number;
  className?: string;
}

/**
 * StockStatusBadge Component
 * 
 * Displays a consistent badge for product stock status across the application.
 * Handles different status types and provides appropriate styling.
 */
export function StockStatusBadge({ 
  status, 
  quantity, 
  lowStockThreshold = 5,
  className = "" 
}: StockStatusBadgeProps) {
  // Determine status if not explicitly provided but quantity is available
  let displayStatus = status;
  
  if (quantity !== undefined) {
    if (quantity <= 0) {
      displayStatus = StockStatus.OUT_OF_STOCK;
    } else if (quantity <= lowStockThreshold) {
      displayStatus = StockStatus.LOW_STOCK;
    } else {
      displayStatus = StockStatus.IN_STOCK;
    }
  }
  
  // Map status to badge variants and text
  const getBadgeProps = () => {
    switch(displayStatus) {
      case StockStatus.IN_STOCK:
        return {
          variant: "outline" as const,
          className: `bg-success/20 text-success text-xs ${className}`,
          text: "In Stock"
        };
      case StockStatus.LOW_STOCK:
        return {
          variant: "outline" as const,
          className: `bg-warning/20 text-warning text-xs ${className}`,
          text: "Low Stock"
        };
      case StockStatus.OUT_OF_STOCK:
        return {
          variant: "outline" as const,
          className: `bg-destructive/20 text-destructive text-xs ${className}`,
          text: "Out of Stock"
        };
      case StockStatus.ON_BACKORDER:
        return {
          variant: "outline" as const,
          className: `bg-muted/20 text-muted-foreground text-xs ${className}`,
          text: "On Backorder"
        };
      default:
        return {
          variant: "outline" as const,
          className: `bg-muted/20 text-muted-foreground text-xs ${className}`,
          text: "Unknown"
        };
    }
  };
  
  const { variant, className: badgeClassName, text } = getBadgeProps();
  
  return (
    <Badge variant={variant} className={badgeClassName}>
      {text}
      {quantity !== undefined && displayStatus === StockStatus.LOW_STOCK && (
        <span className="ml-1">({quantity})</span>
      )}
    </Badge>
  );
}
