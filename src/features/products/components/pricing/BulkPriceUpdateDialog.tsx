import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Product, CustomerGroup, BulkPriceUpdate } from "../../types"

interface BulkPriceUpdateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: Product[]
  customerGroups: CustomerGroup[]
}

export function BulkPriceUpdateDialog({
  open,
  onOpenChange,
  products,
  customerGroups,
}: BulkPriceUpdateDialogProps) {
  const { toast } = useToast()
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [updateType, setUpdateType] = useState<'fixed' | 'percentage' | 'increase' | 'decrease'>('fixed')
  const [value, setValue] = useState("")
  const [customerGroup, setCustomerGroup] = useState("")
  const [reason, setReason] = useState("")
  const [updating, setUpdating] = useState(false)

  const handleUpdatePrices = async () => {
    if (!value || selectedProducts.length === 0) return

    try {
      setUpdating(true)
      const update: BulkPriceUpdate = {
        productIds: selectedProducts,
        updateType,
        value: parseFloat(value),
        customerGroupId: customerGroup || undefined,
        reason: reason || undefined
      }

      // TODO: Implement the actual price update logic
      console.log('Updating prices:', update)

      toast({
        title: "Prices Updated",
        description: `Successfully updated prices for ${selectedProducts.length} products`
      })

      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error('Failed to update prices:', error)
      toast({
        title: "Error",
        description: "Failed to update prices",
        variant: "destructive"
      })
    } finally {
      setUpdating(false)
    }
  }

  const resetForm = () => {
    setSelectedProducts([])
    setUpdateType('fixed')
    setValue("")
    setCustomerGroup("")
    setReason("")
  }

  const handleSelectAllProducts = (checked: boolean) => {
    setSelectedProducts(checked ? products.map(p => p.id) : [])
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) resetForm()
        onOpenChange(isOpen)
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bulk Price Update</DialogTitle>
          <DialogDescription>
            Update prices for multiple products at once.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Update Type</Label>
            <Select
              value={updateType}
              onValueChange={(value: 'fixed' | 'percentage' | 'increase' | 'decrease') => setUpdateType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select update type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Set Fixed Price</SelectItem>
                <SelectItem value="percentage">Update by Percentage</SelectItem>
                <SelectItem value="increase">Increase by Amount</SelectItem>
                <SelectItem value="decrease">Decrease by Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Value</Label>
            <Input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={updateType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
            />
          </div>

          {customerGroups.length > 0 && (
            <div className="grid gap-2">
              <Label>Customer Group (Optional)</Label>
              <Select value={customerGroup} onValueChange={setCustomerGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Customers</SelectItem>
                  {customerGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label>Reason (Optional)</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for price update"
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="selectAll"
                checked={selectedProducts.length === products.length}
                onCheckedChange={handleSelectAllProducts}
              />
              <Label htmlFor="selectAll">Select All Products</Label>
            </div>
            
            <ScrollArea className="h-[200px] border rounded-md p-4">
              {products.map((product) => (
                <div key={product.id} className="flex items-center space-x-2 py-1">
                  <Checkbox
                    id={product.id}
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={(checked) => {
                      setSelectedProducts(prev =>
                        checked
                          ? [...prev, product.id]
                          : prev.filter(id => id !== product.id)
                      )
                    }}
                  />
                  <Label htmlFor={product.id}>
                    {product.name} ({product.sku})
                  </Label>
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdatePrices}
            disabled={updating || !value || selectedProducts.length === 0}
          >
            {updating ? 'Updating...' : 'Update Prices'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default BulkPriceUpdateDialog;
