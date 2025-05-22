import { History, Edit, Truck, Tag, ShoppingCart } from 'lucide-react';
import { SectionCard } from '../SectionCard';
import { Product } from '../../types';

interface ProductHistoryTabProps {
  product: Product;
}

export function ProductHistoryTab({
  product
}: ProductHistoryTabProps) {
  return (
    <div className="space-y-6">
      <SectionCard title="Product History" icon={History}>
        <div className="space-y-6">
          <div className="relative">
            <div className="absolute h-full w-px bg-border left-5 top-6"></div>
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="bg-muted w-10 h-10 rounded-full flex items-center justify-center z-10">
                  <Edit className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Product Created</p>
                  <p className="text-sm text-muted-foreground">Initial product setup completed</p>
                  <p className="text-xs text-muted-foreground">
                    {product.createdAt ? new Date(product.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-muted w-10 h-10 rounded-full flex items-center justify-center z-10">
                  <Edit className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Product Updated</p>
                  <p className="text-sm text-muted-foreground">Price changed from $89.99 to $99.99</p>
                  <p className="text-xs text-muted-foreground">
                    {product.updatedAt ? new Date(product.updatedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-muted w-10 h-10 rounded-full flex items-center justify-center z-10">
                  <Truck className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Stock Received</p>
                  <p className="text-sm text-muted-foreground">30 units added to inventory</p>
                  <p className="text-xs text-muted-foreground">
                    {product.lastRestock ? new Date(product.lastRestock).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-muted w-10 h-10 rounded-full flex items-center justify-center z-10">
                  <Tag className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Category Changed</p>
                  <p className="text-sm text-muted-foreground">Category updated to "Electronics"</p>
                  <p className="text-xs text-muted-foreground">
                    {product.createdAt ? new Date(product.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-muted w-10 h-10 rounded-full flex items-center justify-center z-10">
                  <ShoppingCart className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">First Sale</p>
                  <p className="text-sm text-muted-foreground">First unit sold to customer</p>
                  <p className="text-xs text-muted-foreground">
                    {product.createdAt ? new Date(product.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
