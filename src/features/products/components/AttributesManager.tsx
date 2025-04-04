import React, { useState } from 'react';
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
  Switch,
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, X, Edit, Trash2 } from 'lucide-react';
import { ProductAttribute } from '../types/unified-product.types';

interface AttributesManagerProps {
  attributes: ProductAttribute[];
  onChange: (attributes: ProductAttribute[]) => void;
}

export const AttributesManager: React.FC<AttributesManagerProps> = ({
  attributes,
  onChange
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAttribute, setCurrentAttribute] = useState<ProductAttribute | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [newValue, setNewValue] = useState('');

  // Initialize a new attribute
  const initNewAttribute = () => {
    setCurrentAttribute({
      name: '',
      values: [],
      isVisibleOnProductPage: true,
      isUsedForVariations: true,
      displayOrder: attributes.length
    });
    setEditIndex(null);
    setNewValue('');
  };

  // Open dialog to add a new attribute
  const handleAddAttribute = () => {
    initNewAttribute();
    setIsDialogOpen(true);
  };

  // Open dialog to edit an existing attribute
  const handleEditAttribute = (attribute: ProductAttribute, index: number) => {
    setCurrentAttribute({ ...attribute });
    setEditIndex(index);
    setIsDialogOpen(true);
  };

  // Add a new value to the current attribute
  const handleAddValue = () => {
    if (!newValue.trim() || !currentAttribute) return;
    
    // Check if value already exists
    if (currentAttribute.values.includes(newValue.trim())) {
      return;
    }
    
    setCurrentAttribute({
      ...currentAttribute,
      values: [...currentAttribute.values, newValue.trim()]
    });
    
    setNewValue('');
  };

  // Remove a value from the current attribute
  const handleRemoveValue = (valueToRemove: string) => {
    if (!currentAttribute) return;
    
    setCurrentAttribute({
      ...currentAttribute,
      values: currentAttribute.values.filter(value => value !== valueToRemove)
    });
  };

  // Save the current attribute
  const handleSaveAttribute = () => {
    if (!currentAttribute || !currentAttribute.name || currentAttribute.values.length === 0) {
      return;
    }
    
    const updatedAttributes = [...attributes];
    
    if (editIndex !== null) {
      // Update existing attribute
      updatedAttributes[editIndex] = currentAttribute;
    } else {
      // Add new attribute
      updatedAttributes.push(currentAttribute);
    }
    
    onChange(updatedAttributes);
    setIsDialogOpen(false);
  };

  // Remove an attribute
  const handleRemoveAttribute = (index: number) => {
    const updatedAttributes = [...attributes];
    updatedAttributes.splice(index, 1);
    
    // Update display order
    updatedAttributes.forEach((attr, i) => {
      attr.displayOrder = i;
    });
    
    onChange(updatedAttributes);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Product Attributes</h3>
        <Button onClick={handleAddAttribute} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Attribute
        </Button>
      </div>
      
      {attributes.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No attributes defined. Add attributes to create product variations.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {attributes.map((attribute, index) => (
            <Card key={index}>
              <CardHeader className="py-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base">{attribute.name}</CardTitle>
                    <CardDescription>
                      {attribute.values.length} value{attribute.values.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditAttribute(attribute, index)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRemoveAttribute(index)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="py-2">
                <div className="flex flex-wrap gap-2">
                  {attribute.values.map((value, valueIndex) => (
                    <Badge key={valueIndex} variant="secondary">
                      {value}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="py-3 text-xs text-muted-foreground">
                {attribute.isUsedForVariations ? 'Used for variations' : 'Not used for variations'}
                {' • '}
                {attribute.isVisibleOnProductPage ? 'Visible to customers' : 'Not visible to customers'}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editIndex !== null ? 'Edit Attribute' : 'Add New Attribute'}
            </DialogTitle>
            <DialogDescription>
              Define an attribute and its values for product variations.
            </DialogDescription>
          </DialogHeader>
          
          {currentAttribute && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="attribute-name">Attribute Name</Label>
                <Input
                  id="attribute-name"
                  placeholder="e.g., Size, Color, Material"
                  value={currentAttribute.name}
                  onChange={(e) => setCurrentAttribute({
                    ...currentAttribute,
                    name: e.target.value
                  })}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Attribute Values</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="e.g., Small, Red, Cotton"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddValue();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddValue}>
                    Add
                  </Button>
                </div>
                
                {currentAttribute.values.length > 0 && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2 mt-2">
                      {currentAttribute.values.map((value, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {value}
                          <button
                            type="button"
                            onClick={() => handleRemoveValue(value)}
                            className="ml-1 rounded-full hover:bg-muted p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="visible">Visible on Product Page</Label>
                    <p className="text-sm text-muted-foreground">
                      Show this attribute to customers
                    </p>
                  </div>
                  <Switch
                    id="visible"
                    checked={currentAttribute.isVisibleOnProductPage}
                    onCheckedChange={(checked) => setCurrentAttribute({
                      ...currentAttribute,
                      isVisibleOnProductPage: checked
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="variations">Use for Variations</Label>
                    <p className="text-sm text-muted-foreground">
                      Create different product variations based on this attribute
                    </p>
                  </div>
                  <Switch
                    id="variations"
                    checked={currentAttribute.isUsedForVariations}
                    onCheckedChange={(checked) => setCurrentAttribute({
                      ...currentAttribute,
                      isUsedForVariations: checked
                    })}
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAttribute}>
              {editIndex !== null ? 'Update Attribute' : 'Add Attribute'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttributesManager;
