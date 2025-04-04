import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { 
  Button,
  Input,
  Label,
  Badge,
  Separator
} from '@/components/ui/components-index';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { ProductVariation, ProductAttribute } from '../types/unified-product.types';

interface VariationsListProps {
  variations: ProductVariation[];
  attributes: ProductAttribute[];
  onChange: (variations: ProductVariation[]) => void;
  basePrice: number;
}

export const VariationsList: React.FC<VariationsListProps> = ({
  variations,
  attributes,
  onChange,
  basePrice
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentVariation, setCurrentVariation] = useState<ProductVariation | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Get attributes that are used for variations
  const variationAttributes = attributes.filter(attr => attr.isUsedForVariations);

  // Open dialog to edit a variation
  const handleEditVariation = (variation: ProductVariation, index: number) => {
    setCurrentVariation({ ...variation });
    setEditIndex(index);
    setIsDialogOpen(true);
  };

  // Save the current variation
  const handleSaveVariation = () => {
    if (!currentVariation) return;
    
    const updatedVariations = [...variations];
    
    if (editIndex !== null) {
      // Update existing variation
      updatedVariations[editIndex] = currentVariation;
    }
    
    onChange(updatedVariations);
    setIsDialogOpen(false);
  };

  // Format attribute combinations for display
  const formatVariationName = (attributes: Record<string, string>) => {
    return Object.entries(attributes)
      .map(([name, value]) => `${name}: ${value}`)
      .join(', ');
  };

  // Handle stock change
  const handleStockChange = (index: number, value: string) => {
    const updatedVariations = [...variations];
    updatedVariations[index].stock = parseInt(value) || 0;
    onChange(updatedVariations);
  };

  // Handle price change
  const handlePriceChange = (index: number, value: string) => {
    const updatedVariations = [...variations];
    updatedVariations[index].retailPrice = parseFloat(value) || basePrice;
    onChange(updatedVariations);
  };

  // Handle sale price change
  const handleSalePriceChange = (index: number, value: string) => {
    const updatedVariations = [...variations];
    updatedVariations[index].salePrice = value ? parseFloat(value) : undefined;
    onChange(updatedVariations);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Product Variations ({variations.length})</h3>
      </div>
      
      {variations.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No variations available. Add attributes and generate variations first.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variation</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Sale Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variations.map((variation, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {formatVariationName(variation.attributes)}
                    </TableCell>
                    <TableCell>{variation.sku || '-'}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={variation.retailPrice}
                        onChange={(e) => handlePriceChange(index, e.target.value)}
                        className="w-24 h-8"
                        min="0"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={variation.salePrice || ''}
                        onChange={(e) => handleSalePriceChange(index, e.target.value)}
                        className="w-24 h-8"
                        min="0"
                        step="0.01"
                        placeholder="-"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={variation.stock}
                        onChange={(e) => handleStockChange(index, e.target.value)}
                        className="w-20 h-8"
                        min="0"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditVariation(variation, index)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Variation</DialogTitle>
            <DialogDescription>
              Update details for this product variation.
            </DialogDescription>
          </DialogHeader>
          
          {currentVariation && (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-muted/30 rounded-md">
                <h4 className="font-medium mb-1">Variation</h4>
                <p>{formatVariationName(currentVariation.attributes)}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={currentVariation.sku || ''}
                    onChange={(e) => setCurrentVariation({
                      ...currentVariation,
                      sku: e.target.value
                    })}
                    placeholder="Auto-generated"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    value={currentVariation.barcode || ''}
                    onChange={(e) => setCurrentVariation({
                      ...currentVariation,
                      barcode: e.target.value
                    })}
                    placeholder="Optional"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={currentVariation.retailPrice}
                    onChange={(e) => setCurrentVariation({
                      ...currentVariation,
                      retailPrice: parseFloat(e.target.value) || basePrice
                    })}
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="salePrice">Sale Price</Label>
                  <Input
                    id="salePrice"
                    type="number"
                    value={currentVariation.salePrice || ''}
                    onChange={(e) => setCurrentVariation({
                      ...currentVariation,
                      salePrice: e.target.value ? parseFloat(e.target.value) : undefined
                    })}
                    min="0"
                    step="0.01"
                    placeholder="Optional"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={currentVariation.stock}
                    onChange={(e) => setCurrentVariation({
                      ...currentVariation,
                      stock: parseInt(e.target.value) || 0
                    })}
                    min="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image">Image</Label>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="h-10">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Select Image
                    </Button>
                    {currentVariation.image && (
                      <div className="h-10 w-10 rounded border overflow-hidden">
                        <img 
                          src={currentVariation.image} 
                          alt="Variation" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveVariation}>
              Update Variation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VariationsList;
