import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Package,
  RefreshCw,
  ArrowRight,
  X
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Market } from '../pages/MarketsPage'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/lib/toast'

interface MarketStockTransferProps {
  market: Market
  onClose: () => void
}

export function MarketStockTransfer({ market, onClose }: MarketStockTransferProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [revertDialogOpen, setRevertDialogOpen] = useState(false)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [selectedMarket, setSelectedMarket] = useState('')
  const navigate = useNavigate()
  const { toast } = useToast()

  // Mock data - replace with real data from your API
  const otherMarkets = [
    { id: 'market1', name: 'Weekend Market' },
    { id: 'market2', name: 'Holiday Fair' },
    { id: 'market3', name: 'Spring Festival' }
  ].filter(m => m.id !== market.id)

  const handleViewAssignedProducts = () => {
    // Navigate to product stock transfer tool with market context
    navigate(`/products/transfers/create?marketId=${market.id}`)
  }

  const handleRevertStock = () => {
    setRevertDialogOpen(true)
  }

  const handleConfirmRevert = () => {
    // Implement revert stock logic here
    toast({
      title: "Stock Reverted",
      description: "Unsold stock has been returned to inventory"
    })
    setRevertDialogOpen(false)
  }

  const handleTransferToMarket = () => {
    setTransferDialogOpen(true)
  }

  const handleConfirmTransfer = () => {
    if (!selectedMarket) {
      toast({
        title: "Select Market",
        description: "Please select a target market for transfer",
        variant: "destructive"
      })
      return
    }

    // Implement transfer logic here
    toast({
      title: "Stock Transferred",
      description: "Products have been transferred to the selected market"
    })
    setTransferDialogOpen(false)
  }

  return (
    <>
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stock Management
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleViewAssignedProducts}
          >
            <Package className="h-4 w-4" />
            View Assigned Products
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleRevertStock}
          >
            <RefreshCw className="h-4 w-4" />
            Revert Unsold Stock
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleTransferToMarket}
          >
            <ArrowRight className="h-4 w-4" />
            Transfer to Another Market
          </Button>
        </div>
      </div>

      {/* Revert Stock Dialog */}
      <Dialog open={revertDialogOpen} onOpenChange={setRevertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revert Unsold Stock</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This will return all unsold products back to the main inventory.
              Are you sure you want to continue?
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevertDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmRevert}>
              Revert Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer to Market Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer to Another Market</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Select Target Market</Label>
              <Select value={selectedMarket} onValueChange={setSelectedMarket}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a market" />
                </SelectTrigger>
                <SelectContent>
                  {otherMarkets.map((market) => (
                    <SelectItem key={market.id} value={market.id}>
                      {market.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              This will transfer all selected products to the chosen market.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmTransfer}>
              Transfer Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}