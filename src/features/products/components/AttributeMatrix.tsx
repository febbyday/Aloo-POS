import { useMemo } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import type { Product, ProductAttribute, ProductVariation } from '../types';

interface AttributeMatrixProps {
  product: Product;
}

export function AttributeMatrix({ product }: AttributeMatrixProps) {
  const { attributes = [], variations = [] } = product;
  
  // Generate matrix headers based on attributes
  const attributeHeaders = useMemo(() => {
    return attributes.filter(attr => attr.isVisibleOnProductPage);
  }, [attributes]);
  
  // Check if we have data to display
  const hasData = attributeHeaders.length > 0 && variations.length > 0;
  
  if (!hasData) {
    return (
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-2">Product Variations</h3>
          <div className="text-center py-4 text-muted-foreground">
            {product.productType === 'variable' 
              ? 'No variations defined for this product.' 
              : 'This is a simple product without variations.'}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <h3 className="font-medium">Product Variations</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {attributeHeaders.map((attr) => (
                  <TableHead key={attr.name} className="font-medium">
                    {attr.name}
                  </TableHead>
                ))}
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variations.map((variation, index) => (
                <TableRow key={index}>
                  {attributeHeaders.map((attr) => {
                    const value = variation.attributes[attr.name];
                    return (
                      <TableCell key={attr.name}>
                        {value || '-'}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-right font-medium">
                    ${variation.price || product.retailPrice || 0}
                    {variation.salePrice && (
                      <span className="text-success ml-1 text-xs">
                        ${variation.salePrice}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {variation.stock !== undefined ? variation.stock : 'N/A'}
                  </TableCell>
                  <TableCell className="text-center">
                    {variation.inStock ? (
                      <Badge variant="outline" className="bg-success/20 text-success">
                        <Check className="h-3 w-3 mr-1" />
                        In Stock
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-destructive/20 text-destructive">
                        <X className="h-3 w-3 mr-1" />
                        Out of Stock
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
