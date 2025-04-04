// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
import { useState } from 'react';
import { Package, Plus, Minus, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Product } from '../../types';

interface StockAdjustmentDialogProps {
  product: Product;
  locationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdjustStock: (locationId: string, adjustmentType: 'add' | 'remove' | 'set', quantity: number, reason: string) => void;
}

export function StockAdjustmentDialog({ 
  product, 
  locationId, 
  open, 
  onOpenChange, 
  onAdjustStock 
}: StockAdjustmentDialogProps) {
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove' | 'set'>('add');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');

  // Find the location data
  const location = product.locations?.find(loc => loc.id === locationId || loc.locationId === locationId);
  const currentStock = location?.stock || 0;
  const locationName = location?.name || locationId;

  const handleAdjust = () => {
    if (quantity > 0) {
      onAdjustStock(locationId, adjustmentType, quantity, reason);
      onOpenChange(false);
    }
  };

  // Calculate new stock level based on adjustment type
  const calculateNewStock = () => {
    switch (adjustmentType) {
      case 'add':
        return currentStock + quantity;
      case 'remove':
        return Math.max(0, currentStock - quantity);
      case 'set':
        return quantity;
      default:
        return currentStock;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            Update inventory levels for {product.name} at {locationName}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Adjustment Type</Label>
            <RadioGroup 
              value={adjustmentType} 
              onValueChange={(value) => setAdjustmentType(value as 'add' | 'remove' | 'set')}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="add" id="add" />
                <Label htmlFor="add" className="flex items-center">
                  <Plus className="h-4 w-4 mr-1 text-green-500" />
                  Add
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="remove" id="remove" />
                <Label htmlFor="remove" className="flex items-center">
                  <Minus className="h-4 w-4 mr-1 text-red-500" />
                  Remove
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="set" id="set" />
                <Label htmlFor="set" className="flex items-center">
                  <Package className="h-4 w-4 mr-1 text-blue-500" />
                  Set
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Adjustment</Label>
            <Textarea
              id="reason"
              placeholder="Enter reason for stock adjustment"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Stock Information</AlertTitle>
            <AlertDescription className="text-sm">
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>Current Stock:</div>
                <div className="font-medium">{currentStock}</div>
                <div>New Stock:</div>
                <div className="font-medium">{calculateNewStock()}</div>
                <div>Location:</div>
                <div className="font-medium">{locationName}</div>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleAdjust}
            disabled={quantity <= 0}
          >
            Adjust Stock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
