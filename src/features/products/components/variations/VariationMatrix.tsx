import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Copy, 
  MoreHorizontal, 
  Image as ImageIcon, 
  RefreshCw, 
  Save, 
  AlertCircle,
  FileDown,
  Upload
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Types for variations and attributes
interface ProductAttribute {
  id: string;
  name: string;
  options: string[];
  isVisibleOnProductPage: boolean;
  isUsedForVariations: boolean;
}

interface ProductVariation {
  id: string;
  attributes: Record<string, string>;
  sku: string;
  price: number;
  salePrice?: number;
  cost?: number;
  stock: number;
  image?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  enabled: boolean;
}

interface VariationMatrixProps {
  productId: string;
  productName: string;
  basePrice: number;
  baseCost?: number;
  variations: ProductVariation[];
  attributes: ProductAttribute[];
  onVariationUpdate: (variation: ProductVariation) => Promise<void>;
  onBulkUpdate: (variations: string[], field: string, value: any) => Promise<void>;
  onVariationDelete: (variationId: string) => Promise<void>;
  onVariationImageUpload: (variationId: string, file: File) => Promise<string>;
  onGenerateVariations: () => Promise<void>;
  onExport: (format: 'csv' | 'excel') => void;
}

export const VariationMatrix: React.FC<VariationMatrixProps> = ({
  productId,
  productName,
  basePrice,
  baseCost,
  variations,
  attributes,
  onVariationUpdate,
  onBulkUpdate,
  onVariationDelete,
  onVariationImageUpload,
  onGenerateVariations,
  onExport,
}) => {
  const { toast } = useToast();
  const [selectedVariations, setSelectedVariations] = useState<Set<string>>(new Set());
  const [editMode, setEditMode] = useState<'none' | 'single' | 'bulk'>('none');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bulkField, setBulkField] = useState<string>('');
  const [bulkValue, setBulkValue] = useState<any>('');
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [currentVariationId, setCurrentVariationId] = useState<string>('');
  const [filterAttribute, setFilterAttribute] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Get variation attributes that are used for variations
  const variationAttributes = attributes.filter(attr => attr.isUsedForVariations);
  
  // Filter and sort variations
  const filteredVariations = variations.filter(variation => {
    if (!filterAttribute || !filterValue) return true;
    return variation.attributes[filterAttribute] === filterValue;
  });
  
  const sortedVariations = [...filteredVariations].sort((a, b) => {
    if (!sortField) return 0;
    
    let valueA, valueB;
    
    if (sortField === 'sku') {
      valueA = a.sku;
      valueB = b.sku;
    } else if (sortField === 'price') {
      valueA = a.price;
      valueB = b.price;
    } else if (sortField === 'stock') {
      valueA = a.stock;
      valueB = b.stock;
    } else {
      // Sort by attribute
      valueA = a.attributes[sortField] || '';
      valueB = b.attributes[sortField] || '';
    }
    
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortDirection === 'asc' 
        ? valueA.localeCompare(valueB) 
        : valueB.localeCompare(valueA);
    } else {
      return sortDirection === 'asc' 
        ? (valueA as number) - (valueB as number) 
        : (valueB as number) - (valueA as number);
    }
  });
  
  // Handle select all variations
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = filteredVariations.map(v => v.id);
      setSelectedVariations(new Set(allIds));
    } else {
      setSelectedVariations(new Set());
    }
  };
  
  // Handle select single variation
  const handleSelectVariation = (variationId: string, checked: boolean) => {
    const newSelected = new Set(selectedVariations);
    if (checked) {
      newSelected.add(variationId);
    } else {
      newSelected.delete(variationId);
    }
    setSelectedVariations(newSelected);
  };
  
  // Handle variation update
  const handleVariationUpdate = async (variation: ProductVariation, field: string, value: any) => {
    try {
      const updatedVariation = { ...variation, [field]: value };
      await onVariationUpdate(updatedVariation);
    } catch (error) {
      console.error('Failed to update variation:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update variation. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle bulk update
  const handleBulkUpdate = async () => {
    if (!bulkField || selectedVariations.size === 0) return;
    
    try {
      setIsProcessing(true);
      await onBulkUpdate(Array.from(selectedVariations), bulkField, bulkValue);
      
      toast({
        title: "Bulk Update Successful",
        description: `Updated ${selectedVariations.size} variations.`,
      });
      
      // Reset bulk edit mode
      setEditMode('none');
      setBulkField('');
      setBulkValue('');
    } catch (error) {
      console.error('Failed to perform bulk update:', error);
      toast({
        title: "Bulk Update Failed",
        description: "Failed to update variations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle variation delete
  const handleVariationDelete = async (variationId: string) => {
    try {
      setIsProcessing(true);
      await onVariationDelete(variationId);
      
      toast({
        title: "Variation Deleted",
        description: "The variation has been deleted successfully.",
      });
      
      // Remove from selected variations
      const newSelected = new Set(selectedVariations);
      newSelected.delete(variationId);
      setSelectedVariations(newSelected);
    } catch (error) {
      console.error('Failed to delete variation:', error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete variation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedVariations.size === 0) return;
    
    try {
      setIsProcessing(true);
      
      // Delete each selected variation
      for (const variationId of selectedVariations) {
        await onVariationDelete(variationId);
      }
      
      toast({
        title: "Bulk Delete Successful",
        description: `Deleted ${selectedVariations.size} variations.`,
      });
      
      // Reset selected variations
      setSelectedVariations(new Set());
    } catch (error) {
      console.error('Failed to perform bulk delete:', error);
      toast({
        title: "Bulk Delete Failed",
        description: "Failed to delete variations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) return;
    
    try {
      setIsProcessing(true);
      const file = event.target.files[0];
      const imageUrl = await onVariationImageUpload(currentVariationId, file);
      
      // Update variation with new image
      const variation = variations.find(v => v.id === currentVariationId);
      if (variation) {
        await onVariationUpdate({ ...variation, image: imageUrl });
      }
      
      toast({
        title: "Image Uploaded",
        description: "The variation image has been uploaded successfully.",
      });
      
      setImageDialogOpen(false);
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle generate variations
  const handleGenerateVariations = async () => {
    try {
      setIsProcessing(true);
      await onGenerateVariations();
      
      toast({
        title: "Variations Generated",
        description: "Product variations have been generated successfully.",
      });
    } catch (error) {
      console.error('Failed to generate variations:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate variations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle sort change
  const handleSortChange = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Get sort indicator
  const getSortIndicator = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Product Variations</CardTitle>
            <CardDescription>
              Manage variations for {productName}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onExport('csv')}
              disabled={variations.length === 0}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGenerateVariations}
              disabled={isProcessing || variationAttributes.length === 0}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate Variations
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {variations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Variations</h3>
            <p className="text-muted-foreground mb-4">
              {variationAttributes.length === 0 
                ? "Add attributes and mark them as 'Used for variations' to create product variations." 
                : "Generate variations based on the product attributes."}
            </p>
            {variationAttributes.length > 0 && (
              <Button onClick={handleGenerateVariations} disabled={isProcessing}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate Variations
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Filters and Bulk Actions */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 flex items-center space-x-2">
                <Select 
                  value={filterAttribute} 
                  onValueChange={setFilterAttribute}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by attribute" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Attributes</SelectItem>
                    {variationAttributes.map(attr => (
                      <SelectItem key={attr.id} value={attr.name}>
                        {attr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {filterAttribute && (
                  <Select 
                    value={filterValue} 
                    onValueChange={setFilterValue}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select value" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Values</SelectItem>
                      {variationAttributes
                        .find(attr => attr.name === filterAttribute)
                        ?.options.map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {selectedVariations.size > 0 && (
                  <>
                    <Badge variant="outline">
                      {selectedVariations.size} selected
                    </Badge>
                    
                    {editMode === 'none' ? (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setEditMode('bulk')}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Bulk Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={handleBulkDelete}
                          disabled={isProcessing}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setEditMode('none')}
                      >
                        Cancel
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {/* Bulk Edit Controls */}
            {editMode === 'bulk' && (
              <div className="flex items-center gap-4 p-4 mb-4 border rounded-lg bg-muted/30">
                <Select 
                  value={bulkField} 
                  onValueChange={setBulkField}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="salePrice">Sale Price</SelectItem>
                    <SelectItem value="cost">Cost</SelectItem>
                    <SelectItem value="stock">Stock</SelectItem>
                    <SelectItem value="enabled">Status</SelectItem>
                  </SelectContent>
                </Select>
                
                {bulkField === 'enabled' ? (
                  <Select 
                    value={bulkValue?.toString()} 
                    onValueChange={(value) => setBulkValue(value === 'true')}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Enabled</SelectItem>
                      <SelectItem value="false">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type="number"
                    placeholder={`Enter ${bulkField}`}
                    value={bulkValue || ''}
                    onChange={(e) => setBulkValue(parseFloat(e.target.value) || 0)}
                    className="w-[180px]"
                    min="0"
                    step={bulkField === 'stock' ? '1' : '0.01'}
                  />
                )}
                
                <Button 
                  onClick={handleBulkUpdate}
                  disabled={!bulkField || isProcessing}
                >
                  {isProcessing ? 'Updating...' : 'Update Selected'}
                </Button>
              </div>
            )}
            
            {/* Variations Table */}
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox 
                        checked={selectedVariations.size === filteredVariations.length && filteredVariations.length > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    {variationAttributes.map(attr => (
                      <TableHead 
                        key={attr.id}
                        className="cursor-pointer"
                        onClick={() => handleSortChange(attr.name)}
                      >
                        {attr.name}{getSortIndicator(attr.name)}
                      </TableHead>
                    ))}
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSortChange('sku')}
                    >
                      SKU{getSortIndicator('sku')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSortChange('price')}
                    >
                      Price{getSortIndicator('price')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSortChange('stock')}
                    >
                      Stock{getSortIndicator('stock')}
                    </TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedVariations.map((variation) => (
                    <TableRow key={variation.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedVariations.has(variation.id)}
                          onCheckedChange={(checked) => handleSelectVariation(variation.id, !!checked)}
                          aria-label={`Select variation ${variation.id}`}
                        />
                      </TableCell>
                      {variationAttributes.map(attr => (
                        <TableCell key={attr.id}>
                          {variation.attributes[attr.name] || '-'}
                        </TableCell>
                      ))}
                      <TableCell>{variation.sku}</TableCell>
                      <TableCell>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5">$</span>
                          <Input
                            type="number"
                            className="pl-6 w-24"
                            value={variation.price}
                            onChange={(e) => handleVariationUpdate(
                              variation, 
                              'price', 
                              parseFloat(e.target.value) || 0
                            )}
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-20"
                          value={variation.stock}
                          onChange={(e) => handleVariationUpdate(
                            variation, 
                            'stock', 
                            parseInt(e.target.value) || 0
                          )}
                          min="0"
                          step="1"
                        />
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setCurrentVariationId(variation.id);
                            setImageDialogOpen(true);
                          }}
                        >
                          {variation.image ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="h-8 w-8 relative">
                                    <img 
                                      src={variation.image} 
                                      alt={`Variation ${variation.id}`}
                                      className="h-full w-full object-cover rounded-sm"
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Click to change image</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <ImageIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Badge variant={variation.enabled ? 'default' : 'secondary'}>
                          {variation.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleVariationUpdate(
                              variation, 
                              'enabled', 
                              !variation.enabled
                            )}>
                              {variation.enabled ? (
                                <>Disable</>
                              ) : (
                                <>Enable</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setCurrentVariationId(variation.id);
                              setImageDialogOpen(true);
                            }}>
                              <ImageIcon className="h-4 w-4 mr-2" />
                              Change Image
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleVariationDelete(variation.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-sm text-muted-foreground">
          {variations.length} variations
        </div>
        {variations.length > 0 && (
          <Button 
            variant="outline" 
            onClick={handleGenerateVariations}
            disabled={isProcessing || variationAttributes.length === 0}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate Variations
          </Button>
        )}
      </CardFooter>
      
      {/* Image Upload Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload Variation Image</DialogTitle>
            <DialogDescription>
              Upload an image for this product variation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center justify-center gap-4">
              {variations.find(v => v.id === currentVariationId)?.image && (
                <div className="border rounded-md p-2">
                  <img 
                    src={variations.find(v => v.id === currentVariationId)?.image} 
                    alt="Current variation image"
                    className="max-h-[200px] object-contain"
                  />
                </div>
              )}
              <label 
                htmlFor="variation-image" 
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG or WEBP (MAX. 2MB)
                  </p>
                </div>
                <input 
                  id="variation-image" 
                  type="file" 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default VariationMatrix;
