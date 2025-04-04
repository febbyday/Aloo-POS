// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
import { useState } from 'react';
import { Settings, Shield, AlertTriangle, ShoppingCart } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Product } from '../../types';

interface InventorySettingsDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveSettings: (settings: {
    minStock: number;
    reorderPoint: number;
    reorderQuantity: number;
  }) => void;
}

export function InventorySettingsDialog({ 
  product, 
  open, 
  onOpenChange, 
  onSaveSettings 
}: InventorySettingsDialogProps) {
  const [minStock, setMinStock] = useState(product.minStock || 0);
  const [reorderPoint, setReorderPoint] = useState(product.reorderPoint || 0);
  const [reorderQuantity, setReorderQuantity] = useState(product.reorderQuantity || 0);

  const handleSave = () => {
    onSaveSettings({
      minStock,
      reorderPoint,
      reorderQuantity
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Inventory Settings</DialogTitle>
          <DialogDescription>
            Configure inventory management settings for {product.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="minStock" className="flex items-center">
              <Shield className="h-4 w-4 mr-2 text-blue-500" />
              Minimum Stock Level
            </Label>
            <Input
              id="minStock"
              type="number"
              min={0}
              value={minStock}
              onChange={(e) => setMinStock(parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Safety threshold for inventory. When stock falls below this level, it will be marked as "Low Stock".
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reorderPoint" className="flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
              Reorder Point
            </Label>
            <Input
              id="reorderPoint"
              type="number"
              min={0}
              value={reorderPoint}
              onChange={(e) => setReorderPoint(parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Stock level at which you should place a new order to avoid running out.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reorderQuantity" className="flex items-center">
              <ShoppingCart className="h-4 w-4 mr-2 text-green-500" />
              Default Reorder Quantity
            </Label>
            <Input
              id="reorderQuantity"
              type="number"
              min={1}
              value={reorderQuantity}
              onChange={(e) => setReorderQuantity(parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Default quantity to order when restocking this product.
            </p>
          </div>

          <Alert>
            <Settings className="h-4 w-4" />
            <AlertTitle>Current Settings</AlertTitle>
            <AlertDescription className="text-sm">
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>Current Stock:</div>
                <div className="font-medium">
                  {product.locations
                    ? product.locations.reduce((sum, loc) => sum + (loc.stock || 0), 0)
                    : product.stock || 0}
                </div>
                <div>Min Stock:</div>
                <div className="font-medium">{product.minStock || 0}</div>
                <div>Reorder Point:</div>
                <div className="font-medium">{product.reorderPoint || 0}</div>
                <div>Reorder Quantity:</div>
                <div className="font-medium">{product.reorderQuantity || 0}</div>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
