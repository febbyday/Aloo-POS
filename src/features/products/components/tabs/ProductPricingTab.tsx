// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
import { DollarSign, Tag, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionCard } from '../SectionCard';
import { PriceHistoryChart } from '../../components/PriceHistoryChart';
import { Product } from '../../types';

interface ProductPricingTabProps {
  product: Product;
  onManagePrice: () => void;
}

export function ProductPricingTab({
  product,
  onManagePrice
}: ProductPricingTabProps) {
  return (
    <div className="space-y-6">
      {/* Current Pricing */}
      <SectionCard
        title="Current Pricing"
        icon={DollarSign}
        headerRight={
          <Button variant="outline" size="sm" onClick={onManagePrice}>
            <Tag className="h-4 w-4 mr-2" />
            Manage Pricing
          </Button>
        }
      >
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <h3 className="text-sm font-medium">Retail Price</h3>
            <p className="text-lg font-bold">${product.retailPrice.toFixed(2)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Cost Price</h3>
            <p className="text-lg font-medium">
              ${product.costPrice.toFixed(2)}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Sale Price</h3>
            <p className="text-lg font-medium">
              {product.salePrice ? `$${product.salePrice.toFixed(2)}` : 'No sale'}
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Price History Chart */}
      <SectionCard title="Price History" icon={Calendar}>
        <div className="h-[300px]">
          <PriceHistoryChart product={product} />
        </div>
      </SectionCard>

      {/* Price Details */}
      <SectionCard title="Price Details" icon={DollarSign}>
        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
          Price details would be displayed here
        </div>
      </SectionCard>

      {/* Price History Table */}
      <SectionCard title="Price Change History" icon={Calendar}>
        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
          Price history table would be displayed here
        </div>
      </SectionCard>
    </div>
  );
}
