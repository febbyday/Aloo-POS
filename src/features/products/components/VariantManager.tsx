import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Copy, Edit, Save, X, AlertTriangle } from "lucide-react"
import { ProductVariant, VariantAttribute, VariantGenerationConfig } from "../types"
import { generateVariantSKU } from "../utils/productUtils"
import { generateBarcode } from "../utils/barcodeValidation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

/**
 * Props for the VariantManager component
 */
interface VariantManagerProps {
  /**
   * The parent product SKU to use as a base for variant SKUs
   */
  productSku: string;
  
  /**
   * The existing variants (if any)
   */
  variants: ProductVariant[];
  
  /**
   * Callback when variants are updated
   */
  onVariantsChange: (variants: ProductVariant[]) => void;
  
  /**
   * Whether the component is in a loading state
   */
  isLoading?: boolean;
}

/**
 * Component for managing product variants
 */
export function VariantManager({
  productSku,
  variants,
  onVariantsChange,
  isLoading = false
}: VariantManagerProps) {
  // State for the current tab
  const [activeTab, setActiveTab] = useState<string>("manual");
  
  // State for manual variant creation
  const [manualVariants, setManualVariants] = useState<ProductVariant[]>(variants);
  
  // State for bulk variant generation
  const [attributes, setAttributes] = useState<VariantAttribute[]>([
    { id: "1", name: "size", values: [], displayOrder: 0 },
    { id: "2", name: "color", values: [], displayOrder: 1 }
  ]);
  
  // State for variant generation config
  const [generationConfig, setGenerationConfig] = useState<VariantGenerationConfig>({
    baseProduct: {},
    attributes: attributes,
    pricingStrategy: "fixed",
    pricingValue: 0,
    generateSKUs: true,
    generateBarcodes: true,
    stockStrategy: "distribute"
  });
  
  // State for attribute input
  const [attributeInput, setAttributeInput] = useState<{ [key: string]: string }>({});
  
  // Update manual variants when props change
  useEffect(() => {
    setManualVariants(variants);
  }, [variants]);
  
  /**
   * Adds a new manual variant
   */
  const addManualVariant = () => {
    const newVariant: ProductVariant = {
      id: `temp-${Date.now()}`,
      productId: "",
      sku: generateVariantSKU(productSku),
      barcode: generateBarcode(),
      costPrice: 0,
      retailPrice: 0,
      stock: 0,
      isActive: true
    };
    
    setManualVariants([...manualVariants, newVariant]);
  };
  
  /**
   * Removes a manual variant
   */
  const removeManualVariant = (index: number) => {
    const updatedVariants = [...manualVariants];
    updatedVariants.splice(index, 1);
    setManualVariants(updatedVariants);
    onVariantsChange(updatedVariants);
  };
  
  /**
   * Updates a manual variant
   */
  const updateManualVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const updatedVariants = [...manualVariants];
    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]: value
    };
    
    // Auto-generate SKU if size or color changes
    if (field === "size" || field === "color") {
      const variant = updatedVariants[index];
      updatedVariants[index].sku = generateVariantSKU(
        productSku,
        variant.size,
        variant.color
      );
    }
    
    setManualVariants(updatedVariants);
  };
  
  /**
   * Saves manual variants
   */
  const saveManualVariants = () => {
    onVariantsChange(manualVariants);
  };
  
  /**
   * Adds a new attribute for bulk generation
   */
  const addAttribute = () => {
    const newAttribute: VariantAttribute = {
      id: `attr-${Date.now()}`,
      name: "",
      values: [],
      displayOrder: attributes.length
    };
    
    setAttributes([...attributes, newAttribute]);
  };
  
  /**
   * Removes an attribute
   */
  const removeAttribute = (index: number) => {
    const updatedAttributes = [...attributes];
    updatedAttributes.splice(index, 1);
    
    // Update display order
    updatedAttributes.forEach((attr, i) => {
      attr.displayOrder = i;
    });
    
    setAttributes(updatedAttributes);
    setGenerationConfig({
      ...generationConfig,
      attributes: updatedAttributes
    });
  };
  
  /**
   * Updates an attribute
   */
  const updateAttribute = (index: number, field: keyof VariantAttribute, value: any) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[index] = {
      ...updatedAttributes[index],
      [field]: value
    };
    
    setAttributes(updatedAttributes);
    setGenerationConfig({
      ...generationConfig,
      attributes: updatedAttributes
    });
  };
  
  /**
   * Adds a value to an attribute
   */
  const addAttributeValue = (attributeIndex: number) => {
    const attrId = attributes[attributeIndex].id;
    const value = attributeInput[attrId] || "";
    
    if (!value.trim()) return;
    
    const updatedAttributes = [...attributes];
    if (!updatedAttributes[attributeIndex].values.includes(value)) {
      updatedAttributes[attributeIndex].values.push(value);
    }
    
    setAttributes(updatedAttributes);
    setGenerationConfig({
      ...generationConfig,
      attributes: updatedAttributes
    });
    
    // Clear input
    setAttributeInput({
      ...attributeInput,
      [attrId]: ""
    });
  };
  
  /**
   * Removes a value from an attribute
   */
  const removeAttributeValue = (attributeIndex: number, valueIndex: number) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[attributeIndex].values.splice(valueIndex, 1);
    
    setAttributes(updatedAttributes);
    setGenerationConfig({
      ...generationConfig,
      attributes: updatedAttributes
    });
  };
  
  /**
   * Updates the generation config
   */
  const updateGenerationConfig = (field: keyof VariantGenerationConfig, value: any) => {
    setGenerationConfig({
      ...generationConfig,
      [field]: value
    });
  };
  
  /**
   * Generates variants based on attribute combinations
   */
  const generateVariants = () => {
    // Filter attributes with values
    const validAttributes = attributes.filter(attr => 
      attr.name && attr.values.length > 0
    );
    
    if (validAttributes.length === 0) return;
    
    // Generate all combinations of attribute values
    const combinations = generateCombinations(validAttributes);
    
    // Create variants from combinations
    const generatedVariants: ProductVariant[] = combinations.map((combo, index) => {
      const sku = generationConfig.generateSKUs
        ? generateVariantSKU(
            productSku,
            combo.find(c => c.attribute === "size")?.value,
            combo.find(c => c.attribute === "color")?.value
          )
        : `${productSku}-${index + 1}`;
      
      return {
        id: `temp-${Date.now()}-${index}`,
        productId: "",
        sku,
        barcode: generationConfig.generateBarcodes ? generateBarcode() : "",
        size: combo.find(c => c.attribute === "size")?.value,
        color: combo.find(c => c.attribute === "color")?.value,
        style: combo.find(c => c.attribute === "style")?.value,
        costPrice: 0, // Would be calculated based on pricing strategy
        retailPrice: 0, // Would be calculated based on pricing strategy
        stock: 0,
        isActive: true
      };
    });
    
    // Add generated variants to manual variants
    setManualVariants([...manualVariants, ...generatedVariants]);
    setActiveTab("manual"); // Switch to manual tab to show results
  };
  
  /**
   * Generates all possible combinations of attribute values
   */
  const generateCombinations = (attrs: VariantAttribute[]) => {
    // Helper function to generate combinations recursively
    const combine = (
      current: { attribute: string; value: string }[],
      attrIndex: number
    ): { attribute: string; value: string }[][] => {
      // Base case: we've processed all attributes
      if (attrIndex >= attrs.length) {
        return [current];
      }
      
      const attribute = attrs[attrIndex];
      const combinations: { attribute: string; value: string }[][] = [];
      
      // For each value of the current attribute
      for (const value of attribute.values) {
        // Add this value to the current combination
        const newCombination = [
          ...current,
          { attribute: attribute.name, value }
        ];
        
        // Recursively generate combinations for the next attributes
        const nextCombinations = combine(newCombination, attrIndex + 1);
        combinations.push(...nextCombinations);
      }
      
      return combinations;
    };
    
    // Start with an empty combination and the first attribute
    return combine([], 0);
  };
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Generate</TabsTrigger>
        </TabsList>
        
        {/* Manual Variant Entry */}
        <TabsContent value="manual" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Manual Variant Entry</h3>
            <Button onClick={addManualVariant} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Variant
            </Button>
          </div>
          
          {manualVariants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No variants added yet. Click "Add Variant" to create one.
            </div>
          ) : (
            <div className="border rounded-md">
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {manualVariants.map((variant, index) => (
                      <TableRow key={variant.id || index}>
                        <TableCell>
                          <Input
                            value={variant.sku || ""}
                            onChange={(e) => updateManualVariant(index, "sku", e.target.value)}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={variant.size || ""}
                            onChange={(e) => updateManualVariant(index, "size", e.target.value)}
                            className="h-8 w-20"
                            placeholder="Size"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={variant.color || ""}
                            onChange={(e) => updateManualVariant(index, "color", e.target.value)}
                            className="h-8 w-24"
                            placeholder="Color"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={variant.retailPrice || 0}
                            onChange={(e) => updateManualVariant(index, "retailPrice", parseFloat(e.target.value))}
                            className="h-8 w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={variant.stock || 0}
                            onChange={(e) => updateManualVariant(index, "stock", parseInt(e.target.value))}
                            className="h-8 w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={variant.isActive}
                            onCheckedChange={(checked) => 
                              updateManualVariant(index, "isActive", checked === true)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeManualVariant(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setManualVariants(variants)}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={saveManualVariants}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Variants
            </Button>
          </div>
        </TabsContent>
        
        {/* Bulk Generate */}
        <TabsContent value="bulk" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Bulk Generate Variants</h3>
            <Button onClick={addAttribute} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Attribute
            </Button>
          </div>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Bulk Generation</AlertTitle>
            <AlertDescription>
              This will generate all possible combinations of the attributes you define.
              For example, 3 sizes and 4 colors will create 12 variants.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-6">
            {attributes.map((attribute, attrIndex) => (
              <Card key={attribute.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <Input
                        value={attribute.name}
                        onChange={(e) => updateAttribute(attrIndex, "name", e.target.value)}
                        placeholder="Attribute Name (e.g., Size, Color)"
                        className="h-9"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAttribute(attrIndex)}
                      className="ml-2"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      value={attributeInput[attribute.id] || ""}
                      onChange={(e) => 
                        setAttributeInput({
                          ...attributeInput,
                          [attribute.id]: e.target.value
                        })
                      }
                      placeholder={`Add ${attribute.name || 'attribute'} value`}
                      className="h-9"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addAttributeValue(attrIndex);
                        }
                      }}
                    />
                    <Button
                      onClick={() => addAttributeValue(attrIndex)}
                      size="sm"
                    >
                      Add
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {attribute.values.map((value, valueIndex) => (
                      <div
                        key={`${attribute.id}-${valueIndex}`}
                        className="flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                      >
                        {value}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 ml-1"
                          onClick={() => removeAttributeValue(attrIndex, valueIndex)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h4 className="font-medium">Generation Options</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pricingStrategy">Pricing Strategy</Label>
                <Select
                  value={generationConfig.pricingStrategy}
                  onValueChange={(value) => 
                    updateGenerationConfig("pricingStrategy", value)
                  }
                >
                  <SelectTrigger id="pricingStrategy">
                    <SelectValue placeholder="Select pricing strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                    <SelectItem value="increment">Increment</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pricingValue">Pricing Value</Label>
                <Input
                  id="pricingValue"
                  type="number"
                  value={generationConfig.pricingValue}
                  onChange={(e) => 
                    updateGenerationConfig("pricingValue", parseFloat(e.target.value))
                  }
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="generateSKUs"
                  checked={generationConfig.generateSKUs}
                  onCheckedChange={(checked) => 
                    updateGenerationConfig("generateSKUs", checked === true)
                  }
                />
                <Label htmlFor="generateSKUs">Auto-generate SKUs</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="generateBarcodes"
                  checked={generationConfig.generateBarcodes}
                  onCheckedChange={(checked) => 
                    updateGenerationConfig("generateBarcodes", checked === true)
                  }
                />
                <Label htmlFor="generateBarcodes">Auto-generate Barcodes</Label>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stockStrategy">Stock Strategy</Label>
              <Select
                value={generationConfig.stockStrategy}
                onValueChange={(value) => 
                  updateGenerationConfig("stockStrategy", value as any)
                }
              >
                <SelectTrigger id="stockStrategy">
                  <SelectValue placeholder="Select stock strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distribute">Distribute Evenly</SelectItem>
                  <SelectItem value="duplicate">Duplicate Base Stock</SelectItem>
                  <SelectItem value="zero">Start at Zero</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setActiveTab("manual")}
            >
              Cancel
            </Button>
            <Button
              onClick={generateVariants}
              disabled={
                attributes.filter(a => a.name && a.values.length > 0).length === 0
              }
            >
              Generate Variants
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 