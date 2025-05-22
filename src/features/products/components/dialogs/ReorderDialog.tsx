import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Product } from '../../types';

interface ReorderDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReorder: (quantity: number, expectedDeliveryDate: string, notes: string) => void;
}

export function ReorderDialog({ product, open, onOpenChange, onReorder }: ReorderDialogProps) {
  const [orderQuantity, setOrderQuantity] = useState(product.reorderQuantity || 10);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [orderNotes, setOrderNotes] = useState('');

  const handleReorder = () => {
    if (orderQuantity > 0) {
      onReorder(
        orderQuantity,
        date ? format(date, 'yyyy-MM-dd') : '',
        orderNotes
      );
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
          <DialogDescription>
            Order more inventory for {product.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="orderQuantity">Order Quantity</Label>
            <Input
              id="orderQuantity"
              type="number"
              min={1}
              value={orderQuantity}
              onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 1)}
            />
            <p className="text-xs text-muted-foreground">
              Recommended reorder quantity: {product.reorderQuantity || 'Not set'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedDelivery">Expected Delivery Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  id="expectedDelivery"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderNotes">Order Notes</Label>
            <Textarea
              id="orderNotes"
              placeholder="Add any special instructions or notes for this order"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
            />
          </div>

          <div className="pt-2 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Product:</span>
              <span className="font-medium">{product.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>SKU:</span>
              <span className="font-medium">{product.sku}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Supplier:</span>
              <span className="font-medium">{product.supplier?.name || 'Not specified'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Current Stock:</span>
              <span className="font-medium">
                {product.locations
                  ? product.locations.reduce((sum, loc) => sum + (loc.stock || 0), 0)
                  : product.stock || 0}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleReorder}
            disabled={orderQuantity <= 0}
          >
            Create Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
