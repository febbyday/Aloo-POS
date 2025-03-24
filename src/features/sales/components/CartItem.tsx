import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, Percent, Snowflake, Coffee } from 'lucide-react'
import type { CartItem } from '../types'

interface CartItemProps {
  item: CartItem
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemoveFromCart: (productId: string) => void
  onApplyDiscount: (item: CartItem) => void
}

export function CartItemComponent({
  item,
  onUpdateQuantity,
  onRemoveFromCart,
  onApplyDiscount
}: CartItemProps) {
  return (
    <Card key={item.productId} className="mb-2">
      <CardContent className="p-2">
        <div className="flex justify-between items-start">
          <div className="w-3/5">
            <h3 className="font-medium text-sm truncate">{item.name}</h3>
            <p className="text-xs text-muted-foreground">
              ${item.price.toFixed(2)} × {item.quantity}
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
              {item.size && (
                <Badge variant="outline" className="text-xs py-0 h-5">
                  <Coffee className="h-2 w-2 mr-1" />
                  {item.size}
                </Badge>
              )}
              {item.iceLevel !== undefined && (
                <Badge variant="outline" className="text-xs py-0 h-5">
                  <Snowflake className="h-2 w-2 mr-1" />
                  {item.iceLevel}%
                </Badge>
              )}
            </div>
            {item.discount && (
              <div className="mt-1">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs py-0 h-5">
                  {item.discount.type === 'percentage' 
                    ? `${item.discount.value}% off` 
                    : `$${item.discount.value.toFixed(2)} off`}
                </Badge>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 w-2/5">
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="icon"
                className="h-5 w-5"
                onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
              >
                -
              </Button>
              <span className="w-5 text-center text-xs">{item.quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-5 w-5"
                onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
              >
                +
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-destructive"
                onClick={() => onRemoveFromCart(item.productId)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-5 px-1"
              onClick={() => onApplyDiscount(item)}
            >
              <Percent className="h-3 w-3 mr-1" />
              {item.discount ? 'Edit' : 'Discount'}
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center mt-1 text-xs">
          <div className="text-muted-foreground">
            Total:
          </div>
          <div className="font-medium">
            ${(item.price * item.quantity).toFixed(2)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}