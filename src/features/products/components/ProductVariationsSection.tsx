import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from "@/components/ui/badge";
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from "lucide-react";
import { UseFormReturn } from 'react-hook-form';
import { ProductFormData } from '../context/ProductFormContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProductVariationsSectionProps {
  form: UseFormReturn<ProductFormData>;
  product: {
    id: string;
    sku: string;
    attributes: Array<{
      name: string;
      options: string[];
      isVisibleOnProductPage: boolean;
      isUsedForVariations: boolean;
    }>;
    variations: Array<{
      id: string;
      attributes: Record<string, string>;
      sku: string;
      price: number;
      stock: number;
      image: string;
    }>;
  };
  setProduct: React.Dispatch<React.SetStateAction<any>>;
  generateVariations: () => void;
}

export const ProductVariationsSection: React.FC<ProductVariationsSectionProps> = ({
  form,
  product,
  setProduct,
  generateVariations,
}) => {
  // State for attribute dialog
  const [attributeDialogOpen, setAttributeDialogOpen] = useState(false);
  const [newAttribute, setNewAttribute] = useState<{
    name: string;
    options: string[];
    isVisibleOnProductPage: boolean;
    isUsedForVariations: boolean;
  }>({
    name: '',
    options: [],
    isVisibleOnProductPage: true,
    isUsedForVariations: true,
  });
  const [newOption, setNewOption] = useState('');

  // Add function to handle adding a new attribute
  const handleAddAttribute = () => {
    if (!newAttribute.name || newAttribute.options.length === 0) {
      // Show error message
      return;
    }

    setProduct(prev => ({
      ...prev,
      attributes: [...prev.attributes, { ...newAttribute }]
    }));

    // Reset the new attribute form
    setNewAttribute({
      name: '',
      options: [],
      isVisibleOnProductPage: true,
      isUsedForVariations: true
    });

    // Close the dialog
    setAttributeDialogOpen(false);
  };

  // Add function to handle adding a new option to an attribute
  const handleAddOption = () => {
    if (!newOption.trim()) return;

    setNewAttribute(prev => ({
      ...prev,
      options: [...prev.options, newOption.trim()]
    }));

    setNewOption('');
  };

  // Only show this section for variable products
  if (form.getValues('productType') !== 'variable') {
    return null;
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Attributes & Variations</h3>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAttributeDialogOpen(true)}
                className="text-sm"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Attribute
              </Button>
            </div>
            <Separator />

            {product.attributes.length > 0 ? (
              <div className="space-y-4">
                {product.attributes.map((attr, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{attr.name}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newAttributes = [...product.attributes];
                          newAttributes.splice(index, 1);
                          setProduct({ ...product, attributes: newAttributes });
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {attr.options.map((option, optIndex) => (
                        <Badge key={optIndex} variant="secondary">
                          {option}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center mt-2 space-x-2">
                      <Checkbox
                        id={`visible-${index}`}
                        checked={attr.isVisibleOnProductPage}
                        onCheckedChange={(checked) => {
                          const newAttributes = [...product.attributes];
                          newAttributes[index] = {
                            ...attr,
                            isVisibleOnProductPage: !!checked
                          };
                          setProduct({ ...product, attributes: newAttributes });
                        }}
                      />
                      <Label htmlFor={`visible-${index}`} className="text-sm">Visible on product page</Label>
                    </div>
                    <div className="flex items-center mt-2 space-x-2">
                      <Checkbox
                        id={`variation-${index}`}
                        checked={attr.isUsedForVariations}
                        onCheckedChange={(checked) => {
                          const newAttributes = [...product.attributes];
                          newAttributes[index] = {
                            ...attr,
                            isUsedForVariations: !!checked
                          };
                          setProduct({ ...product, attributes: newAttributes });
                        }}
                      />
                      <Label htmlFor={`variation-${index}`} className="text-sm">Used for variations</Label>
                    </div>
                  </div>
                ))}

                {/* Generate Variations Button */}
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={generateVariations}
                    disabled={!product.attributes.some(attr => attr.isUsedForVariations)}
                  >
                    Generate Variations
                  </Button>
                </div>

                {/* Variations Table */}
                {product.variations.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Product Variations ({product.variations.length})</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-2 text-left">Variation</th>
                            <th className="px-4 py-2 text-left">SKU</th>
                            <th className="px-4 py-2 text-left">Price</th>
                            <th className="px-4 py-2 text-left">Stock</th>
                          </tr>
                        </thead>
                        <tbody>
                          {product.variations.map((variation, index) => (
                            <tr key={variation.id} className="border-t">
                              <td className="px-4 py-2">
                                {Object.entries(variation.attributes)
                                  .map(([attr, value]) => `${attr}: ${value}`)
                                  .join(', ')}
                              </td>
                              <td className="px-4 py-2">
                                <Input
                                  value={variation.sku}
                                  onChange={(e) => {
                                    const newVariations = [...product.variations];
                                    newVariations[index] = {
                                      ...variation,
                                      sku: e.target.value
                                    };
                                    setProduct({ ...product, variations: newVariations });
                                  }}
                                  className="h-8"
                                  autoComplete="off"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <div className="relative">
                                  <span className="absolute left-2 top-1.5">$</span>
                                  <Input
                                    type="number"
                                    value={variation.price}
                                    onChange={(e) => {
                                      const newVariations = [...product.variations];
                                      newVariations[index] = {
                                        ...variation,
                                        price: parseFloat(e.target.value) || 0
                                      };
                                      setProduct({ ...product, variations: newVariations });
                                    }}
                                    className="h-8 pl-6"
                                    min="0"
                                    step="0.01"
                                    autoComplete="off"
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-2">
                                <Input
                                  type="number"
                                  value={variation.stock}
                                  onChange={(e) => {
                                    const newVariations = [...product.variations];
                                    newVariations[index] = {
                                      ...variation,
                                      stock: parseInt(e.target.value) || 0
                                    };
                                    setProduct({ ...product, variations: newVariations });
                                  }}
                                  className="h-8"
                                  min="0"
                                  step="1"
                                  autoComplete="off"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground border rounded-lg">
                No attributes defined. Add attributes to create product variations.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Attribute Dialog */}
      <Dialog open={attributeDialogOpen} onOpenChange={setAttributeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Attribute</DialogTitle>
            <DialogDescription>
              Create a new attribute for your product. Attributes can be used to create variations.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="attribute-name">Attribute Name</Label>
              <Input
                id="attribute-name"
                placeholder="e.g. Size, Color, Material"
                value={newAttribute.name}
                onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
                autoComplete="off"
              />
            </div>
            <div className="grid gap-2">
              <Label>Options</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {newAttribute.options.map((option, index) => (
                  <Badge key={index} variant="secondary" className="px-2 py-1">
                    {option}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 ml-1 p-0"
                      onClick={() => {
                        const newOptions = [...newAttribute.options];
                        newOptions.splice(index, 1);
                        setNewAttribute({ ...newAttribute, options: newOptions });
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add option"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                  autoComplete="off"
                />
                <Button type="button" onClick={handleAddOption} disabled={!newOption.trim()}>
                  Add
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="visible-on-page"
                checked={newAttribute.isVisibleOnProductPage}
                onCheckedChange={(checked) => setNewAttribute({ ...newAttribute, isVisibleOnProductPage: !!checked })}
              />
              <Label htmlFor="visible-on-page">Visible on product page</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="used-for-variations"
                checked={newAttribute.isUsedForVariations}
                onCheckedChange={(checked) => setNewAttribute({ ...newAttribute, isUsedForVariations: !!checked })}
              />
              <Label htmlFor="used-for-variations">Used for variations</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAttributeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleAddAttribute}
              disabled={!newAttribute.name || newAttribute.options.length === 0}
            >
              Add Attribute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductVariationsSection;
