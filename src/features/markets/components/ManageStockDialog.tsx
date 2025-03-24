import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Package,
  ArrowRight,
  ArrowLeft,
  Plus,
  Minus,
  History,
  AlertCircle,
} from "lucide-react"

interface ManageStockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: any // Replace with proper Product type
  market: any // Replace with proper Market type
}

export function ManageStockDialog({
  open,
  onOpenChange,
  product,
  market
}: ManageStockDialogProps) {
  const { toast } = useToast()
  const [quantity, setQuantity] = useState<string>('')
  const [operation, setOperation] = useState<'add' | 'remove'>('add')
  const [reason, setReason] = useState<string>('restock')

  const reasons = {
    add: [
      { value: 'restock', label: 'Restock' },
      { value: 'return', label: 'Customer Return' },
      { value: 'correction', label: 'Inventory Correction' },
      { value: 'transfer', label: 'Transfer from Other Market' }
    ],
    remove: [
      { value: 'damaged', label: 'Damaged/Expired' },
      { value: 'lost', label: 'Lost/Missing' },
      { value: 'correction', label: 'Inventory Correction' },
      { value: 'transfer', label: 'Transfer to Other Market' }
    ]
  }

  const handleSubmit = () => {
    const numQuantity = parseInt(quantity)
    if (isNaN(numQuantity) || numQuantity <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity greater than 0.",
        variant: "destructive",
      })
      return
    }

    // Here you would typically make an API call to update the stock
    toast({
      title: "Stock Updated",
      description: `Successfully ${operation === 'add' ? 'added' : 'removed'} ${quantity} units of ${product.name}.`,
      variant: "success",
    })

    // Reset form and close dialog
    setQuantity('')
    setOperation('add')
    setReason('restock')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Manage Stock
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Product Info */}
          <Card className="p-4">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{product?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Current Stock: {product?.stock || 0} units
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="bg-primary/10">
                    SKU: {product?.sku}
                  </Badge>
                  <Badge variant="secondary" className="bg-primary/10">
                    Market: {market?.name}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Operation Type */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={operation === 'add' ? 'default' : 'outline'}
              onClick={() => setOperation('add')}
              className="h-20"
            >
              <div className="flex flex-col items-center gap-2">
                <Plus className="h-5 w-5" />
                <span>Add Stock</span>
              </div>
            </Button>
            <Button
              variant={operation === 'remove' ? 'default' : 'outline'}
              onClick={() => setOperation('remove')}
              className="h-20"
            >
              <div className="flex flex-col items-center gap-2">
                <Minus className="h-5 w-5" />
                <span>Remove Stock</span>
              </div>
            </Button>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
            />
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {reasons[operation].map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stock Movement Preview */}
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Stock Movement</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {product?.stock || 0}
                </span>
                <ArrowRight className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {operation === 'add'
                    ? (product?.stock || 0) + (parseInt(quantity) || 0)
                    : (product?.stock || 0) - (parseInt(quantity) || 0)}
                </span>
              </div>
            </div>
          </Card>

          {/* Warning for low stock */}
          {operation === 'remove' && (product?.stock || 0) - (parseInt(quantity) || 0) < (product?.minStock || 10) && (
            <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Warning: This will put the stock below minimum level.</span>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {operation === 'add' ? 'Add Stock' : 'Remove Stock'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
