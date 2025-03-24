import { Button } from "@/components/ui/button"
import { BulkSpecialPriceForm } from "./BulkSpecialPriceForm"
import type { SpecialPrice } from "../../types"
import { Plus } from "lucide-react"
import { CategoryProvider } from "../../context/CategoryContext"

interface PricingToolbarProps {
  onSpecialPricesAdded: (prices: SpecialPrice[]) => void
}

export function PricingToolbar({
  onSpecialPricesAdded,
}: PricingToolbarProps) {
  return (
    <div className="flex items-center justify-between pb-4">
      <div className="flex gap-2">
        <CategoryProvider>
          <BulkSpecialPriceForm
            onSpecialPricesAdded={onSpecialPricesAdded}
            defaultSelectionType="individual"
            buttonProps={{
              size: "default",
              children: (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Special Price
                </>
              ),
            }}
          />
        </CategoryProvider>
      </div>
    </div>
  )
}

export default PricingToolbar;
