import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Location, Product } from '../types'

interface StockTransferDialogProps {
  selectedProducts: Product[]
  onTransfer: (data: {
    sourceId: string
    destinationId: string
    items: { productId: string; quantity: number }[]
  }) => void
}

// Mock data - replace with API call
const mockLocations: Location[] = [
  { id: '1', name: 'Main Warehouse', type: 'warehouse' },
  { id: '2', name: 'Downtown Store', type: 'shop' },
  { id: '3', name: 'Pop-up Market A', type: 'market' },
]

export function StockTransferDialog({ 
  selectedProducts,
  onTransfer 
}: StockTransferDialogProps) {
  const [sourceId, setSourceId] = useState('')
  const [destinationId, setDestinationId] = useState('')
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const handleQuantityChange = (productId: string, quantity: string) => {
    setQuantities({
      ...quantities,
      [productId]: parseInt(quantity) || 0
    })
  }

  const handleTransfer = () => {
    const items = selectedProducts.map(product => ({
      productId: product.id,
      quantity: quantities[product.id] || 0
    }))

    onTransfer({
      sourceId,
      destinationId,
      items
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Transfer Stock</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transfer Stock</DialogTitle>
          <DialogDescription>
            Transfer selected items between locations
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="source">Source Location</label>
            <Select
              value={sourceId}
              onValueChange={setSourceId}
            >
              <SelectTrigger id="source">
                <SelectValue placeholder="Select source location" />
              </SelectTrigger>
              <SelectContent>
                {mockLocations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="destination">Destination Location</label>
            <Select
              value={destinationId}
              onValueChange={setDestinationId}
            >
              <SelectTrigger id="destination">
                <SelectValue placeholder="Select destination location" />
              </SelectTrigger>
              <SelectContent>
                {mockLocations
                  .filter(loc => loc.id !== sourceId)
                  .map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label>Transfer Quantities</label>
            {selectedProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-2">
                <span className="flex-1">{product.name}</span>
                <Input
                  type="number"
                  min="0"
                  max={product.stock}
                  value={quantities[product.id] || ''}
                  onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                  className="w-24"
                />
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleTransfer}
            disabled={!sourceId || !destinationId || selectedProducts.length === 0}
          >
            Transfer Stock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
