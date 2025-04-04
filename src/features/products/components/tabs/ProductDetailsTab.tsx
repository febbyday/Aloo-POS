// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
import { FileText, Building, Clock, Calendar, Tag, AlignLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SectionCard } from '../SectionCard';
import { TemporaryProductAlert } from '../TemporaryProductAlert';
import { Product } from '../../types';

interface ProductDetailsTabProps {
  product: Product;
  onCompleteProduct: () => void;
  onNavigateToSupplier: (supplierId: string) => void;
}

export function ProductDetailsTab({
  product,
  onCompleteProduct,
  onNavigateToSupplier
}: ProductDetailsTabProps) {
  return (
    <div className="space-y-6">
      {product.isTemporary && (
        <TemporaryProductAlert onComplete={onCompleteProduct} />
      )}

      {/* Product Overview */}
      <SectionCard title="Product Overview" icon={FileText}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium">SKU</h3>
            <p className="text-sm text-muted-foreground">{product.sku}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Barcode</h3>
            <p className="text-sm text-muted-foreground">
              {product.barcode || (product.isTemporary ?
                <span className="italic text-gray-400">Not specified</span> :
                "N/A")}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Category</h3>
            <p className="text-sm text-muted-foreground">
              {product.category || (product.isTemporary ?
                <span className="italic text-gray-400">Not specified</span> :
                "Uncategorized")}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Brand</h3>
            <p className="text-sm text-muted-foreground">
              {product.brand || (product.isTemporary ?
                <span className="italic text-gray-400">Not specified</span> :
                "No brand")}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Supplier</h3>
            <p className="text-sm text-muted-foreground">
              {product.supplier?.name || (product.isTemporary ?
                <span className="italic text-gray-400">Not specified</span> :
                "No supplier")}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Created</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(product.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium flex items-center">
            <FileText className="h-4 w-4 mr-2 text-primary" />
            Description
          </h3>
          <div className="mt-2 p-4 bg-muted/50 rounded-md">
            <p className="text-sm">
              {product.description || "No description provided for this product."}
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Pricing Card */}
      <SectionCard title="Pricing" icon={Tag}>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <h3 className="text-sm font-medium">Retail Price</h3>
            <p className="text-lg font-bold">${product.retailPrice.toFixed(2)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Cost Price</h3>
            <p className="text-lg font-medium">
              {product.costPrice ?
                `$${product.costPrice.toFixed(2)}` :
                (product.isTemporary ?
                  <span className="italic text-gray-400">Not set</span> :
                  "$0.00")}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Sale Price</h3>
            <p className="text-lg font-medium">
              {product.salePrice ?
                <span className="text-green-600">${product.salePrice.toFixed(2)}</span> :
                (product.isTemporary ?
                  <span className="italic text-gray-400">Not set</span> :
                  "No sale")}
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Supplier Information */}
      {product.supplier && product.supplier.name && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium flex items-center">
              <Building className="h-4 w-4 mr-2 text-primary" />
              Supplier
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateToSupplier(product.supplier?.id || '')}
              disabled={!product.supplier?.id}
            >
              View Supplier
            </Button>
          </div>
          <div className="flex items-center gap-3 mt-2 p-3 bg-muted/30 rounded-md">
            <Avatar>
              <AvatarImage src={`/assets/suppliers/${product.supplier?.id}.png`} alt={product.supplier?.name} />
              <AvatarFallback>{product.supplier?.name?.substring(0, 2).toUpperCase() || 'NA'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{product.supplier?.name}</p>
              <p className="text-sm text-muted-foreground">{product.supplier?.contact || 'No contact info'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div className="space-y-1">
              <h3 className="text-sm font-medium flex items-center">
                <Clock className="h-4 w-4 mr-2 text-primary" />
                Lead Time
              </h3>
              <p className="font-medium">{product.supplier?.leadTime || 'N/A'} days</p>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-primary" />
                Last Order
              </h3>
              <p className="font-medium">{product.supplier?.lastOrder ? new Date(product.supplier.lastOrder).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
