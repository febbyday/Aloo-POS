import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Product } from '../../types';

interface StockTransferDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransfer: (sourceLocationId: string, destinationLocationId: string, quantity: number) => void;
}

export function StockTransferDialog({ product, open, onOpenChange, onTransfer }: StockTransferDialogProps) {
  const [sourceLocationId, setSourceLocationId] = useState('');
  const [destinationLocationId, setDestinationLocationId] = useState('');
  const [transferQuantity, setTransferQuantity] = useState(1);

  const handleTransfer = () => {
    if (sourceLocationId && destinationLocationId && transferQuantity > 0) {
      onTransfer(sourceLocationId, destinationLocationId, transferQuantity);
      onOpenChange(false);
    }
  };

  const maxQuantity = sourceLocationId && product.locations
    ? product.locations.find(loc => loc.locationId === sourceLocationId)?.stock || 1
    : 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transfer Stock</DialogTitle>
          <DialogDescription>
            Move inventory between locations for this product.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="sourceLocation">Source Location</Label>
            <Select
              value={sourceLocationId}
              onValueChange={setSourceLocationId}
            >
              <SelectTrigger id="sourceLocation">
                <SelectValue placeholder="Select source location" />
              </SelectTrigger>
              <SelectContent>
                {product.locations && product.locations.map((location) => (
                  <SelectItem
                    key={location.locationId}
                    value={location.locationId || ''}
                    disabled={(location.stock || 0) <= 0}
                  >
                    {location.name || location.locationId} ({location.stock || 0} units)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="destinationLocation">Destination Location</Label>
            <Select
              value={destinationLocationId}
              onValueChange={setDestinationLocationId}
            >
              <SelectTrigger id="destinationLocation">
                <SelectValue placeholder="Select destination location" />
              </SelectTrigger>
              <SelectContent>
                {product.locations && product.locations.map((location) => (
                  <SelectItem
                    key={location.locationId}
                    value={location.locationId || ''}
                    disabled={location.locationId === sourceLocationId}
                  >
                    {location.name || location.locationId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transferQuantity">Transfer Quantity</Label>
            <Input
              id="transferQuantity"
              type="number"
              min={1}
              max={maxQuantity}
              value={transferQuantity}
              onChange={(e) => setTransferQuantity(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="pt-2">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Product Information</AlertTitle>
              <AlertDescription className="text-sm">
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>Product:</div>
                  <div className="font-medium">{product.name}</div>
                  <div>SKU:</div>
                  <div className="font-medium">{product.sku}</div>
                  <div>Total Stock:</div>
                  <div className="font-medium">
                    {product.locations
                      ? product.locations.reduce((sum, loc) => sum + (loc.stock || 0), 0)
                      : product.stock || 0}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleTransfer}
            disabled={!sourceLocationId || !destinationLocationId || sourceLocationId === destinationLocationId || transferQuantity <= 0 || transferQuantity > maxQuantity}
          >
            Transfer Stock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
