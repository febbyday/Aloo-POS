import { useState } from 'react';
import {
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToastManager } from "@/components/ui/toast-manager";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Truck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from '@/lib/utils';
import type { Product } from '../../types';

interface ReorderStockDialogProps {
  product: Product;
  onComplete: () => void;
}

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  leadTime: number; // in days
  minimumOrder: number;
  preferredSupplier: boolean;
}

// Mock suppliers data
const mockSuppliers: Supplier[] = [
  {
    id: 'sup1',
    name: 'Audio Supplies Co.',
    email: 'orders@audiosupplies.com',
    phone: '(555) 123-4567',
    leadTime: 3,
    minimumOrder: 5,
    preferredSupplier: true
  },
  {
    id: 'sup2',
    name: 'Tech Distributors Inc.',
    email: 'sales@techdist.com',
    phone: '(555) 987-6543',
    leadTime: 5,
    minimumOrder: 10,
    preferredSupplier: false
  },
  {
    id: 'sup3',
    name: 'Global Electronics',
    email: 'orders@globalelec.com',
    phone: '(555) 456-7890',
    leadTime: 7,
    minimumOrder: 15,
    preferredSupplier: false
  }
];

export function ReorderStockDialog({ 
  product, 
  onComplete 
}: ReorderStockDialogProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    product.supplier?.id || mockSuppliers[0].id
  );
  const [quantity, setQuantity] = useState<number>(
    Math.max(product.minStock, 10)
  );
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  );
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const showToast = useToastManager();
  
  const selectedSupplier = mockSuppliers.find(s => s.id === selectedSupplierId);
  
  const totalCost = quantity * product.costPrice;
  const estimatedDelivery = selectedSupplier ? new Date(Date.now() + selectedSupplier.leadTime * 24 * 60 * 60 * 1000) : undefined;
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showToast.success(
        "Purchase Order Created", 
        `Order for ${quantity} units of ${product.name} has been sent to ${selectedSupplier?.name}.`
      );
      
      onComplete();
    } catch (error) {
      console.error("Error creating purchase order:", error);
      showToast.error(
        "Order Failed", 
        "There was an error creating the purchase order. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isQuantityBelowMinimum = selectedSupplier && quantity < selectedSupplier.minimumOrder;
  
  return (
    <>
      <DialogDescription className="px-6">
        Create a purchase order to restock {product.name}
      </DialogDescription>
      
      <div className="grid gap-6 p-6">
        {/* Product Summary */}
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
            </div>
            <div className="text-right">
              <p className="text-sm">Current Stock: <span className="font-medium">{
                product.locations.reduce((total, loc) => total + loc.stock, 0)
              } units</span></p>
              <p className="text-sm">Min Stock Level: <span className="font-medium">{product.minStock} units</span></p>
            </div>
          </div>
        </div>
        
        {/* Supplier Selection */}
        <div className="grid gap-3">
          <Label htmlFor="supplier">Supplier</Label>
          <Select 
            value={selectedSupplierId} 
            onValueChange={setSelectedSupplierId}
          >
            <SelectTrigger id="supplier">
              <SelectValue placeholder="Select supplier" />
            </SelectTrigger>
            <SelectContent>
              {mockSuppliers.map(supplier => (
                <SelectItem 
                  key={supplier.id} 
                  value={supplier.id}
                >
                  {supplier.name} {supplier.preferredSupplier && '(Preferred)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedSupplier && (
            <div className="text-sm text-muted-foreground mt-1">
              <p>Lead Time: {selectedSupplier.leadTime} days</p>
              <p>Minimum Order: {selectedSupplier.minimumOrder} units</p>
            </div>
          )}
        </div>
        
        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-3">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={e => setQuantity(parseInt(e.target.value) || 0)}
            />
            {isQuantityBelowMinimum && (
              <p className="text-sm text-yellow-600 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Below supplier minimum order ({selectedSupplier?.minimumOrder} units)
              </p>
            )}
          </div>
          
          <div className="grid gap-3">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-3">
            <Label>Required By</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !deliveryDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deliveryDate ? format(deliveryDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={deliveryDate}
                  onSelect={setDeliveryDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
            
            {estimatedDelivery && (
              <p className="text-sm text-muted-foreground">
                Estimated delivery: {format(estimatedDelivery, "PPP")}
              </p>
            )}
          </div>
          
          <div className="grid gap-3">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any special instructions"
            />
          </div>
        </div>
        
        <Separator />
        
        {/* Order Summary */}
        <div>
          <h3 className="font-medium mb-2">Order Summary</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Cost</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-right">{quantity}</TableCell>
                <TableCell className="text-right">${product.costPrice.toFixed(2)}</TableCell>
                <TableCell className="text-right">${totalCost.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
      
      <DialogFooter className="px-6 pb-6">
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || quantity <= 0}
          className="gap-2"
        >
          {isSubmitting ? (
            <>Processing...</>
          ) : (
            <>
              <Truck className="h-4 w-4" />
              Create Purchase Order
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  );
}

export default ReorderStockDialog;
