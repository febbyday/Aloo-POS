import { ArrowLeftRight, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProductActionsProps {
  selectedProducts: Product[];
  onAction: (action: string) => void;
}

export function ProductActions({
  selectedProducts,
  onAction,
}: ProductActionsProps) {
  const hasSelection = selectedProducts.length > 0

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        disabled={!hasSelection}
        onClick={() => onAction('transfer')}
      >
        <ArrowLeftRight className="mr-2 h-4 w-4" />
        Transfer Stock
      </Button>
      <Button
        variant="outline"
        disabled={!hasSelection}
        onClick={() => onAction('restock')}
      >
        <Package className="mr-2 h-4 w-4" />
        Restock Items
      </Button>
    </div>
  )
}
