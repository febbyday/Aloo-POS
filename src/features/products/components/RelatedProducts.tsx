import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Eye } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useInventory } from '@/features/inventory/hooks/useInventory';
import { StockStatusBadge } from './StockStatusBadge';
import type { UnifiedProduct } from '../types/unified-product.types';

interface RelatedProductsProps {
  product: UnifiedProduct;
  onViewProduct: (product: UnifiedProduct) => void;
}

export function RelatedProducts({ product, onViewProduct }: RelatedProductsProps) {
  const { products } = useProducts();
  const { getStockStatus } = useInventory();
  
  const relatedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    // Find products in the same category
    const sameCategory = products.filter(p => 
      p.id !== product.id && 
      p.category === product.category
    );
    
    // Find products with similar tags
    const productTags = new Set(product.tags || []);
    const similarTags = products.filter(p => 
      p.id !== product.id && 
      p.tags && 
      p.tags.some(tag => productTags.has(tag))
    );
    
    // Combine and remove duplicates
    const combined = [...sameCategory, ...similarTags];
    const uniqueIds = new Set();
    const unique = combined.filter(p => {
      if (uniqueIds.has(p.id)) return false;
      uniqueIds.add(p.id);
      return true;
    });
    
    // Limit to 10 products
    return unique.slice(0, 10);
  }, [products, product]);
  
  if (relatedProducts.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <h3 className="font-medium">Related Products</h3>
        <ScrollArea>
          <div className="flex space-x-4 pb-4">
            {relatedProducts.map((relatedProduct) => (
              <div 
                key={relatedProduct.id} 
                className="w-[180px] flex-shrink-0 rounded-md border overflow-hidden"
              >
                <div className="h-[120px] bg-muted flex items-center justify-center">
                  {relatedProduct.images && relatedProduct.images.length > 0 ? (
                    <img 
                      src={relatedProduct.images[0]} 
                      alt={relatedProduct.name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-muted-foreground text-xs">No image</div>
                  )}
                </div>
                <div className="p-3 space-y-2">
                  <div className="font-medium line-clamp-1 text-sm">{relatedProduct.name}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold">${relatedProduct.retailPrice}</div>
                    <StockStatusBadge 
                      status={getStockStatus(relatedProduct.id) || relatedProduct.stockStatus} 
                      quantity={relatedProduct.stock} 
                    />
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => onViewProduct(relatedProduct)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="h-8 w-full"
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
